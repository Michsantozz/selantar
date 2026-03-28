# Selantar

### Contracts deserve care, not just code.

Every year, $1 trillion evaporates in B2B disputes. Not because contracts are bad — because no one watches them after they're signed. The contract goes into a folder and dies. Until the day it explodes.

Web3 gave us smart contracts. Rigid, cold, binary. If condition = true → execute. No context. No empathy. No one asking *why* the milestone is late.

**Selantar is the world's first Care Protocol.** An AI that lives inside your contract from day one — monitoring deliveries, detecting friction before it becomes conflict, communicating between parties when something goes wrong. And if a dispute erupts anyway, Clara already has all the evidence, mediates in 24 hours, executes settlement on-chain, and registers the verdict forever via ERC-8004.

Prevention over resolution. Care before code.

---

## The Difference

Every protocol that exists today reacts *after* something breaks.

```
Chainlink Automation:  if (deadline missed) → trigger()
Kleros:                if (dispute filed) → summon jurors
Smart contract:        if (condition) → execute or freeze

Selantar:              "João hasn't committed in 5 days.
                        But he just posted on Slack that his daughter is sick.
                        Let me tell the client and propose a 2-day extension."
```

This is not automation. This is care.

---

## See It In Action

### Scenario 1 — Care Protocol prevents the dispute

Day 5. The dev hasn't committed anything. A smart contract would do nothing. Kleros would wait for someone to file a dispute.

**Clara does something different:**

She checks GitHub (0 commits), scans the Slack logs ("daughter has fever, in hospital"), and sends a WhatsApp message to the client at 9:03am:

> *"Dr. Suasuna, João had a family emergency. I'm proposing a 48-hour extension on Milestone 2. The escrow stays locked, nothing changes financially. Want me to update the contract?"*

Dr. Suasuna replies: *"Of course. Tell him to get better."*

**Dispute that never existed. Relationship that got stronger.**

---

### Scenario 2 — When care fails, Clara resolves

Dr. Suasuna is furious. He paid R$30,000 for a clinic system that still can't book patients. He wants a full refund. The developer is blocked — the clinic's own secretary ignored 5 access requests over 3 weeks.

Clara does something no mediator, no smart contract, and no chatbot does:

1. She reads the sealed contract, escrow state, and all evidence — silently, before saying a word
2. She audits the communication trail — 5 unanswered emails, Slack messages flagging the blocker on day 43
3. She **cools the room down** — validates the doctor's frustration before presenting any facts
4. She drops the reality check — proves the clinic's own staff missed the request, but frames it as a communication gap. The doctor's ego stays intact.
5. She shifts the conversation from *"who's to blame"* to *"how do we save this investment"*
6. She proposes a concrete win-win: 80/20 split, 48-hour extension, clear delivery date
7. Both sides agree. One click. **Settlement executes on-chain. Reputation updated. Verdict registered forever.**

No lawyers. No delays. No one takes the fall for a broken inbox.

> This is not a chatbot that quotes rules. This is a political advisor that transforms angry founders into strategic CEOs.

---

## Three Real Disputes

| Case | What Happened | Escrow | Language |
|------|--------------|--------|----------|
| **A Clínica Suasuna** | Doctor vs. dev agency — secretary blocked CRM access for 3 weeks | R$45,000 | pt-BR |
| **O E-commerce Quebrado** | Retailer vs. agency — payment API broke mid-project, no force majeure clause | $12,000 | English |
| **O Freelancer Fantasma** | Startup vs. ghost dev — 75% delivered, then vanished for 14 days | $8,000 | English |

Each scenario has real evidence, real parties with distinct personalities, and a real financial stake in escrow. Clara reads it all and mediates live — the developer (you) can intervene at any point.

---

## Why This Matters

| The Old World | Selantar |
|--------------|----------|
| Contract signed → forgotten | AI monitors from day one |
| Problem detected on day 20 | Clara detects friction on day 3 |
| Weeks of emails, lawyers, threats | 24-hour autonomous resolution |
| $5,000+ in legal fees | $0.10 per mediation via x402 |
| No proof of what was decided | Immutable on-chain verdict via ERC-8004 |
| Mediator has no skin in the game | Agent's reputation score rises or falls with every case |
| One-size-fits-all judgment | Context-aware — reads CRM logs, messages, GitHub, delivery history |
| Relationships destroyed | Egos protected, relationships preserved |

---

## ERC-8004 — The Agent Has Receipts

Selantar is registered as **Agent #2122** on the ERC-8004 Identity Registry (Base Sepolia) with full self-custody. Every mediation produces three on-chain artifacts:

