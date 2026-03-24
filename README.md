# Selantar

### The oracle for human intention.

![Hedera Testnet](https://img.shields.io/badge/Hedera-Testnet_(296)-8247E5?style=for-the-badge&logo=hedera)
![ERC-8004](https://img.shields.io/badge/ERC--8004-Agent_%2336-orange?style=for-the-badge)
![HCS](https://img.shields.io/badge/HCS-Audit_Log-blue?style=for-the-badge)
![HTS](https://img.shields.io/badge/HTS-SLNTR_NFT-green?style=for-the-badge)
![OpenClaw](https://img.shields.io/badge/OpenClaw-Integrated-red?style=for-the-badge)

**Autonomous AI mediation for B2B disputes.** Clara reads sealed contracts, analyzes evidence, mediates live between parties, executes settlement in HBAR, and registers the verdict on-chain via ERC-8004 — without human intervention. Every case builds immutable trust on Hedera.

Built for **Hedera Hello Future Apex Hackathon 2026** · Tracks: **AI & Agents** ($40K) · **OpenClaw Bounty** ($8K) · Network: **Hedera Testnet (Chain ID 296)**

---

## Live Demo

- **App:** [selantar-hedera.vercel.app](https://selantar-hedera.vercel.app)
- **Agent #36 on HashScan:** [View all transactions](https://hashscan.io/testnet/account/0xFE5561A1a064ae13DbcF23BA1e3ff85Fc3da7B04)
- **Agent manifest:** [agent.json](https://selantar-hedera.vercel.app/agent.json)
- **HCS Audit Log:** [Topic 0.0.8351168](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.8351168/messages)
- **HTS Token:** [SLNTR on HashScan](https://hashscan.io/testnet/token/0.0.8351617)

---

## See It In Action

Dr. Suasuna is furious. He paid R$30,000 for a clinic system that still can't book patients. He wants a full refund. The developer is blocked — the clinic's own secretary ignored 5 access requests over 3 weeks.

An old-world mediator would take weeks and charge thousands. A smart contract would just freeze the funds forever. Neither cares about context.

**Clara** — Selantar's AI mediator — does something different:

1. She reads the sealed contract, escrow state, and all evidence — silently, before saying a word
2. She audits the communication trail — 5 unanswered emails, Slack messages flagging the blocker on day 43
3. She **cools the room down** — validates the doctor's frustration before presenting any facts
4. She drops the reality check — proves the clinic's own staff missed the request, but frames it as a communication gap
5. She proposes a concrete win-win: 80/20 split, 48-hour extension, clear delivery date
6. Both sides agree. One click. **Settlement executes on-chain in HBAR. Reputation updated. Verdict registered forever.**

No lawyers. No delays. No one takes the fall for a broken inbox.

---

## Three Hedera Services

Every mediation uses **EVM + HCS + HTS** — three native Hedera services in a single workflow:

| Service | What It Does | Verifiable At |
|---------|-------------|---------------|
| **EVM (Smart Contracts)** | ERC-8004 registries (Identity, Reputation, Validation) + HBAR settlement | [HashScan](https://hashscan.io/testnet/account/0xFE5561A1a064ae13DbcF23BA1e3ff85Fc3da7B04) |
| **HCS (Consensus Service)** | Immutable audit log — every tool step recorded as a consensus message | [Mirror Node](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.8351168/messages) |
| **HTS (Token Service)** | NFT receipt (SLNTR) minted for each completed mediation | [HashScan](https://hashscan.io/testnet/token/0.0.8351617) |

**Per mediation:** 3 EVM TXs + 5 HCS messages + 1 NFT receipt + 2 new accounts = **12 Hedera operations.**

---

## ERC-8004 — The Agent Has Receipts

Selantar is registered as **Agent #36** on the ERC-8004 Identity Registry (Hedera Testnet). Every mediation produces three on-chain artifacts:

| Registry | What It Proves | Address |
|----------|---------------|---------|
| **Identity** | Agent exists as a verifiable economic actor | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| **Reputation** | Trust score 85 — earned through results | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |
| **Validation** | Verdict stored as cryptographic evidence | `0xf3dd86fcc060639d3dd56fbf652b171aeabb1b58` |

> The official ERC-8004 Validation Registry was not deployed on Hedera. We deployed a spec-compliant implementation — [deploy TX](https://hashscan.io/testnet/transaction/0x8048e03744e2811ebeeb69a559848076bccb3ac9e81789d83d82a18bc20ad013).

---

## On-Chain Transactions (All Verified)

| # | Operation | TX / ID | Status |
|---|----------|---------|--------|
| 1 | Agent Registration (ERC-8004 Identity) | [0xe290eedd...](https://hashscan.io/testnet/transaction/0xe290eedd9382668979d523687975914feda4d601c78e188da2510a890cd2761f) | success |
| 2 | Settlement Test (0.01 HBAR) | [0xc90d1cf1...](https://hashscan.io/testnet/transaction/0xc90d1cf17300ec1b4b6943a452d258e2e690f23af15f4132b5a9651d0970bae1) | success |
| 3 | Client Funding (10 HBAR) | [0x11f93d3c...](https://hashscan.io/testnet/transaction/0x11f93d3c83951d5425b8cf342c06d80b0baafca1937a16060f86e82025c8e18e) | success |
| 4 | Reputation Feedback (score 85) | [0x3a68bdb5...](https://hashscan.io/testnet/transaction/0x3a68bdb5c364dad2131b04c32c79a985aa34dee7a867bfa9cee9357d4d9e06d6) | success |
| 5 | ValidationRegistry Deploy | [0x8048e037...](https://hashscan.io/testnet/transaction/0x8048e03744e2811ebeeb69a559848076bccb3ac9e81789d83d82a18bc20ad013) | success |
| 6 | HCS Topic Created | Topic `0.0.8351168` | success |
| 7 | HCS Test Message | Seq #1 | success |
| 8 | HTS Token Created (SLNTR) | Token `0.0.8351617` | success |
| 9 | HTS NFT Minted (#1) | Serial #1 | success |

Every TX is real. Click any link and verify on HashScan.

---

## OpenClaw Integration

Selantar integrates with **OpenClaw** (personal AI assistant framework) for agent-to-agent communication:

| Component | What It Does |
|-----------|-------------|
| **Skill: selantar** | Teaches the OpenClaw agent about Selantar — pipeline, ERC-8004, Evolution API |
| **Agent: selantar** | Dedicated OpenClaw agent (gpt-5.4-mini) with full Selantar context |
| **Evolution API** | WhatsApp delivery — typing indicators + messages via `whats.vensa.pro` |
| **Webhook** | `/hooks/agent` on OpenClaw Gateway for event notifications |

**Agent-to-agent flow:** Clara (AI SDK) decides to notify → calls `notifyAgent` tool → Evolution API → WhatsApp delivered.

---

## Five Tools — All Real, All On-Chain

| Tool | What It Does | Hedera Service |
|------|-------------|----------------|
| `analyzeEvidence` | Scores evidence credibility (0-100) | HCS audit log |
| `proposeSettlement` | Calculates fair distribution | HCS audit log |
| `executeSettlement` | Transfers HBAR on-chain | EVM + HCS |
| `postFeedback` | Posts reputation to ERC-8004 | EVM + HCS |
| `registerVerdict` | Registers verdict + mints NFT receipt | EVM + HCS + HTS |

Clara calls these silently during mediation. The parties never see the machinery.

---

## The Pipeline

```
Contract uploaded to Forge
  → AI parses risks and milestones (tool calling with structured output)
    → Sentinel Plan: React Flow visualization of monitoring actions
      → Agent approves/declines actions → WhatsApp notifies parties
        → If dispute: Clara mediates live with dual-agent orchestration
          → Settlement executes on-chain in HBAR
            → ERC-8004 reputation + validation registered
              → HCS audit log + HTS NFT receipt
```

Every step autonomous. Every action verifiable. Every receipt on-chain.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   SELANTAR ECOSYSTEM                  │
│                                                      │
│  AI SDK v6 (Clara + Sentinel)                        │
│  ├── ToolLoopAgent (mediator) — 5 on-chain tools     │
│  ├── parse-contract agent — structured output         │
│  └── notifyAgent tool → Evolution API → WhatsApp     │
│                                                      │
│  OpenClaw (Gateway + Agent)                           │
│  ├── Skill: selantar (SKILL.md)                      │
│  ├── Model: gpt-5.4-mini                             │
│  └── Hooks: /hooks/agent webhook                     │
│                                                      │
│  Hedera Testnet (Chain ID 296)                       │
│  ├── EVM: ERC-8004 Identity (#36) + Reputation + Val │
│  ├── HCS: Topic 0.0.8351168 (audit log)              │
│  └── HTS: Token 0.0.8351617 (SLNTR receipts)        │
│                                                      │
│  Vercel: selantar-hedera.vercel.app                  │
│  └── Auto-deploy from hedera-apex branch             │
└──────────────────────────────────────────────────────┘
```

---

## Network Effect

Every mediation Clara resolves generates real activity on Hedera:

| Per Mediation | Count |
|--------------|-------|
| EVM transactions | 3 (settlement + reputation + validation) |
| HCS messages | 5 (audit log per tool step) |
| NFT receipts | 1 (SLNTR on HTS) |
| New accounts | 2 (client + developer wallets) |
| Trust entries | 1 (permanent reputation on-chain) |

**Simple math:** 100 mediations/month = 200 new accounts, 300 EVM TXs, 500 HCS messages, 100 NFT receipts on Hedera.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, App Router, React 19 |
| AI | AI SDK v6 — `ToolLoopAgent`, `generateText`, `useChat`, `DefaultChatTransport` |
| Models | `openai/gpt-5.4-mini` via OpenRouter (contract analysis), `gemini-3.1-pro-preview` via Google AI (mediation) |
| On-chain | viem + `@hashgraph/sdk`, Hedera Testnet (Chain ID 296) |
| ERC-8004 | Identity + Reputation + Validation registries (all 3) |
| Agent Framework | OpenClaw (Gateway + Skills + WhatsApp via Baileys) |
| WhatsApp | Evolution API (`whats.vensa.pro`) — direct delivery |
| UI | Tailwind CSS v4, shadcn/ui (New York), Framer Motion, React Flow |
| AI Elements | Chain of thought, shimmer, agent avatars, tool cards |
| Visualization | @xyflow/react — 40+ animated nodes for Sentinel Plan |
| Harness | Claude Code (Opus 4.6) |

---

## Running Locally

```bash
git clone https://github.com/Michsantozz/selantar.git
cd selantar
git checkout hedera-apex
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

**Required env vars:**

```bash
OPENROUTER_API_KEY=           # OpenRouter API key (for gpt-5.4-mini)
GOOGLE_GENERATIVE_AI_API_KEY= # Google AI key (for gemini-3.1-pro-preview)
AGENT_PRIVATE_KEY=            # Hedera wallet private key (Agent #36)
CLIENT_PRIVATE_KEY=           # Second wallet for ERC-8004 feedback
SELANTAR_AGENT_ID=36          # ERC-8004 agent ID
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_CHAIN_ID=296
HCS_TOPIC_ID=0.0.8351168     # Hedera Consensus Service topic
HTS_TOKEN_ID=0.0.8351617     # Hedera Token Service (SLNTR)
```

**Optional (OpenClaw integration):**

```bash
OPENCLAW_HOOKS_URL=http://127.0.0.1:18789/hooks/agent
OPENCLAW_HOOKS_TOKEN=selantar-hook-2026
OPENCLAW_NOTIFY_TO=+5562994161690
```

---

## Key Pages

| Route | What |
|-------|------|
| `/` | Landing — value prop + network effect + pipeline |
| `/forge` | Contract upload + 2 demo scenarios |
| `/contractv2` | AI-powered contract analysis — risks, milestones, deploy preview |
| `/contract/sentinel-plan` | Agent workflow visualization (React Flow, 40+ animated steps) |
| `/mediation` | Live AI mediation — Clara + client dual-agent chat |

---

## Autonomy Metrics

```json
{
  "humanInterventionRequired": false,
  "decisionSteps": 5,
  "hederaServicesUsed": 3,
  "onChainTransactions": 9,
  "settlementExecutedOnChain": true,
  "reputationPostedOnChain": true,
  "verdictRegisteredOnChain": true,
  "hcsAuditLogEnabled": true,
  "htsNftReceiptEnabled": true,
  "openClawIntegrated": true,
  "whatsAppDelivery": true,
  "erc8004RegistriesUsed": 3,
  "agentId": 36
}
```

---

## Why This Matters

| The Problem | The Scale |
|-------------|-----------|
| **$40-50B/year** lost to commercial disputes globally | 400M small businesses worldwide |
| **11% of SMB revenue** evaporates to contract friction | Average arbitration: $10K-50K, 6-18 months |
| No affordable resolution for contracts under $100K | Lawyers don't scale. Smart contracts don't care. |

| Traditional Arbitration | Selantar |
|------------------------|---------|
| $10,000-50,000 in legal fees | ~$0.01 in Hedera gas |
| 6-18 months | Minutes |
| No proof of what was decided | Immutable on-chain verdict via ERC-8004 |
| Mediator has no skin in the game | Agent's reputation rises or falls with every case |
| One-size-fits-all judgment | Context-aware — reads logs, messages, delivery history |
| Relationships destroyed | Egos protected, relationships preserved |

---

## Hackathon

| | |
|---|---|
| **Event** | Hedera Hello Future Apex Hackathon 2026 |
| **Track** | AI & Agents ($40K prize pool) |
| **Bounty** | OpenClaw — Killer App for the Agentic Society ($8K) |
| **Network** | Hedera Testnet (Chain ID 296) |
| **Agent ID** | #36 (ERC-8004 Identity Registry) |
| **Demo** | [selantar-hedera.vercel.app](https://selantar-hedera.vercel.app) |
| **Repo** | [github.com/Michsantozz/selantar](https://github.com/Michsantozz/selantar) (branch: `hedera-apex`) |
| **Hacking Period** | 17 Feb — 23 Mar 2026 |
| **Fresh Code** | 100% — all commits within hacking period |

---

*The Web3 economy finally has a brain, it has hands, and it actually cares. Welcome to Selantar.*
