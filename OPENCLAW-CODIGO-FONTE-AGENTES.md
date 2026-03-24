# OpenClaw — Código-Fonte Real dos Agentes

> Análise direta do repositório `github.com/openclaw/openclaw` (v2026.3.13, commit 61d171a).
> Mapeamento de cada componente da arquitetura de agentes ao código TypeScript real.

---

## Índice

1. [Mapa de Arquivos-Fonte](#1-mapa-de-arquivos-fonte)
2. [Agent Command — Entrada Principal](#2-agent-command--entrada-principal)
3. [Queue & Lanes — Implementação Real](#3-queue--lanes--implementação-real)
4. [Pi Embedded Runner — Core do Agente](#4-pi-embedded-runner--core-do-agente)
5. [System Prompt — Montagem Real](#5-system-prompt--montagem-real)
6. [Bootstrap Files — Injeção de Contexto](#6-bootstrap-files--injeção-de-contexto)
7. [Tool Definitions — Ferramentas Reais](#7-tool-definitions--ferramentas-reais)
8. [Compaction — Implementação Real](#8-compaction--implementação-real)
9. [Model Fallback — Failover Real](#9-model-fallback--failover-real)
10. [Event Subscription — Bridge de Eventos](#10-event-subscription--bridge-de-eventos)
11. [Dependências Internas (pi-agent-core / pi-coding-agent)](#11-dependências-internas)

---

## 1. Mapa de Arquivos-Fonte

### Core do Agente (`src/agents/`)

```
src/agents/
├── agent-command.ts              # ENTRADA PRINCIPAL — resolve sessão, modelo, skills, chama runner
├── agent-scope.ts                # Resolução de agentId, workspace, skills filter
├── agent-paths.ts                # Paths do agente (~/.openclaw/agents/<id>/)
│
├── pi-embedded.ts                # Re-export do runner (barrel file)
├── pi-embedded-runner.ts         # RUNNER PRINCIPAL — orquestra tudo
├── pi-embedded-runner/
│   ├── run.ts                    # Outer run loop (session lane + global lane)
│   ├── run/
│   │   ├── attempt.ts            # INNER RUN — monta context, chama LLM, loop de tools
│   │   ├── params.ts             # Parâmetros do run
│   │   ├── payloads.ts           # Payloads de resposta
│   │   └── types.ts              # Tipos do run
│   ├── lanes.ts                  # resolveSessionLane(), resolveGlobalLane()
│   ├── compact.ts                # Compaction runtime (dentro do runner)
│   ├── compact.runtime.ts        # Compaction durante run ativo
│   ├── compaction-runtime-context.ts
│   ├── compaction-safety-timeout.ts
│   ├── system-prompt.ts          # buildEmbeddedSystemPrompt() — wrapper
│   ├── session-manager-init.ts   # Prepara SessionManager para run
│   ├── session-manager-cache.ts  # Cache de sessões
│   ├── session-truncation.ts     # Truncação pós-compaction
│   ├── history.ts                # Limites de histórico
│   ├── model.ts                  # Resolução de modelo async
│   ├── extensions.ts             # Factories de extensões
│   ├── skills-runtime.ts         # Skills em runtime
│   ├── tool-name-allowlist.ts    # Allowlist de tools
│   ├── tool-result-truncation.ts # Truncação de tool results
│   ├── tool-result-context-guard.ts
│   ├── tool-split.ts             # Separação SDK tools vs custom
│   ├── abort.ts                  # Abort handling
│   ├── cache-ttl.ts              # Cache TTL para pruning
│   ├── context-engine-maintenance.ts
│   ├── thinking.ts               # Thinking level handling
│   ├── sandbox-info.ts           # Info de sandbox
│   └── utils.ts                  # Helpers
│
├── pi-embedded-subscribe.ts      # EVENT BRIDGE — pi events → OpenClaw streams
├── pi-embedded-subscribe.handlers.ts
├── pi-embedded-subscribe.handlers.compaction.ts
├── pi-embedded-subscribe.handlers.lifecycle.ts
├── pi-embedded-subscribe.handlers.messages.ts
├── pi-embedded-subscribe.handlers.tools.ts
├── pi-embedded-block-chunker.ts  # Block streaming chunker
├── pi-embedded-payloads.ts       # Payloads de block reply
├── pi-embedded-queue.runtime.ts  # Queue runtime
├── pi-embedded-messaging.ts      # Messaging tool integration
│
├── system-prompt.ts              # buildAgentSystemPrompt() — REAL ASSEMBLY
├── system-prompt-params.ts       # Parâmetros do system prompt
├── system-prompt-report.ts       # Report de tamanho
│
├── bootstrap-files.ts            # resolveBootstrapContextForRun()
├── bootstrap-cache.ts            # Cache de bootstrap files
├── bootstrap-hooks.ts            # Hook overrides de bootstrap
├── bootstrap-budget.ts           # Budget de tokens para bootstrap
│
├── compaction.ts                 # COMPACTION ENGINE — split, chunk, summarize
├── compaction-real-conversation.ts
│
├── model-fallback.ts             # runWithModelFallback() — failover loop
├── model-selection.ts            # normalizeModelRef(), resolveConfiguredModelRef()
├── model-catalog.ts              # Catálogo de modelos
│
├── auth-profiles.ts              # Auth profile management
├── auth-profiles/
│   ├── order.ts                  # Ordem de rotação de profiles
│   ├── store.ts                  # Persistência
│   ├── cooldown-auto-expiry.ts   # Cooldowns automáticos
│   └── session-override.ts       # Override per-session
│
├── pi-tools.ts                   # createOpenClawCodingTools() — TOOL FACTORY
├── pi-tools.policy.ts            # Tool policies (allow/deny)
├── pi-tools.before-tool-call.ts  # before_tool_call hook wrapper
├── pi-tools.read.ts              # Read tool variants
├── pi-tools.schema.ts            # Schema normalization
├── bash-tools.ts                 # Exec tool
├── bash-tools.exec.ts            # Shell execution
├── channel-tools.ts              # Channel-specific tools
├── openclaw-tools.ts             # OpenClaw-specific tools (gateway, cron, etc)
│
├── skills.ts                     # buildWorkspaceSkillSnapshot(), resolveSkillsPromptForRun()
├── skills/refresh.ts             # Skills refresh
│
├── lanes.ts                      # AGENT_LANE_NESTED, AGENT_LANE_SUBAGENT
├── defaults.ts                   # DEFAULT_MODEL, DEFAULT_PROVIDER, DEFAULT_CONTEXT_TOKENS
├── timeout.ts                    # resolveAgentTimeoutMs()
├── workspace.ts                  # ensureAgentWorkspace(), loadWorkspaceBootstrapFiles()
│
├── acp-spawn.ts                  # ACP subagent spawning
├── acp-spawn-parent-stream.ts    # Parent stream for spawned agents
└── spawned-context.ts            # Metadata de spawn
```

### Queue System (`src/process/`)

```
src/process/
├── command-queue.ts              # FILA PRINCIPAL — enqueueCommandInLane()
├── lanes.ts                      # CommandLane enum (Main, Cron, Subagent, Nested)
├── exec.ts                       # Execução de processos
├── spawn-utils.ts                # Spawn helpers
├── kill-tree.ts                  # Kill process tree
├── restart-recovery.ts           # Recovery após restart
└── supervisor/                   # Process supervisor
    ├── supervisor.ts
    ├── registry.ts
    └── adapters/ (child, env, pty)
```

---

## 2. Agent Command — Entrada Principal

**Arquivo:** `src/agents/agent-command.ts`

Este é o ponto de entrada principal. Quando uma mensagem chega (via RPC, CLI, ou canal):

```typescript
// Imports reais do código-fonte:
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { runEmbeddedPiAgent } from "./pi-embedded.js";
import { buildWorkspaceSkillSnapshot } from "./skills.js";
import { runWithModelFallback } from "./model-fallback.js";
import { prepareSessionManagerForRun } from "./pi-embedded-runner/session-manager-init.js";
import { resolveSession } from "./command/session.js";
import { deliverAgentCommandResult } from "./command/delivery.js";
import { resolveAgentTimeoutMs } from "./timeout.js";
import { ensureAgentWorkspace } from "./workspace.js";
```

### Fluxo real do `agentCommand`:

1. **Resolve sessão** → `resolveSession()` (command/session.ts)
2. **Resolve agentId** → `resolveSessionAgentId()` (agent-scope.ts)
3. **Carrega config** → `loadConfig()` (config/config.ts)
4. **Ensure workspace** → `ensureAgentWorkspace()` (workspace.ts)
5. **Carrega skills** → `buildWorkspaceSkillSnapshot()` (skills.ts)
6. **Resolve modelo** → `resolveDefaultModelForAgent()` (model-selection.ts)
7. **Auth profiles** → `ensureAuthProfileStore()` (auth-profiles.ts)
8. **Run com failover** → `runWithModelFallback()` → chama `runEmbeddedPiAgent()`
9. **Delivery** → `deliverAgentCommandResult()` (command/delivery.ts)

### Session Entry (tipo real):

```typescript
type SessionEntry = {
  sessionId: string;
  updatedAt: number;
  lastChannel?: string;
  origin?: {
    label?: string;
    from?: string;
  };
  chatType?: "direct" | "group";
  // Override fields (cleared on /new):
  providerOverride?: string;
  modelOverride?: string;
  authProfileOverride?: string;
  authProfileOverrideSource?: string;
  fallbackNoticeSelectedModel?: string;
  fallbackNoticeActiveModel?: string;
  fallbackNoticeReason?: string;
};
```

---

## 3. Queue & Lanes — Implementação Real

**Arquivo:** `src/process/command-queue.ts`

### Enum de Lanes (código real):

```typescript
// src/process/lanes.ts
export const enum CommandLane {
  Main = "main",
  Cron = "cron",
  Subagent = "subagent",
  Nested = "nested",
}
```

### Estrutura da Queue (código real):

```typescript
type QueueEntry = {
  task: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  enqueuedAt: number;
  warnAfterMs: number;
  onWait?: (waitMs: number, queuedAhead: number) => void;
};

type LaneState = {
  lane: string;
  queue: QueueEntry[];
  activeTaskIds: Set<number>;
  maxConcurrent: number;   // Default 1 por lane
  draining: boolean;
  generation: number;       // Bumped em reset para invalidar tasks stale
};
```

### Estado Global (Singleton):

```typescript
// Estado compartilhado via Symbol.for() — garante que todos os chunks
// do bundle compartilham a mesma instância
const COMMAND_QUEUE_STATE_KEY = Symbol.for("openclaw.commandQueueState");

const queueState = resolveGlobalSingleton(COMMAND_QUEUE_STATE_KEY, () => ({
  gatewayDraining: false,       // true durante shutdown
  lanes: new Map<string, LaneState>(),
  nextTaskId: 1,
}));
```

### Função Principal — enqueueCommandInLane():

```typescript
export function enqueueCommandInLane<T>(
  lane: string,
  task: () => Promise<T>,
  opts?: {
    warnAfterMs?: number;     // Default 2000ms
    onWait?: (waitMs: number, queuedAhead: number) => void;
  },
): Promise<T> {
  // 1. Rejeita se gateway está drenando
  if (queueState.gatewayDraining) {
    return Promise.reject(new GatewayDrainingError());
  }

  // 2. Normaliza lane e obtém/cria estado
  const cleaned = normalizeLane(lane);
  const state = getLaneState(cleaned);

  // 3. Enfileira e tenta drenar
  return new Promise<T>((resolve, reject) => {
    state.queue.push({
      task: () => task(),
      resolve, reject,
      enqueuedAt: Date.now(),
      warnAfterMs: opts?.warnAfterMs ?? 2_000,
      onWait: opts?.onWait,
    });
    drainLane(cleaned);  // Tenta executar imediatamente
  });
}
```

### Drain Loop (código real):

```typescript
function drainLane(lane: string) {
  const state = getLaneState(lane);
  if (state.draining) return;
  state.draining = true;

  const pump = () => {
    try {
      // Enquanto há capacidade E itens na fila
      while (state.activeTaskIds.size < state.maxConcurrent && state.queue.length > 0) {
        const entry = state.queue.shift()!;
        const taskId = queueState.nextTaskId++;
        const taskGeneration = state.generation;
        state.activeTaskIds.add(taskId);

        // Executa async
        void (async () => {
          try {
            const result = await entry.task();
            // Completa se ainda na mesma geração
            if (completeTask(state, taskId, taskGeneration)) {
              pump();  // Tenta próximo
            }
            entry.resolve(result);
          } catch (err) {
            if (completeTask(state, taskId, taskGeneration)) {
              pump();
            }
            entry.reject(err);
          }
        })();
      }
    } finally {
      state.draining = false;
    }
  };
  pump();
}
```

### Session Lane Resolution (código real):

```typescript
// src/agents/pi-embedded-runner/lanes.ts

export function resolveSessionLane(key: string) {
  const cleaned = key.trim() || CommandLane.Main;
  return cleaned.startsWith("session:") ? cleaned : `session:${cleaned}`;
}

export function resolveGlobalLane(lane?: string) {
  const cleaned = lane?.trim();
  // Cron jobs hold the cron lane; inner operations use nested para evitar deadlock
  if (cleaned === CommandLane.Cron) {
    return CommandLane.Nested;
  }
  return cleaned ? cleaned : CommandLane.Main;
}
```

### Agent Lane Constants (código real):

```typescript
// src/agents/lanes.ts
import { CommandLane } from "../process/lanes.js";

export const AGENT_LANE_NESTED = CommandLane.Nested;
export const AGENT_LANE_SUBAGENT = CommandLane.Subagent;

export function resolveNestedAgentLane(lane?: string): string {
  const trimmed = lane?.trim();
  // Nested agent runs NÃO herdam o cron lane — evita deadlock
  if (!trimmed || trimmed === "cron") {
    return AGENT_LANE_NESTED;
  }
  return trimmed;
}
```

### Erros de Queue (código real):

```typescript
export class CommandLaneClearedError extends Error {
  constructor(lane?: string) {
    super(lane ? `Command lane "${lane}" cleared` : "Command lane cleared");
    this.name = "CommandLaneClearedError";
  }
}

export class GatewayDrainingError extends Error {
  constructor() {
    super("Gateway is draining for restart; new tasks are not accepted");
    this.name = "GatewayDrainingError";
  }
}
```

---

## 4. Pi Embedded Runner — Core do Agente

**Arquivo:** `src/agents/pi-embedded-runner.ts` → re-exporta de `src/agents/pi-embedded-runner/run.ts`

### Exports (barrel):

```typescript
// src/agents/pi-embedded.ts
export {
  abortEmbeddedPiRun,
  compactEmbeddedPiSession,
  isEmbeddedPiRunActive,
  isEmbeddedPiRunStreaming,
  queueEmbeddedPiMessage,
  resolveEmbeddedSessionLane,
  runEmbeddedPiAgent,          // ← FUNÇÃO PRINCIPAL
  waitForEmbeddedPiRunEnd,
} from "./pi-embedded-runner.js";
```

### Dependência Core:

```typescript
// O runtime de agente é baseado em dois pacotes internos:
import type { AgentMessage, StreamFn } from "@mariozechner/pi-agent-core";
import {
  createAgentSession,
  DefaultResourceLoader,
  SessionManager,
  estimateTokens,
  generateSummary,
} from "@mariozechner/pi-coding-agent";
```

- **`pi-agent-core`** — Core do agente: tipos de mensagem, stream functions, tool calling
- **`pi-coding-agent`** — Agente de coding: SessionManager, estimateTokens, generateSummary, tools (read/write/edit/exec)

### Fluxo do `attempt.ts` (inner run):

O arquivo `src/agents/pi-embedded-runner/run/attempt.ts` é o coração:

1. **Resolve workspace** → `resolveAttemptSpawnWorkspaceDir()`
2. **Carrega bootstrap** → `resolveBootstrapContextForRun()`
3. **Monta system prompt** → `buildEmbeddedSystemPrompt()`
4. **Runs hooks** → `before_prompt_build`, `before_agent_start`
5. **Cria tools** → `createOpenClawCodingTools()`
6. **Cria sessão pi** → `createAgentSession()`
7. **Prepara SessionManager** → `prepareSessionManagerForRun()`
8. **Subscreve eventos** → `subscribeEmbeddedPiSession()`
9. **Roda loop** → `session.agent.run()` (pi-agent-core)
10. **Compaction se necessário** → `compactWithSafetyTimeout()`
11. **Persiste** → SessionManager write

### Key imports do attempt.ts (código real):

```typescript
import { createAgentSession, DefaultResourceLoader, SessionManager } from "@mariozechner/pi-coding-agent";
import { resolveBootstrapContextForRun } from "../../bootstrap-files.js";
import { buildEmbeddedSystemPrompt } from "../system-prompt.js";
import { subscribeEmbeddedPiSession } from "../../pi-embedded-subscribe.js";
import { createOpenClawCodingTools } from "../../pi-tools.js";
import { enqueueCommandInLane } from "../../../process/command-queue.js";
import { resolveGlobalLane, resolveSessionLane } from "../lanes.js";
```

---

## 5. System Prompt — Montagem Real

**Arquivo:** `src/agents/system-prompt.ts`

### Função Principal:

```typescript
export type PromptMode = "full" | "minimal" | "none";

export function buildAgentSystemPrompt(params: {
  workspaceDir: string;
  defaultThinkLevel?: ThinkLevel;
  reasoningLevel?: ReasoningLevel;
  extraSystemPrompt?: string;
  ownerNumbers?: string[];
  reasoningTagHint?: boolean;
  toolNames?: string[];
  toolSummaries?: Record<string, string>;
  modelAliasLines?: string[];
  userTimezone?: string;
  contextFiles?: EmbeddedContextFile[];
  skillsPrompt?: string;
  heartbeatPrompt?: string;
  docsPath?: string;
  promptMode?: PromptMode;
  acpEnabled?: boolean;
  runtimeInfo?: { host, os, arch, node, model, channel, ... };
  sandboxInfo?: EmbeddedSandboxInfo;
  memoryCitationsMode?: MemoryCitationsMode;
}) {
  // Monta seções na ordem:
  // 1. Tool summaries (nome → descrição)
  // 2. Skills section (se disponível)
  // 3. Memory section (se não minimal)
  // 4. User identity (authorized senders)
  // 5. Time section
  // 6. Reply tags
  // 7. Messaging section (com tool hints)
  // 8. Voice/TTS section
  // 9. Docs section
  // 10. Context files (bootstrap: AGENTS.md, SOUL.md, etc)
  // 11. Runtime info
}
```

### Tool Summaries (hardcoded no código real):

```typescript
const coreToolSummaries: Record<string, string> = {
  read: "Read file contents",
  write: "Create or overwrite files",
  edit: "Make precise edits to files",
  apply_patch: "Apply multi-file patches",
  grep: "Search file contents for patterns",
  find: "Find files by glob pattern",
  ls: "List directory contents",
  exec: "Run shell commands (pty available for TTY-required CLIs)",
  process: "Manage background exec sessions",
  web_search: "Search the web (Brave API)",
  web_fetch: "Fetch and extract readable content from a URL",
  browser: "Control web browser",
  canvas: "Present/eval/snapshot the Canvas",
  nodes: "List/describe/notify/camera/screen on paired nodes",
  cron: "Manage cron jobs and wake events",
  message: "Send messages and channel actions",
  gateway: "Restart, apply config, or run updates",
  agents_list: "List OpenClaw agent ids allowed for sessions_spawn",
  sessions_list: "List other sessions (incl. sub-agents) with filters/last",
  sessions_history: "Fetch history for another session/sub-agent",
  sessions_send: "Send a message to another session/sub-agent",
  sessions_spawn: "Spawn an isolated sub-agent session",
  subagents: "List, steer, or kill sub-agent runs",
  session_status: "Show /status-equivalent status card",
  image: "Analyze an image with the configured image model",
  image_generate: "Generate images with the configured image-generation model",
};
```

### Tool Order (ordem real de apresentação):

```typescript
const toolOrder = [
  "read", "write", "edit", "apply_patch",
  "grep", "find", "ls",
  "exec", "process",
  "web_search", "web_fetch",
  "browser", "canvas", "nodes",
  "cron", "message", "gateway",
  "agents_list", "sessions_list", "sessions_history", "sessions_send",
  "subagents", "session_status",
  "image", "image_generate",
];
```

### Skills Section (código real):

```typescript
function buildSkillsSection(params: { skillsPrompt?: string; readToolName: string }) {
  return [
    "## Skills (mandatory)",
    "Before replying: scan <available_skills> <description> entries.",
    `- If exactly one skill clearly applies: read its SKILL.md at <location> with \`${params.readToolName}\`, then follow it.`,
    "- If multiple could apply: choose the most specific one, then read/follow it.",
    "- If none clearly apply: do not read any SKILL.md.",
    "Constraints: never read more than one skill up front; only read after selecting.",
    "- When a skill drives external API writes, assume rate limits...",
    trimmed,  // Lista de skills disponíveis
  ];
}
```

### Messaging Section (código real — com SILENT_REPLY_TOKEN):

```typescript
import { SILENT_REPLY_TOKEN } from "../auto-reply/tokens.js";

// Na seção de messaging:
`- If you use \`message\` (action=send) to deliver your user-visible reply,
   respond with ONLY: ${SILENT_REPLY_TOKEN} (avoid duplicate replies).`
```

---

## 6. Bootstrap Files — Injeção de Contexto

**Arquivo:** `src/agents/bootstrap-files.ts`

### Fluxo real:

```typescript
export async function resolveBootstrapContextForRun(params: {
  workspaceDir: string;
  config?: OpenClawConfig;
  sessionKey?: string;
  sessionId?: string;
  agentId?: string;
  warn?: (message: string) => void;
  contextMode?: BootstrapContextMode;    // "full" | "lightweight"
  runKind?: BootstrapContextRunKind;     // "default" | "heartbeat" | "cron"
}): Promise<{
  bootstrapFiles: WorkspaceBootstrapFile[];
  contextFiles: EmbeddedContextFile[];
}> {
  // 1. Carrega arquivos do workspace (ou do cache)
  const bootstrapFiles = await resolveBootstrapFilesForRun(params);

  // 2. Converte para context files com limites de tamanho
  const contextFiles = buildBootstrapContextFiles(bootstrapFiles, {
    maxChars: resolveBootstrapMaxChars(params.config),        // default 20000
    totalMaxChars: resolveBootstrapTotalMaxChars(params.config), // default 150000
    warn: params.warn,
  });

  return { bootstrapFiles, contextFiles };
}
```

### Context Mode Filter (código real):

```typescript
function applyContextModeFilter(params: {
  files: WorkspaceBootstrapFile[];
  contextMode?: BootstrapContextMode;
  runKind?: BootstrapContextRunKind;
}): WorkspaceBootstrapFile[] {
  if (contextMode !== "lightweight") return params.files;  // full → tudo

  if (runKind === "heartbeat") {
    return params.files.filter(f => f.name === "HEARTBEAT.md");  // só heartbeat
  }

  return [];  // cron/default lightweight → vazio
}
```

---

## 7. Tool Definitions — Ferramentas Reais

**Arquivo:** `src/agents/pi-tools.ts`

### Factory Principal:

```typescript
import { codingTools, createReadTool } from "@mariozechner/pi-coding-agent";
import { createExecTool, createProcessTool } from "./bash-tools.js";
import { createApplyPatchTool } from "./apply-patch.js";
import { createOpenClawTools } from "./openclaw-tools.js";
import { listChannelAgentTools } from "./channel-tools.js";

export function createOpenClawCodingTools(options) {
  // 1. Base coding tools (read, write, edit, grep, find, ls)
  //    → vem de @mariozechner/pi-coding-agent

  // 2. Exec tools (exec, process)
  //    → bash-tools.ts com sandbox/approval/policy

  // 3. Apply patch (optional, gated)
  //    → apply-patch.ts

  // 4. OpenClaw tools (gateway, cron, message, sessions_*, subagents, etc)
  //    → openclaw-tools.ts

  // 5. Channel tools (channel-specific actions)
  //    → channel-tools.ts

  // 6. Plugin tools
  //    → plugins/tools.ts

  // Apply policies:
  // - Tool allow/deny lists
  // - Message provider restrictions (voice → no tts)
  // - Model provider restrictions (xAI → no web_search)
  // - Sandbox restrictions
  // - Owner-only tools
  // - before_tool_call hook wrapper
  // - Abort signal wrapper
}
```

### Tool Policy Pipeline (código real):

```typescript
// Ferramentas são filtradas por múltiplas camadas:
import { isToolAllowedByPolicies } from "./pi-tools.policy.js";
import { wrapToolWithBeforeToolCallHook } from "./pi-tools.before-tool-call.js";
import { wrapToolWithAbortSignal } from "./pi-tools.abort.js";

// Policy layers (em ordem):
// 1. tools.allow / tools.deny (config)
// 2. Group tool policy (per-group override)
// 3. Subagent tool policy (session tools removidos)
// 4. Message provider deny (ex: voice → no tts)
// 5. Model provider deny (ex: xAI → no web_search)
// 6. Owner-only enforcement
// 7. apply_patch model allowlist
// 8. before_tool_call hook (pode bloquear)
// 9. AbortSignal wrapper (timeout)
```

---

## 8. Compaction — Implementação Real

**Arquivo:** `src/agents/compaction.ts`

### Constantes:

```typescript
export const BASE_CHUNK_RATIO = 0.4;
export const MIN_CHUNK_RATIO = 0.15;
export const SAFETY_MARGIN = 1.2;  // 20% buffer para imprecisão de estimateTokens()
export const SUMMARIZATION_OVERHEAD_TOKENS = 4096;
```

### Instruções de Sumarização (hardcoded):

```typescript
const MERGE_SUMMARIES_INSTRUCTIONS = [
  "Merge these partial summaries into a single cohesive summary.",
  "",
  "MUST PRESERVE:",
  "- Active tasks and their current status (in-progress, blocked, pending)",
  "- Batch operation progress (e.g., '5/17 items completed')",
  "- The last thing the user requested and what was being done about it",
  "- Decisions made and their rationale",
  "- TODOs, open questions, and constraints",
  "- Any commitments or follow-ups promised",
  "",
  "PRIORITIZE recent context over older history. The agent needs to know",
  "what it was doing, not just what was discussed.",
].join("\n");

const IDENTIFIER_PRESERVATION_INSTRUCTIONS =
  "Preserve all opaque identifiers exactly as written (no shortening or reconstruction), " +
  "including UUIDs, hashes, IDs, tokens, API keys, hostnames, IPs, ports, URLs, and file names.";
```

### Estimativa de Tokens (código real):

```typescript
export function estimateMessagesTokens(messages: AgentMessage[]): number {
  // SECURITY: toolResult.details são stripped para evitar payloads untrusted
  const safe = stripToolResultDetails(messages);
  return safe.reduce((sum, message) => sum + estimateTokens(message), 0);
}
```

### Split de Mensagens por Token Share:

```typescript
export function splitMessagesByTokenShare(
  messages: AgentMessage[],
  parts = 2,  // DEFAULT_PARTS
): AgentMessage[][] {
  const totalTokens = estimateMessagesTokens(messages);
  const targetTokens = totalTokens / normalizedParts;
  const chunks: AgentMessage[][] = [];
  let current: AgentMessage[] = [];
  let currentTokens = 0;

  for (const message of messages) {
    const messageTokens = estimateCompactionMessageTokens(message);
    if (chunks.length < normalizedParts - 1
        && current.length > 0
        && currentTokens + messageTokens > targetTokens) {
      chunks.push(current);
      current = [];
      currentTokens = 0;
    }
    current.push(message);
    currentTokens += messageTokens;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}
```

### Chunk por Max Tokens (para context windows menores):

```typescript
export function chunkMessagesByMaxTokens(
  messages: AgentMessage[],
  maxTokens: number,
): AgentMessage[][] {
  // Safety margin para compensar underestimation do estimateTokens()
  // (heurística chars/4 não captura multi-byte, special tokens, etc.)
  const effectiveMax = Math.max(1, Math.floor(maxTokens / SAFETY_MARGIN));
  // ... chunking com split de mensagens oversized
}
```

### Adaptive Chunk Ratio:

```typescript
export function computeAdaptiveChunkRatio(
  messages: AgentMessage[],
  contextWindow: number
): number {
  const totalTokens = estimateMessagesTokens(messages);
  const avgTokens = totalTokens / messages.length;
  const safeAvgTokens = avgTokens * SAFETY_MARGIN;
  const avgRatio = safeAvgTokens / contextWindow;

  // Se mensagem média > 10% do contexto, reduz chunk ratio
  if (avgRatio > 0.1) {
    const reduction = Math.min(avgRatio * 2, BASE_CHUNK_RATIO - MIN_CHUNK_RATIO);
    return Math.max(MIN_CHUNK_RATIO, BASE_CHUNK_RATIO - reduction);
  }
  return BASE_CHUNK_RATIO;  // 0.4
}
```

---

## 9. Model Fallback — Failover Real

**Arquivo:** `src/agents/model-fallback.ts`

### Imports:

```typescript
import { ensureAuthProfileStore, resolveAuthProfileOrder } from "./auth-profiles.js";
import { coerceToFailoverError, isFailoverError, isTimeoutError } from "./failover-error.js";
import { buildModelAliasIndex, modelKey, normalizeModelRef } from "./model-selection.js";
```

### Collector de Candidatos:

```typescript
function createModelCandidateCollector(allowlist: Set<string> | null) {
  const seen = new Set<string>();
  const candidates: ModelCandidate[] = [];

  const addCandidate = (candidate: ModelCandidate, enforceAllowlist: boolean) => {
    const key = modelKey(candidate.provider, candidate.model);
    if (seen.has(key)) return;
    if (enforceAllowlist && allowlist && !allowlist.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  };

  return { candidates, addExplicitCandidate, addAllowlistedCandidate };
}
```

### Run com Fallback (pattern real):

```typescript
// Para cada candidato (primary → fallbacks):
//   Para cada auth profile (OAuth primeiro → API keys):
//     Tenta run
//     Se sucesso → retorna
//     Se AbortError (não timeout) → rethrow (user cancelou)
//     Se FailoverError → cooldown, próximo profile/modelo
//     Se context overflow → próximo modelo (skip restantes profiles)
```

### Abort vs Failover (decisão real):

```typescript
function isFallbackAbortError(err: unknown): boolean {
  // Só trata "AbortError" explícito como abort do usuário
  // Erros com "aborted" na mensagem NÃO são abort (podem mascarar timeouts)
  const name = "name" in err ? String(err.name) : "";
  return name === "AbortError";
}

function shouldRethrowAbort(err: unknown): boolean {
  return isFallbackAbortError(err) && !isTimeoutError(err);
}
```

---

## 10. Event Subscription — Bridge de Eventos

**Arquivo:** `src/agents/pi-embedded-subscribe.ts`

### Estado do Subscriber (código real):

```typescript
const state: EmbeddedPiSubscribeState = {
  assistantTexts: [],
  toolMetas: [],
  toolMetaById: new Map(),
  toolSummaryById: new Set(),
  lastToolError: undefined,
  blockReplyBreak: params.blockReplyBreak ?? "text_end",
  reasoningMode,
  deltaBuffer: "",
  blockBuffer: "",
  blockState: { thinking: false, final: false, inlineCode: createInlineCodeState() },
  compactionInFlight: false,
  pendingCompactionRetry: 0,
  messagingToolSentTexts: [],
  messagingToolSentTargets: [],
  pendingMessagingTexts: new Map(),
  pendingToolMediaUrls: [],
  // ... 30+ campos de estado
};
```

### Handlers separados:

```
pi-embedded-subscribe.handlers.compaction.ts  → Eventos de compaction
pi-embedded-subscribe.handlers.lifecycle.ts   → start/end/error
pi-embedded-subscribe.handlers.messages.ts    → Deltas de texto + reasoning
pi-embedded-subscribe.handlers.tools.ts       → Tool call/result events
```

### Tracking de Messaging Tool (anti-duplicata):

```typescript
// Quando o agente usa message tool para enviar:
messagingToolSentTexts: [],          // Textos já enviados
messagingToolSentTextsNormalized: [], // Normalizados para comparação
messagingToolSentTargets: [],        // Targets já enviados

// No final, filtra duplicatas:
// Se o texto da resposta = texto já enviado via message tool → suprime
```

---

## 11. Dependências Internas

### `@mariozechner/pi-agent-core`

Core runtime do agente. Fornece:
- `AgentMessage` — Tipo de mensagem (role, content)
- `StreamFn` — Função de streaming
- `AgentTool` — Definição de tool

### `@mariozechner/pi-coding-agent`

Agente de coding completo. Fornece:
- `SessionManager` — Gerencia sessões (load, save, JSONL)
- `createAgentSession()` — Cria sessão de agente
- `estimateTokens()` — Estimativa de tokens (chars/4 heuristic)
- `generateSummary()` — Gera sumário para compaction
- `DefaultResourceLoader` — Carregador de recursos
- `codingTools` — Tools base (read, write, edit, grep, find, ls)
- `readTool`, `createReadTool` — Variantes de read

### `@mariozechner/pi-ai`

Streaming AI wrapper:
- `streamSimple()` — Streaming simples para compaction summarization

---

## Resumo da Arquitetura Real

```
                    Canal (WhatsApp/Telegram/etc)
                              │
                              ▼
                    agent-command.ts
                    (resolve session, model, skills)
                              │
                              ▼
                    model-fallback.ts
                    (primary → fallback1 → fallback2)
                              │
                              ▼
                    pi-embedded-runner/run.ts
                    (enqueue em session lane + global lane)
                              │
                              ▼
                    pi-embedded-runner/run/attempt.ts
                    ┌─────────┴─────────┐
                    │                   │
              bootstrap-files.ts   system-prompt.ts
              (AGENTS.md, etc)     (monta prompt)
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                    pi-coding-agent.createAgentSession()
                    (SessionManager + tools + agent loop)
                              │
                    ┌─────────┼─────────┐
                    │         │         │
              pi-tools.ts    │    pi-embedded-subscribe.ts
              (tool defs)    │    (event bridge)
                             │
                    pi-agent-core (LLM loop)
                    ┌────────┴────────┐
                    │                 │
              Tool calls         Text deltas
                    │                 │
              bash-tools.ts    block-chunker.ts
              openclaw-tools.ts     │
                                    ▼
                              Channel delivery
                              (chunked, human-paced)
```

---

> **Fonte:** Código-fonte real de `github.com/openclaw/openclaw`
> **Acessado via:** `gh api repos/openclaw/openclaw/contents/...`
> **Data:** 2026-03-23