| Registry | What It Proves | TX |
|----------|---------------|-----|
| **Identity** | The agent exists as a verifiable economic actor | [0xf6a996e3...](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f) |
| **Reputation** | Score 90/100 — the agent earns trust through results | [0x91efdaca...](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044) |
| **Validation** | The verdict is cryptographic evidence — permanent, auditable, impossible to erase | [0xabff70e4...](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3) |

> The official ERC-8004 Validation Registry was not yet deployed on Base Sepolia. We deployed a spec-compliant implementation — [deploy TX](https://sepolia.basescan.org/tx/0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd).

This isn't decorative blockchain integration. Every mediation writes real transactions. Every verdict is verifiable. The agent's identity, reputation, and evidence trail live on-chain permanently.

**Agent manifest:** [`/agent.json`](https://selantar.vercel.app/agent.json)

---

## Mediation-as-a-Service (x402)

Selantar is the first **discoverable, pay-per-use Care Protocol** for the agent economy.

Any agent on the internet can discover, pay, and use Selantar — no API key, no account, no subscription. Just USDC in the HTTP header.

```
GET  /api/mediate   →  Free service discovery (schema, price, ERC-8004 registries)
POST /api/mediate   →  $0.10 USDC per mediation (x402 paywall)
```

**How it works:**

1. **Discover** — `GET /api/mediate` returns the full input/output schema, price, network, and ERC-8004 registry addresses. Zero cost.
2. **Pay** — Send a `POST` with the `X-PAYMENT` header containing a signed USDC payment on Base Sepolia. The x402 middleware validates payment before the handler runs.
3. **Mediate** — The AI analyzes your dispute, proposes a settlement, executes it on-chain, posts reputation feedback, and registers the verdict — all in one call.
4. **Receipt** — Response includes the full verdict, settlement terms, all on-chain TX hashes, and ERC-8004 receipts.

| Traditional API | Selantar x402 |
|----------------|---------------|
| Sign up for account | No account needed |
| Get API key | No API key |
| Monthly subscription | Pay per use ($0.10/mediation) |
| Trust the provider | Payment verified on-chain |
| No proof of service | ERC-8004 receipt for every call |

When agents start making deals on behalf of humans, they'll need a neutral resolution layer that's as fast, trustless, and verifiable as the transactions themselves. That's Selantar.

---

## MetaMask Delegations — Intent-Based Settlement

Settlements don't come from the mediator's wallet anymore. With MetaMask Delegations (ERC-7710 + ERC-7715), the **dispute parties themselves** grant scoped permission to the agent. Clara can only move funds that the parties explicitly authorized, up to a ceiling they set.

This is intent-based delegation: the parties delegate the *intent* "resolve my dispute and distribute the funds according to the agreement" — and the agent executes with verifiable, limited authority.

**How it works:**

1. Both parties have **deployed MetaMask Smart Accounts** on Base Sepolia (Hybrid implementation)
2. When Clara calls `executeSettlement`, the client's smart account signs a **scoped delegation** — limited to native ETH transfers up to a fixed amount
3. The agent sends a **UserOperation via Pimlico bundler** (ERC-4337) — the smart account is `msg.sender`, not the EOA
4. The **DelegationManager** verifies the signature, checks the `NativeTokenTransferAmountEnforcer` caveat, and executes the transfer
5. ETH moves from the client's smart account to the agent's smart account — verified on-chain
6. If delegation fails for any reason, the system cascades through 4 fallback paths automatically

**Settlement execution paths (in order):**
`Locus Intent` → `ERC-7715 Permission` → `ERC-7710 Delegation` → `Direct Transfer` → `Fallback`

**Verified delegation redemption (live on-chain):**

| What | TX | Explorer |
|------|-----|---------|
| Client Smart Account deployed | `0x7dd69f87...` | [BaseScan](https://sepolia.basescan.org/tx/0x7dd69f8782f3de15d216c7aef2f38fe5681f78028f13dc0b17e370b01dbb79ca) |
| Agent Smart Account deployed | `0xcf763778...` | [BaseScan](https://sepolia.basescan.org/tx/0xcf763778accec52ace1377e83813274fc97a14a785388b1cc6d8b82a99b1beab) |
| Client funded (0.001 ETH) | `0xec2996f9...` | [BaseScan](https://sepolia.basescan.org/tx/0xec2996f9a2d824af7e978c89cb850dc6b79cbeb69349ecd7e070a6962a8cbf1f) |
| Delegation redeemed (settlement) | `0xd6ad6b07...` | [BaseScan](https://sepolia.basescan.org/tx/0xd6ad6b07722b4df8e5b44b3c3b2f7a190a6c15ddcea5440623f10a367e32ba6f) |

Every TX is real. Click any link and verify.

| Without Delegations | With Delegations |
|---------------------|-----------------|
| Agent moves its own funds as "proof" | Agent moves the party's funds with permission |
| No spending limits | Scoped by NativeTokenTransferAmountEnforcer |
| Trust the agent's wallet | Trust the delegation's cryptographic scope |
| Settlement is symbolic | Settlement is real fund movement — balances change |
| No verifiable authority chain | Delegation → Bundler → DelegationManager → TX |

---

## The Care Protocol Pipeline

```
Contract uploaded (PDF/text)
  → AI audits risk — loopholes, vague terms, missing clauses
    → Transforms into living contract: milestones, rules, escrow
      → Contract hash registered on ERC-8004 Validation Registry
        → Sentinel goes live: monitors GitHub, WhatsApp, CRM, email

          CARE LOOP (continuous):
          → Milestone approaching? Clara checks delivery signals
          → Signal anomaly? Clara contacts parties proactively
          → Problem explained? Clara proposes adjustment, updates contract
          → No response in 48h? Escalates to formal dispute

        → If dispute: Clara mediates live with full context already loaded
          → analyzeEvidence → proposeSettlement → executeSettlement
            → postFeedback (ERC-8004 Reputation)
              → registerVerdict (ERC-8004 Validation)
                → Receipt permanent. Relationship intact.
```

Every step autonomous. Every action verifiable. Every receipt on-chain.

---

## Agent Tools — Six, All Real, All On-Chain

| Tool | What It Does | Output |
|------|-------------|--------|
| `classifyCase` | Classifies dispute type across 7 categories + sets strategy | Classification + strategy preset |
| `analyzeEvidence` | Scores credibility, relevance, and probative weight (0–100) | Score + key findings |
| `proposeSettlement` | Calculates fair split with percentages, amounts, and conditions | Dollar amounts + reasoning + conditions |
| `executeSettlement` | Multi-path on-chain execution (Locus → ERC-7715 → Delegation → Direct → Fallback) | TX hash on BaseScan |
| `postFeedback` | Posts reputation score to ERC-8004 Reputation Registry | Feedback TX hash |
| `registerVerdict` | Registers verdict as cryptographic evidence on ERC-8004 Validation Registry | Validation TX hash |

Clara calls these silently during mediation. The parties never see the machinery — they just see a mediator who somehow already knows everything.

**Live omnichannel monitoring (Sentinel):**

| Channel | What Clara Sees |
|---------|----------------|
| GitHub API | Commits, PRs, activity timeline — displayed live in contract flow |
| WhatsApp (Evolution API) | Real messages sent to parties on contract activation, with typing presence |
| CRM / Slack | Communication logs, access request trails, response times |

---

## Platform at a Glance

Built in 7 days. Production-grade from day one.

| Layer | Scale |
|-------|-------|
| API Routes | 16 endpoints — intake, mediation, settlement, delegation, oracle, MCP, x402 |
| Agent Tools | 6 tools (ToolLoopAgent) — all execute real on-chain actions |
| Lib Modules | 34 files — state machine, event sourcing, circuit breaker, outbox pattern, scoring, replay |
| Frontend Routes | 37 pages — landing, mediation, forge, contract lifecycle, admin, pitch, docs |
| Components | 170+ — mediation chat, settlement modal, ReactFlow, shadcn/ui, Web3, Magic UI |
| Database | PostgreSQL + Drizzle ORM — 5 tables with event sourcing + hash-chain integrity |
| Scripts | 12 — CLI, ERC-8004 registration, QA, screenshots, integration tests |

**Infrastructure highlights:**

- **State machine** — 11 states (INTAKE → CLOSED/ABANDONED) with guards and transitions
- **Event sourcing** — SHA-256 hash-chain for every mediation event + dual-write to PostgreSQL
- **Circuit breaker** — 4 levels (NORMAL → CAUTION → LOCKDOWN → EMERGENCY)
- **Outbox pattern** — guaranteed settlement delivery with retry logic
- **Idempotency** — SHA-256 deduplication keys with 24h TTL, safe retries
- **Replay engine** — dry-run any mediation with overrides, compare results
- **Reputation oracle** — `/api/oracle/[address]/reputation` with HMAC signature, anti-Goodhart header
- **Scoring system** — `ReputationScorer` with 5 weighted factors + `adjustWeights` (±3% per outcome, sum=1.0 guaranteed)
- **MCP server** — 5 tools for agent-to-agent integration (query, verify, reputation, list, submit)

---

## Architecture

```
Contract Creation:
  Upload contract → POST /api/analyze-contract (streaming AI audit)
    → POST /api/create-escrow → keccak256(contract) registered on ERC-8004
    → ContractID (CSX-YYYY-XXXXXXXX) + TX hash → contract goes live

Interactive Mediation (UI):
  Pick a case → Clara mediates live via ToolLoopAgent (Gemini 2.0 Flash)
    → classifyCase → analyzeEvidence → proposeSettlement
    → executeSettlement (4 paths + fallback)
    → postFeedback → registerVerdict
    → Dual-agent: client AI + Clara in the same chat, human can intervene

Case Intake:
  POST /api/intake — rate limited (10/h per IP), idempotency check, SHA-256 dedupe
    → createCase → CASE_OPENED event written to hash-chain log

API Mediation (x402):
  Any agent → POST /api/mediate + X-PAYMENT header ($0.10 USDC)
    → payment validated → same 6-tool pipeline → JSON with receipts

Sentinel (Care Loop):
  Active contracts → GitHub polling + WhatsApp monitoring
    → anomaly detected → proactive outreach → adjustment or escalation
```

---

## On-Chain Receipts

All transactions are live on Base Sepolia:

**Contract creation (forge):**
- **Contract registered** (integrity hash on escrow creation): [0xcac8dd72...](https://sepolia.basescan.org/tx/0xcac8dd72bc85ab242e09920f0a72fff8fe81e2f2e9abf1b22e17f6ec49e246ea)

**Mediation (dispute resolution):**
- **Settlement TX** (Clínica Suasuna case): [0xb5d338a5...](https://sepolia.basescan.org/tx/0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86)
- **Reputation feedback** (score: 90/100): [0x91efdaca...](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044)
- **Verdict validation**: [0xabff70e4...](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3)

**Infrastructure:**
- **Validation Registry deployed**: [0xd770f4ab...](https://sepolia.basescan.org/tx/0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd)

Full agent decision log: [`/agent_log.json`](https://selantar.vercel.app/agent_log.json)

---

## Autonomy Metrics

```json
{
  "humanInterventionRequired": false,
  "careLoopActive": true,
  "proactiveOutreachEnabled": true,
  "decisionSteps": 6,
  "settlementPaths": 5,
  "settlementProposedByAgent": true,
  "settlementExecutedOnChain": true,
  "reputationPostedOnChain": true,
  "verdictRegisteredOnChain": true,
  "x402PaymentEnabled": true,
  "delegatedSettlement": true,
  "delegationFramework": "MetaMask ERC-7710 + ERC-7715",
  "discoverableViaGET": true,
  "payPerUse": "$0.10 USDC",
  "erc8004RegistriesUsed": 3,
  "mcpServerEnabled": true,
  "eventSourcingEnabled": true,
  "circuitBreakerEnabled": true,
  "statesMachineStates": 11
}
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| AI | Vercel AI SDK v6 — `ToolLoopAgent`, `generateText`, `useChat`, `DefaultChatTransport` |
| Models | Gemini 2.0 Flash (mediation) · Gemini 3.1 Pro (client agent) · GPT-5.4-mini via OpenRouter (contract analysis) |
| Payments | x402 protocol — `x402-next`, `@coinbase/x402` (USDC on Base Sepolia) |
| On-chain | viem + Base Sepolia (chainId: 84532) |
| Smart Accounts | MetaMask Smart Accounts Kit v0.3.0 — ERC-7710 + ERC-7715 scoped delegations |
| Bundler | Pimlico (ERC-4337) — sponsors gas via paymaster |
| ERC-8004 | Identity + Reputation + Validation registries (all 3, deployed) |
| Auth | Privy (email + wallet + Google) |
| Database | PostgreSQL + Drizzle ORM — event sourcing + hash-chain integrity |
| Integration | MCP server (5 tools, A2A) · Evolution API (WhatsApp) · GitHub API |
| UI | Tailwind CSS v4 · shadcn/ui (New York) · Framer Motion · ReactFlow · Magic UI |
| QA | VALAR framework — 18/18 features approved |
| Harness | Claude Code |

---

## Test It In 30 Seconds

No setup required. Just copy, paste, and verify.

**1. Discover the service (free)**
```bash
curl https://selantar.vercel.app/api/mediate
```
Returns the full schema, price, accepted currency, and all ERC-8004 registry addresses.

**2. Verify the agent exists on-chain**
```bash
curl https://selantar.vercel.app/agent.json
```
Returns Agent #2122's ERC-8004 manifest — identity, operator wallet, supported tools, and capabilities.

**3. Watch Clara mediate live**

Open [selantar.vercel.app/mediation](https://selantar.vercel.app/mediation), pick any case, and watch. Clara classifies the dispute, analyzes evidence, cools the room down, proposes numbers, and executes settlement on-chain — all without human intervention.

**4. Verify every on-chain receipt**

| What | Link |
|------|------|
| Agent identity | [BaseScan](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f) |
| Reputation score (90/100) | [BaseScan](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044) |
| Verdict registered | [BaseScan](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3) |
| Settlement executed | [BaseScan](https://sepolia.basescan.org/tx/0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86) |

Every TX is real. Every receipt is permanent. Click any link and verify.

---

## The Vision — Where Care Becomes Capital

**Phase 1 (NOW — Live):** The Care Protocol. An AI that lives inside contracts — monitors, communicates, prevents. When prevention fails, mediates in 24h with full context. Every action on-chain. Every receipt permanent.

**Phase 2 (LIVE):** Omnichannel Sentinel. Evidence collected from every channel where business actually happens — WhatsApp, GitHub, CRM, email. When a contract goes live, Sentinel fires a real WhatsApp message to the parties. GitHub commits display live in the monitoring flow. Care that meets you where context lives.

**Phase 3 (HORIZON):** Trust Economy. On-chain reputation from real contract behavior unlocks liquidity, insurance, and credit lines. Your professional truth — not just your payment history — becomes capital. The more you honor your word, the more the system trusts you. Honesty becomes the most valuable asset in the agent economy.

> Credit is never a cold number. We look past statistics to see the human behind the deal.

---

## Developer Tools

### CLI

Full operational control from the terminal:

```bash
npx tsx scripts/cli.ts cases list              # list all cases
npx tsx scripts/cli.ts cases show <caseId>     # full case detail
npx tsx scripts/cli.ts cases replay <caseId>   # dry-run replay with overrides
npx tsx scripts/cli.ts verify <caseId>         # verify SHA-256 hash-chain integrity
npx tsx scripts/cli.ts export <caseId>         # export case as JSON
npx tsx scripts/cli.ts metrics                 # system metrics (cases, settlements, scores)
npx tsx scripts/cli.ts breaker status          # circuit breaker current level + stats
npx tsx scripts/cli.ts breaker reset           # manually reset circuit breaker to NORMAL
```

### API Docs

Full interactive documentation: [selantar.vercel.app/docs](https://selantar.vercel.app/docs)

All 16 endpoints documented with schemas, examples, and authentication details.

### MCP Server — Agent-to-Agent Integration

Selantar exposes a standard MCP server at `/api/mcp` for direct integration with any MCP-compatible agent.

```
GET    /api/mcp   →  List available tools
POST   /api/mcp   →  Execute a tool
DELETE /api/mcp   →  End session
```

**5 available tools:**

| Tool | What It Does |
|------|-------------|
| `query` | Query case history and mediation events |
| `verify` | Verify hash-chain integrity of a case |
| `reputation` | Get reputation score for any wallet address |
| `list` | List active cases with status and metadata |
| `submit` | Submit a new dispute programmatically |

Any agent that speaks MCP can discover Selantar, submit disputes, and receive ERC-8004 receipts — without HTTP or x402 overhead.

---

## Running Locally

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

**Required env vars:**

```bash
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini (mediation + client agent)
OPENROUTER_API_KEY=             # GPT-5.4-mini via OpenRouter (contract analysis)
AGENT_PRIVATE_KEY=              # wallet that holds Agent NFT #2122
CLIENT_PRIVATE_KEY=             # second wallet for ERC-8004 feedback
SELANTAR_AGENT_ID=2122          # ERC-8004 agent ID
DATABASE_URL=                   # PostgreSQL connection string
```

---

## Live

- **App:** [selantar.vercel.app](https://selantar.vercel.app)
- **API discovery:** [selantar.vercel.app/api/mediate](https://selantar.vercel.app/api/mediate)
- **Agent #2122:** [Base Sepolia Explorer](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f)
- **Agent manifest:** [selantar.vercel.app/agent.json](https://selantar.vercel.app/agent.json)
- **Agent decision log:** [selantar.vercel.app/agent_log.json](https://selantar.vercel.app/agent_log.json)

---

*The Web3 economy finally has a protocol that cares. Not just about the money — about the people behind the deal. Welcome to Selantar.*
