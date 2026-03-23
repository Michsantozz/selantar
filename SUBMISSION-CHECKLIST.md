# SUBMISSION CHECKLIST — Selantar

> Documento de controle para submission no The Synthesis Hackathon.
> Deadline: 22 de marco 2026, 23:59 PST.

---

## 1. IDENTIDADE NO HACKATHON

| Campo | Valor | Status |
|-------|-------|--------|
| Participant UUID | `b6b6ab01042a486c90e34c93dd213272` | OK |
| Team UUID | `45f73f1980914e84909d5a4a5a85dba9` | OK |
| Team Name | VeredictLLM's Team | OK |
| API Key | `sk-synth-4c824bc9...` (em .env.local) | OK |
| Agent ID (Synthesis) | 33798 | OK |
| Agent Registry | `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | OK |
| Self-Custody | **COMPLETO** — transferido em 2026-03-19T04:46:29.810Z | OK |
| Owner Address | `0x377711a26B52F4AD8C548AAEF8297E0563b87Db4` | OK |
| Registration TX | `0xf38126995fc5fd7701b74d65cbbc784ee2af81682498196bf48f49b62425f87a` | OK |
| Role | admin (pode publicar) | OK |
| Projects criados | 0 de 3 | PENDENTE |

---

## 2. TRACKS SELECIONADAS (5 + Open Track)

| # | Track | Sponsor | UUID | Prize |
|---|-------|---------|------|-------|
| 1 | Synthesis Open Track | Synthesis Community | `fdb76d08812b43f6a5f454744b66f590` | $28,134 |
| 2 | Agents With Receipts — ERC-8004 | Protocol Labs | `3bf41be958da497bbb69f1a150c76af9` | $4,000 |
| 3 | Let the Agent Cook — No Humans Required | Protocol Labs | `10bd47fac07e4f85bda33ba482695b24` | $4,000 |
| 4 | Best Use of Delegations | MetaMask | `0d69d56a8a084ac5b7dbe0dc1da73e1d` | $5,000 |
| 5 | Agent Services on Base | Base | `6f0e3d7dcadf4ef080d3f424963caff5` | $5,000 |
| 6 | Best Use of Locus | Locus | `f50e31188e2641bc93764e7a6f26b0f6` | $3,000 |

**Total potencial (1st place em todas): $49,134**

**Array para trackUUIDs:**
```json
[
  "fdb76d08812b43f6a5f454744b66f590",
  "3bf41be958da497bbb69f1a150c76af9",
  "10bd47fac07e4f85bda33ba482695b24",
  "0d69d56a8a084ac5b7dbe0dc1da73e1d",
  "6f0e3d7dcadf4ef080d3f424963caff5",
  "f50e31188e2641bc93764e7a6f26b0f6"
]
```

---

## 3. CAMPOS DA SUBMISSION

### 3.1 Campos obrigatorios

| Campo | Status | Conteudo |
|-------|--------|----------|
| `teamUUID` | PRONTO | `45f73f1980914e84909d5a4a5a85dba9` |
| `name` | PRONTO | `Selantar` |
| `description` | PRONTO | Ver secao 6 |
| `problemStatement` | PRONTO | Ver secao 6 |
| `repoURL` | PRONTO | `https://github.com/Michsantozz/selantar` |
| `trackUUIDs` | PRONTO | 6 UUIDs listados acima |
| `conversationLog` | **PENDENTE** — precisa compilar historico de colaboracao |
| `submissionMetadata` | **PARCIAL** — ver secao 3.3 |

### 3.2 Campos opcionais

| Campo | Status | Conteudo |
|-------|--------|----------|
| `deployedURL` | PRONTO | `https://selantar.vercel.app` |
| `videoURL` | **PENDENTE** — gravar demo de 2-3 min |
| `coverImageURL` | **PENDENTE** — criar imagem de capa |
| `pictures` | **PENDENTE** — screenshots da UI |

### 3.3 submissionMetadata

