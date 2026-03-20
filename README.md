# Selantar

**Autonomous AI mediator for B2B contract disputes.**

Selantar reads sealed contract terms and verifiable evidence, conducts structured mediation with both parties, proposes a fair settlement, and registers the verdict on-chain via ERC-8004 — without human intervention.

Built for [The Synthesis](https://synthesis.md) hackathon · Tracks: **Agents With Receipts — ERC-8004** (Protocol Labs) · **Agent Services on Base** (Base) · **Let the Agent Cook** (Protocol Labs)

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

## Mediation-as-a-Service (x402)

Selantar exposes its mediation engine as a **paid API endpoint** using the [x402 payment protocol](https://x402.org). Any agent on the internet can discover, pay, and use Selantar's mediation — no API key, no account, no subscription. Just USDC in the HTTP header.

```
GET  /api/mediate   →  Free service discovery (schema, price, ERC-8004 registries)
POST /api/mediate   →  $0.10 USDC per mediation (x402 paywall)
```

### How it works

1. **Discover** — `GET /api/mediate` returns the full input/output schema, price, network, and ERC-8004 registry addresses. Zero cost.
2. **Pay** — Send a `POST` with the `X-PAYMENT` header containing a signed USDC payment on Base Sepolia. The x402 middleware validates payment before the handler runs.
3. **Mediate** — The AI mediator analyzes your dispute, proposes a settlement, executes it on-chain, posts reputation feedback, and registers the verdict — all in one call.
4. **Receipt** — Response includes the full verdict, settlement terms, all on-chain TX hashes, and ERC-8004 receipts (reputation + validation).

### Example request

```bash
# 1. Discover the service
curl https://selantar.vercel.app/api/mediate

# 2. Call with x402 payment (via awal CLI)
awal x402 pay https://selantar.vercel.app/api/mediate -X POST \
  -d '{"contract": "Web dev contract for $5000", "dispute": "Developer delivered 3 weeks late with missing features", "evidence": "Sprint logs show 60% completion at deadline"}'
```

### Response structure

```json
{
  "verdict": "VERDICT: Based on evidence analysis...",
  "settlement": { "clientShare": 0.65, "developerShare": 0.35, "amount": 5000 },
  "execution": { "txHash": "0x..." },
  "erc8004": {
    "feedback": { "feedbackTxHash": "0x..." },
    "validation": { "validationTxHash": "0x..." }
  },
  "txHashes": ["0x...", "0x...", "0x..."],
  "toolExecutions": 5,
  "timestamp": "2026-03-20T04:30:00.000Z"
}
```

### Why x402?

| Traditional API | Selantar x402 |
|----------------|---------------|
| Sign up for account | No account needed |
| Get API key | No API key |
| Monthly subscription | Pay per use ($0.10/mediation) |
| Trust the provider | Payment verified on-chain |
| No proof of service | ERC-8004 receipt for every call |

This makes Selantar the first **discoverable, pay-per-use dispute resolution service** for the agent economy.

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

**Pipelines:**

```
Interactive (UI):
  Client complaint → POST /api/mediation-chat (ToolLoopAgent)
    → analyzeEvidence → proposeSettlement → executeSettlement
    → postFeedback (ERC-8004) → registerVerdict (ERC-8004)

API (x402):
  Any agent → POST /api/mediate + X-PAYMENT header ($0.10 USDC)
    → x402 payment validation → same 5-tool pipeline → JSON response
```

**Dual-agent mediation (UI):** Clara (mediator) responds to the client automatically after each exchange via `POST /api/client-chat` — the developer can intervene at any point via the input box.

**Single-shot mediation (API):** External agents send contract + dispute + evidence via x402 and receive a complete verdict with on-chain receipts in one call.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, App Router |
| AI | AI SDK v6 — `ToolLoopAgent`, `generateText`, `useChat`, `DefaultChatTransport` |
| Model | `openai/gpt-5.4-mini` via OpenRouter |
| Payments | x402 protocol — `x402-next`, `@coinbase/x402` (USDC on Base Sepolia) |
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
OPENROUTER_API_KEY=      # OpenRouter API key (for gpt-5.4-mini)
AGENT_PRIVATE_KEY=       # wallet that holds Agent NFT #2122
CLIENT_PRIVATE_KEY=      # second wallet for ERC-8004 feedback
SELANTAR_AGENT_ID=2122   # ERC-8004 agent ID
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
  "reputationPostedOnChain": true,
  "x402PaymentEnabled": true,
  "discoverableViaGET": true,
  "payPerUse": "$0.10 USDC"
}
```

---

## Live

- **App:** [selantar.vercel.app](https://selantar.vercel.app)
- **API (discovery):** [selantar.vercel.app/api/mediate](https://selantar.vercel.app/api/mediate)
- **Agent #2122:** [Base Sepolia Explorer](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f)
- **Agent manifest:** [`/agent.json`](https://selantar.vercel.app/agent.json)
