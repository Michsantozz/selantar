# OpenClaw — Arquitetura Técnica de Agentes

> Documento detalhado sobre a estrutura interna dos agentes OpenClaw:
> prompts, tool calling, queues, orquestração, contexto, compaction, spawning e multi-agent.

---

## Índice

1. [Agent Loop — Ciclo de Vida Completo](#1-agent-loop--ciclo-de-vida-completo)
2. [Queue & Lanes — Fila de Mensagens](#2-queue--lanes--fila-de-mensagens)
3. [Prompt Assembly — Montagem do System Prompt](#3-prompt-assembly--montagem-do-system-prompt)
4. [Templates de Prompt — Todos os Arquivos](#4-templates-de-prompt--todos-os-arquivos)
5. [Tool Calling — Function Calling Interno](#5-tool-calling--function-calling-interno)
6. [Context Engine — Gerenciamento de Contexto](#6-context-engine--gerenciamento-de-contexto)
7. [Compaction & Memory — Compressão e Memória](#7-compaction--memory--compressão-e-memória)
8. [Session Pruning — Poda de Sessões](#8-session-pruning--poda-de-sessões)
9. [Sessões — Gerenciamento Completo](#9-sessões--gerenciamento-completo)
10. [Multi-Agent — Roteamento e Orquestração](#10-multi-agent--roteamento-e-orquestração)
11. [Subagents — Spawning de Sub-Agentes](#11-subagents--spawning-de-sub-agentes)
12. [Session Tools — Comunicação Inter-Agente](#12-session-tools--comunicação-inter-agente)
13. [Streaming & Chunking — Entrega de Respostas](#13-streaming--chunking--entrega-de-respostas)
14. [Models & Failover — Seleção e Fallback](#14-models--failover--seleção-e-fallback)
15. [Gateway Protocol — WebSocket & RPC](#15-gateway-protocol--websocket--rpc)
16. [Hooks — Pontos de Extensão](#16-hooks--pontos-de-extensão)
17. [Typing & Presence](#17-typing--presence)
18. [Todas as Configs de Agente](#18-todas-as-configs-de-agente)

---

## 1. Agent Loop — Ciclo de Vida Completo

### Fluxo Completo

```
Mensagem inbound
    │
    ▼
[1] Dedupe + Debounce
    │
    ▼
[2] Queue (Lane FIFO)
    │ ├─ Per-session lane: session:<key>  (1 run por sessão)
    │ └─ Global lane: main               (maxConcurrent cap)
    │
    ▼
[3] agent RPC
    │ ├─ Valida params
    │ ├─ Resolve sessão (session key → session ID)
    │ └─ Retorna { runId, acceptedAt }
    │
    ▼
[4] agentCommand
    │ ├─ Resolve modelo + defaults
    │ ├─ Carrega skills snapshot
    │ └─ Chama runEmbeddedPiAgent
    │
    ▼
[5] runEmbeddedPiAgent
    │ ├─ Serializa via per-session + global queues
    │ ├─ Constrói pi session
    │ ├─ Subscreve a eventos
    │ ├─ Enforce timeout (default 600s)
    │ └─ Inicia loop de inferência
    │
    ▼
[6] Loop de Inferência (pi-agent-core)
    │ ├─ Monta context (system prompt + history + tools)
    │ ├─ Chama LLM
    │ ├─ Streama deltas (text + reasoning + tool calls)
    │ ├─ Executa tools se necessário
    │ ├─ Verifica steering queue (mensagens pendentes)
    │ └─ Repete até resposta final ou timeout
    │
    ▼
[7] subscribeEmbeddedPiSession
    │ ├─ Ponte: pi events → OpenClaw streams
    │ ├─ Events: assistant, tool, lifecycle
    │ └─ Compaction events se necessário
    │
    ▼
[8] Entrega
    │ ├─ Chunking por canal
    │ ├─ Block streaming (se habilitado)
    │ ├─ Human delay (se habilitado)
    │ └─ Envio final ao canal
    │
    ▼
[9] Persistência
    │ ├─ Append ao JSONL da sessão
    │ ├─ Atualiza sessions.json (índice)
    │ └─ Background compaction (se necessário)
    │
    ▼
[10] agent.wait
     ├─ Espera lifecycle end/error
     └─ Retorna { status, startedAt, endedAt, error? }
```

### Entry Points

| Ponto de Entrada | Descrição |
|------------------|-----------|
| Gateway RPC `agent` | Chamada principal — valida, enfileira, retorna runId |
| Gateway RPC `agent.wait` | Espera resultado (timeout default 30s) |
| CLI `openclaw agent` | Via terminal |
| Channel inbound | Mensagem de WhatsApp/Telegram/etc |
| Cron job | Agendamento disparando agent turn |
| Webhook | HTTP POST → agent turn |

### Timeouts

| Timeout | Default | Config |
|---------|---------|--------|
| Agent runtime | 600s (10 min) | `agents.defaults.timeoutSeconds` |
| `agent.wait` | 30s | param `timeoutMs` |
| Lane wait | Indefinido (com cap) | `messages.queue.cap` |

### Early Termination

- Timeout do agent runtime (AbortSignal)
- Desconexão do cliente
- `agent.wait` timeout
- Comando `/stop`

---

## 2. Queue & Lanes — Fila de Mensagens

### Estrutura de Lanes

```
┌─────────────────────────────────────────┐
│           GLOBAL LANE: main             │
│     maxConcurrent: 4 (default)          │
│                                         │
│  ┌───────────────┐ ┌───────────────┐    │
│  │ session:user1 │ │ session:user2 │    │
│  │  (1 por vez)  │ │  (1 por vez)  │    │
│  └───────────────┘ └───────────────┘    │
│                                         │
│  ┌───────────────┐ ┌───────────────┐    │
│  │ session:group1│ │  session:cron │    │
│  │  (1 por vez)  │ │  (1 por vez)  │    │
│  └───────────────┘ └───────────────┘    │
└─────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  LANE: cron      │  │  LANE: subagent  │
│  (paralelo ao    │  │  (paralelo ao    │
│   main)          │  │   main)          │
└──────────────────┘  └──────────────────┘
```

- **Per-session lane:** `session:<key>` — máximo 1 run por sessão (serializado)
- **Global lane:** `main` — cap geral de concorrência (`maxConcurrent`, default 4)
- **Lanes adicionais:** `cron`, `subagent` — rodam em paralelo ao main

### Queue Modes

| Modo | Comportamento | Quando usar |
|------|---------------|-------------|
| `collect` (default) | Acumula mensagens pendentes, entrega como follow-up consolidado | Uso geral |
| `steer` | Injeta na run atual (cancela tool calls pendentes) | Interrupção urgente |
| `followup` | Enfileira para próximo turno | Preservar contexto |
| `steer-backlog` | Injeta agora + preserva para follow-up | Híbrido |
| `interrupt` | Aborta run ativo, roda mensagem mais nova | Prioridade máxima |

### Opções de Queue

```json5
{
  messages: {
    queue: {
      mode: "collect",        // collect | steer | followup | interrupt
      debounceMs: 1000,       // Espera silêncio antes de follow-up
      cap: 20,                // Máximo de mensagens enfileiradas
      drop: "summarize",      // Overflow: old | new | summarize
      byChannel: {            // Overrides por canal
        whatsapp: { mode: "collect", debounceMs: 2000 },
        telegram: { mode: "steer" }
      }
    }
  }
}
```

### Debounce de Inbound

```json5
{
  messages: {
    inbound: {
      debounceMs: 1500,       // Global default
      byChannel: {
        whatsapp: { debounceMs: 2000 },
        telegram: { debounceMs: 1000 }
      }
    }
  }
}
```

- **Text-only batching:** mídia/attachments flusham imediatamente
- **Control commands** (`/new`, `/think`, etc.) bypassam debounce
- **Dedupe cache:** chave = channel + account + peer + session + message id

### Steering (Injeção em Run Ativa)

Quando `mode: "steer"`:
1. Mensagem chega enquanto agente está processando
2. Após cada tool call, agente verifica queue
3. Tool calls pendentes são canceladas com erro
4. Mensagem injetada antes da próxima resposta
5. Agente processa a nova mensagem com contexto atualizado

---

## 3. Prompt Assembly — Montagem do System Prompt

### Ordem de Montagem

```
System Prompt Final
│
├── [1] TOOLING
│   ├── Lista de tools disponíveis
│   ├── Descrições + schemas
│   └── Tool policies (allow/deny)
│
├── [2] SAFETY
│   └── Guardrail reminder
│
├── [3] SKILLS
│   ├── Lista compacta: nome + descrição + localização
│   └── Instrução: "carregue via read quando necessário"
│
├── [4] SELF-UPDATE
│   ├── config.apply
│   └── update.run
│
├── [5] WORKSPACE
│   └── Working directory path
│
├── [6] DOCUMENTATION
│   ├── Local docs path
│   └── ClawHub reference
│
├── [7] BOOTSTRAP FILES (injetados)
│   ├── AGENTS.md    (regras de operação)
│   ├── SOUL.md      (personalidade)
│   ├── TOOLS.md     (notas de ferramentas)
│   ├── IDENTITY.md  (identidade)
│   ├── USER.md      (perfil do usuário)
│   ├── MEMORY.md    (memória curada)
│   ├── HEARTBEAT.md (tarefas periódicas)
│   └── BOOTSTRAP.md (só first-run, deletado depois)
│
├── [8] SANDBOX (quando habilitado)
│   ├── Runtime info
│   ├── Path rules
│   └── Elevated exec availability
│
├── [9] CURRENT DATE & TIME
│   ├── User timezone
│   └── Time format (cache-stable)
│
├── [10] REPLY TAGS
│   └── Syntax para providers suportados
│
├── [11] HEARTBEATS
│   ├── Prompt de heartbeat
│   └── Ack behavior
│
├── [12] RUNTIME
│   ├── Host, OS, Node version
│   ├── Model identifier
│   ├── Repo root
│   └── Thinking level
│
└── [13] REASONING
    ├── Visibility level
    └── /reasoning toggle
```

### Modos de Prompt

| Modo | Seções incluídas | Quando usado |
|------|------------------|--------------|
| `full` (default) | Todas as seções | Sessões normais |
| `minimal` | Omite: Skills, Memory Recall, Self-Update, Model Aliases, User Identity, Reply Tags, Messaging, Silent Replies, Heartbeats | Sub-agentes |
| `none` | Só base identity line | Contexts mínimos |

### Limites de Bootstrap Files

| Config | Default | Descrição |
|--------|---------|-----------|
| `bootstrapMaxChars` | 20000 | Máximo por arquivo |
| `bootstrapTotalMaxChars` | 150000 | Máximo total |
| `bootstrapPromptTruncationWarning` | `once` | `off\|once\|always` |

- Arquivos em branco são ignorados
- Arquivos ausentes injetam marker
- Arquivos grandes são truncados com aviso
- Sub-agentes recebem apenas `AGENTS.md` + `TOOLS.md`

### Tamanho Típico do System Prompt

- **9.000–40.000 tokens** dependendo de:
  - Modelo (diferentes wrappers)
  - Quantidade de tools
  - Tamanho do workspace (bootstrap files)
  - Skills carregadas

---

## 4. Templates de Prompt — Todos os Arquivos

### 4.1 AGENTS.md — Regras de Operação

```markdown
# O que faz:
- Define regras de como o agente opera
- Sistema de memória (daily + long-term)
- Red lines (o que NUNCA fazer)
- Regras de grupo
- Heartbeats

# Estrutura:
## Startup
- Lê SOUL.md, USER.md, memory files
- Identifica contexto

## Memory System
- Daily: memory/YYYY-MM-DD.md (logs diários)
- Long-term: MEMORY.md (curado manualmente pelo agente)
- Recall: memory_search (semântico) + memory_get (direto)

## Red Lines
- Privacidade de dados
- Comandos destrutivos sem permissão
- Ações externas sem confirmação

## External vs Internal Actions
- SAFE (fazer livremente): ler arquivos, buscar info, calcular
- ASK FIRST: enviar mensagens, deletar, modificar config, transações

## Group Chats
- Saber quando falar
- Não dominar conversa
- Respeitar mention gating

## Reactions
- Usar emoji naturalmente como resposta leve

## Tools & Skills
- Carregar on-demand via read de SKILL.md
- Lista de skills no system prompt (nome + descrição)

## Heartbeats
- Tarefas periódicas (email, calendar, notifications, weather)
- Controlado por HEARTBEAT.md

## Memory Maintenance
- Periodicamente curar daily → long-term
- Mover insights importantes para MEMORY.md
```

### 4.2 SOUL.md — Personalidade

```markdown
# O que define:
## Core Truths
- Genuinamente útil
- Tem opiniões formadas
- Resourceful (resolve problemas)
- Constrói confiança ao longo do tempo
- Respeita limites

## Boundaries
- Privacidade: nunca compartilhar dados sem permissão
- Quando perguntar vs quando fazer
- Nunca respostas genéricas/half-baked
- Comportamento em grupos

## Vibe
- Tom: conciso mas completo
- Não corporativo, não bajulador
- Natural, direto
- Humor sutil quando apropriado

## Continuity
- Arquivos SÃO memória — manter atualizados
- Avisar o usuário quando mudar algo
- Construir perfil do usuário ao longo do tempo
```

### 4.3 IDENTITY.md — Identidade

```markdown
---
name: "Nome do Agente"
creature: "tipo (ex: lobster, owl, etc)"
vibe: "descrição curta do vibe"
emoji: "🦞"
avatar: "./avatar.png"  # ou URL
---
```

### 4.4 USER.md — Perfil do Humano

```markdown
# O que contém:
- Nome do usuário
- Como se dirigir
- Pronomes
- Timezone
- Contexto: projetos, preferências, humor
- Construído ao longo do tempo pelo agente
```

### 4.5 TOOLS.md — Notas de Ferramentas

```markdown
# O que contém (exemplos):
## Cameras
- "front-door": câmera da porta da frente
- "office": câmera do escritório

## SSH Hosts
- "server1": ubuntu@192.168.1.100

## TTS Voices
- "alloy": voz padrão
- "echo": voz grave

## Speakers
- "living-room": Sonos sala

## Device Nicknames
- "phone": iPhone pessoal
- "tablet": iPad Pro

# NOTA: Este arquivo NÃO controla quais tools existem.
# É apenas guia/notas para o agente usar as tools corretamente.
```

### 4.6 BOOT.md — Instruções de Startup

```markdown
# Executado toda vez que o gateway inicia
# Exemplo: protocolo de notificação autopilot
# WhatsApp → processa → responde → notifica via Signal
```

### 4.7 BOOTSTRAP.md — First-Run

```markdown
# Executado apenas NA PRIMEIRA VEZ (deletado depois)
# Conversa guiada:
1. Escolher nome do agente
2. Tipo de criatura
3. Vibe/personalidade
4. Emoji representativo
5. Atualiza IDENTITY.md, USER.md, SOUL.md
6. Opcional: setup de canais
7. Deleta BOOTSTRAP.md quando terminar
```

### 4.8 HEARTBEAT.md — Tarefas Periódicas

```markdown
# Se vazio: heartbeat é SKIP (sem chamadas de API)
# Se preenchido, exemplo:

## Checklist
- [ ] Verificar email (gmail inbox)
- [ ] Verificar calendário (próximos 24h)
- [ ] Verificar notificações pendentes
- [ ] Verificar clima
- [ ] Verificar tarefas Trello/Notion

# Intervalo: agents.defaults.heartbeat.every (default 30m)
```

### 4.9 MEMORY.md — Memória Curada

```markdown
# Gerenciado pelo próprio agente
# Long-term: insights importantes extraídos dos daily logs
# Carregado APENAS em sessões main/direct
# Formato livre — o agente organiza como quiser
```

---

## 5. Tool Calling — Function Calling Interno

### Fluxo de Tool Calling

```
LLM gera tool_call
    │
    ▼
[1] before_tool_call hook
    │ (pode interceptar/modificar params)
    │
    ▼
[2] Execução da tool
    │ ├─ Built-in: read, exec, edit, write, process
    │ ├─ Session tools: sessions_list, sessions_history, sessions_send, sessions_spawn
    │ ├─ Messaging: send (cross-channel)
    │ ├─ Browser: browser control
    │ ├─ Cron: job management
    │ ├─ Canvas: visual workspace
    │ ├─ Nodes: device actions
    │ └─ Skills: skill-specific tools
    │
    ▼
[3] after_tool_call hook
    │ (pode modificar resultado)
    │
    ▼
[4] tool_result_persist hook
    │ (transforma resultado antes de logar)
    │
    ▼
[5] Tool result → volta ao LLM
    │
    ▼
[6] LLM decide: mais tools ou resposta final?
    │
    ├── Mais tools → volta ao passo [1]
    └── Resposta final → streaming ao usuário
```

### Tools Built-in

| Tool | Descrição | Policy |
|------|-----------|--------|
| `read` | Ler arquivo do workspace | Sempre disponível |
| `write` | Escrever arquivo | Sujeito a tool policy |
| `edit` | Editar arquivo (diff) | Sujeito a tool policy |
| `exec` | Executar comando shell | Sujeito a sandbox + approval |
| `process` | Gerenciar processos | Sujeito a tool policy |
| `apply_patch` | Aplicar patch | Gated por `tools.exec.applyPatch` |

### Session Tools

| Tool | Descrição |
|------|-----------|
| `sessions_list` | Listar sessões ativas |
| `sessions_history` | Buscar transcrição de uma sessão |
| `sessions_send` | Enviar mensagem para outra sessão |
| `sessions_spawn` | Spawnar sub-agente |

### Tool Policies

```json5
{
  tools: {
    allow: ["read", "write", "edit", "exec", "sessions_*"],
    deny: ["browser", "canvas"],
    exec: {
      applyPatch: true
    },
    sessions: {
      visibility: "tree"  // self | tree | agent | all
    }
  }
}
```

### Messaging Tool — Cross-Channel

- Agent pode enviar mensagens para qualquer canal conectado
- Tracking de envios para suprimir confirmações duplicadas
- `NO_REPLY` filtrado dos payloads de saída
- Cross-context controlado por `tools.message.crossContext`

### Tool Result Sanitization

- Resultados sanitizados antes de logging/emissão
- Tool results grandes são podados pelo session pruning
- `tool_result_persist` hook permite transformação antes de persistir

---

## 6. Context Engine — Gerenciamento de Contexto

### Ciclo de Vida do Contexto

```
[1] INGEST — Armazenar/indexar nova mensagem
    │
    ▼
[2] ASSEMBLE — Montar mensagens ordenadas + systemPromptAddition
    │           Respeitar budget de tokens
    │
    ▼
[3] COMPACT — Resumir histórico antigo (quando necessário)
    │
    ▼
[4] AFTER TURN — Persistir estado, trigger background compaction
```

### Context Engine Default (Legacy)

- Pass-through + built-in summarization
- Pi-agent-core gerencia compaction
- Mensagens passadas como estão

### Custom Context Engine (Plugin)

```typescript
// Interface de um context engine customizado
interface ContextEngine {
  ingest(message): void;                    // Armazenar nova mensagem
  assemble(budget): AssembledContext;        // Montar contexto dentro do budget
  compact(): void;                          // Resumir histórico
  bootstrap?(): void;                       // Inicialização
  ingestBatch?(messages): void;             // Batch ingest
  afterTurn?(): void;                       // Pós-turno
  prepareSubagentSpawn?(config): void;      // Preparar spawn
  onSubagentEnded?(result): void;           // Subagente terminou
  dispose?(): void;                         // Cleanup
}

// assemble retorna:
{
  messages: Message[];          // Mensagens ordenadas
  estimatedTokens: number;      // Tokens estimados
  systemPromptAddition?: string; // Adição ao system prompt
}
```

- `ownsCompaction: true` → engine controla toda compaction
- `ownsCompaction: false` → Pi built-in ainda roda

### O Que Conta Como Contexto

| Componente | Tokens Típicos |
|------------|----------------|
| System prompt | 9.000–40.000 |
| Tool list + schemas | Varia por quantidade |
| Conversation history | Cresce com uso |
| Tool call results | Pode ser grande |
| Attachments | Imagens, PDFs |
| Compaction summaries | Resumos anteriores |
| Pruning artifacts | Placeholders |

### Estimativa de Context Window

1. `models.providers.*.models[].contextWindow` override
2. Model definition `contextWindow`
3. Default: **200.000 tokens**
4. `agents.defaults.contextTokens` como cap (mínimo)

### Comandos de Inspeção

```
/status           — Status rápido (modelo + tokens)
/context list     — Listar componentes do contexto
/context detail   — Detalhes de cada componente
/usage tokens     — Uso de tokens
/compact          — Forçar compaction manual
```

---

## 7. Compaction & Memory — Compressão e Memória

### Compaction — O que é

Quando o contexto se aproxima do limite da context window, o OpenClaw **resume mensagens antigas** em um sumário compacto:

```
ANTES da compaction:
[msg1] [msg2] [msg3] [msg4] [msg5] [msg6] [msg7] [msg8] [msg9] [msg10]

DEPOIS da compaction:
[SUMÁRIO de msg1-msg7] [msg8] [msg9] [msg10]
```

### Tipos de Compaction

| Tipo | Trigger | Descrição |
|------|---------|-----------|
| **Auto-compaction** | Context window quase cheia | Automático, transparente |
| **Manual** | `/compact [instruções]` | Forçado pelo usuário |
| **Memory flush** | Pre-compaction | Turno silencioso para salvar memória |

### Memory Flush (Pre-Compaction)

```
Context quase cheio
    │
    ▼
[1] Soft threshold atingido
    │ (contextWindow - reserveTokensFloor - softThresholdTokens)
    │
    ▼
[2] Turno silencioso
    │ "Salve informações importantes em memória durável"
    │ (NÃO visível ao usuário)
    │
    ▼
[3] Agente escreve em memory/YYYY-MM-DD.md ou MEMORY.md
    │
    ▼
[4] Compaction executa normalmente
    │
    ▼
[5] Informações importantes já estão salvas em arquivo
```

**Config:**

```json5
{
  agents: {
    defaults: {
      compaction: {
        mode: "warn",                    // warn | enforce
        model: "anthropic/claude-sonnet-4-6",  // Modelo para sumarização
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 50000
        },
        reserveTokensFloor: 10000,
        targetTokens: 100000             // Alvo pós-compaction
      }
    }
  }
}
```

### 3 Camadas de Memória

```
┌─────────────────────────────────────────────────┐
│ CAMADA 1: Context Window (in-memory)            │
│ • Mensagens da sessão atual                     │
│ • Compactada quando enche                       │
│ • Perdida após compaction                       │
├─────────────────────────────────────────────────┤
│ CAMADA 2: Workspace Files (durável)             │
│ • memory/YYYY-MM-DD.md (daily logs)             │
│ • MEMORY.md (long-term curado)                  │
│ • Gerenciado pelo agente                        │
│ • Persistente entre sessões                     │
├─────────────────────────────────────────────────┤
│ CAMADA 3: Vector DB (SQLite + embeddings)       │
│ • memory/main.sqlite                            │
│ • Busca semântica (BM25 + embeddings)           │
│ • Providers: Gemini, OpenAI, Voyage, Ollama     │
│ • Features: MMR diversity, temporal decay       │
└─────────────────────────────────────────────────┘
```

### Memory Tools

| Tool | Descrição |
|------|-----------|
| `memory_search` | Busca semântica (hybrid BM25 + embedding) |
| `memory_get` | Leitura direta de arquivo de memória |

### Compaction vs Pruning

| Aspecto | Compaction | Pruning |
|---------|-----------|---------|
| **Persiste?** | Sim (no JSONL) | Não (transiente) |
| **O que faz?** | Resume mensagens antigas | Remove tool results antigos |
| **Quando?** | Context window cheia | Antes de cada LLM call |
| **Reversível?** | Não | Sim (não modifica JSONL) |

---

## 8. Session Pruning — Poda de Sessões

### O Que É

Trima **tool results antigos** do contexto in-memory **antes de cada LLM call**, sem reescrever o JSONL.

### Como Funciona

```
Antes de cada LLM call:
    │
    ▼
[1] Verifica modo: off | cache-ttl
    │
    ▼
[2] Se cache-ttl: último call Anthropic > ttl (5min)?
    │ ├─ Não → Skip pruning
    │ └─ Sim → Continuar
    │
    ▼
[3] Identifica tool results para podar
    │ ├─ Apenas toolResult messages (nunca user/assistant)
    │ ├─ Protege últimos keepLastAssistants (default 3) assistants
    │ └─ Aplica tools.allow / tools.deny
    │
    ▼
[4] Soft trim: head + tail, insere "..."
    │
    ▼
[5] Hard clear: substitui com placeholder para results muito antigos
    │
    ▼
[6] Contexto trimado → envia ao LLM
```

### Config

```json5
{
  agents: {
    defaults: {
      contextPruning: {
        mode: "cache-ttl",      // off | cache-ttl
        ttlMinutes: 5,          // Cache TTL
        keepLastAssistants: 3,  // Proteger últimos N assistants
        tools: {
          allow: ["*"],         // Quais tools podar
          deny: ["memory_*"]   // Quais proteger
        }
      }
    }
  }
}
```

### Smart Defaults

| Auth Type | Pruning | Heartbeat | Cache Retention |
|-----------|---------|-----------|-----------------|
| OAuth/setup-token | `cache-ttl` | 1h | Normal |
| API key | `cache-ttl` | 30m | `short` |

---

## 9. Sessões — Gerenciamento Completo

### Session Keys

```
# DMs (depende de dmScope):
main               → agent:main:main           (dmScope: "main")
per-peer            → agent:main:direct:+5562...  (dmScope: "per-peer")
per-channel-peer    → agent:main:whatsapp:direct:+5562... (dmScope: "per-channel-peer")

# Grupos:
agent:main:whatsapp:group:120363...
agent:main:telegram:group:-100123...
agent:main:discord:channel:123456...

# Cron:
cron:<job-uuid>

# Webhooks:
hook:<uuid>

# Subagentes:
agent:main:subagent:<uuid>

# Nodes:
node-<nodeId>

# Telegram topics:
agent:main:telegram:group:-100123...:topic:456
```

### DM Scope Modes

| Modo | Session Key | Isolamento |
|------|-------------|------------|
| `main` | `agent:main:main` | Nenhum — todas DMs na mesma sessão |
| `per-peer` | `agent:main:direct:+5562...` | Por sender (cross-channel) |
| `per-channel-peer` | `agent:main:whatsapp:direct:+5562...` | Por canal + sender |
| `per-account-channel-peer` | `agent:main:whatsapp:default:direct:+5562...` | Por account + canal + sender |

### Reset Policy

```json5
{
  session: {
    reset: {
      mode: "daily",        // daily | idle | none
      atHour: 4             // 4 AM local time
    },
    idleMinutes: 120,        // Reset após 2h idle
    resetByType: {
      direct: { mode: "daily" },
      group: { mode: "none" },     // Grupos nunca resetam
      thread: { mode: "idle" }
    },
    resetByChannel: {
      telegram: { mode: "idle", idleMinutes: 60 }
    }
  }
}
```

### Storage

```
~/.openclaw/agents/main/sessions/
├── sessions.json                    # ÍNDICE (sessionKey → metadata)
├── <SessionId>.jsonl                # Transcrição (1 JSON/linha)
├── <SessionId>-topic-<threadId>.jsonl  # Telegram topics
├── *.deleted.<timestamp>            # Arquivados
└── *.reset.<timestamp>              # Reset archives
```

### JSONL Types

| type | Descrição |
|------|-----------|
| `session` | Header: id, timestamp, cwd |
| `message` | Turno: role, content, model, usage |
| `custom` | Metadata: `model-snapshot`, `openclaw.cache-ttl` |
| `compaction` | Context window podada |
| `model_change` | Modelo trocado mid-session |
| `thinking_level_change` | Thinking level ajustado |

### Maintenance

```json5
{
  session: {
    maintenance: {
      mode: "enforce",            // warn | enforce
      pruneAfter: "30d",          // Prune entries > 30 dias
      maxEntries: 500,            // Cap no número
      rotateBytes: 10485760,      // Rotacionar sessions.json > 10MB
      maxDiskBytes: 1073741824,   // Budget: 1GB (opcional)
      highWaterBytes: 858993459   // 80% do max
    }
  }
}
```

**Ordem de manutenção:**
1. Prune stale → cap count → archive transcripts → purge old archives → rotate sessions.json → enforce disk budget

---

## 10. Multi-Agent — Roteamento e Orquestração

### Arquitetura Multi-Agent

```
┌──────────────────────────────────────────────────────┐
│                    GATEWAY                            │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Agent: main  │  │ Agent: sales │  │Agent: code │ │
│  │              │  │              │  │            │ │
│  │ Workspace    │  │ Workspace    │  │ Workspace  │ │
│  │ Sessions     │  │ Sessions     │  │ Sessions   │ │
│  │ Auth         │  │ Auth         │  │ Auth       │ │
│  │ Skills       │  │ Skills       │  │ Skills     │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                │        │
│  ┌──────┴─────────────────┴────────────────┴──────┐ │
│  │              BINDING ROUTER                     │ │
│  │  (most-specific wins)                           │ │
│  └──────┬─────────────────┬────────────────┬──────┘ │
│         │                 │                │        │
│  ┌──────┴──┐       ┌─────┴──┐      ┌─────┴──┐     │
│  │WhatsApp │       │Telegram│      │Discord │     │
│  └─────────┘       └────────┘      └────────┘     │
└──────────────────────────────────────────────────────┘
```

### O Que É Um Agente

Cada agente tem:
- **Workspace** (arquivos, AGENTS.md, SOUL.md, persona)
- **State directory** (`~/.openclaw/agents/<agentId>/`)
- **Auth profiles** (`agent/auth-profiles.json`)
- **Session store** (`sessions/sessions.json` + JSONLs)
- **Skills** (workspace + shared)
- **Model config** (override per-agent)

### Bindings (Roteamento)

Regras de roteamento de mensagens para agentes. **Most-specific wins:**

```
Prioridade (maior → menor):
1. peer match (DM/grupo específico)
2. parentPeer match (herança de thread)
3. guildId + roles (Discord)
4. guildId (Discord)
5. teamId (Slack)
6. accountId match
7. Channel-level match (accountId: "*")
8. Default agent
```

**Exemplo:**

```json5
{
  agents: {
    defaults: { workspace: "~/.openclaw/workspace" },
    list: [
      {
        id: "main",
        workspace: "~/.openclaw/workspace",
        model: "anthropic/claude-opus-4-6"
      },
      {
        id: "sales",
        workspace: "~/.openclaw/workspace-sales",
        model: "anthropic/claude-sonnet-4-6",
        bindings: [
          {
            channel: "telegram",
            accountId: "sales-bot",
            agentId: "sales"
          }
        ]
      },
      {
        id: "code",
        workspace: "~/.openclaw/workspace-code",
        bindings: [
          {
            channel: "discord",
            guildId: "123456",
            roles: ["developer"],
            agentId: "code"
          }
        ]
      }
    ]
  }
}
```

### Delegate Architecture

Agente nomeado que age "em nome de" humanos:

**Capability Tiers:**

| Tier | Capacidade |
|------|------------|
| 1. Read-Only + Draft | Lê dados, drafta mensagens para aprovação |
| 2. Send on Behalf | Envia mensagens sob própria identidade |
| 3. Proactive | Autônomo: schedule, standing orders, async review |

**Hardening:**
- Hard blocks em `SOUL.md` + `AGENTS.md`
- Tool restrictions per-agent (`tools.allow|deny`)
- Sandbox isolation
- Audit trail

---

## 11. Subagents — Spawning de Sub-Agentes

### Spawn via `sessions_spawn`

```
Agent principal (sessão main)
    │
    ├── sessions_spawn("Build REST API", label: "api-builder")
    │       │
    │       ▼
    │   Sub-agente (sessão: agent:main:subagent:<uuid>)
    │       │
    │       ├── Tools: tudo MENOS session tools
    │       ├── Prompt: minimal mode
    │       ├── Não pode spawnar sub-sub-agentes
    │       ├── Non-blocking (sempre async)
    │       └── Auto-archive após 60min (default)
    │
    ├── sessions_spawn("Review PR", label: "pr-reviewer")
    │       └── Outro sub-agente paralelo
    │
    └── Recebe resultados via announce step
```

### Parâmetros do Spawn

| Param | Descrição |
|-------|-----------|
| `task` | Descrição da tarefa |
| `label` | Nome legível |
| `agentId` | Qual agente usar (default: mesmo) |
| `model` | Override de modelo |
| `thinking` | Nível de thinking |
| `runTimeoutSeconds` | Timeout customizado |
| `thread` | Thread ID |
| `mode` | Modo de execução |
| `cleanup` | Cleanup policy |
| `sandbox` | Herda sandbox do pai |
| `attachments` | Arquivos para o sub-agente |

### Visibilidade de Sessões (Sandbox)

```json5
{
  tools: {
    sessions: {
      visibility: "tree"  // self | tree | agent | all
    }
  },
  agents: {
    defaults: {
      sandbox: {
        sessionToolsVisibility: "spawned"  // spawned | all
      }
    }
  }
}
```

### Multi-Agent Coding (Spawn Externo)

```bash
# Spawn Codex em background
bash pty:true workdir:~/project background:true command:"codex exec --full-auto 'Build API'"

# Spawn Claude Code
bash pty:true workdir:~/project background:true command:"claude 'Refactor auth'"

# Parallel PR reviews
bash pty:true background:true command:"codex exec 'Review PR #86'"
bash pty:true background:true command:"codex exec 'Review PR #87'"

# Com git worktrees para isolamento
git worktree add -b fix/78 /tmp/78 main
bash pty:true workdir:/tmp/78 background:true command:"codex --yolo 'Fix #78'"

# Auto-notify quando terminar
bash pty:true background:true command:"codex exec 'Task.
When done: openclaw gateway wake --text \"Done\" --mode now'"
```

---

## 12. Session Tools — Comunicação Inter-Agente

### `sessions_list`

```
Listar sessões ativas
Filtros: kinds, limit, activeMinutes, messageLimit
Sandboxed: vê apenas sessões spawned (por default)
```

### `sessions_history`

```
Buscar transcrição de uma sessão
Params: sessionKey | sessionId, limit, includeTools
Default: sem tool results (economiza tokens)
```

### `sessions_send`

```
Enviar mensagem para outra sessão

Agente A (sessão main)
    │
    ├── sessions_send(sessionKey: "agent:main:sales", message: "Status do deal?")
    │       │
    │       ▼
    │   Agente Sales recebe mensagem
    │       │
    │       ▼
    │   Reply-back loop (alternating):
    │       Agente A → Agente Sales → Agente A → ...
    │       (max turns configurável)
    │
    │   Fire-and-forget (timeoutSeconds: 0):
    │       Agente A envia, não espera resposta
    │
    └── Mensagem persistida com provenance.kind = "inter_session"
```

### `sessions_spawn`

Ver seção 11 (Subagents).

---

## 13. Streaming & Chunking — Entrega de Respostas

### Block Streaming

```
LLM gerando texto...
    │
    ├── Buffer acumula
    │   ├── buffer >= minChars? Continue acumulando
    │   ├── buffer >= maxChars? SPLIT!
    │   └── Break preference: paragraph → newline → sentence → whitespace → hard
    │
    ├── Code fence ativo? NUNCA split dentro
    │
    ├── Chunk pronto → Enviar ao canal
    │   ├── Coalescing? Merge chunks próximos
    │   └── Human delay? Pausa entre chunks
    │
    └── message_end → Flush final
```

### Config de Streaming

```json5
{
  agents: {
    defaults: {
      blockStreamingDefault: "off",        // on | off
      blockStreamingBreak: "text_end",     // text_end | message_end
      blockStreamingChunk: {
        minChars: 200,
        maxChars: 2000,
        breakPreference: "paragraph"       // paragraph > newline > sentence > whitespace > hard
      },
      blockStreamingCoalesce: {
        minChars: 1500,                    // Merge fragments menores que isso
        maxChars: 4000,
        idleMs: 500                        // Merge se gap < 500ms
      },
      humanDelay: "off"                    // off | natural (800-2500ms) | { minMs, maxMs }
    }
  }
}
```

### Preview Streaming (Telegram/Discord/Slack)

| Modo | Comportamento |
|------|---------------|
| `off` | Sem preview |
| `partial` | Atualiza mensagem temporária |
| `block` | Append chunked |
| `progress` | Status + final |

### Chunking por Canal

| Canal | Limite Default |
|-------|----------------|
| WhatsApp | 4000 chars |
| Telegram | 4096 chars |
| Signal | 4000 chars |
| Discord | 2000 chars |
| Slack | 4000 chars |
| LINE | 5000 chars |
| Zalo | 2000 chars |

---

## 14. Models & Failover — Seleção e Fallback

### Ordem de Seleção

```
[1] Primary: agents.defaults.model.primary
    │ ├── Auth profile 1 → TENTA
    │ ├── Auth profile 2 → TENTA (se 1 falhou)
    │ └── Todos falharam?
    │
    ▼
[2] Fallback 1: agents.defaults.model.fallbacks[0]
    │ ├── Auth profiles → TENTA
    │ └── Falharam?
    │
    ▼
[3] Fallback 2: agents.defaults.model.fallbacks[1]
    │ └── ...
    │
    ▼
[N] Último fallback ou ERRO
```

### Auth Profile Rotation

**Ordem:**
1. Explicit config: `auth.order[provider]`
2. Configured profiles: `auth.profiles` filtrado por provider
3. Stored profiles: `auth-profiles.json`

**Round-robin:** type (OAuth antes de keys) → `lastUsed` (oldest first)

**Session stickiness:** pin auth profile por sessão (reusa até reset/compaction)

### Cooldowns (Exponential Backoff)

| Falha # | Cooldown |
|---------|----------|
| 1 | 1 min |
| 2 | 5 min |
| 3 | 25 min |
| 4+ | 1 hora (cap) |

**Billing disabled:** 5h inicial, 24h cap

### Config Completa

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: [
          "anthropic/claude-sonnet-4-6",
          "openai/gpt-4o"
        ]
      },
      imageModel: {
        primary: "anthropic/claude-sonnet-4-6"
      },
      imageGenerationModel: {
        primary: "openai/dall-e-3"
      },
      models: {
        "anthropic/claude-opus-4-6": { alias: "opus" },
        "anthropic/claude-sonnet-4-6": { alias: "sonnet" }
      }
    }
  }
}
```

---

## 15. Gateway Protocol — WebSocket & RPC

### Protocolo WebSocket

```
Client → Gateway

Frame types:
├── Request:  { type: "req",   id, method, params }
├── Response: { type: "res",   id, ok, payload|error }
└── Event:    { type: "event", event, payload, seq?, stateVersion? }

Primeiro frame DEVE ser "connect"
```

### Connection Lifecycle

```
Client                          Gateway
  │                               │
  ├── req:connect ───────────────►│
  │   { auth: { token }, client } │
  │                               │
  │◄── res:connect ──────────────┤
  │   { features, methods,        │
  │     events, health }          │
  │                               │
  │◄── event:presence ───────────┤
  │◄── event:tick ───────────────┤
  │                               │
  ├── req:agent ─────────────────►│
  │   { message, sessionKey }     │
  │                               │
  │◄── res:agent (ack) ──────────┤
  │   { runId, status }           │
  │                               │
  │◄── event:agent (stream) ─────┤
  │   { assistant deltas,         │
  │     tool events,              │
  │     lifecycle events }        │
  │                               │
  │◄── res:agent (final) ────────┤
  │   { runId, status, summary }  │
```

### Métodos RPC Principais

| Categoria | Métodos |
|-----------|---------|
| **Core** | `connect`, `health`, `status` |
| **Messaging** | `send`, `poll`, `agent`, `agent.wait` |
| **Chat** | `chat.history`, `chat.send`, `chat.abort`, `chat.inject` |
| **Sessions** | `sessions.list`, `sessions.patch`, `sessions.delete` |
| **Nodes** | `node.list`, `node.invoke`, `node.pair.*` |
| **Config** | `config.get`, `config.set`, `config.apply` |
| **Cron** | `cron.list`, `cron.add`, `cron.run`, `cron.delete` |

### Events

| Event | Descrição |
|-------|-----------|
| `tick` | Heartbeat periódico |
| `presence` | Estado de clientes conectados |
| `agent` | Streaming de resposta do agente |
| `chat` | Eventos de chat |
| `health` | Mudanças de health |
| `shutdown` | Gateway desligando |

### Autenticação

- `OPENCLAW_GATEWAY_TOKEN` deve bater com `connect.params.auth.token`
- Connects locais (loopback) auto-aprovados
- Connects remotos exigem device pairing
- Nonce challenge assinado no connect

---

## 16. Hooks — Pontos de Extensão

### Hooks Internos (Gateway)

| Hook | Quando dispara |
|------|----------------|
| `agent:bootstrap` | Construindo bootstrap files |
| `/new`, `/reset` | Comandos de reset |
| `/stop` | Parar run |

### Hooks de Plugin

| Hook | Quando | O que pode fazer |
|------|--------|------------------|
| `before_model_resolve` | Antes de resolver modelo | Override provider/model |
| `before_prompt_build` | Antes de montar prompt | Injetar `prependContext`, `systemPrompt` |
| `before_agent_start` | Antes de iniciar agente | Legacy compatibility |
| `agent_end` | Após conclusão | Inspecionar mensagens + metadata |
| `before_compaction` | Antes de compactar | Observar ciclo |
| `after_compaction` | Após compactar | Observar resultado |
| `before_tool_call` | Antes de executar tool | Interceptar/modificar params |
| `after_tool_call` | Após executar tool | Modificar resultado |
| `tool_result_persist` | Antes de persistir tool result | Transformar antes de logar |
| `message_received` | Mensagem recebida | Processar inbound |
| `message_sending` | Antes de enviar | Modificar outbound |
| `message_sent` | Após enviar | Confirmar delivery |
| `session_start` | Sessão iniciada | Setup |
| `session_end` | Sessão encerrada | Cleanup |
| `gateway_start` | Gateway iniciou | Inicialização |
| `gateway_stop` | Gateway parando | Shutdown |

---

## 17. Typing & Presence

### Typing Indicators

```json5
{
  agents: {
    defaults: {
      typingMode: "instant",          // never | instant | thinking | message
      typingIntervalSeconds: 6        // Refresh cadence
    }
  }
}
```

| Modo | Quando começa |
|------|---------------|
| `never` | Nunca |
| `instant` | Assim que model loop inicia |
| `thinking` | No primeiro reasoning delta |
| `message` | No primeiro text delta não-silencioso |

**Defaults quando não configurado:**
- DMs diretas: typing imediato
- Grupos com mention: typing imediato
- Grupos sem mention: typing no text stream
- Heartbeat: desabilitado

### Presence

```json5
// Campos de presença por entry:
{
  instanceId: "abc123",      // Identificador estável do cliente
  host: "DESKTOP-...",
  ip: "192.168.1.100",
  version: "2026.3.13",
  deviceFamily: "wsl",
  modelIdentifier: "claude-opus-4-6",
  mode: "gateway",
  lastInputSeconds: 42,
  reason: "online",
  ts: 1711234567890
}
```

- **TTL:** 5 minutos
- **Max entries:** 200
- **Producers:** Gateway self-entry, WS connect, system-event beacons, node connects

---

## 18. Todas as Configs de Agente

### Modelo

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.model.primary` | — | Modelo principal |
| `agents.defaults.model.fallbacks` | `[]` | Fallbacks em ordem |
| `agents.defaults.imageModel.primary` | — | Para input de imagem |
| `agents.defaults.imageGenerationModel.primary` | — | Para gerar imagens |
| `agents.defaults.models` | `{}` | Allowlist + aliases |

### Limites

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.timeoutSeconds` | `600` | Timeout do agent run |
| `agents.defaults.maxConcurrent` | `4` | Runs concorrentes (main lane) |
| `agents.defaults.contextTokens` | — | Cap na context window |

### Bootstrap

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.workspace` | `~/.openclaw/workspace` | Diretório do workspace |
| `agents.defaults.bootstrapMaxChars` | `20000` | Max por arquivo |
| `agents.defaults.bootstrapTotalMaxChars` | `150000` | Max total |
| `agents.defaults.bootstrapPromptTruncationWarning` | `once` | `off\|once\|always` |
| `agent.skipBootstrap` | `false` | Desabilitar bootstrap |

### Streaming

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.blockStreamingDefault` | `off` | `on\|off` |
| `agents.defaults.blockStreamingBreak` | `text_end` | `text_end\|message_end` |
| `agents.defaults.blockStreamingChunk.minChars` | — | Min chars por chunk |
| `agents.defaults.blockStreamingChunk.maxChars` | — | Max chars por chunk |
| `agents.defaults.blockStreamingCoalesce.idleMs` | — | Merge gap |
| `agents.defaults.humanDelay` | `off` | `off\|natural\|{minMs,maxMs}` |

### Typing

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.typingMode` | (legacy) | `never\|instant\|thinking\|message` |
| `agents.defaults.typingIntervalSeconds` | `6` | Refresh cadence |

### Sessão

| Config | Default | Descrição |
|--------|---------|-----------|
| `session.mainKey` | `main` | Key primária |
| `session.dmScope` | `main` | `main\|per-peer\|per-channel-peer\|per-account-channel-peer` |
| `session.reset.mode` | `daily` | `daily\|idle\|none` |
| `session.reset.atHour` | `4` | Hora do reset diário |
| `session.idleMinutes` | — | Reset após idle |
| `session.maintenance.mode` | `warn` | `warn\|enforce` |
| `session.maintenance.pruneAfter` | `30d` | Prune stale |
| `session.maintenance.maxEntries` | `500` | Cap |
| `session.maintenance.rotateBytes` | `10485760` | Rotação (10MB) |
| `session.maintenance.maxDiskBytes` | — | Budget de disco |

### Compaction

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.compaction.mode` | `warn` | `warn\|enforce` |
| `agents.defaults.compaction.model` | (primary) | Modelo para sumarização |
| `agents.defaults.compaction.memoryFlush.enabled` | `true` | Memory flush pre-compaction |
| `agents.defaults.compaction.memoryFlush.softThresholdTokens` | — | Threshold |
| `agents.defaults.compaction.reserveTokensFloor` | — | Tokens reservados |
| `agents.defaults.compaction.targetTokens` | — | Alvo pós-compaction |

### Pruning

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.contextPruning.mode` | `off` | `off\|cache-ttl` |
| `agents.defaults.contextPruning.ttlMinutes` | `5` | Cache TTL |
| `agents.defaults.contextPruning.keepLastAssistants` | `3` | Proteger últimos N |

### Queue

| Config | Default | Descrição |
|--------|---------|-----------|
| `messages.queue.mode` | `collect` | `collect\|steer\|followup\|interrupt` |
| `messages.queue.debounceMs` | `1000` | Debounce |
| `messages.queue.cap` | `20` | Max enfileirado |
| `messages.queue.drop` | `summarize` | `old\|new\|summarize` |

### Heartbeat

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.heartbeat.every` | `30m` | Intervalo |
| `agents.defaults.heartbeat.activeHours` | — | Janela ativa |

### Subagents

| Config | Default | Descrição |
|--------|---------|-----------|
| `agents.defaults.subagents.maxConcurrent` | — | Concorrência de sub-agentes |
| `agents.defaults.subagents.archiveAfterMinutes` | `60` | Auto-archive |
| `agents.list[].subagents.allowAgents` | — | Allowlist de agentes para spawn |

### Tools

| Config | Default | Descrição |
|--------|---------|-----------|
| `tools.allow` | `["*"]` | Tools permitidas |
| `tools.deny` | `[]` | Tools bloqueadas |
| `tools.exec.applyPatch` | `false` | Habilitar apply_patch |
| `tools.sessions.visibility` | `tree` | `self\|tree\|agent\|all` |
| `tools.message.crossContext.allowAcrossProviders` | `false` | Cross-channel |

### Memory

| Config | Default | Descrição |
|--------|---------|-----------|
| `plugins.slots.memory` | `memory-core` | Plugin de memória |
| `plugins.slots.contextEngine` | — | Engine de contexto customizada |

---

> **Fonte:** Documentação oficial OpenClaw em `/home/michsantoz/selantar/docs/`
> **Data:** 2026-03-23
> **Versão:** OpenClaw 2026.3.13
