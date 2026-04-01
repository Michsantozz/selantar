# CLAUDE.md

> Diretriz arquitetural para Claude Code neste repositorio.
> Todas as decisoes de codigo devem ser rastreaveis ate uma skill ou arquivo-fonte listado abaixo.

## Regra Zero: Nao Confie na Memoria

O ecossistema AI SDK, ERC-8004 e Next.js evolui semanalmente.
Antes de escrever qualquer linha de codigo, consulte as skills e os docs locais listados neste documento.
Se a informacao nao estiver nas skills ou no codigo-fonte do projeto, declare explicitamente: *"Nao encontrei documentacao para isso."*

---

## 1. Fontes de Verdade (Skills)

Consulte **obrigatoriamente** antes de gerar codigo:

| # | Skill | Quando usar |
|---|-------|-------------|
| 1 | `@skill ai-sdk` | `useChat`, `sendMessage`, `streamText`, `isToolUIPart`, `DefaultChatTransport`, `toUIMessageStreamResponse`, `inputSchema`, `ToolLoopAgent`, `InferAgentUIMessage` |
| 2 | `@skill shadcn` | Composicao de componentes, Tailwind semantico (sem cores cruas), `cn()`, acessibilidade, forms, icones (`lucide-react`) |
| 3 | `@skill vercel-react-best-practices` | App Router, file conventions, RSC boundaries, `'use client'`/`'use server'`, async params, metadata, error handling, hydration |
| 4 | `@skill firecrawl` | Web scraping, search — usado para pesquisar docs ERC-8004 |

### Referencias Criticas (dentro das skills)

- **`ai-sdk/references/common-errors.md`** — Migracoes obrigatorias: `parameters` -> `inputSchema`, `maxTokens` -> `maxOutputTokens`, `maxSteps` -> `stopWhen: stepCountIs(n)`, `toDataStreamResponse` -> `toUIMessageStreamResponse`, `tool-invocation` -> `tool-{toolName}`, `part.args` -> `part.input`, `part.result` -> `part.output`, `addToolResult` -> `addToolOutput`, `api:` -> `transport: new DefaultChatTransport({ api })`, input state gerenciado manualmente com `useState`
- **`ai-sdk/references/type-safe-agents.md`** — `ToolLoopAgent`, `InferAgentUIMessage`, file structure para agents/tools, `UIToolInvocation`

---

## 2. Fluxo de Trabalho Obrigatorio

Antes de gerar qualquer bloco de codigo:

1. **Pare e Leia** — Consulte a skill relevante.
2. **Checagem** — *"Isso esta documentado nas skills/fonte ou estou inventando?"*
3. **Origem** — Ao final de toda modificacao, inclua no chat:

```text
ORIGEM DA INFERENCIA
- Skill: [nome]
- Arquivo/Secao: [referencia especifica]
- Verificado: [sim/nao — se nao, declarar incerteza]
```

---

## 3. Visao do Projeto

**Selantar** e o primeiro Care Protocol do mundo — uma IA que vive dentro do contrato desde o dia 1, monitorando entregas, detectando fricao antes de virar conflito, comunicando entre as partes quando algo da errado. Quando prevencao falha, Clara media em 24h com todo o contexto ja carregado e executa settlement on-chain sem intervencao humana.

**Clara** e a mediadora autonoma — lida com o lado humano das disputas com inteligencia emocional (The Empath) e estrategia de negociacao (The Strategist) como cadeias de raciocinio internas antes de cada resposta.

### Hackathon: The Synthesis
- **Deadline:** 22 de marco de 2026, 23:59 PST (**JA PASSOU — projeto submetido**)
- **Prizes alvo:** "Agents With Receipts — ERC-8004" (Protocol Labs), "Let the Agent Cook", Open Track
- **Status:** Submetido. App live em selantar.vercel.app. Agent #2122 registrado on-chain.

### Paginas (37 rotas no total)