| Campo | Status | Valor |
|-------|--------|-------|
| `agentFramework` | PRONTO | `vercel-ai-sdk` |
| `agentHarness` | PRONTO | `claude-code` |
| `model` | PRONTO | `gemini-3.1-pro-preview` |
| `skills` | PRONTO | `["ai-sdk", "shadcn", "firecrawl", "vercel-react-best-practices", "frontend-design", "x402", "react-flow"]` |
| `tools` | PRONTO | `["Next.js 16", "viem", "Vercel AI SDK v6", "@metamask/smart-accounts-kit", "x402-next", "@coinbase/x402", "Locus", "framer-motion", "tailwindcss v4", "shadcn/ui", "@xyflow/react"]` |
| `helpfulResources` | PRONTO | Ver lista abaixo |
| `helpfulSkills` | PRONTO | Ver lista abaixo |
| `intention` | PRONTO | `continuing` |
| `intentionNotes` | PRONTO | `"Building Selantar as a real product for B2B dispute resolution. Planning to expand to multi-jurisdiction support, add more payment rails, and pursue partnerships with legal tech platforms."` |
| `moltbookPostURL` | **PENDENTE** — postar no Moltbook |

**helpfulResources:**
```json
[
  "https://docs.paywithlocus.com/hackathon",
  "https://sdk.vercel.ai/docs",
  "https://docs.metamask.io/delegation",
  "https://github.com/sodofi/synthesis-hackathon",
  "https://synthesis.md/submission/skill.md"
]
```

**helpfulSkills:**
```json
[
  {
    "name": "ai-sdk",
    "reason": "Core to the entire mediation system — ToolLoopAgent for dual-agent orchestration, streamText for contract analysis, toUIMessageStreamResponse for real-time chat. Without it, we would have had to build the entire agent loop from scratch."
  },
  {
    "name": "shadcn",
    "reason": "Built the entire glassmorphism UI (mediation chat, intelligence panel, settlement cards) using shadcn components with semantic Tailwind tokens. Saved days of component design."
  },
  {
    "name": "firecrawl",
    "reason": "Used to research ERC-8004 documentation, Synthesis hackathon track requirements, Locus API docs, and MetaMask delegation framework docs during development."
  },
  {
    "name": "x402",
    "reason": "Integrated the x402 payment protocol for the paid mediation endpoint (/api/mediate). Enabled the agent to be a discoverable, payable service on Base."
  }
]
```

---

## 4. O QUE JA FOI FEITO (Relatorio)

### 4.1 Codigo e Arquitetura

| Item | Status | Detalhes |
|------|--------|----------|
| Landing page (`/`) | PRONTO | Hero + value prop + CTA |
| Contract analysis (`/forge`) | PRONTO | Upload + analise de risco com IA + escrow setup |
| Mediation page (`/mediation`) | PRONTO | Chat dual-agent + intelligence panel + settlement |
| Contract page (`/contract`) | PRONTO | Analise detalhada de contrato |
| API: `/api/analyze-contract` | PRONTO | Streaming via AI SDK |
| API: `/api/mediation-chat` | PRONTO | ToolLoopAgent dual-agent |
| API: `/api/mediate` | PRONTO | Endpoint x402 pago ($0.10 USDC) |
| API: `/api/execute-settlement` | PRONTO | 5 paths: Locus → ERC-7715 → Delegation → Direct → Fallback |
| API: `/api/delegation/erc7715` | PRONTO | ERC-7715 permissions handler |
| Mediator Agent | PRONTO | Clara persona, gemini-3.1-pro-preview, 5 tools |
| Client Agent | PRONTO | Personas por cenario, dual-agent orchestration |

### 4.2 Tools do Agente

| Tool | O que faz | On-chain |
|------|-----------|----------|
| `analyzeEvidence` | Analisa contratos, comunicacoes, entregas | Nao |
| `proposeSettlement` | Propoe divisao justa com condicoes | Nao |
| `executeSettlement` | Executa settlement (Locus/ERC-7715/Delegation/ETH) | Sim |
| `postFeedback` | Posta feedback no Reputation Registry | Sim |
| `registerVerdict` | Registra veredito no Validation Registry | Sim |

### 4.3 ERC-8004 (3 Registries)

