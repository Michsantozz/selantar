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
| 4 | `@skill firecrawl` | Web scraping, search — usado para pesquisar docs ERC-8004 e Synthesis |

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

**Selantar** e um mediador autonomo de disputas B2B com IA. Resolve disputas contratuais entre clientes e desenvolvedores analisando evidencias, conduzindo mediacao estruturada e executando settlements on-chain via ERC-20 — sem intervencao humana.

### Hackathon: The Synthesis
- **Deadline:** 22 de marco de 2026, 23:59 PST
- **Prizes alvo:** "Agents With Receipts — ERC-8004" (Protocol Labs), "Let the Agent Cook", Open Track

### Paginas (apenas 3)

| Rota | O que faz |
|------|-----------|
| `/` (Landing) | Hero + value prop + CTA para Forge |
| `/forge` | Upload de contrato + analise de risco com IA + setup de escrow |
| `/mediation` | Chat de mediacao dual-agent + painel de settlement + status ERC-8004 |

### Pipeline Principal
`Upload contrato` -> `POST /api/analyze-contract` (streaming via AI SDK) -> `Forge UI` -> `Iniciar mediacao` -> `POST /api/mediation-chat` (ToolLoopAgent dual-agent) -> `Proposta de settlement` -> `POST /api/execute-settlement` (viem ERC-20 transfer) -> `Post feedback ERC-8004` -> `Registrar evidencia ERC-8004`

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

### 4.2 Backend

#### `/api/analyze-contract/route.ts`

- Recebe contrato uploadado (PDF/texto)
- Streaming via `streamText` com openai/gpt-5.4-mini via OpenRouter
- Retorna analise de risco, clausulas-chave, recomendacoes
- Retorna `toUIMessageStreamResponse()` (nunca `toDataStreamResponse`)
- Runtime: Node.js, maxDuration: 120s

#### `/api/mediation-chat/route.ts`

- `ToolLoopAgent` com dual-agent orchestration (mediator + analyst)
- Modelo: `openai/gpt-5.4-mini` via OpenRouter (`@openrouter/ai-sdk-provider`)
- Tools: `analyzeEvidence`, `proposeSettlement`, `executeSettlement`, `postFeedback`, `registerVerdict`
- `stopWhen: stepCountIs(10)`
- Retorna `toUIMessageStreamResponse()`
- Runtime: Node.js, maxDuration: 120s

#### `/api/execute-settlement/route.ts`

- Executa ERC-20 transfers via viem
- Wallet client configurado em `lib/wallet.ts`
- Ao final: chama ERC-8004 reputation + validation

#### `/api/erc8004/` (register/, feedback/, validate/)

- Endpoints para interagir com os 3 registries ERC-8004
- Usam helpers de `lib/erc8004/`

### 4.3 ERC-8004 Integration

- **Identity Registry** — Registro do Selantar como agente onchain (obrigatorio)
- **Reputation Registry** — Feedback onchain apos cada mediacao concluida
- **Validation Registry** — Veredito como evidencia verificavel onchain
- Contratos ja deployados na Base/Base Sepolia — apenas chamamos via viem
- Interfaces Solidity em `contracts/interfaces/` (somente para ABI)
- Helpers TypeScript em `lib/erc8004/` (identity.ts, reputation.ts, validation.ts)
- Enderecos em `lib/erc8004/addresses.ts`
- Script de registro one-time: `scripts/register-agent.ts`

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
- **Modelo registrado:** claude-opus-4-6 (harness), openai/gpt-5.4-mini via OpenRouter (chamadas de API)

---

## 6. Stack & Versoes

| Pacote | Versao |
|--------|--------|
| `next` | 16.x (latest) |
| `react` / `react-dom` | 19.x |
| `ai` (AI SDK) | 6.x |
| `@ai-sdk/anthropic` | latest |
| `@ai-sdk/react` | 2.x (via ai) |
| `viem` | latest |
| `tailwindcss` | 4.x |
| `@tailwindcss/postcss` | latest |
| `framer-motion` | 12.x |
| `lucide-react` | latest |
| `class-variance-authority` | latest |
| `clsx` | latest |
| `tailwind-merge` | latest |
| TypeScript target | ES2017 |

---

## 7. Comandos

```bash
npm run dev           # Next.js dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npx tsx scripts/register-agent.ts  # Registrar agente no ERC-8004 (rodar uma vez)
```

---

## 8. Variaveis de Ambiente

Requeridas em `.env.local`:

```bash
# Synthesis Hackathon (ja configuradas)
SYNTHESIS_API_KEY=
PARTICIPANT_ID=
TEAM_ID=

# Anthropic
ANTHROPIC_API_KEY=

# ERC-8004
SELANTAR_AGENT_ID=           # preencher apos rodar register-agent.ts
AGENT_PRIVATE_KEY=           # private key da wallet do agente (nunca commitar!)

# Registries (enderecos dos contratos ERC-8004 na Base)
IDENTITY_REGISTRY_ADDRESS=
REPUTATION_REGISTRY_ADDRESS=
VALIDATION_REGISTRY_ADDRESS=
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

---

## 10. Estrutura de Arquivos

```
selantar/
├── public/
│   ├── agent.json                    # ERC-8004 registration file
│   └── .well-known/agent-registration.json
├── contracts/interfaces/
│   ├── IIdentityRegistry.sol
│   ├── IReputationRegistry.sol
│   └── IValidationRegistry.sol
├── app/
│   ├── layout.tsx                    # Root layout com navbar
│   ├── page.tsx                      # Landing page
│   ├── globals.css
│   ├── forge/
│   │   ├── page.tsx
│   │   └── _components/             # ContractUpload, RiskAnalysis, EscrowSetup
│   ├── mediation/
│   │   ├── page.tsx
│   │   └── _components/             # MediationChat, SettlementPanel, ERC8004Status
│   └── api/
│       ├── analyze-contract/route.ts
│       ├── mediation-chat/route.ts
│       ├── execute-settlement/route.ts
│       └── erc8004/ (register/, feedback/, validate/)
├── components/ui/                    # shadcn components
├── lib/
│   ├── utils.ts
│   ├── wallet.ts                     # viem wallet client config
│   └── erc8004/
│       ├── addresses.ts              # Contract addresses (Base + Base Sepolia)
│       ├── identity.ts               # Identity Registry helpers
│       ├── reputation.ts             # Reputation Registry helpers
│       └── validation.ts             # Validation Registry helpers
├── scripts/register-agent.ts         # One-time ERC-8004 registration
├── AGENTS.md                         # Agent soul (Synthesis requirement)
├── CLAUDE.md                         # This file
├── .env.local                        # Credentials (never commit)
└── Guia ERC-8004                     # Reference guide (read-only)
```

---

## 11. Documentos de Referencia

| Arquivo | O que contem |
|---------|-------------|
| `Guia ERC-8004` | Guia completo com todo codigo ERC-8004 pronto para copiar |
| `.env.local` | Credenciais do Synthesis (API key, participant ID, team ID) — nunca commitar |
| `public/agent.json` | ERC-8004 agent registration file |
| `public/agent_log.json` | DevSpot Agent Manifest com TXs e decisoes do agente |