| Rota Principal | O que faz |
|----------------|-----------|
| `/` (Landing) | Hero + value prop + Care Protocol framing |
| `/forge` | Upload de contrato + analise por 5 sub-agents em paralelo + setup de escrow |
| `/mediation` | Chat de mediacao dual-agent (Clara + client AI) + settlement on-chain + ERC-8004 status |
| `/docs` | Documentacao interativa de todos os 16+ endpoints |

### Pipeline Principal (Care Protocol completo)

```
Upload contrato (PDF/texto)
  → POST /api/parse-contract (ToolLoopAgent + 5 sub-agents em paralelo)
    → extractParties + analyzeRisks + extractMilestones (Phase 1)
    → scoreClauses + generateDeployPlan (Phase 2, depends on Phase 1)
    → POST /api/create-escrow → keccak256 registrado no ERC-8004
    → ContractID (CSX-YYYY-XXXXXXXX) + TX hash → contrato ativo

  CARE LOOP (Sentinel):
  → GitHub polling + WhatsApp monitoring (Evolution API)
  → Anomalia detectada → outreach proativo
  → Problema → proposta de ajuste, contrato atualizado
  → Sem resposta em 48h → escalada para disputa formal

  Se disputa:
  → POST /api/mediation-chat (ToolLoopAgent — Gemini 2.0 Flash)
    → classifyCase → analyzeEvidence → proposeSettlement
    → executeSettlement (4 paths + fallback)
    → postFeedback (ERC-8004 Reputation)
    → registerVerdict (ERC-8004 Validation)
    → Evidence pinned to IPFS + stored on Filecoin (PDP)
    → Receipt permanente. Evidence provably alive.

  API Mediation (x402):
  → qualquer agente → POST /api/mediate + X-PAYMENT ($0.10 USDC)
    → mesmo pipeline de 6 tools → JSON com receipts ERC-8004
```

---

## 4. Arquitetura & Regras

### 4.1 Frontend (Next.js 16, App Router)

- **Estado do Chat** — Gerenciado EXCLUSIVAMENTE por `useChat` do `@ai-sdk/react`. Proibido `setTimeout`, simulacoes de loading, ou `useState` para array de mensagens.
- **Transport** — `useChat` usa `transport: new DefaultChatTransport({ api: "/api/mediation-chat" })`. Nunca usar `api:` direto (deprecated).
- **`sendMessage`** — Substitui `handleSubmit`/`handleInputChange`. Input gerenciado com `useState` manual.
- **Renderizacao de partes** — Separar rigorosamente:
  - `part.type === 'text'` -> conteudo markdown
  - `part.type === 'reasoning'` -> `<Reasoning>` / `<ReasoningTrigger>` / `<ReasoningContent>`
  - `isToolUIPart(part)` -> tool cards com `part.toolCallId`, `part.state`, `part.input`, `part.output`
- **Tool states** — `input-streaming` -> `input-available` -> `output-available` (ou `output-error`). Nunca acessar `part.input` sem checar state.
- **Design** — Glassmorphism. Tailwind CSS v4 com tokens semanticos. Nunca cores cruas.
- **Componentes** — 170+ componentes: mediation chat, settlement modal, ReactFlow (contract lifecycle), shadcn/ui, Web3, Magic UI.

### 4.2 Backend — Endpoints (17+)

#### `/api/parse-contract/route.ts`
- `ToolLoopAgent` orquestrador (Gemini 2.0 Flash) + 5 sub-agents em paralelo via `Promise.allSettled`
- Phase 1: `extractParties`, `analyzeRisks`, `extractMilestones`
- Phase 2: `scoreClauses`, `generateDeployPlan`
- Partial results survive se algum sub-agent falhar

