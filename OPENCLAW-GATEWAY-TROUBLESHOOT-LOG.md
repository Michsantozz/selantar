# OpenClaw Gateway Troubleshoot Log

**Data:** 2026-03-23
**Ambiente:** WSL2 (Ubuntu) / Windows 11 / Node v22.22.1
**OpenClaw:** 2026.3.23 (ccfeecb)
**Branch:** `hedera-apex`

---

## Problema 1: Gateway morre com SIGTERM após ~5 segundos

### Sintoma

Toda vez que `openclaw gateway` era executado, o processo iniciava normalmente, carregava hooks e health-monitor, mas recebia SIGTERM e fazia shutdown em ~5-8 segundos. Comportamento consistente mesmo com `trap '' SIGTERM`, limpeza de lock files e kill manual de PIDs anteriores.

```
20:54:45 [gateway] listening on ws://127.0.0.1:18789 (PID 143221)
20:54:45 [hooks] loaded 4 internal hook handlers
20:54:53 [gateway] signal SIGTERM received
20:54:53 [gateway] received SIGTERM; shutting down
```

### Diagnóstico

**Passo 1 — Análise de logs (`/tmp/openclaw/openclaw-2026-03-23.log`)**

Filtrei por `SIGTERM`, `shutdown` e `health-monitor`:

```bash
grep -i "SIGTERM\|signal\|shutdown" /tmp/openclaw/openclaw-2026-03-23.log | tail -30
grep -i "health-monitor" /tmp/openclaw/openclaw-2026-03-23.log | tail -30
```

Observação crítica: em cada ciclo de boot, **duas instâncias do health-monitor** iniciavam — uma do Node v22.22.1, outra do Node v22.17.1.

**Passo 2 — Contagem de runtime versions nos logs**

```bash
grep "runtimeVersion" /tmp/openclaw/openclaw-2026-03-23.log \
  | grep -oP '"runtimeVersion":"[^"]*"' | sort | uniq -c | sort -rn
```

Resultado:
```
1794 "runtimeVersion":"22.17.1"
 195 "runtimeVersion":"22.22.1"
```

O worker de v22.17.1 dominava a execução (1794 entries vs 195 do v22.22.1).

**Passo 3 — Verificação de múltiplas instalações**

```bash
ls /home/michsantoz/.nvm/versions/node/*/bin/openclaw
```

Resultado — **4 instalações** do openclaw em versões diferentes do Node:
```
/home/michsantoz/.nvm/versions/node/v22.17.1/bin/openclaw
/home/michsantoz/.nvm/versions/node/v22.22.0/bin/openclaw
/home/michsantoz/.nvm/versions/node/v22.22.1/bin/openclaw   ← atual
/home/michsantoz/.nvm/versions/node/v24.14.0/bin/openclaw
```

### Causa raiz

O gateway fazia fork/spawn de um **worker process** que resolvia o binário `openclaw` de uma versão antiga do Node (v22.17.1 via NVM). Esse worker conflitava com o processo principal no mesmo port/lock, detectava gateway duplicado e mandava **SIGTERM pro processo pai**, matando tudo.

### Solução

