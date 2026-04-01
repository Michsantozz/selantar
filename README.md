# Selantar

[![CI](https://github.com/Michsantozz/selantar/actions/workflows/ci.yml/badge.svg)](https://github.com/Michsantozz/selantar/actions/workflows/ci.yml)

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
| **Identity** | The agent exists as a verifiable economic actor | [0xd96cad52...](https://sepolia.basescan.org/tx/0xd96cad52e144d98de68ce97aa8f9f3619302302c95feb8546a28b64e3fc72cf4) |
| **Reputation** | Score 90/100 — the agent earns trust through results | [0x1b16a2e1...](https://sepolia.basescan.org/tx/0x1b16a2e1ca162280eb3440cda9cbcfcc62671a1eea71e39c62f55768543a6a6d) |
| **Validation** | The verdict is cryptographic evidence — permanent, auditable, impossible to erase | [0xacc46a6a...](https://sepolia.basescan.org/tx/0xacc46a6aa3c563af6700e590733cd29e3e6e067dd5ee4403316d4cf4d4fda9ee) |

> The official ERC-8004 Validation Registry was not yet deployed on Base Sepolia. We deployed a spec-compliant implementation — [deploy TX](https://sepolia.basescan.org/tx/0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd).

This isn't decorative blockchain integration. Every mediation writes real transactions. Every verdict is verifiable. The agent's identity, reputation, and evidence trail live on-chain permanently.

Every on-chain receipt includes an **IPFS-pinned + Filecoin-stored evidence report** — the full mediation data (contract, analysis, settlement terms, reasoning) is pinned to IPFS *and* uploaded to Filecoin via Synapse SDK with **Proof of Data Possession (PDP)** verification. The `feedbackURI` and `requestURI` fields on-chain contain dual URIs (`ipfs://` + `filecoin://`). IPFS gives instant availability; Filecoin gives **cryptographic proof that the evidence still exists** — continuously verified on-chain by the PDP protocol. Anyone can download the report, hash it, and verify it matches the on-chain hash. No trust required — just math.

Every contract write is **simulated before execution** — the transaction runs against live chain state as a dry-run before spending gas. If it would revert (insufficient balance, wrong permissions, contract error), the agent catches it before a single wei is spent. All on-chain hashes use **canonical JSON serialization** (recursively sorted keys) so the same data always produces the same hash, regardless of property order.

**Agent manifest:** [`/agent.json`](https://selantar.vercel.app/agent.json)

---

## Filecoin — Provably Alive Evidence

IPFS pins data. Filecoin **proves it's still there.**

Every mediation verdict and reputation feedback is stored on the **Filecoin Calibration network** via the [Synapse SDK](https://github.com/FilOzone/synapse-sdk), with continuous **Proof of Data Possession (PDP)** — a cryptographic challenge-response protocol that forces storage providers to prove they still hold the data, on-chain, on a recurring schedule.

**How it works:**

1. Evidence is pinned to IPFS (instant availability, returns CID)
2. Same bytes uploaded to Filecoin via Synapse SDK (returns PieceCID)
3. Both CIDs written on-chain in ERC-8004 `feedbackURI`/`requestURI` as dual URI: `ipfs://QmX...|filecoin://bafk...`
4. `FILECOIN_STORED` event appended to the SHA-256 hash-chain with PieceCID, provider info, and linked TX
5. PDP proofs run continuously — storage provider must prove possession or face penalties
6. Public verification: `GET /api/verify-evidence?pieceCid=bafk...` returns live PDP status

| IPFS Only | IPFS + Filecoin PDP |
|-----------|-------------------|
| "Data was pinned somewhere" | "Data is provably stored right now" |
| Pin can disappear silently | PDP catches missing data on-chain |
| Trust the pinning service | Trust cryptographic proofs |
| No proof of retention | Continuous verification every proving period |
| Single layer | Dual storage with independent verification |

**Verified Filecoin storage (live on Calibration testnet):**

| What | Value |
|------|-------|
| Deposit TX | [0xc172b70f...](https://calibration.filfox.info/en/tx/0xc172b70f71b4eefb1ce61915747b20123443500a19079495b93b540158e54fd9) |
| Test PieceCID | `bafkzcibd3qaqjzlcknf7am35f6cbioxsspnx7qy2unltvjwlc3cypngepxojqjr6` |
| Provider | #4, dataset 12922 |
| PDP Status | Active — proofs verified on-chain |

The Filecoin integration is protected by a dedicated **circuit breaker** (CLOSED/OPEN/HALF_OPEN) — if the Filecoin network is slow or down, evidence still flows to IPFS and on-chain without interruption. Filecoin catches up asynchronously.

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
4. The **DelegationManager** verifies the signature, checks the scoped caveat, and executes the transfer
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
| No spending limits | Scoped by delegation caveats (amount + recipient) |
| Trust the agent's wallet | Trust the delegation's cryptographic scope |
| Settlement is symbolic | Settlement is real fund movement — balances change |
| No verifiable authority chain | Delegation → Bundler → DelegationManager → TX |

---

## The Care Protocol Pipeline

```
Contract uploaded (PDF/text)
  → 5 AI sub-agents analyze in parallel (parties, risks, milestones, clause scores, deploy plan)
    → Promise.allSettled — partial results survive if any agent fails
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
                → Evidence pinned to IPFS + stored on Filecoin (PDP)
                  → Receipt permanent. Evidence provably alive. Relationship intact.
```

Every step autonomous. Every action verifiable. Every receipt on-chain.

---

## Agent Tools — Seven, All Real, All Autonomous

| Tool | What It Does | Output |
|------|-------------|--------|
| `parseContract` | Orchestrates 5 sub-agents in parallel — extracts parties, risks, milestones, scores clauses, generates deploy plan | Structured contract analysis (typed, nullable for partial results) |
| `classifyCase` | Classifies dispute type across 7 categories + sets strategy | Classification + strategy preset |
| `analyzeEvidence` | Scores credibility, relevance, and probative weight (0–100) | Score + key findings |
| `proposeSettlement` | Calculates fair split with percentages, amounts, and conditions | Dollar amounts + reasoning + conditions |
| `executeSettlement` | Multi-path on-chain execution (Locus → ERC-7715 → Delegation → Direct → Fallback) | TX hash on BaseScan |
| `postFeedback` | Posts reputation score to ERC-8004 Reputation Registry | Feedback TX hash |
| `registerVerdict` | Registers verdict as cryptographic evidence on ERC-8004 Validation Registry | Validation TX hash |

Clara calls these silently during mediation. The parties never see the machinery — they just see a mediator who somehow already knows everything.

### Advisory Chains — Clara Doesn't Think Alone

Before every response, Clara receives invisible counsel from two internal reasoning chains — sequential `generateText` calls (Claude Sonnet 4.6) that run before her `ToolLoopAgent` processes the message. The parties never see this. Clara just gets better.

The chains only activate after the first exchange — the Empath needs at least one prior turn to read dynamics, not fabricate nuance from a single message. On the first message, Clara operates alone.

**The Empath** (Claude Sonnet 4.6) is a clinical psychologist specialized in commercial mediation. She reads the full conversation — including Clara's own moves and how parties reacted to them — and reasons about what's really happening emotionally. Not sentiment scores. Not keyword matching. She tracks power dynamics, projection, trust tests, obsessive repetition, and avoidance patterns:

> *"He's repeating 'investment' for the third time — this isn't about money anymore, it's about feeling deceived. His tone shifted from frustrated to resigned after Clara's last message pushed facts too early. If Clara doubles down on evidence now, he'll interpret it as one more person who doesn't listen. The developer's responses are getting shorter and more technical — classic protection mechanism. He knows he dropped the ball but won't admit it if he feels cornered."*

**The Strategist** (Claude Sonnet 4.6) is a senior negotiation advisor trained in the Harvard PON method. She receives the Empath's reading plus case context, then reasons about approach using BATNA analysis (what happens to each party if mediation fails?), timing, framing, sequencing (validation → facts → proposals → deadlines), and walk-away risk:

> *"The doctor's BATNA is weak — small claims court would take 8 months and cost more than the dispute. He doesn't want to leave, he wants to feel heard. This is the moment to slow down, not propose numbers. A premature proposal gets rejected on principle, not on merit. Clara should name the feeling without judgment — 'R$30 mil não é só dinheiro, é confiança' — then redirect. The developer needs a dignified exit: frame it as 'communication failure', not 'delivery failure'. Settlement proposal should wait one more turn."*

Clara receives both as her own internal thinking — not as external advice, but framed as observations she arrived at herself. She absorbs the emotional intelligence and strategic timing, then responds as herself — human, direct, better calibrated. If either chain fails, Clara proceeds without advisory. She's already good alone. The chains make her exceptional.

**Why this matters:** Most AI mediators treat conflict as a classification problem — sentiment: negative, recommendation: concede 20%. Clara treats it as a reading-the-room problem, the way a real mediator with a therapist and a negotiator whispering in her ear would. The reasoning happens in sequential chains before Clara ever speaks.

`Empath → Strategist → Clara` · Sequential · Graceful degradation · ~900 tokens reasoning overhead · Activates from 2nd message onward

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
| API Routes | 22 endpoints — intake, mediation, contract parsing, settlement, delegation, oracle, MCP, x402, ENS, sentinel, replay, verification |
| Agent Tools | 7 tools across 2 ToolLoopAgents — contract parsing (5 sub-agents) + mediation (6 on-chain tools) |
| Lib Modules | 51 files — state machine, event sourcing, circuit breaker, outbox pattern, scoring, replay, contract parser, IPFS pinning, canonical hashing |
| Frontend Routes | 23 pages — landing, mediation, forge, contract lifecycle, dashboard, pitch, docs |
| Components | 168 — mediation chat, settlement modal, ReactFlow, shadcn/ui, Web3, ai-elements |
| Database | PostgreSQL + Drizzle ORM — 6 tables with event sourcing + hash-chain integrity |
| Scripts | 21 — CLI, ERC-8004 registration, QA, screenshots, integration tests, Filecoin, validation |

**Infrastructure highlights:**

- **State machine** — 11 states (INTAKE → CLOSED/ABANDONED) with guards and transitions
- **Event sourcing** — SHA-256 hash-chain for every mediation event + dual-write to PostgreSQL
- **Circuit breaker** — dual-layer: settlement guard (4 levels) + per-service ServiceBreaker (CLOSED/OPEN/HALF_OPEN) with error discrimination
- **Outbox pattern** — guaranteed settlement delivery with retry logic
- **Idempotency** — SHA-256 deduplication keys with 24h TTL, safe retries
- **Replay engine** — dry-run any mediation with overrides, compare results
- **Reputation oracle** — `/api/oracle/[address]/reputation` with HMAC signature, anti-Goodhart header
- **Scoring system** — `ReputationScorer` with 5 weighted factors + AI-driven `adjustWeights` (Claude Sonnet 4.6 analyzes outcomes, proposes weights with reasoning, fallback to math)
- **MCP server** — 5 tools for agent-to-agent integration (query, verify, reputation, list, submit)
- **Dual evidence storage (IPFS + Filecoin)** — every verdict and feedback report pinned to IPFS *and* uploaded to Filecoin (Synapse SDK) with PDP verification; dual CID stored in `feedbackURI`/`requestURI` on-chain; `FILECOIN_STORED` event emitted in hash-chain when upload completes; public verification endpoint at `/api/verify-evidence?pieceCid=...`; circuit breaker protects against Filecoin downtime; fallback computes CID locally if all providers are down
- **Simulate-before-write** — every contract call dry-runs against live chain state before sending; zero gas wasted on reverts
- **Canonical JSON hashing** — recursively sorted keys ensure deterministic hashes across hash-chain, keccak256 on-chain, and IPFS CIDs
- **Deterministic smart accounts** — agent and party smart accounts use named salts (`keccak256("selentar-agent-v1")`) so addresses are predictable, reproducible, and verifiable by anyone
- **Test suite** — 40 tests across 7 modules (vitest): hash-chain integrity, circuit breaker state transitions, service breaker CLOSED/OPEN/HALF_OPEN, scoring normalization, idempotency TTL, canonical JSON determinism, case lifecycle guards. `npm test` — all green.

---

## Self-Improving Reputation Engine

Selantar doesn't just score — it **learns from every mediation it runs.**

After each case closes, an AI agent (Claude Sonnet 4.6) analyzes all resolved outcomes, reasons about **why** certain factors mattered, and proposes weight adjustments with per-factor justification. This isn't mechanical ±3% — it's an LLM that reads patterns, explains its reasoning, and assigns a confidence score to every adjustment.

**5 reputation factors, dynamically weighted:**

| Factor | What It Measures | Default Weight |
|--------|-----------------|----------------|
| Compliance rate | Did parties follow through on agreements? | 30% |
| Resolution rate | Did the case reach settlement? | 25% |
| Response speed | How fast did parties engage? | 20% |
| Evidence quality | Was submitted evidence strong and verifiable? | 15% |
| Cooperation score | Did parties negotiate in good faith? | 10% |

**How the learning loop works:**

```
Case closes (success or failure)
  → AI agent receives all resolved outcomes + current weights
    → Analyzes patterns: which factors predicted success vs failure, and why
      → Proposes new weights with reasoning per factor + confidence (0-100)
        → System validates constraints (min 5%, max 45%, ±5% max delta, sum=1.0)
          → Full analysis + adjustments persisted as WEIGHT_ADJUSTMENT event in hash-chain
            → Next case scored with updated weights
              → If LLM fails → silent fallback to math-based adjustment (loop never breaks)
```

**Constraints that prevent overfitting:**
- Maximum weight per factor: 45% (no single factor dominates)
- Minimum weight per factor: 5% (no factor is ever ignored)
- Maximum change per cycle: ±5% per factor (gradual learning, no sudden shifts)
- Weights normalized to sum = 1.0 after every adjustment (guaranteed, no drift)
- Every weight change is an immutable event in the hash-chain — includes analysis, reasoning per factor, and confidence score
- Mandatory fallback: if the LLM call fails for any reason, the system falls back to correlation-based math adjustment. The learning loop never breaks.

The system compounds intelligence over time. A Selantar instance with 100 mediations scores reputation more accurately than one with 10 — because an AI analyst reviews real outcomes, explains what worked, and the weights reflect reasoned judgment, not blind math.

---

## Replay Engine — Audit Any Decision

Dr. Suasuna got an 80/20 split. The developer thinks it should have been 70/30. In the old world, he'd hire a lawyer, spend $5,000, and wait 6 months to challenge a verdict no one can reconstruct.

**In Selantar, he runs one command:**

```bash
npx tsx scripts/cli.ts cases replay CSX-2026-A7F3B2C1
```

The replay engine re-runs the entire mediation through the AI — same evidence, same contract, same conversation history — and automatically detects every point where the outcome diverges from the original. No transactions execute. No state changes. The hash-chain stays untouched. It's a pure thought experiment with receipts.

**What it produces:**

| Field | Description |
|-------|-------------|
| `original_outcome` | What Clara decided in the live mediation |
| `replay_outcome` | What the AI decides on re-analysis |
| `confidence_delta` | Difference in confidence scores |
| `terms_changed` | Did the proposed terms change? |
| `amount_changed` | Did the settlement amount change? |
| `reasoning_divergences` | List of specific differences detected |

The developer replays with `temperature=0`. Same verdict. He replays with a different model. Same split. He changes the system prompt to remove the Empath's emotional reading. Now the split shifts to 75/25 — the AI without empathy gave the developer less, not more, because it couldn't read that the clinic's own staff caused the delay.

**The replay didn't just prove the verdict was fair — it proved that emotional intelligence made it *more* fair.**

- **Accountability** — Any party can challenge a verdict by replaying it
- **Consistency audit** — Run the same case 10 times with temperature=0 to verify determinism
- **Model comparison** — Replay with a different model to see if the verdict holds
- **Bias detection** — Change the system prompt and see if the outcome shifts

Every human judge can be questioned. Every AI verdict can be replayed. The difference is that replaying Clara takes 30 seconds, costs nothing, and produces a cryptographic diff — not a 40-page appeal.

---

## Architecture

```
Contract Creation:
  Upload contract → POST /api/parse-contract (ToolLoopAgent + 5 sub-agents in parallel)
    → extractParties + analyzeRisks + extractMilestones (Phase 1, parallel)
    → scoreClauses + generateDeployPlan (Phase 2, parallel, depends on Phase 1)
    → UI populates progressively — shimmer → real data → chain-of-thought summary
    → POST /api/create-escrow → keccak256(contract) registered on ERC-8004
    → ContractID (CSX-YYYY-XXXXXXXX) + TX hash → contract goes live

Interactive Mediation (UI):
  Pick a case → Clara mediates live via ToolLoopAgent (GPT-5.4)
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
- **Settlement TX** (Clínica Suasuna case — ERC-7710 delegation, real ETH transferred): [0xd6ad6b07...](https://sepolia.basescan.org/tx/0xd6ad6b07722b4df8e5b44b3c3b2f7a190a6c15ddcea5440623f10a367e32ba6f)
- **Reputation feedback** (score: 90/100): [0x1b16a2e1...](https://sepolia.basescan.org/tx/0x1b16a2e1ca162280eb3440cda9cbcfcc62671a1eea71e39c62f55768543a6a6d)
- **Verdict validation**: [0xacc46a6a...](https://sepolia.basescan.org/tx/0xacc46a6aa3c563af6700e590733cd29e3e6e067dd5ee4403316d4cf4d4fda9ee)

**Infrastructure:**
- **Validation Registry deployed**: [0xd770f4ab...](https://sepolia.basescan.org/tx/0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd)

Full agent decision log: [`/api/agent-log`](https://selantar.vercel.app/api/agent-log)

---

## Autonomy Metrics

```json
{
  "humanInterventionRequired": false,
  "careLoopActive": true,
  "proactiveOutreachEnabled": true,
  "decisionSteps": 7,
  "contractParsingAgents": 5,
  "parallelSubAgentExecution": true,
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
  "statesMachineStates": 11,
  "ipfsPinnedEvidence": true,
  "filecoinPDPStorage": true,
  "filecoinDualURI": true,
  "filecoinCircuitBreaker": true,
  "filecoinVerificationEndpoint": true,
  "simulateBeforeWrite": true,
  "canonicalJsonHashing": true,
  "deterministicSmartAccounts": true,
  "testSuite": "40 tests, 7 modules, vitest"
}
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| AI | Vercel AI SDK v6 — `ToolLoopAgent`, `generateText`, `useChat`, `DefaultChatTransport` |
| Models | GPT-5.4 (mediation, parser orchestrator, client agent) · Claude Sonnet 4.6 (advisory chains, scoring) · GPT-5.4-mini (contract audit, x402 mediation) |
| Payments | x402 protocol — `x402-next`, `@coinbase/x402` (USDC on Base Sepolia) |
| On-chain | viem + Base Sepolia (chainId: 84532) |
| Smart Accounts | MetaMask Smart Accounts Kit v0.3.0 — ERC-7710 + ERC-7715 scoped delegations |
| Bundler | Pimlico (ERC-4337) — sponsors gas via paymaster |
| ERC-8004 | Identity + Reputation + Validation registries (all 3, deployed) |
| Filecoin | Synapse SDK — PDP-verified evidence storage on Calibration testnet |
| Auth | Privy (email + wallet + Google) |
| Database | PostgreSQL + Drizzle ORM — event sourcing + hash-chain integrity |
| ENS | Mainnet reverse lookup with PostgreSQL cache (6h TTL), retry with backoff |
| Integration | MCP server (5 tools, A2A) · GitHub API |
| UI | Tailwind CSS v4 · shadcn/ui (New York) · Framer Motion · ReactFlow · ai-elements |
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
| Agent identity | [BaseScan](https://sepolia.basescan.org/tx/0xd96cad52e144d98de68ce97aa8f9f3619302302c95feb8546a28b64e3fc72cf4) |
| Reputation score (90/100) | [BaseScan](https://sepolia.basescan.org/tx/0x1b16a2e1ca162280eb3440cda9cbcfcc62671a1eea71e39c62f55768543a6a6d) |
| Verdict registered | [BaseScan](https://sepolia.basescan.org/tx/0xacc46a6aa3c563af6700e590733cd29e3e6e067dd5ee4403316d4cf4d4fda9ee) |
| Settlement executed (ERC-7710 delegation) | [BaseScan](https://sepolia.basescan.org/tx/0xd6ad6b07722b4df8e5b44b3c3b2f7a190a6c15ddcea5440623f10a367e32ba6f) |

Every TX is real. Every receipt is permanent. Click any link and verify.

**5. Verify evidence is still stored on Filecoin**
```bash
curl https://selantar.vercel.app/api/verify-evidence?pieceCid=bafkzcibd3qaqjzlcknf7am35f6cbioxsspnx7qy2unltvjwlc3cypngepxojqjr6
```
Returns PDP verification status, provider info, and liveness proof.

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

All 22 endpoints documented with schemas, examples, and authentication details.

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
ANTHROPIC_API_KEY=              # Claude Sonnet 4.6 (advisory chains, scoring)
OPENAI_API_KEY=                 # GPT-5.4 (mediation, parser, client agent) + GPT-5.4-mini (contract audit, x402)
AGENT_PRIVATE_KEY=              # wallet that holds Agent NFT #2122
CLIENT_PRIVATE_KEY=             # second wallet for ERC-8004 feedback
SELANTAR_AGENT_ID=2122          # ERC-8004 agent ID
DATABASE_URL=                   # PostgreSQL connection string
```

---

## Live

- **App:** [selantar.vercel.app](https://selantar.vercel.app)
- **API discovery:** [selantar.vercel.app/api/mediate](https://selantar.vercel.app/api/mediate)
- **Agent #2122:** [Base Sepolia Explorer](https://sepolia.basescan.org/tx/0xd96cad52e144d98de68ce97aa8f9f3619302302c95feb8546a28b64e3fc72cf4)
- **Agent manifest:** [selantar.vercel.app/agent.json](https://selantar.vercel.app/agent.json)
- **Agent decision log:** [selantar.vercel.app/api/agent-log](https://selantar.vercel.app/api/agent-log)

---

**Care Protocol** — the standard Selantar implements — is formally defined in [`CARE-PROTOCOL.md`](CARE-PROTOCOL.md), cryptographically anchored on Bitcoin mainnet via [OpenTimestamps](https://opentimestamps.org) · SHA-256: `c4d196853d4c35d0a3cba56d76fb890acbb3c4f7c59a7eeb82a74d8aee549553`

---

*The Web3 economy finally has a protocol that cares. Not just about the money — about the people behind the deal. Welcome to Selantar.*