#### `/api/mediation-chat/route.ts`
- `ToolLoopAgent` com dual-agent orchestration (Clara + client AI)
- Modelo Clara: Gemini 2.0 Flash (via `@ai-sdk/google`)
- Advisory chains antes de cada resposta (a partir da 2a mensagem):
  - **The Empath** (Claude Sonnet 4.6) — psicologia clinica, dinamicas de poder, projecao
  - **The Strategist** (Claude Sonnet 4.6) — Harvard PON, BATNA, timing, framing
- Tools: `classifyCase`, `analyzeEvidence`, `proposeSettlement`, `executeSettlement`, `postFeedback`, `registerVerdict`
- `stopWhen: stepCountIs(10)`
- Retorna `toUIMessageStreamResponse()`

#### `/api/analyze-contract/route.ts`
- Streaming via `streamText` com GPT-5.4-mini via OpenRouter
- Retorna analise de risco, clausulas-chave, recomendacoes
- Retorna `toUIMessageStreamResponse()` (nunca `toDataStreamResponse`)

#### `/api/execute-settlement/route.ts`
- Multi-path execution: Locus Intent → ERC-7715 Permission → ERC-7710 Delegation → Direct Transfer → Fallback
- Smart Accounts via MetaMask Smart Accounts Kit v0.3.0 (ERC-4337, Pimlico bundler)
- Ao final: ERC-8004 reputation + validation

#### `/api/mediate/route.ts` (x402)
- `GET` — service discovery gratuita (schema, preco, registries)
- `POST` — $0.10 USDC via `X-PAYMENT` header, mesmo pipeline de 6 tools

#### `/api/mcp/route.ts`
- MCP server padrao para integracao A2A
- 5 tools: `query`, `verify`, `reputation`, `list`, `submit`

#### `/api/oracle/[address]/reputation/route.ts`
- Reputation oracle com HMAC signature, anti-Goodhart header

#### `/api/erc8004/` (register/, feedback/, validate/)
- Endpoints para interagir com os 3 registries ERC-8004
- Usam helpers de `lib/erc8004/`

#### `/api/intake/route.ts`
- Rate limited (10/h por IP), idempotency check, SHA-256 dedupe
- `createCase` → `CASE_OPENED` event no hash-chain

#### `/api/verify-evidence/route.ts`
- Verifica PDP status no Filecoin Calibration testnet
- `GET /api/verify-evidence?pieceCid=...`

### 4.3 ERC-8004 Integration

- **Identity Registry** — Agent #2122 registrado, auto-custody confirmada
- **Reputation Registry** — Score 90/100 apos mediacao da Clinica Suasuna
- **Validation Registry** — Contrato deployado por nos (oficial nao estava deployado na Base Sepolia), spec-compliant
- Contratos na Base Sepolia — chamamos via viem
- Interfaces Solidity em `contracts/interfaces/` (somente para ABI)
- Helpers TypeScript em `lib/erc8004/` (identity.ts, reputation.ts, validation.ts)
- Enderecos em `lib/erc8004/addresses.ts`
- Script de registro one-time: `scripts/register-agent.ts`

### 4.4 Filecoin PDP Integration

- Synapse SDK — evidence storage no Filecoin Calibration testnet
- Dual URI em `feedbackURI`/`requestURI` on-chain: `ipfs://QmX...|filecoin://bafk...`
- `FILECOIN_STORED` event emitido no hash-chain quando upload completa
- Circuit breaker protege contra downtime do Filecoin (fallback para IPFS-only)
- Verificacao publica: `GET /api/verify-evidence?pieceCid=...`

### 4.5 MetaMask Delegations

- Smart Accounts Kit v0.3.0 — ERC-7710 + ERC-7715
- Pimlico bundler (ERC-4337), gas sponsorado via paymaster
- `NativeTokenTransferAmountEnforcer` caveat — limite de valor por delegacao
- Enderecamento deterministico com named salts (`keccak256("selentar-agent-v1")`)

### 4.6 Infrastructure Modules (`lib/`)

