# Selantar

**Autonomous AI mediator for B2B contract disputes.**

Selantar reads sealed contract terms and verifiable evidence, conducts structured mediation with both parties, proposes a fair settlement, and registers the verdict on-chain via ERC-8004 — without human intervention.

Built for [The Synthesis](https://synthesis.md) hackathon · Track: **Agents With Receipts — ERC-8004** (Protocol Labs)

---

## The Problem

B2B service contracts have no neutral resolution layer. When a clinic hires a dev agency and something breaks at go-live — who's right? Today that answer costs weeks, legal fees, and a destroyed relationship.

The problem isn't bad people. It's that no trusted third party exists at the speed of software delivery. And when one does exist, there's no verifiable proof of what was decided.

---

## The Solution

Selantar makes the mediator autonomous, instant, and verifiably impartial.

**Clara** — Selantar's mediator persona — analyzes evidence, de-escalates emotion, and proposes a proportional settlement. Every resolved case leaves an immutable on-chain receipt. The agent has skin in the game: its ERC-8004 reputation score rises or falls with every case.

---

## How It Works

```
Pick a case → Clara mediates live → Settlement proposed → Verdict registered on-chain
```

**Three real dispute scenarios:**

| Case | Dispute | Value |
|------|---------|-------|
| A Clínica Suasuna | Doctor vs. dev agency — blocked CRM access | R$45,000 |
| O E-commerce Quebrado | Retailer vs. agency — breaking API change | $12,000 |
| O Freelancer Fantasma | Startup vs. ghost freelancer — 75% delivered | $8,000 |

Each scenario comes with real evidence, real parties, and a real financial stake in escrow. Clara reads it all and mediates live.

---

## ERC-8004 Integration

Selantar is registered as **Agent #2122** on the ERC-8004 Identity Registry (Base Sepolia) with full self-custody.

| Registry | Address | TX |
|----------|---------|-----|
| Identity Registry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | [0xf6a996e3...](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f) |
| Reputation Registry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | [0x91efdaca...](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044) |
| Validation Registry | `0xd6f7d27ce23830c7a59acfca20197f9769a17120` | [0xabff70e4...](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3) |

> The official ERC-8004 Validation Registry was not yet deployed on Base Sepolia. Selantar deployed a spec-compliant implementation — [deploy TX](https://sepolia.basescan.org/tx/0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd).

**Agent manifest:** [`/agent.json`](public/agent.json)

---

## Architecture

```
Landing (/)
  └── Scenario selector (/mediation)
        └── Mediation Room — 3-panel layout
              ├── Case Info Panel    — contract, parties, escrow
              ├── Chat (center)      — Clara mediates live via AI SDK ToolLoopAgent
              └── Intelligence Panel — evidence, tools, ERC-8004 status
```

**Pipeline:**

```
Client complaint → POST /api/mediation-chat (ToolLoopAgent)
  → analyzeEvidence tool
  → proposeSettlement tool
  → executeSettlement tool (viem ERC-20)
  → postFeedback tool (ERC-8004 Reputation Registry)
  → registerVerdict tool (ERC-8004 Validation Registry)
```

**Dual-agent mediation:** Clara (mediator) responds to the client automatically after each exchange via `POST /api/client-chat` — the developer can intervene at any point via the input box.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, App Router |
| AI | AI SDK v6 — `ToolLoopAgent`, `useChat`, `DefaultChatTransport` |
| Model | `openai/gpt-5.4-mini` via OpenRouter |
| On-chain | viem, Base Sepolia (chainId: 84532) |
| ERC-8004 | Identity + Reputation + Validation registries |
| UI | Tailwind CSS v4, shadcn/ui (New York), Framer Motion |
| Harness | Claude Code |

---

## Running Locally

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

**Required env vars:**

```bash
ANTHROPIC_API_KEY=
AGENT_PRIVATE_KEY=       # wallet that holds Agent NFT #2122
CLIENT_PRIVATE_KEY=      # second wallet for ERC-8004 feedback
SELANTAR_AGENT_ID=2122
```

---

## On-Chain Receipts

All three ERC-8004 transactions are live on Base Sepolia:

- **Settlement TX** (Clínica Suasuna case): [0xb5d338a5...](https://sepolia.basescan.org/tx/0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86)
- **Reputation feedback** (score: 90/100): [0x91efdaca...](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044)
- **Verdict validation**: [0xabff70e4...](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3)

Full agent decision log: [`public/agent_log.json`](public/agent_log.json)

---

## Autonomy Metrics

```json
{
  "humanInterventionRequired": false,
  "decisionSteps": 5,
  "settlementProposedByAgent": true,
  "settlementExecutedOnChain": true,
  "reputationPostedOnChain": true
}
```
