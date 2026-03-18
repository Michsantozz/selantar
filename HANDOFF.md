# HANDOFF — Contexto Completo para Continuacao do Projeto

> Cole este documento inteiro como primeiro prompt na proxima sessao do Claude Code.
> Working directory: `/home/michsantoz/newveredict/`

---

## QUEM SOMOS

- **Humano**: Michael Nunes (@MichaelNun49000, msantoznunes@gmail.com, Founder)
- **Agente**: VeredictLLM — mediador autonomo de disputas B2B com IA
- **Hackathon**: The Synthesis (deadline: 22 de marco de 2026, 23:59 PST — FALTAM ~4 DIAS)
- **Repo anterior**: github.com/Michsantozz/veredict (SURGE x OpenClaw hackathon — NAO REUTILIZAR CODIGO, apenas referencia)

---

## O QUE JA FOI FEITO

### 1. Registro no Synthesis ✅
O VeredictLLM foi registrado com sucesso na plataforma do hackathon.
- Transacao on-chain: https://basescan.org/tx/0xf38126995fc5fd7701b74d65cbbc784ee2af81682498196bf48f49b62425f87a
- Credenciais salvas em `.env.local` (SYNTHESIS_API_KEY, PARTICIPANT_ID, TEAM_ID)
- O registro do Synthesis criou automaticamente uma identidade ERC-8004 na Base Mainnet

### 2. Plano Arquitetural ✅
Plano completo aprovado pelo usuario em: `/home/michsantoz/.claude/plans/fizzy-toasting-simon.md`

### 3. Pesquisa Completa ✅
- Documentacao do AI SDK v6 (ToolLoopAgent, useChat, streaming) — salva em `.firecrawl/`
- Regras e prizes do Synthesis — salva em `.firecrawl/`
- Guia ERC-8004 completo — em `/home/michsantoz/newveredict/Guia ERC-8004`
- Projeto original analisado em `/home/michsantoz/veredict/`

### 4. Decisoes Tecnicas Confirmadas ✅
| Decisao | Escolha |
|---|---|
| IA | AI SDK v6 (Vercel) com ToolLoopAgent — NAO usar @anthropic-ai/sdk direto |
| On-chain | viem direto — NAO usar SURGE |
| Agentes | NAO usar OpenClaw |
| Modelo | claude-opus-4-6 (registrado), pode usar claude-sonnet-4-6 nas chamadas |
| Harness | claude-code |
| Frontend | Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui + Framer Motion 12 |
| Paginas | Apenas 3: Landing, Forge, Mediation |

---

## O QUE FALTA FAZER (em ordem)

### FASE 0 — ERC-8004 (Validar Primeiro)
O usuario quer validar o ERC-8004 antes de construir o app.

**0.1 Pesquisar enderecos dos contratos ERC-8004 na Base**
- Acessar https://8004.org
- Acessar https://github.com/ethereum/ERCs/pull/1170
- Buscar na web: "ERC-8004 contract addresses Base"
- Precisamos dos enderecos de 3 contratos: Identity Registry, Reputation Registry, Validation Registry
- Salvar em `lib/erc8004/addresses.ts`

**0.2 Criar arquivos ERC-8004**
Tudo esta documentado no arquivo `Guia ERC-8004` na raiz do projeto. Seguir os 8 passos do guia:
- `/public/agent.json` — registration file (codigo pronto no guia, Passo 1)
- `/public/.well-known/agent-registration.json` — domain verification
- `/contracts/interfaces/IIdentityRegistry.sol` (codigo pronto no guia, Passo 2)
- `/contracts/interfaces/IReputationRegistry.sol` (codigo pronto no guia, Passo 2)
- `/contracts/interfaces/IValidationRegistry.sol` (codigo pronto no guia, Passo 2)
- `/lib/erc8004/addresses.ts` (template no guia, Passo 3 — preencher com enderecos reais)
- `/lib/erc8004/identity.ts` (codigo pronto no guia, Passo 4)
- `/lib/erc8004/reputation.ts` (codigo pronto no guia, Passo 4)
- `/lib/erc8004/validation.ts` (codigo pronto no guia, Passo 4)
- `/scripts/register-agent.ts` (codigo pronto no guia, Passo 6)

**0.3 Testar registro**
- Precisa de wallet com ETH na Base para gas
- Rodar `npx tsx scripts/register-agent.ts`
- Salvar VEREDICT_AGENT_ID no .env.local