- **State machine** — 11 estados (INTAKE → CLOSED/ABANDONED) com guards e transicoes
- **Event sourcing** — SHA-256 hash-chain para cada evento + dual-write para PostgreSQL
- **Circuit breaker** — dual-layer: settlement guard (4 levels) + ServiceBreaker por servico (CLOSED/OPEN/HALF_OPEN) com error discrimination
- **Outbox pattern** — guaranteed settlement delivery com retry logic
- **Idempotency** — SHA-256 dedupe keys com 24h TTL, safe retries
- **Replay engine** — dry-run de qualquer mediacao com overrides, detecta divergencias automaticamente
- **Reputation oracle** — HMAC signature, anti-Goodhart header
- **Scoring system** — `ReputationScorer` com 5 fatores ponderados + `adjustWeights` via AI (Claude Sonnet 4.6 analisa outcomes, propoe pesos com reasoning + confidence score, fallback para math)
- **ENS** — Mainnet reverse lookup com cache PostgreSQL (6h TTL), retry com backoff, 30 req/min rate limit
- **Canonical JSON hashing** — keys recursivamente ordenadas para hashes determiniscos
- **Simulate-before-write** — toda chamada de contrato faz dry-run antes de gastar gas

---

## 5. Convencoes

- **Idioma:** pt-BR para texto user-facing, English para codigo/variaveis/comments
- **Styling:** Tailwind CSS v4 com CSS variables semanticas. Usar `cn()` para merge de classes. Nunca cores cruas (`bg-red-500`), usar tokens semanticos (`bg-primary`, `bg-destructive`)
- **Animacoes:** `motion` (framer-motion) para transicoes de UI
- **Path aliases:** `@/*` -> `./*` (sem src-dir)
- **Icones:** `lucide-react`. Nunca sizing classes no componente de icone; usar `className="size-4"` no wrapper.
- **shadcn/ui:** Style `new-york`, RSC enabled, Tailwind v4
- **On-chain:** viem direto — NAO usar ethers.js
- **IA:** AI SDK v6 (Vercel) — NAO usar @anthropic-ai/sdk direto
- **Nao tocar pages existentes** — criar novas paginas, NUNCA editar page.tsx existentes sem instrucao explicita

---

## 6. Stack & Versoes

| Pacote | Versao | Uso |
|--------|--------|-----|
| `next` | 16.x (latest) | Framework |
| `react` / `react-dom` | 19.x | UI |
| `ai` (AI SDK) | 6.x | ToolLoopAgent, useChat, streamText |
| `@ai-sdk/anthropic` | latest | Claude Sonnet 4.6 (advisory chains, scoring) |
| `@ai-sdk/google` | latest | Gemini 2.0 Flash (mediation), Gemini 3.1 Pro (client agent) |
| `@openrouter/ai-sdk-provider` | latest | GPT-5.4-mini (contract audit) |
| `viem` | latest | On-chain calls, ERC-8004 |
| `tailwindcss` | 4.x | Styling |
| `@tailwindcss/postcss` | latest | PostCSS integration |
| `framer-motion` | 12.x | Animacoes |
| `lucide-react` | latest | Icones |
| `class-variance-authority` | latest | CVA |
| `clsx` | latest | Classes condicionais |
| `tailwind-merge` | latest | Merge de classes |
| `drizzle-orm` | latest | ORM PostgreSQL |
| `@metamask/sdk` | latest | Smart Accounts Kit (ERC-7710 + ERC-7715) |
| `x402-next` | latest | x402 payment middleware |
| `@coinbase/x402` | latest | USDC payment on Base Sepolia |
| TypeScript target | ES2017 | |

**Modelos por funcao:**

| Funcao | Modelo |
|--------|--------|
| Clara (mediadora) | Gemini 2.0 Flash |
| Parser orchestrator | Gemini 2.0 Flash |
| Client agent (disputante) | Gemini 3.1 Pro |
| The Empath (advisory) | Claude Sonnet 4.6 |
| The Strategist (advisory) | Claude Sonnet 4.6 |
| Contract audit (analyze-contract) | GPT-5.4-mini via OpenRouter |
| Scoring adjustWeights | Claude Sonnet 4.6 |
| Harness (Claude Code) | claude-opus-4-6 |

