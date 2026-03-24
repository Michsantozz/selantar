# OpenClaw — Guia Completo de Operações, Troubleshooting e Melhores Práticas

> Documento de referência para configurar, operar e resolver problemas do OpenClaw.
> Baseado na análise completa de toda a documentação oficial.

---

## Índice

1. [Diagnóstico Rápido](#1-diagnóstico-rápido)
2. [Channels — Todos os Canais](#2-channels--todos-os-canais)
3. [Gateway — Configuração e Operação](#3-gateway--configuração-e-operação)
4. [Agentes, Sessões e Modelos](#4-agentes-sessões-e-modelos)
5. [Skills e Ferramentas](#5-skills-e-ferramentas)
6. [Automação — Cron, Webhooks, Gmail](#6-automação--cron-webhooks-gmail)
7. [Segurança](#7-segurança)
8. [Plataformas — WSL2, Linux, macOS, iOS, Android](#8-plataformas--wsl2-linux-macos-ios-android)
9. [Troubleshooting — Erros Comuns e Soluções](#9-troubleshooting--erros-comuns-e-soluções)
10. [Melhores Práticas](#10-melhores-práticas)
11. [Referência de Comandos](#11-referência-de-comandos)
12. [Mapa de Arquivos](#12-mapa-de-arquivos)

---

## 1. Diagnóstico Rápido

Sempre comece aqui quando algo parecer errado:

```bash
# Escada de diagnóstico (rodar nessa ordem)
openclaw status              # Status geral
openclaw gateway status      # Gateway rodando?
openclaw channels status --probe  # Canais conectados?
openclaw doctor              # Diagnóstico completo
openclaw logs --follow       # Logs em tempo real
```

### Health Check Rápido (copie tudo)

```bash
echo "=== GATEWAY ===" && \
ps aux | grep -c "[o]penclaw" && \
echo "=== CONFIG ===" && \
python3 -m json.tool ~/.openclaw/openclaw.json > /dev/null 2>&1 && echo "JSON: OK" || echo "JSON: BROKEN" && \
echo "=== CHANNELS ===" && \
cat ~/.openclaw/openclaw.json | node -e "
const cfg=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
Object.entries(cfg.channels||{}).forEach(([k,v])=>console.log(k+': policy='+(v.dmPolicy||'n/a')+' enabled='+(v.enabled||'implicit')))
" && \
echo "=== WHATSAPP CREDS ===" && \
ls ~/.openclaw/credentials/whatsapp/default/ 2>/dev/null | wc -l | xargs -I{} echo "WhatsApp keys: {} files"
```

---

## 2. Channels — Todos os Canais

### 2.1 Políticas de Acesso (Universais)

Todos os canais suportam essas políticas:

| Política DM | Comportamento |
|-------------|---------------|
| `pairing` (default) | Desconhecidos recebem código de pairing, você aprova |
| `allowlist` | Só números/IDs na lista `allowFrom` recebem resposta |
| `open` | Qualquer pessoa pode falar com o bot |
| `disabled` | Canal desativado |

| Política Grupos | Comportamento |
|-----------------|---------------|
| `allowlist` | Só grupos/senders na lista `groupAllowFrom` |
| `open` | Todos os grupos permitidos |
| `disabled` | Ignora todas mensagens de grupo |

**Comandos de pairing:**

```bash
openclaw pairing list <channel>          # Ver pendentes
openclaw pairing approve <channel> <CODE>  # Aprovar
```

---

### 2.2 WhatsApp (Baileys)

**Status:** Production-ready via WhatsApp Web

**Setup:**

```bash
openclaw channels login --channel whatsapp  # Escanear QR
```

**Configuração mínima (`~/.openclaw/openclaw.json`):**

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+5562994161690"],
      groupPolicy: "open",        // ou "allowlist" com groupAllowFrom
      sendReadReceipts: true,
      selfChatMode: false
    }
  }
}
```

**Parâmetros importantes:**

| Campo | Default | Descrição |
|-------|---------|-----------|
| `dmPolicy` | `pairing` | Política de DMs |
| `allowFrom` | `[]` | Números E.164 permitidos |
| `groupPolicy` | `disabled` | Política de grupos |
| `groupAllowFrom` | `[]` | Senders permitidos em grupos |
| `sendReadReceipts` | `true` | Enviar "lido" |
| `selfChatMode` | `false` | Chat consigo mesmo |
| `mediaMaxMb` | `50` | Limite de mídia (MB) |

**Troubleshooting WhatsApp:**

| Problema | Diagnóstico | Solução |
|----------|-------------|---------|
| Sem resposta às DMs | `openclaw channels status --probe` | Verificar `dmPolicy` e `allowFrom` |
| Grupos ignorados | Config `groupPolicy` | Mudar para `open` ou adicionar em `groupAllowFrom` |
| Desconexão aleatória | `grep "408\|retry" ~/.openclaw/logs/gateway.err.log` | Normal até 12 retries; se falhar, `openclaw gateway restart` |
| QR não aparece | `openclaw channels login --channel whatsapp` | Re-executar o login |
| Credenciais perdidas | `ls ~/.openclaw/credentials/whatsapp/default/ \| wc -l` | Se 0 arquivos, re-parear com `openclaw configure` |
| Cross-context denied | Log de erros | Segurança — mensagem deve vir do contexto correto |

---

### 2.3 Telegram

**Setup:**

1. Criar bot via [@BotFather](https://t.me/BotFather)
2. Copiar o bot token

```json5
{
  channels: {
    telegram: {
      enabled: true,
      accounts: {
        meubot: {
          name: "Meu Bot",
          enabled: true,
          botToken: "123456:ABCDEF"  // IMPORTANTE: "botToken", NÃO "token"
        }
      },
      dmPolicy: "pairing",
      groupPolicy: "disabled"
    }
  }
}
```

**Erro comum:** Usar `token` em vez de `botToken` → "Unrecognized keys"

**Troubleshooting Telegram:**

| Problema | Solução |
|----------|---------|
| Bot online mas sem resposta | Verificar `botToken` (não `token`), verificar `dmPolicy` |
| `getUpdates timed out` | Bot perdeu conexão; `openclaw gateway restart` |
| Grupo silencioso | Ativar `groupPolicy: "open"` ou adicionar `requireMention: true` |
| Mensagens duplicadas | Verificar offset em `~/.openclaw/telegram/update-offset-*.json` |

---

### 2.4 Discord

**Setup:**

1. Criar aplicação em [discord.com/developers](https://discord.com/developers/applications)
2. Criar bot, copiar token
3. Convidar para servidor com permissões

```json5
{
  channels: {
    discord: {
      token: "seu-bot-token",
      dmPolicy: "pairing",
      groupPolicy: "allowlist",
      guilds: {
        "GUILD_ID": {
          requireMention: true
        }
      }
    }
  }
}
```

**Troubleshooting Discord:**

| Problema | Solução |
|----------|---------|
| Bot online mas sem reply | Verificar `guilds` allowlist e `requireMention` |
| DMs não funcionam | Verificar `dmPolicy` e `allowFrom` |
| Sem resposta em canais | Adicionar guild ID em `guilds` |

---

### 2.5 Slack

**Setup:**

1. Criar Slack App com Socket Mode
2. Obter Bot Token (`xoxb-`) e App Token (`xapp-`)

```json5
{
  channels: {
    slack: {
      botToken: "xoxb-...",
      appToken: "xapp-...",
      dmPolicy: "pairing",
      groupPolicy: "allowlist",
      replyToMode: "first"  // off | first | all
    }
  }
}
```

**Scopes necessários:** `chat:write`, `channels:history`, `groups:history`, `im:history`, `reactions:read`, `reactions:write`, `pins:read`, `pins:write`

**Features extras:** Streaming nativo (Agents API), slash commands (`commands.native`), reactions, pins

---

### 2.6 Signal (signal-cli)

**Requisitos:** signal-cli instalado (JVM ou nativo), número de telefone dedicado

**Setup:**

```bash
# Path A: Link via QR
signal-cli link -n "OpenClaw"

# Path B: Registrar via SMS
signal-cli -a +NUMERO register
signal-cli -a +NUMERO verify CODE
```

```json5
{
  channels: {
    signal: {
      account: "+5562...",
      dmPolicy: "pairing",
      allowFrom: ["+5562994161690"],
      groupPolicy: "disabled"
    }
  }
}
```

**Troubleshooting Signal:**

| Problema | Solução |
|----------|---------|
| `Signal RPC -1` | signal-cli daemon caiu; `openclaw gateway restart` |
| `Signal RPC -5` | Rate limiting; esperar e reduzir frequência |
| `Unknown target "nome"` | Usar formato E.164 (`+55...`) ou `uuid:ID` |
| Profile name warning spam | `signal-cli -a +CONTA updateProfile --given-name "Nome"` |

---

### 2.7 BlueBubbles (iMessage — Recomendado)

**Requisitos:** macOS com BlueBubbles server rodando

```json5
{
  channels: {
    bluebubbles: {
      serverUrl: "http://localhost:1234",
      password: "sua-senha",
      webhookPath: "/bluebubbles/webhook",
      dmPolicy: "pairing"
    }
  }
}
```

**Features:** Typing, read receipts, reactions (tapbacks), edit, unsend, reply threading, efeitos de mensagem

**Quirk:** Edit quebrado no macOS 26 (Tahoe)

---

### 2.8 iMessage (Legacy)

**Status:** Deprecated — use BlueBubbles

**Requisitos:** macOS only, Full Disk Access + Automation

```json5
{
  channels: {
    imessage: {
      enabled: true,
      dmPolicy: "pairing"
    }
  }
}
```

---

### 2.9 IRC

```json5
{
  channels: {
    irc: {
      server: "irc.libera.chat",
      port: 6697,
      tls: true,
      nick: "openclaw-bot",
      channels: ["#meucanal"],
      dmPolicy: "pairing"
    }
  }
}
```

**Segurança:** TLS obrigatório por default; sem mentions nativos, usa regex para detecção

---

### 2.10 Microsoft Teams (Plugin)

```bash
openclaw plugins install @openclaw/msteams
```

**Requisitos:** Azure Bot Framework (App ID + secret + tenant ID), webhook público na porta 3978

```json5
{
  channels: {
    msteams: {
      appId: "...",
      appPassword: "...",
      tenantId: "...",
      dmPolicy: "pairing",
      groupPolicy: "allowlist"
    }
  }
}
```

---

### 2.11 Google Chat

**Requisitos:** Service Account + JSON key, webhook HTTPS

```json5
{
  channels: {
    googlechat: {
      serviceAccountKeyPath: "/path/to/key.json",
      webhookPath: "/googlechat",
      dmPolicy: "pairing"
    }
  }
}
```

---

### 2.12 Matrix (Plugin)

```bash
openclaw plugins install @openclaw/matrix
```

```json5
{
  channels: {
    matrix: {
      homeserver: "https://matrix.org",
      accessToken: "syt_...",
      userId: "@bot:matrix.org",
      dmPolicy: "pairing"
    }
  }
}
```

**Features:** E2EE suportado, DMs, rooms, threads, reactions, polls

---

### 2.13 Outros Canais (Plugins)

| Canal | Instalação | Destaques |
|-------|-----------|-----------|
| **Feishu/Lark** | Bundled | WebSocket (sem URL pública), enterprise app |
| **LINE** | `@openclaw/line` | Webhook HTTPS, Flex messages, 5000 chars |
| **Mattermost** | `@openclaw/mattermost` | WebSocket, slash commands, threading |
| **Nostr** | `@openclaw/nostr` | NIP-04 encrypted DMs, relays customizáveis |
| **Twitch** | `@openclaw/twitch` | `allowedRoles` (mod, vip, sub), mention gating |
| **Zalo** | `@openclaw/zalo` | Marketplace-bot, 2000 chars, 5MB media |
| **WebChat** | Built-in | Via Gateway WebSocket, sem config extra |

---

## 3. Gateway — Configuração e Operação

### 3.1 Startup

```bash
openclaw gateway                          # Foreground
openclaw gateway --port 18789 --verbose   # Com debug
nohup openclaw gateway > ~/.openclaw/logs/gateway.log 2>&1 &  # Background (sem systemd)
```

**Startup normal (~3 segundos):**

```
[heartbeat] started
[gateway] listening on ws://127.0.0.1:18789
[browser/service] Browser control service ready
[whatsapp] [default] starting provider
[whatsapp] Listening for personal WhatsApp inbound messages.
```

### 3.2 Configuração Principal

**Arquivo:** `~/.openclaw/openclaw.json` (JSON5)

```json5
{
  // Modelo do agente
  agent: {
    model: "anthropic/claude-opus-4-6"
  },

  // Fallbacks
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": { alias: "opus" },
        "anthropic/claude-sonnet-4-6": { alias: "sonnet" }
      },
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["anthropic/claude-sonnet-4-6"]
      },
      maxConcurrent: 10,
      heartbeat: { every: "30m" },
      compaction: "safeguard"
    }
  },

  // Gateway
  gateway: {
    bind: "loopback",    // loopback | lan | custom | tailnet | auto
    port: 18789,
    auth: {
      mode: "token"      // token | password | device
    }
  },

  // Hot reload
  configReload: "hybrid"  // off | hot | restart | hybrid (default)
}
```

### 3.3 Bind Modes

| Modo | Quem acessa | Quando usar |
|------|-------------|-------------|
| `loopback` | Só localhost | Dev local (mais seguro) |
| `lan` | Rede local | Docker, dispositivos na LAN |
| `tailnet` | Tailscale | Acesso remoto seguro |
| `custom` | IP específico | Deploy avançado |
| `auto` | Automático | Não recomendado em produção |

### 3.4 Autenticação

| Modo | Uso |
|------|-----|
| `token` | Bearer token (recomendado) |
| `password` | Senha compartilhada (para Funnel público) |
| `device` | Device auth com pairing |

```bash
# Verificar token
openclaw config get gateway.auth.token
```

### 3.5 Health Monitoring

```json5
{
  gateway: {
    healthMonitor: {
      channelCheckIntervalMs: 300000,    // 5 min
      staleEventThresholdMs: 1800000,    // 30 min
      maxRestartsPerHour: 10
    }
  }
}
```

### 3.6 Tailscale (Acesso Remoto)

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: {
      mode: "serve"     // off | serve (tailnet-only) | funnel (público)
    }
  }
}
```

**Regras:**
- `bind` DEVE ser `loopback` com Tailscale
- `funnel` EXIGE `gateway.auth.mode: "password"`
- `serve` usa identity headers do Tailscale por default

---

## 4. Agentes, Sessões e Modelos

### 4.1 Sessões

**Modos de DM Scope:**

| Modo | Comportamento | Quando usar |
|------|---------------|-------------|
| `main` (default) | Todas DMs compartilham sessão principal | Uso pessoal |
| `per-peer` | Uma sessão por sender | Multi-usuário básico |
| `per-channel-peer` | Uma sessão por canal+sender | **Recomendado para multi-usuário** |

```json5
{
  agents: {
    defaults: {
      session: {
        dmScope: "per-channel-peer"
      }
    }
  }
}
```

**Manutenção de sessões:**

```json5
{
  agents: {
    defaults: {
      session: {
        maintenance: {
          mode: "enforce",     // warn | enforce
          pruneAfterDays: 30,
          maxEntries: 500,
          rotateBytes: 10485760  // 10MB
        }
      }
    }
  }
}
```

### 4.2 Modelos

```bash
openclaw models list                      # Listar disponíveis
openclaw models status                    # Status atual
openclaw models set anthropic/claude-opus-4-6  # Mudar modelo
openclaw models fallbacks add anthropic/claude-sonnet-4-6  # Adicionar fallback
openclaw models scan                      # Escanear modelos (OpenRouter)
```

**In-chat:** `/model` (picker), `/model list`, `/model <ref>`

### 4.3 Compaction

Quando a context window enche, mensagens antigas são podadas:

```json5
{
  agents: {
    defaults: {
      compaction: "safeguard"  // Só compacta no limite do contexto
    }
  }
}
```

**Verificar compactions de uma sessão:**

```bash
grep -c '"compaction"' ~/.openclaw/agents/main/sessions/SESSION_ID.jsonl
```

### 4.4 Multi-Agent

Cada agente tem seu workspace isolado. Skills carregam por precedência:

1. **Workspace** (`~/.openclaw/workspace/skills/`)
2. **Managed** (`~/.openclaw/skills/`)
3. **Bundled** (instalação do OpenClaw)
4. **Extra dirs** (`skills.load.extraDirs`)

---

## 5. Skills e Ferramentas

### 5.1 ClawHub (Registry)

```bash
clawdhub search "postgres"              # Buscar skills
clawdhub explore                        # Navegar
clawdhub install supabase-postgres      # Instalar
clawdhub list                           # Listar instaladas
clawdhub update --all                   # Atualizar todas
```

### 5.2 Skills Instaladas (Bundled)

| Categoria | Skills |
|-----------|--------|
| **Mensagens** | discord, slack, imsg, wacli, voice-call |
| **Social/Web** | bird (X), blogwatcher, github, trello, notion |
| **Google** | gog, google-workspace-mcp, goplaces |
| **Media** | nano-banana-pro (Gemini), openai-image-gen, video-frames, gifgrep, sag (TTS) |
| **Coding** | coding-agent (Codex/Claude Code), ccbg, tmux |
| **Produtividade** | apple-notes, apple-reminders, bear-notes, things-mac, obsidian, himalaya |
| **Smart Home** | openhue (Hue), eightctl (Eight Sleep), sonoscli, blucli (BluOS) |
| **Dev** | github, worktree, starter, desktop, supabase |

### 5.3 Criar Skill Própria

```
minha-skill/
├── SKILL.md              # Obrigatório: frontmatter YAML + instruções markdown
├── scripts/              # Opcional
├── references/           # Opcional
└── assets/               # Opcional
```

**Formato do SKILL.md:**

```markdown
---
name: minha-skill
description: O que faz e QUANDO ativar. A description é o trigger principal.
---

# Minha Skill

Instruções aqui. Só carrega APÓS o trigger.
Manter abaixo de 500 linhas.
```

### 5.4 Config de Skills

```json5
{
  skills: {
    allowBundled: ["github", "coding-agent"],  // Opcional: allowlist
    load: {
      extraDirs: ["/path/to/skills"],
      watch: true,
      watchDebounceMs: 250
    },
    entries: {
      "minha-skill": {
        enabled: true,
        env: { API_KEY: "..." }
      }
    }
  }
}
```

### 5.5 Browser (Ferramenta)

```json5
{
  browser: {
    enabled: true,
    color: "#FF4500",
    profiles: {
      openclaw: { cdpPort: 18791 },
      user: { driver: "existing-session", attachOnly: true }
    }
  }
}
```

```bash
openclaw browser status
openclaw browser start
openclaw browser open https://example.com
openclaw browser snapshot
```

---

## 6. Automação — Cron, Webhooks, Gmail

### 6.1 Cron Jobs

```bash
openclaw cron add --name "Daily Report" --cron "0 9 * * *" --session isolated --message "Generate daily report"
openclaw cron list
openclaw cron run <id>                 # Executar manualmente
openclaw cron runs --id <id>           # Ver histórico
openclaw cron edit <id>
openclaw cron delete <id>
```

**Tipos de schedule:**

| Tipo | Exemplo | Descrição |
|------|---------|-----------|
| `at` | `"2026-03-25T09:00:00Z"` | Uma vez |
| `every` | `3600000` | A cada X ms |
| `cron` | `"0 9 * * *"` | Expressão cron |

**Execution styles:**

| Style | Comportamento |
|-------|---------------|
| `main` | Roda na sessão principal |
| `isolated` | Sessão dedicada (sem contexto anterior) |
| `current` | Sessão que criou o job |
| `session:meu-id` | Sessão nomeada persistente |

### 6.2 Webhooks

```json5
{
  hooks: {
    enabled: true,
    token: "meu-token-secreto"
  }
}
```

**Endpoints:**
- `/hooks/wake` — System event para sessão principal
- `/hooks/agent` — Agent turn isolado
- `/hooks/<name>` — Hooks customizados via `hooks.mappings`

**Auth:** Header `Authorization: Bearer <token>` ou `x-openclaw-token: <token>`

### 6.3 Gmail Pub/Sub

```bash
openclaw webhooks gmail setup --account user@gmail.com
openclaw webhooks gmail run  # Daemon com auto-renew
```

---

## 7. Segurança

### 7.1 Modelo de Confiança

OpenClaw é um assistente **pessoal single-user**. NÃO é multi-tenant.

### 7.2 Baseline Seguro

```json5
{
  gateway: {
    bind: "loopback",
    auth: { mode: "token" }
  },
  channels: {
    whatsapp: { dmPolicy: "pairing" },
    telegram: { dmPolicy: "pairing" },
    signal: { dmPolicy: "pairing" }
  },
  agents: {
    defaults: {
      session: { dmScope: "per-channel-peer" }
    }
  }
}
```

### 7.3 Audit de Segurança

```bash
openclaw security audit              # Básico
openclaw security audit --deep       # Profundo
openclaw security audit --deep --fix # Corrigir automaticamente
```

**O que o audit verifica:**
- Políticas de DM/grupo (inbound access)
- Blast radius de ferramentas
- Exec approval drift
- Exposição de rede (bind/auth/Tailscale)
- Browser control
- Permissões de disco
- Plugins
- Policy drift/misconfig
- Model hygiene

### 7.4 Sandbox (Multi-usuário)

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main"  // Sessões não-main rodam em Docker
      }
    }
  }
}
```

### 7.5 Cross-Channel Messaging

```json5
{
  tools: {
    message: {
      crossContext: {
        allowAcrossProviders: true,  // Permitir envio cross-channel
        marker: { enabled: false }   // Sem prefixo "[via Signal]"
      }
    }
  }
}
```

---

## 8. Plataformas — WSL2, Linux, macOS, iOS, Android

### 8.1 WSL2 (Windows)

**Problema principal:** systemd não habilitado por default

**Solução permanente:**

```bash
# 1. Habilitar systemd
sudo bash -c 'echo -e "[boot]\nsystemd=true" >> /etc/wsl.conf'

# 2. No PowerShell do Windows:
wsl --shutdown

# 3. Reabrir WSL e instalar daemon
openclaw gateway install --force
```

**Solução temporária (sem reiniciar):**

```bash
nohup openclaw gateway > ~/.openclaw/logs/gateway.log 2>&1 &
```

**Browser no WSL2 → Windows:**
- Opção 1: Remote CDP (WSL2 → Chrome no Windows)
- Opção 2: Instalar Chrome dentro do WSL2

```json5
{
  browser: {
    profiles: {
      remote: {
        cdpUrl: "http://WINDOWS_IP:9222"
      }
    }
  }
}
```

### 8.2 Linux

**Systemd (recomendado):**

```bash
openclaw gateway install --force
systemctl --user start openclaw-gateway.service
systemctl --user enable openclaw-gateway.service
sudo loginctl enable-linger $USER  # Manter rodando sem login
```

**Browser no Linux:**

```bash
# Instalar Chrome (NÃO snap — snap causa problemas com AppArmor)
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
```

```json5
{
  browser: {
    executablePath: "/usr/bin/google-chrome-stable"
  }
}
```

### 8.3 macOS

- **App nativa** com menu bar, Voice Wake, Canvas
- **Launchd** para daemon: `openclaw gateway install`
- **Permissões:** Full Disk Access, Automation, Accessibility

### 8.4 iOS/Android (Nodes)

Devices pareados como nodes via Gateway WebSocket:

```bash
openclaw devices list
openclaw devices approve <code>
openclaw nodes list
openclaw nodes status
```

**Capacidades dos nodes:** Camera, screen recording, location, notifications, Canvas

---

## 9. Troubleshooting — Erros Comuns e Soluções

### 9.1 Tabela de Erros

| Erro | Significado | Solução |
|------|-------------|---------|
| `Web connection closed (status 408)` | WhatsApp web timeout | Auto-recovery; se 12/12 retries, restart gateway |
| `Signal RPC -1` | signal-cli daemon perdeu conexão | `openclaw gateway restart` |
| `Signal RPC -5` | Rate limiting Signal | Esperar, reduzir frequência |
| `Cross-context messaging denied` | Tentou enviar cross-channel | Guardrail de segurança; ativar `crossContext.allowAcrossProviders` |
| `getUpdates timed out after 500s` | Telegram perdeu polling | `openclaw gateway restart` |
| `Unrecognized keys: "token"` | Config errada do Telegram | Usar `botToken`, não `token` |
| `RESOURCE_EXHAUSTED` (Gemini 429) | Rate limit de embeddings | Reduzir churn de workspace |
| `lane wait exceeded` | Agente bloqueado em LLM call | Esperar ou restart se > 2min |
| `embedded run timeout: 600000ms` | Resposta > 10 min | Quebrar tarefa em partes menores |
| `gateway timeout after 10000ms` | Gateway reiniciando | Transiente — cron disparou durante restart |
| `systemctl not available` | WSL2 sem systemd | Habilitar systemd no `/etc/wsl.conf` |
| `Anthropic 429 (extra usage required)` | Limite de contexto Anthropic | Desabilitar `context1m`, usar API key com billing |
| `No profile name set` (Signal) | Warning de spam nos logs | `signal-cli updateProfile --given-name "Nome"` |
| `BOT_COMMANDS_TOO_MUCH` (Telegram) | Muitos comandos registrados | Reduzir slash commands |
| `NODE_BACKGROUND_UNAVAILABLE` | App iOS/Android em background | Trazer app para foreground |
| `SYSTEM_RUN_DENIED: approval required` | Exec não aprovado | `openclaw approvals allowlist add` |

### 9.2 Logs

```bash
# Logs em tempo real
openclaw logs --follow

# Erros recentes
tail -20 ~/.openclaw/logs/gateway.err.log

# Erros de WhatsApp
grep -i "whatsapp\|baileys\|408\|retry" ~/.openclaw/logs/gateway.err.log | tail -20

# Erros de Telegram
grep -i "telegram\|getUpdates\|timeout" ~/.openclaw/logs/gateway.err.log | tail -10

# Erros de Signal
grep -i "signal.*rpc\|signal.*failed" ~/.openclaw/logs/gateway.err.log | tail -10
```

### 9.3 Sessões

```bash
# Listar sessões WhatsApp
cat ~/.openclaw/agents/main/sessions/sessions.json | node -e "
const s=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
Object.entries(s).filter(([k])=>k.includes('whatsapp')).forEach(([k,v])=>console.log(k,'|',v.origin?.label||'?'))
"

# Buscar keyword em todas sessões
grep -l "KEYWORD" ~/.openclaw/agents/main/sessions/*.jsonl

# Ler últimas mensagens de uma sessão
tail -30 ~/.openclaw/agents/main/sessions/SESSION_ID.jsonl | node -e "
require('readline').createInterface({input:process.stdin}).on('line',l=>{
  try{const o=JSON.parse(l);if(o.type==='message'){const r=o.message.role;
  const t=o.message.content?.map(c=>c.text||'').join('')||'';
  if(t.trim()&&r!=='toolResult')console.log('['+r+']',t.slice(0,300))}}catch{}})
"
```

### 9.4 Memória

**3 camadas de memória:**

| Camada | O que é | Quando "esquece" |
|--------|---------|------------------|
| Context window | Mensagens na sessão | Após compaction |
| Workspace memory | `~/.openclaw/workspace/memory/*.md` | Manual |
| Vector DB (SQLite) | Embeddings Gemini | Rate limit ou DB corrompido |

```bash
# Verificar memória indexada
sqlite3 ~/.openclaw/memory/main.sqlite "SELECT COUNT(*) || ' chunks' FROM chunks;"

# Buscar por texto
sqlite3 ~/.openclaw/memory/main.sqlite "SELECT substr(text,1,200) FROM chunks_fts WHERE chunks_fts MATCH 'KEYWORD' LIMIT 5;"

# Rebuildar memória (última opção)
rm ~/.openclaw/memory/main.sqlite && openclaw gateway restart
```

---

## 10. Melhores Práticas

### 10.1 Setup Inicial

1. **Usar `openclaw onboard`** — Guia interativo que configura tudo
2. **Número WhatsApp dedicado** — Não usar número pessoal
3. **Node 24** — Mais estável que Node 22
4. **Habilitar systemd no WSL2** — Para daemon persistente

### 10.2 Segurança

1. **`dmPolicy: "pairing"`** para canais novos — Aprovar antes de responder
2. **`dmScope: "per-channel-peer"`** se múltiplos usuários
3. **`bind: "loopback"`** sempre que possível
4. **Rodar `openclaw security audit --deep`** regularmente
5. **Nunca usar `allowFrom: ["*"]`** em produção sem necessidade

### 10.3 Performance

1. **`maxConcurrent: 10`** para paralelismo de sessões
2. **`compaction: "safeguard"`** para não perder contexto desnecessariamente
3. **Session maintenance** ativado (`pruneAfterDays: 30`)
4. **Modelo com fallbacks** — Primary + 1-2 fallbacks

### 10.4 Estabilidade

1. **`openclaw doctor`** após atualizações
2. **Backups automáticos** do `openclaw.json` (`.bak`, `.bak.1`)
3. **Monitorar logs** com `openclaw logs --follow` durante setup
4. **Health monitoring** habilitado para canais

### 10.5 Config Segura (Edição)

```bash
# SEMPRE: backup → edit → validate → restart
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.manual

# Editar (via node, pois jq pode não estar instalado)
node -e "
const fs=require('fs');
const cfg=JSON.parse(fs.readFileSync(process.env.HOME+'/.openclaw/openclaw.json','utf8'));
// ... sua edição aqui ...
fs.writeFileSync(process.env.HOME+'/.openclaw/openclaw.json', JSON.stringify(cfg,null,2));
"

# Validar
node -e "JSON.parse(require('fs').readFileSync(process.env.HOME+'/.openclaw/openclaw.json','utf8'));console.log('OK')"

# Restart
openclaw gateway restart
```

### 10.6 Multi-Agent (Coding)

```bash
# Spawn Codex em background
bash pty:true workdir:~/project background:true command:"codex exec --full-auto 'Build API'"

# Spawn Claude Code
bash pty:true workdir:~/project background:true command:"claude 'Refactor auth'"

# Monitorar
process action:list
process action:log sessionId:XXX
```

### 10.7 Workspace

| Arquivo | Função | Quando editar |
|---------|--------|---------------|
| `SOUL.md` | Personalidade, tom, estilo | Mudar como o bot fala |
| `IDENTITY.md` | Nome, criatura, emoji | Rebrand |
| `USER.md` | Info do owner | Quando contexto muda |
| `AGENTS.md` | Regras: memória, safety, grupos | Mudar comportamento |
| `BOOT.md` | Instruções de startup | Mudar protocolo de notificação |
| `HEARTBEAT.md` | Checklist periódico (vazio = skip) | Adicionar/remover tarefas |
| `MEMORY.md` | Memória curada (só main session) | Bot gerencia sozinho |
| `TOOLS.md` | Contatos, SSH hosts, devices | Adicionar tool notes |

---

## 11. Referência de Comandos

### Gateway

```bash
openclaw gateway                    # Iniciar foreground
openclaw gateway --verbose          # Com debug
openclaw gateway status             # Status
openclaw gateway restart            # Reiniciar
openclaw gateway stop               # Parar
openclaw gateway install [--force]  # Instalar daemon
```

### Diagnóstico

```bash
openclaw status [--all] [--deep]    # Status geral
openclaw health                     # Health check
openclaw doctor [--fix] [--yes]     # Diagnóstico completo
openclaw logs --follow              # Logs em tempo real
```

### Channels

```bash
openclaw channels status [--probe]  # Status dos canais
openclaw channels login             # Login (QR, token, etc)
openclaw channels list              # Listar canais
```

### Modelos

```bash
openclaw models list [--all]        # Listar modelos
openclaw models status              # Status do modelo atual
openclaw models set <ref>           # Mudar modelo
openclaw models fallbacks add <ref> # Adicionar fallback
openclaw models scan                # Escanear disponíveis
```

### Pairing

```bash
openclaw pairing list <channel>     # Pendentes
openclaw pairing approve <channel> <code>  # Aprovar
```

### Devices/Nodes

```bash
openclaw devices list               # Listar dispositivos
openclaw devices approve <code>     # Aprovar device
openclaw nodes list                 # Listar nodes
openclaw nodes status               # Status dos nodes
```

### Cron

```bash
openclaw cron list                  # Listar jobs
openclaw cron add ...               # Adicionar
openclaw cron run <id>              # Executar manual
openclaw cron runs --id <id>        # Histórico
openclaw cron delete <id>           # Remover
```

### Config

```bash
openclaw config get <path>          # Ler valor
openclaw config set <path> <value>  # Definir valor
openclaw config unset <path>        # Remover valor
```

### Segurança

```bash
openclaw security audit [--deep] [--fix]   # Audit
openclaw approvals get --node <id>         # Exec approvals
openclaw approvals allowlist add <cmd>     # Allowlist
```

### Skills

```bash
clawdhub search "keyword"          # Buscar skills
clawdhub install <slug>             # Instalar
clawdhub list                       # Listar
clawdhub update --all               # Atualizar
```

### Chat Commands (WhatsApp/Telegram/Slack)

```
/status    — Status da sessão (modelo + tokens)
/new       — Reset sessão
/compact   — Compactar contexto
/think     — off|minimal|low|medium|high|xhigh
/verbose   — on|off
/usage     — off|tokens|full
/model     — Mudar modelo
/restart   — Reiniciar gateway
/activation — mention|always (grupos)
```

---

## 12. Mapa de Arquivos

```
~/.openclaw/
├── openclaw.json                    # CONFIG PRINCIPAL
├── openclaw.json.bak*               # Backups automáticos
├── exec-approvals.json              # Aprovações de exec
│
├── agents/main/
│   ├── agent/auth-profiles.json     # Tokens de auth
│   └── sessions/
│       ├── sessions.json            # ÍNDICE DE SESSÕES
│       └── *.jsonl                  # Transcrições (1 JSON por linha)
│
├── workspace/                       # WORKSPACE DO AGENTE (git-tracked)
│   ├── SOUL.md                      # Personalidade
│   ├── IDENTITY.md                  # Nome, tipo
│   ├── USER.md                      # Contexto do owner
│   ├── AGENTS.md                    # Regras de comportamento
│   ├── BOOT.md                      # Instruções de boot
│   ├── HEARTBEAT.md                 # Checklist periódico
│   ├── MEMORY.md                    # Memória curada
│   ├── TOOLS.md                     # Contatos, SSH, devices
│   ├── memory/                      # Logs diários + tópicos
│   └── skills/                      # Skills do workspace
│
├── memory/main.sqlite               # Vector DB (Gemini embeddings)
│
├── logs/
│   ├── gateway.log                  # Runtime: startup, channels, config
│   ├── gateway.err.log              # Erros: drops, API fails, timeouts
│   └── commands.log                 # Log de comandos
│
├── cron/
│   ├── jobs.json                    # Definições de jobs
│   └── runs/                        # Logs por job
│
├── credentials/
│   ├── whatsapp/default/            # Sessão Baileys (~1400 arquivos)
│   ├── telegram/{botname}/token.txt # Tokens de bot
│   └── matrix/                      # Credenciais Matrix
│
├── extensions/{name}/               # Plugins customizados
├── skills/                          # Skills managed (instaladas)
├── identity/                        # Device identity
├── devices/                         # Paired devices
├── media/inbound/                   # Mídia recebida
├── media/browser/                   # Screenshots
├── browser/openclaw/user-data/      # Profile Chromium
├── canvas/index.html                # Web canvas
└── subagents/runs.json              # Log de sub-agentes
```

---

> **Fonte:** Documentação oficial OpenClaw em `/home/michsantoz/selantar/docs/`
> **Data:** 2026-03-23
> **Versão:** OpenClaw 2026.3.13