Desinstalar o openclaw de todas as versões do Node exceto a atual (v22.22.1):

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
nvm use 22.17.1 && npm uninstall -g openclaw   # removed 556 packages
nvm use 22.22.0 && npm uninstall -g openclaw   # removed 539 packages
nvm use 24.14.0 && npm uninstall -g openclaw   # removed 540 packages
nvm use 22.22.1  # voltar pro atual
```

### Verificação

```bash
# Confirmar que só existe uma instalação
ls /home/michsantoz/.nvm/versions/node/*/bin/openclaw
# Resultado: apenas v22.22.1/bin/openclaw

# Teste de sobrevivência — gateway deve ficar vivo por 30s+
openclaw gateway &disown; sleep 30 && ps aux | grep openclaw-gateway
# Resultado: ✅ GATEWAY VIVO após 30s
```

Antes: morria em ~5s. Depois: estável indefinidamente.

---

## Problema 2: WhatsApp plugin — `missing light-runtime-api`

### Sintoma

Após resolver o Problema 1, o gateway ficava estável mas o WhatsApp não conectava:

```
[gateway/channels] channel startup failed: Error: WhatsApp plugin runtime
is unavailable: missing light-runtime-api for plugin 'whatsapp'
```

### Diagnóstico

**Passo 1 — Verificar arquivos do plugin bundled**

```bash
ls ~/.nvm/versions/node/v22.22.1/lib/node_modules/openclaw/dist/extensions/whatsapp/
```

Resultado — apenas 4 arquivos:
```
index.js
openclaw.plugin.json
package.json
setup-entry.js
```

Faltavam: `light-runtime-api.js` (ou `.ts`), `runtime-api.js`, e diretório `src/`.

**Passo 2 — Entender o mecanismo de resolução**

Leitura do código fonte do boundary module:

```bash
grep -A 20 "resolveWhatsAppRuntimeModulePath" \
  ~/.nvm/versions/node/v22.22.1/lib/node_modules/openclaw/dist/runtime-whatsapp-boundary-BMepWtnk.js
```

O código busca `light-runtime-api.js` ou `light-runtime-api.ts` no diretório do plugin. Usa **jiti** (TypeScript JIT transpiler) para compilar `.ts` on-the-fly.

**Passo 3 — Verificar o que existe no plugin-sdk (tipos)**

```bash
find ~/.nvm/versions/node/v22.22.1/lib/node_modules/openclaw/ -name "light-runtime-api*"
```

Resultado: apenas `light-runtime-api.d.ts` (type declaration). Sem `.ts` source nem `.js` compilado.

**Passo 4 — Tentativas que NÃO funcionaram**

| Tentativa | Resultado |
|-----------|-----------|
| `openclaw plugins doctor` | "No plugin issues detected" |
| `openclaw plugins uninstall whatsapp && openclaw plugins install whatsapp` | Reinstala o mesmo bundled stub sem runtime |
| `openclaw plugins install @openclaw/whatsapp` | "npm package unavailable; using bundled plugin" |
| `openclaw plugins install clawhub:@openclaw/whatsapp` | "Package not found on ClawHub" |
| `npm install -g @openclaw/whatsapp` | "E404 Not Found" no registry npm |
| `openclaw channels login --channel whatsapp` | Conectou sessão mas não criou runtime files |
| `npm install -g openclaw@latest` (reinstall completo) | Mesmos 4 arquivos, sem runtime |

### Causa raiz

O pacote npm `openclaw` **não inclui os source files TypeScript** do plugin WhatsApp. O diretório `dist/extensions/whatsapp/` contém apenas stubs (index.js, setup-entry.js). Os runtime files (`light-runtime-api.ts`, `runtime-api.ts`, `src/*.ts`) são parte do **source code** do repositório mas não são distribuídos no pacote npm — provavelmente por questões de licença do Baileys (WhatsApp Web client).

### Solução

**Passo 1 — Clonar os sources do GitHub (sparse checkout)**

```bash
cd /tmp
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/openclaw/openclaw.git openclaw-src
cd openclaw-src
git sparse-checkout set extensions/whatsapp
```

Resultado — todos os `.ts` sources incluindo `light-runtime-api.ts` e `src/`.

**Passo 2 — Copiar para o diretório do plugin bundled**

```bash
PLUGIN_DIR=~/.nvm/versions/node/v22.22.1/lib/node_modules/openclaw/dist/extensions/whatsapp

# Copiar todos os .ts do root
cp /tmp/openclaw-src/extensions/whatsapp/*.ts $PLUGIN_DIR/

# Copiar o diretório src/ completo
cp -r /tmp/openclaw-src/extensions/whatsapp/src $PLUGIN_DIR/
```

**Passo 3 — Instalar dependências npm do plugin**

Primeira tentativa sem as deps falhou com:
```
channel startup failed: Error: Cannot find module '@whiskeysockets/baileys'
```

Fix — instalar as dependências declaradas no `package.json` do plugin:

```bash
cd ~/.nvm/versions/node/v22.22.1/lib/node_modules/openclaw
npm install @whiskeysockets/baileys@7.0.0-rc.9 jimp@^1.6.0
# added 380 packages
```

### Verificação

```bash
openclaw gateway &disown; sleep 15
```

```
[whatsapp] [default] starting provider (+556291052901)
[whatsapp] Listening for personal WhatsApp inbound messages.
```

WhatsApp plugin carregou e conectou com sucesso. O jiti transpilou os `.ts` on-the-fly.

### Evolução dos erros durante o fix

```
missing light-runtime-api          → copiou light-runtime-api.ts
Cannot find module '../login-qr-api.js'  → copiou todos os *.ts do root
Cannot find module '@whiskeysockets/baileys' → npm install baileys + jimp
✅ Listening for personal WhatsApp inbound messages
```

---

## Problema 3: WhatsApp — mensagens enviadas mas não entregues

### Sintoma

Após o WhatsApp conectar, `openclaw message send` retornava sucesso com `messageId`, mas as mensagens não chegavam no destino.

```bash
openclaw message send --channel whatsapp \
  --target "+5562994161690" \
  --message "Teste Selantar" --json
```

```json
{
  "result": {
    "messageId": "3EB05BEBE3A8B6D614D976",
    "channel": "whatsapp",
    "toJid": "5562994161690@s.whatsapp.net"
  }
}
```

Logs confirmavam `sent message` sem erros.

### Diagnóstico

Verificação das credenciais da sessão:

```bash
cat ~/.openclaw/credentials/whatsapp/default/creds.json | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print('registered:', d.get('registered'))"
```

Resultado: **`registered: False`**

### Causa raiz

A sessão WhatsApp Web (Baileys) estava com `registered: false`. O dispositivo linked tinha expirado ou sido desconectado. O Baileys achava que estava conectado e "enviava" mensagens, mas elas **não chegavam** porque a sessão não estava autenticada com os servidores do WhatsApp.

### Solução

Re-linkar o WhatsApp via QR code:

```bash
openclaw channels logout --channel whatsapp   # Limpar sessão velha
openclaw channels login --channel whatsapp     # Gerar QR code novo
```

Escanear o QR code no celular (WhatsApp > Dispositivos Vinculados > Vincular dispositivo).

```
WhatsApp asked for a restart after pairing (code 515); waiting for creds to save…
✅ Linked after restart; web session ready.
```

### Status

Após re-link, o envio reportava sucesso mas as mensagens ainda não chegavam. **Problema pendente** — possível necessidade de re-parear o WhatsApp Web com mais calma (sessão pode precisar de warm-up ou o número destino pode ter restrições).

---

## Problema 4: Gateway service apontando para Node v22.17.1

### Sintoma

`openclaw doctor` reportava que o gateway service ainda referenciava a versão antiga do Node:

```
- Gateway service uses Node from a version manager;
  it can break after upgrades.
  (/home/michsantoz/.nvm/versions/node/v22.17.1/bin/node)
- Gateway service entrypoint does not match the current install.
```

### Causa raiz

O gateway service (systemd) foi instalado quando a versão ativa era v22.17.1. Após migrar pra v22.22.1, o service file ficou apontando pro path antigo.

### Solução tentada

```bash
openclaw gateway install --force
```

Resultado: `Error: systemctl not available; systemd user services are required on Linux.`

WSL2 não tem systemd habilitado por padrão. O fix requer:

```ini
# /etc/wsl.conf
[boot]
systemd=true
```

Seguido de `wsl --shutdown` no PowerShell e reabrir o distro.

### Status

**Não bloqueante** — o gateway roda manualmente sem problemas. O service systemd é apenas para auto-start.

---

## Problema 5: API key OpenAI e modelo do agente

### Contexto

A API key OpenAI antiga no config do OpenClaw precisava ser atualizada.

### Ação

Verificação dos modelos disponíveis na nova key:

```bash
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-proj-..." \
  | python3 -c "import sys,json; data=json.load(sys.stdin); \
    models=sorted([m['id'] for m in data.get('data',[])]); \
    [print(m) for m in models if 'gpt-5.4' in m]"
```

Modelos gpt-5.4 disponíveis:
```
gpt-5.4
gpt-5.4-2026-03-05
gpt-5.4-mini
gpt-5.4-mini-2026-03-17
gpt-5.4-nano
gpt-5.4-nano-2026-03-17
gpt-5.4-pro
gpt-5.4-pro-2026-03-05
```

Atualização da key em `~/.openclaw/openclaw.json` campo `env.OPENAI_API_KEY`.

### Verificação

```bash
openclaw agent --agent main --message "qual é seu modelo e versão?"
# Resposta: "Sou o OpenAI gpt-5.4-mini."
```

---

## Estado final do sistema

### Gateway

| Item | Status |
|------|--------|
| Gateway | Estável, sem SIGTERM |
| PID | Rodando em foreground (sem systemd) |
| Modelo | `openai/gpt-5.4-mini` |
| Fallback | `google/gemini-3.1-pro-preview` |
| API Key | OpenAI atualizada |
| Agentes | 1 (`main`) |
| Sessões | 13 ativas |

### Hooks (4/4 ativos)

| Hook | Trigger |
|------|---------|
| boot-md | gateway:startup |
| bootstrap-extra-files | agent:bootstrap |
| command-logger | command |
| session-memory | command:new, command:reset |

### Skills (18/57 prontas)

Ativas: clawhub, coding-agent, gemini, gh-issues, github, healthcheck, node-connect, openai-whisper-api, skill-creator, tmux, video-frames, weather, find-skills, firecrawl, shadcn, vercel-react-best-practices, x-twitter-scraper, selantar.

### Canais

| Canal | Status | Detalhes |
|-------|--------|----------|
| WhatsApp | ON / Connected | `+556291052901`, DM policy: pairing, allow: `+5562994161690` |

### Devices pareados

| Device | Plataforma | Role |
|--------|-----------|------|
| CLI | Linux | operator |
| WebChat UI | Win32 | operator |

### Pendências

1. **WhatsApp delivery** — mensagens enviadas com sucesso pelo Baileys mas não entregues. Necessário re-parear com calma.
2. **Systemd** — habilitar no WSL2 para auto-start do gateway.
3. **Security warns** — hooks.token curto, credentials dir 755, hooks.defaultSessionKey não configurado.

---

## Referências

- OpenClaw docs: https://docs.openclaw.ai
- Plugins: https://docs.openclaw.ai/cli/plugins
- WhatsApp channel: https://docs.openclaw.ai/channels/whatsapp
- Troubleshooting: https://docs.openclaw.ai/troubleshooting
- Source (WhatsApp runtime): https://github.com/openclaw/openclaw → `extensions/whatsapp/`
- Baileys (WhatsApp Web client): `@whiskeysockets/baileys@7.0.0-rc.9`