---

## 7. Comandos

```bash
npm run dev           # Next.js dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm test              # 40 tests, 7 modules (vitest)

# CLI operacional
npx tsx scripts/cli.ts cases list
npx tsx scripts/cli.ts cases show <caseId>
npx tsx scripts/cli.ts cases replay <caseId>
npx tsx scripts/cli.ts verify <caseId>
npx tsx scripts/cli.ts export <caseId>
npx tsx scripts/cli.ts metrics
npx tsx scripts/cli.ts breaker status
npx tsx scripts/cli.ts breaker reset

# One-time scripts
npx tsx scripts/register-agent.ts  # Registrar agente no ERC-8004 (ja rodado)
```

---

## 8. Variaveis de Ambiente

Requeridas em `.env.local`:

```bash
# AI models
ANTHROPIC_API_KEY=              # Claude Sonnet 4.6 (advisory chains, scoring)
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini (mediation, parser orchestrator, client agent)
OPENROUTER_API_KEY=             # GPT-5.4-mini (contract audit)

# On-chain (Base Sepolia)
AGENT_PRIVATE_KEY=              # wallet do agent — nunca commitar!
CLIENT_PRIVATE_KEY=             # segunda wallet para ERC-8004 feedback — nunca commitar!
SELANTAR_AGENT_ID=2122          # ERC-8004 agent ID

# Registries (enderecos dos contratos ERC-8004 na Base Sepolia)
IDENTITY_REGISTRY_ADDRESS=
REPUTATION_REGISTRY_ADDRESS=
VALIDATION_REGISTRY_ADDRESS=

# Database
DATABASE_URL=                   # PostgreSQL connection string

# Integracao (opcional)
EVOLUTION_API_KEY=              # WhatsApp (Evolution API)
EVOLUTION_API_URL=              # WhatsApp server URL
GITHUB_TOKEN=                   # GitHub API para Sentinel
PIMLICO_API_KEY=                # ERC-4337 bundler para MetaMask delegations
```

---

## 9. Regras Anti-Padrao (O que NUNCA fazer)