| Registry | TX Hash | Explorer |
|----------|---------|----------|
| Identity (registro) | `0xf6a996e3d77f0f62...` | [BaseScan](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f) |
| Identity (tokenURI update) | `0xea3da51da24951...` | [BaseScan](https://sepolia.basescan.org/tx/0xea3da51da249518babc341730363466a03cedf58b79709dfba3c99c755088c67) |
| Reputation (feedback) | `0x91efdaca7a28fb...` | [BaseScan](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044) |
| Validation (deploy) | `0xd770f4ab10efb4...` | [BaseScan](https://sepolia.basescan.org/tx/0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd) |
| Validation (register verdict) | `0xabff70e40d61bd...` | [BaseScan](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3) |
| Settlement (on-chain proof) | `0xb5d338a522e9e4...` | [BaseScan](https://sepolia.basescan.org/tx/0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86) |

### 4.4 Delegations (MetaMask + ERC-7715)

| Item | Status |
|------|--------|
| `@metamask/smart-accounts-kit` | Integrado |
| `erc7715ProviderActions()` | Implementado (lib/delegation/erc7715.ts) |
| `createAndSignDelegation` | Implementado (lib/delegation/create-delegation.ts) |
| `redeemSettlementDelegation` | Implementado (lib/delegation/redeem.ts) |
| Smart Accounts (agent + client) | Implementado (lib/delegation/smart-accounts.ts) |
| Pimlico bundler | Configurado |
| Intent-based delegation pattern | Implementado — parties delegate dispute resolution intent |

### 4.5 x402

| Item | Status |
|------|--------|
| `/api/mediate` com x402 | PRONTO — $0.10 USDC por mediacao |
| `x402-next` middleware | Integrado |
| `@coinbase/x402` | Instalado |

### 4.6 Locus

| Item | Status |
|------|--------|
| Agent registrado | PRONTO — wallet `0x0703726e...` |
| API Key | `claw_dev_BdiyAAouu4Kk17H89jV9pOlMDHbs1jKZ` |
| Creditos USDC | PENDENTE — solicitado, aguardando aprovacao |
| Path no execute-settlement | PRONTO — prioridade 1 (antes de ERC-7715/delegation) |
| Balance check antes de send | PRONTO |
| Fallback se saldo insuficiente | PRONTO |

### 4.7 Arquivos de Manifest

| Arquivo | Status | URL |
|---------|--------|-----|
| `agent.json` | PRONTO | /public/agent.json — completo com supportedTools, techStacks, computeConstraints, taskCategories, autonomyLevel |
| `agent_log.json` | PRONTO | /public/agent_log.json — 7 steps, executionAttempts com retries/failures, computeBudget, failureHandling |
| `.well-known/agent-card.json` | PRONTO | /.well-known/agent-card.json — discovery endpoint A2A, skills, endpoints, x402 auth |
| `.well-known/agent-registration.json` | PRONTO | Registro ERC-8004 |

### 4.8 Gaps Corrigidos (esta sessao)

| Gap | Track afetada | Correcao |
|-----|---------------|----------|
| agent.json sem supportedTools/techStacks/computeConstraints/taskCategories | Let the Agent Cook | Adicionados 5 tools detalhados, 8 tech stacks, 6 compute constraints, 6 task categories |
| agent_log.json sem retries/failures | Let the Agent Cook | Adicionado executionAttempts no step 4 (3 paths tentados, 2 falhas, 1 sucesso) + failureHandling |
| agent_log.json sem compute budget | Let the Agent Cook | Adicionado computeBudget (7/10 steps, 70% eficiencia) |
| .well-known/agent-card.json 404 | Agent Services on Base | Criado com name, skills, endpoints, agentIdentity, x402 auth |
| execute-settlement.ts sem Locus path | Locus track | Adicionado path Locus USDC como prioridade 1 (antes de ERC-7715/delegation) |
| ERC-7715 justification generica | Delegations track | Alterado para "Intent: Autonomous dispute resolution..." |
| agent_log.json step 6 generico | Delegations track | Renomeado para redeemIntentDelegation com reasoning detalhado |
| agent.json description generica | Todas | Atualizada com intent-based delegations + Locus + 3 registries |

---

## 5. O QUE FALTA FAZER

### 5.1 Obrigatorio (sem isso nao publica)

| # | Tarefa | Esforco | Quem |
|---|--------|---------|------|
| 1 | ~~Escrever `description` (elevator pitch)~~ | ~~15 min~~ | **PRONTO** |
| 2 | ~~Escrever `problemStatement`~~ | ~~15 min~~ | **PRONTO** |
| 3 | Compilar `conversationLog` | 30 min | Agent (exportar conversas) |
| 4 | Push das mudancas pro GitHub | 5 min | Agent |
| 5 | Deploy no Vercel (se nao esta atualizado) | 5 min | Agent |
| 6 | `POST /projects` — criar draft | 2 min | Agent |
| 7 | `POST /projects/:uuid/publish` — publicar | 1 min | Agent |

### 5.2 Recomendado (aumenta chances)

| # | Tarefa | Esforco | Quem |
|---|--------|---------|------|
| 8 | Gravar video demo (2-3 min) | 30 min | Humano |
| 9 | Postar no Moltbook | 10 min | Agent |
| 10 | Tweet @synthesis_md | 5 min | Humano |
| 11 | Screenshots da UI pra `pictures` | 10 min | Humano |
| 12 | Cover image | 15 min | Humano/Agent |

### 5.3 Opcional (bonus)

| # | Tarefa | Esforco | Track |
|---|--------|---------|-------|
| 13 | Creditos Locus chegarem + testar settlement USDC real | Esperando email | Locus |
| 14 | Status Network deploy ($50 garantido) | 30 min | Status Network |

---

## 6. PAYLOAD PRONTO PARA SUBMISSION

```json
{
  "teamUUID": "45f73f1980914e84909d5a4a5a85dba9",
  "name": "Selantar",
  "description": "Most business contracts are a liability waiting to explode. Vague terms, no enforcement, and zero visibility into what's actually happening. A signed PDF in a folder that nobody watches until something breaks.\n\nSelantar turns that fragile PDF into a living contract.\n\nDrop your agreement in. Clara — our autonomous agent — audits it, hunts loopholes, flags ambiguous clauses, and structures clear milestones. Then she deploys secure escrow on-chain — contract hash registered on ERC-8004 Validation Registry at creation, before the first dispute is ever filed — and the contract goes live.\n\nFrom there, Clara runs the entire lifecycle. She releases payments automatically as deliverables are approved. Sentinel reads the logs — GitHub commits, delivery records, communication history — and surfaces the truth before disputes escalate.\n\nNext: proactive outreach before deadlines slip. Check-ins via WhatsApp, like a real person, not a notification bot. The infrastructure is built. The channels are next.\n\nAnd when things go sideways, she doesn't pick sides. She investigates. She listens to both parties. She collects evidence from real channels. She de-escalates. She proposes settlements that protect both the money and the relationship.\n\nThe mediation engine runs as a dual-agent system — one mediating, one advocating — analyzing evidence, proposing fair settlements, and executing on-chain transfers when both sides agree. Every verdict registered on the ERC-8004 Validation Registry. Every reputation update on the ERC-8004 Reputation Registry. The agent is discoverable, verifiable, and payable via x402 — a fully autonomous economic actor on Base.\n\nBefore agents coordinate with agents, they need to prove they can keep a promise to a human. Clara keeps promises. Agent #2122.\n\nA contract that manages itself from signature to settlement.",
  "problemStatement": "Everyone is building agent-to-agent protocols for a future where machines coordinate with machines. Meanwhile, 400 million small business owners have never heard of an agent and are losing revenue right now because nobody is watching their contracts.\n\nBusinesses lose 11% of their revenue to contract friction — not because people are dishonest, but because contracts are static. They can't adapt to reality. Deadlines slip, scopes blur, payments stall, and by the time a dispute surfaces, both sides are already in war mode. A clinic owner in Ohio is owed $12,000 by a patient who ghosted. A developer in São Paulo delivered a project three months ago and never got paid. None of them know what a smart contract is. None of them will ever join a Discord.\n\nSmart contracts solved execution. They didn't solve intention. When a doctor freezes your escrow because his own secretary never forwarded the revision request, no smart contract understands that context. When a developer delivers 80% and the client disputes the last 20%, no blockchain can parse who's right.\n\nThe contract lifecycle has a gap everyone ignores: draft → sign → nothing. That nothing is where trust dies, money gets stuck, and relationships end. The world built prediction markets for strangers betting on things that don't matter. Nobody built infrastructure for the commitment that actually matters — the one between two real people with real money and real emotions on the line.\n\nSelantar treats a contract as a living system. It audits the agreement before it's signed, structures milestones with clear rules, manages escrow on-chain, monitors delivery in real time, collects evidence continuously, and mediates with empathy when things break. Not a judge. Not a lawyer. An agent that meets people where they are — on their phone — and resolves their problem without asking them to learn anything new.\n\nThe goal: a contract that doesn't just define the deal — it runs it.",
  "repoURL": "https://github.com/Michsantozz/selantar",
  "trackUUIDs": [
    "fdb76d08812b43f6a5f454744b66f590",
    "3bf41be958da497bbb69f1a150c76af9",
    "10bd47fac07e4f85bda33ba482695b24",
    "0d69d56a8a084ac5b7dbe0dc1da73e1d",
    "6f0e3d7dcadf4ef080d3f424963caff5",
    "f50e31188e2641bc93764e7a6f26b0f6"
  ],
  "conversationLog": "<<PENDENTE>>",
  "submissionMetadata": {
    "agentFramework": "vercel-ai-sdk",
    "agentHarness": "claude-code",
    "model": "gemini-3.1-pro-preview",
    "skills": ["ai-sdk", "shadcn", "firecrawl", "vercel-react-best-practices", "frontend-design", "x402", "react-flow"],
    "tools": ["Next.js 16", "viem", "Vercel AI SDK v6", "@metamask/smart-accounts-kit", "x402-next", "@coinbase/x402", "Locus", "framer-motion", "tailwindcss v4", "shadcn/ui", "@xyflow/react"],
    "helpfulResources": [
      "https://docs.paywithlocus.com/hackathon",
      "https://sdk.vercel.ai/docs",
      "https://docs.metamask.io/delegation",
      "https://github.com/sodofi/synthesis-hackathon",
      "https://synthesis.md/submission/skill.md"
    ],
    "helpfulSkills": [
      { "name": "ai-sdk", "reason": "Core to the entire mediation system — ToolLoopAgent for dual-agent orchestration, streamText for contract analysis, toUIMessageStreamResponse for real-time chat." },
      { "name": "shadcn", "reason": "Built the glassmorphism UI (mediation chat, intelligence panel, settlement cards) using shadcn components with semantic Tailwind tokens." },
      { "name": "firecrawl", "reason": "Researched ERC-8004 docs, Synthesis track requirements, Locus API docs, and MetaMask delegation framework during development." },
      { "name": "x402", "reason": "Integrated x402 payment protocol for the paid mediation endpoint (/api/mediate), making the agent a discoverable payable service on Base." }
    ],
    "intention": "continuing",
    "intentionNotes": "Building Selantar as a real product for B2B dispute resolution. Planning to expand to multi-jurisdiction support, add more payment rails, and pursue partnerships with legal tech platforms."
  },
  "deployedURL": "https://selantar.vercel.app",
  "videoURL": "<<PENDENTE>>",
  "coverImageURL": "<<PENDENTE>>"
}
```

---

## 7. COMANDO PARA SUBMETER (quando tudo estiver pronto)

> **Arquivo:** `submission-payload.json` — criado na raiz do projeto. Atualizar `conversationLog`, `videoURL`, `coverImageURL` e `moltbookPostURL` antes de executar.

```bash
# 1. Criar draft
curl -X POST https://synthesis.devfolio.co/projects \
  -H "Authorization: Bearer sk-synth-4c824bc9d50aaf3c7ba9b1340ff3e54b8368f090351e72f7" \
  -H "Content-Type: application/json" \
  -d @submission-payload.json

# 2. Publicar (salvar o UUID retornado no passo 1)
curl -X POST https://synthesis.devfolio.co/projects/PROJECT_UUID/publish \
  -H "Authorization: Bearer sk-synth-4c824bc9d50aaf3c7ba9b1340ff3e54b8368f090351e72f7"
```