### FASE 1 — Scaffold do Projeto
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
npx shadcn@latest init
npm install ai @ai-sdk/anthropic viem framer-motion lucide-react
```

Dependencias completas:
- next, react, react-dom (framework)
- ai, @ai-sdk/anthropic (AI SDK v6 — substitui OpenClaw e @anthropic-ai/sdk)
- viem (on-chain: ERC-20 + ERC-8004 — substitui SURGE)
- tailwindcss, @tailwindcss/postcss
- framer-motion (animacoes)
- lucide-react (icones)
- class-variance-authority, clsx, tailwind-merge (utils UI)
- shadcn/ui components via CLI

### FASE 2 — Landing Page + Layout
- `app/layout.tsx` — root layout com navbar
- `app/page.tsx` — landing page com identidade visual glassmorphism

### FASE 3 — Forge (Upload + Analise)
- `app/forge/page.tsx` com `_components/` (ContractUpload, RiskAnalysis, EscrowSetup)
- `app/api/analyze-contract/route.ts` — streaming via AI SDK
- `lib/claude.ts` → substituir por AI SDK provider config

### FASE 4 — Mediation (Chat + Settlement)
- `app/mediation/page.tsx` com `_components/` (MediationChat, SettlementPanel, ERC8004Status)
- `app/api/mediation-chat/route.ts` — ToolLoopAgent com dual-agent orchestration
- `app/api/execute-settlement/route.ts` — viem ERC-20 transfer
- `lib/wallet.ts` — wallet client viem configurado
- Integrar chamadas ERC-8004 (reputation + validation) ao final do fluxo

### FASE 5 — AGENTS.md + Polish + Deploy
- Criar AGENTS.md com soul do VeredictLLM + identity ERC-8004
- Deploy na Vercel
- Submissao no Synthesis via API (ver submission skill em https://synthesis.md/submission/skill.md)

---

## ESTRUTURA FINAL ESPERADA

```
newveredict/
├── public/
│   ├── agent.json
│   └── .well-known/agent-registration.json
├── contracts/interfaces/
│   ├── IIdentityRegistry.sol
│   ├── IReputationRegistry.sol
│   └── IValidationRegistry.sol
├── app/
│   ├── layout.tsx
│   ├── page.tsx (landing)
│   ├── globals.css
│   ├── forge/
│   │   ├── page.tsx
│   │   └── _components/ (ContractUpload, RiskAnalysis, EscrowSetup)
│   ├── mediation/
│   │   ├── page.tsx
│   │   └── _components/ (MediationChat, SettlementPanel, ERC8004Status)
│   └── api/
│       ├── analyze-contract/route.ts
│       ├── mediation-chat/route.ts
│       ├── execute-settlement/route.ts
│       └── erc8004/ (register/, feedback/, validate/)
├── components/ui/ (shadcn)
├── lib/
│   ├── utils.ts
│   ├── wallet.ts
│   └── erc8004/ (addresses.ts, identity.ts, reputation.ts, validation.ts)
├── scripts/register-agent.ts
├── AGENTS.md
├── .env.local (JA EXISTE — tem credenciais do Synthesis)
└── Guia ERC-8004 (referencia — ler este arquivo para implementar)
```

---

## ARQUIVOS DE REFERENCIA IMPORTANTES

| Arquivo | O que contem |
|---|---|
| `Guia ERC-8004` | Guia completo com todo codigo ERC-8004 pronto para copiar |
| `.env.local` | Credenciais do Synthesis (API key, participant ID, team ID) |
| `.firecrawl/` | Docs baixados: AI SDK, Synthesis rules, prizes, themes |
| `/home/michsantoz/veredict/` | Projeto original — referencia de UI e fluxo (NAO copiar codigo) |
| `/home/michsantoz/.claude/plans/fizzy-toasting-simon.md` | Plano arquitetural completo |

---

## AI SDK v6 — PADROES CRITICOS

O projeto usa AI SDK v6 (Vercel), NAO @anthropic-ai/sdk. Cuidado com estas migracoes:

| v5 (antigo) | v6 (usar este) |
|---|---|
| `parameters` | `inputSchema` |
| `maxTokens` | `maxOutputTokens` |
| `maxSteps` | `stopWhen: stepCountIs(n)` |
| `toDataStreamResponse` | `toUIMessageStreamResponse` |
| `handleSubmit` | `sendMessage` |
| `tool-invocation` | `tool-{toolName}` |
| `part.args` | `part.input` |
| `part.result` | `part.output` |

Exemplo do mediator agent:
```typescript
import { ToolLoopAgent, tool, stepCountIs } from 'ai';
export const mediatorAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4.5',
  instructions: 'You are VeredictLLM...',
  tools: { analyzeEvidence: tool({...}), executeSettlement: tool({...}) },
  stopWhen: stepCountIs(10),
});
```

---

## PRIZES QUE ESTAMOS MIRANDO

1. **"Agents With Receipts — ERC-8004"** (Protocol Labs) — $4k/$3k/$1k
2. **"Let the Agent Cook"** — $4k/$2.5k/$1.5k
3. **Open Track** — $25k+

---

## INSTRUCAO FINAL

Comece pela FASE 0 (ERC-8004). O usuario quer ver isso validado primeiro.
O blocker principal e encontrar os enderecos dos contratos — pesquise em 8004.org e no PR #1170.
Depois siga as fases 1-5 em ordem.
Deadline: 22 de marco de 2026. Nao ha tempo para over-engineering. Faca funcionar.