| Proibido | Correto | Ref |
|----------|---------|-----|
| `parameters: z.object(...)` em tool | `inputSchema: z.object(...)` | ai-sdk/common-errors |
| `maxTokens: N` | `maxOutputTokens: N` | ai-sdk/common-errors |
| `maxSteps: N` | `stopWhen: stepCountIs(N)` | ai-sdk/common-errors |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` | ai-sdk/common-errors |
| `useChat({ api: "..." })` | `useChat({ transport: new DefaultChatTransport({ api }) })` | ai-sdk/common-errors |
| `handleSubmit` / `handleInputChange` | `sendMessage({ text })` + `useState` manual | ai-sdk/common-errors |
| `part.toolInvocation.args` | `part.input` (apos checar state) | ai-sdk/common-errors |
| `part.toolInvocation.result` | `part.output` (state: `output-available`) | ai-sdk/common-errors |
| `addToolResult` | `addToolOutput` | ai-sdk/common-errors |
| `case 'tool-invocation':` | `isToolUIPart(part)` ou `case 'tool-{name}':` | ai-sdk/common-errors |
| `generateObject(...)` | `generateText({ output: Output.object({...}) })` | ai-sdk/common-errors |
| `bg-red-500` (cor crua) | `bg-destructive` (token semantico) | shadcn |
| `import { ethers }` | `import { ... } from 'viem'` | decisao arquitetural |
| `@anthropic-ai/sdk` direto | `@ai-sdk/anthropic` via AI SDK | decisao arquitetural |
| Editar `page.tsx` existente | Criar nova pagina | feedback do usuario |

---

## 10. Estrutura de Arquivos

```
selantar/
├── public/
│   ├── agent.json                    # ERC-8004 registration file (Agent #2122)
│   └── .well-known/agent-registration.json
├── contracts/interfaces/
│   ├── IIdentityRegistry.sol
│   ├── IReputationRegistry.sol
│   └── IValidationRegistry.sol
├── app/
│   ├── layout.tsx                    # Root layout com navbar
│   ├── page.tsx                      # Landing page (Care Protocol framing)
│   ├── globals.css
│   ├── forge/
│   │   ├── page.tsx
│   │   └── _components/             # ContractUpload, RiskAnalysis, EscrowSetup, ContractParser
│   ├── mediation/
│   │   ├── page.tsx
│   │   └── _components/             # MediationChat, SettlementModal, ERC8004Status, FilecoinCard
│   ├── docs/page.tsx                 # API documentation
│   └── api/
│       ├── analyze-contract/route.ts
│       ├── parse-contract/route.ts   # ToolLoopAgent + 5 sub-agents
│       ├── create-escrow/route.ts
│       ├── mediation-chat/route.ts   # Clara + advisory chains
│       ├── execute-settlement/route.ts
│       ├── mediate/route.ts          # x402 paywall
│       ├── mcp/route.ts              # MCP server A2A
│       ├── intake/route.ts           # Rate limited, idempotent
│       ├── verify-evidence/route.ts  # Filecoin PDP verification
│       ├── agent-log/route.ts
│       ├── oracle/[address]/reputation/route.ts
│       └── erc8004/ (register/, feedback/, validate/)
├── components/ui/                    # shadcn components
├── lib/
│   ├── utils.ts
│   ├── wallet.ts                     # viem wallet client config
│   ├── state-machine.ts              # 11 estados, guards, transicoes
│   ├── event-sourcing.ts             # SHA-256 hash-chain
│   ├── circuit-breaker.ts            # Settlement guard + ServiceBreaker
│   ├── outbox.ts                     # Guaranteed delivery pattern
│   ├── idempotency.ts                # SHA-256 dedupe, 24h TTL
│   ├── replay.ts                     # Replay engine com divergence detection
│   ├── scoring.ts                    # ReputationScorer + AI adjustWeights
│   ├── canonical-hash.ts             # Canonical JSON serialization
│   ├── ipfs.ts                       # IPFS pinning
│   ├── filecoin.ts                   # Synapse SDK, PDP
│   ├── ens.ts                        # ENS reverse lookup + cache
│   ├── db/                           # Drizzle ORM schema + queries
│   └── erc8004/
│       ├── addresses.ts
│       ├── identity.ts
│       ├── reputation.ts
│       └── validation.ts
├── scripts/
│   ├── cli.ts                        # CLI operacional completo
│   ├── register-agent.ts             # One-time ERC-8004 registration (ja rodado)
│   └── ...                           # QA, screenshots, integration tests
├── AGENTS.md                         # Agent soul
├── CLAUDE.md                         # This file
├── README.md                         # Documentacao completa do projeto
├── .env.local                        # Credentials (never commit)
└── Guia ERC-8004                     # Reference guide (read-only)
```

---

## 11. Documentos de Referencia

| Arquivo | O que contem |
|---------|-------------|
| `README.md` | Documentacao completa — fonte de verdade do estado atual do projeto |
| `Guia ERC-8004` | Guia completo com todo codigo ERC-8004 pronto para copiar |
| `.env.local` | Credenciais — nunca commitar |
| `public/agent.json` | ERC-8004 agent registration file (Agent #2122) |
| `public/agent_log.json` | DevSpot Agent Manifest com TXs e decisoes do agente |
| `AGENTS.md` | Agent soul — framing, personalidade, valores da Clara |
| `CARE-PROTOCOL.md` | Documentacao do Care Protocol e Sentinel |
