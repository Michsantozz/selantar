# Selantar

### Contracts break. We fix the people.

Businesses lose **11% of revenue** to contract friction. Billions evaporating because a piece of paper can't adapt to reality. Web3 was supposed to fix this — instead, smart contracts gave us rigid, cold numbers for emotional creatures.

You can't solve a human problem with a binary calculator. You need a system that gives **real attention**. Something that listens, understands your *why* before it judges. Sometimes you don't need a judge — you need someone who cares.

**Selantar is the world's first autonomous dispute mediator.** It reads sealed contracts, analyzes verifiable evidence, conducts live mediation with both parties, proposes a fair settlement, and registers the verdict on-chain via ERC-8004 — without human intervention. Every resolved case leaves an immutable receipt. The agent's reputation rises or falls with every case.

We believe attention is the new gold for the next decade.

Built for [The Synthesis](https://synthesis.md) · Tracks: **Agents With Receipts — ERC-8004** · **Best Use of Delegations** · **Agent Services on Base** · **Let the Agent Cook**

---

## See It In Action

Dr. Suasuna is furious. He paid R$30,000 for a clinic system that still can't book patients. He wants a full refund. The developer is blocked — the clinic's own secretary ignored 5 access requests over 3 weeks.

An old-world mediator would take weeks and charge thousands. A smart contract would just freeze the funds forever. Neither cares about context.

**Clara** — Selantar's AI mediator — does something different:

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
| Weeks of emails, lawyers, threats | 24-hour autonomous resolution |
| $5,000+ in legal fees | $0.10 per mediation via x402 |
| No proof of what was decided | Immutable on-chain verdict via ERC-8004 |
| Mediator has no skin in the game | Agent's reputation score rises or falls with every case |
| One-size-fits-all judgment | Context-aware — reads CRM logs, messages, delivery history |
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

Selantar is the first **discoverable, pay-per-use dispute resolution service** for the agent economy.

Any agent on the internet can discover, pay, and use Selantar's mediation — no API key, no account, no subscription. Just USDC in the HTTP header.

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

Settlements don't come from the mediator's wallet anymore. With MetaMask Delegations (ERC-7710), the **dispute parties themselves** grant scoped permission to the agent. Clara can only move funds that the parties explicitly authorized, up to a ceiling they set.

This is intent-based delegation: the parties delegate the *intent* "resolve my dispute and distribute the funds according to the agreement" — and the agent executes with verifiable, limited authority.

**How it works:**

1. Both parties have **deployed MetaMask Smart Accounts** on Base Sepolia (Hybrid implementation)
2. When Clara calls `executeSettlement`, the client's smart account signs a **scoped delegation** — limited to native ETH transfers up to a fixed amount
3. The agent sends a **UserOperation via Pimlico bundler** (ERC-4337) — the smart account is `msg.sender`, not the EOA
4. The **DelegationManager** verifies the signature, checks the `NativeTokenTransferAmountEnforcer` caveat, and executes the transfer
5. ETH moves from the client's smart account to the agent's smart account — verified on-chain
6. If delegation fails for any reason, the existing direct settlement path executes as fallback

**Verified delegation redemption (live on-chain):**

| What | TX | Explorer |
|------|-----|---------|
| Client Smart Account deployed | `0x7dd69f87...` | [BaseScan](https://sepolia.basescan.org/tx/0x7dd69f8782f3de15d216c7aef2f38fe5681f78028f13dc0b17e370b01dbb79ca) |
| Agent Smart Account deployed | `0xcf763778...` | [BaseScan](https://sepolia.basescan.org/tx/0xcf763778accec52ace1377e83813274fc97a14a785388b1cc6d8b82a99b1beab) |
| Client funded (0.001 ETH) | `0xec2996f9...` | [BaseScan](https://sepolia.basescan.org/tx/0xec2996f9a2d824af7e978c89cb850dc6b79cbeb69349ecd7e070a6962a8cbf1f) |
| Delegation redeemed (settlement) | `0xd6ad6b07...` | [BaseScan](https://sepolia.basescan.org/tx/0xd6ad6b07722b4df8e5b44b3c3b2f7a190a6c15ddcea5440623f10a367e32ba6f) |

Every TX is real. Click any link and verify.

**Smart Account addresses:**

| Account | Address |
|---------|---------|
| Agent Smart Account (delegate) | `0xe765f43E8B7065729E54E563D4215727154decC9` |
| Client Smart Account (delegator) | `0x4ae5e741931D4E882B9c695ae4522a522390eD3B` |

**Why this is dream-tier for the bounty:**

| Without Delegations | With Delegations |
|---------------------|-----------------|
| Agent moves its own funds as "proof" | Agent moves the party's funds with permission |
| No spending limits | Scoped by NativeTokenTransferAmountEnforcer |
| Trust the agent's wallet | Trust the delegation's cryptographic scope |
| Settlement is symbolic | Settlement is real fund movement — balances change |
| No verifiable authority chain | Delegation → Bundler → DelegationManager → TX |

**Technical stack:**

| Component | Tech |
|-----------|------|
| Smart Accounts | `@metamask/smart-accounts-kit` v0.3.0 — Hybrid implementation |
| Bundler | Pimlico (ERC-4337) — sponsors gas via paymaster |
| Delegation scope | `nativeTokenTransferAmount` — enforced on-chain |
| Signing | EIP-712 typed data via smart account |
| Network | Base Sepolia (chainId: 84532) |
| Standard | ERC-7710 (MetaMask Delegation Framework) |

**Implementation files:**

| File | Purpose |
|------|---------|
| `lib/delegation/smart-accounts.ts` | MetaMask Hybrid smart account factory |
| `lib/delegation/create-delegation.ts` | Scoped delegation creation + EIP-712 signing (unique salt per call) |
| `lib/delegation/redeem.ts` | ABI encoding + Pimlico bundler UserOperation submission |
| `app/api/delegation/grant/route.ts` | API endpoint — both parties grant delegation |
| `lib/tools/execute-settlement.ts` | Delegation path (bundler) + direct fallback |

Full implementation report with all 8 problems encountered and solutions: [`DELEGATION-IMPLEMENTATION.md`](DELEGATION-IMPLEMENTATION.md)

---

## The Pipeline

```
PDF contract drops
  → AI audits it — hunts loopholes, flags vague terms, eliminates ambiguity
    → Transforms into a living contract with milestones, rules, and on-chain escrow
      → As milestones are approved, cash releases instantly
        → If a dispute hits, Sentinel already has the proof
          → Clara mediates live — protects egos, proposes concrete numbers
            → Both sides sign → Settlement executes on-chain
              → ERC-8004 receipt registered forever
```

Every step autonomous. Every action verifiable. Every receipt on-chain.

---

## Architecture

```
Interactive (UI):
  Pick a case → Clara mediates live via ToolLoopAgent
    → analyzeEvidence → proposeSettlement → executeSettlement
    → postFeedback (ERC-8004 Reputation) → registerVerdict (ERC-8004 Validation)

API (x402):
  Any agent → POST /api/mediate + X-PAYMENT header ($0.10 USDC)
    → x402 payment validation → same 5-tool pipeline → JSON response with receipts
```

**Dual-agent mediation (UI):** Clara responds to the client automatically — the developer (you) can intervene at any point. Two independent AI agents conversing in the same chat, with a human able to jump in anytime.

**Single-shot mediation (API):** External agents send contract + dispute + evidence via x402 and receive a complete verdict with on-chain receipts in one call.

---

## Five Tools — All Real, All On-Chain

| Tool | What It Does | Output |
|------|-------------|--------|
| `analyzeEvidence` | Scores evidence credibility (0-100) based on specificity, completeness, and type | Credibility score + key findings |
| `proposeSettlement` | Calculates fair distribution based on evidence analysis | Dollar amounts + reasoning + conditions |
| `executeSettlement` | Redeems MetaMask Delegation to move USDC on behalf of parties (falls back to direct ETH transfer) | TX hash on BaseScan |
| `postFeedback` | Posts reputation score to ERC-8004 Reputation Registry | Feedback TX hash |
| `registerVerdict` | Registers verdict as cryptographic evidence on ERC-8004 Validation Registry | Validation TX hash |

Clara calls these silently during mediation. The parties never see the machinery — they just see a mediator who somehow already knows everything.

---

## Autonomy Metrics

```json
{
  "humanInterventionRequired": false,
  "decisionSteps": 5,
  "settlementProposedByAgent": true,
  "settlementExecutedOnChain": true,
  "reputationPostedOnChain": true,
  "verdictRegisteredOnChain": true,
  "x402PaymentEnabled": true,
  "delegatedSettlement": true,
  "delegationFramework": "MetaMask ERC-7710",
  "discoverableViaGET": true,
  "payPerUse": "$0.10 USDC",
  "erc8004RegistriesUsed": 3
}
```

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, App Router |
| AI | AI SDK v6 — `ToolLoopAgent`, `generateText`, `useChat`, `DefaultChatTransport` |
| Model | `openai/gpt-5.4-mini` via OpenRouter |
| Payments | x402 protocol — `x402-next`, `@coinbase/x402` (USDC on Base Sepolia) |
| On-chain | viem, Base Sepolia (chainId: 84532) |
| Delegations | MetaMask Smart Accounts Kit — ERC-7710 scoped delegations |
| ERC-8004 | Identity + Reputation + Validation registries (all 3) |
| UI | Tailwind CSS v4, shadcn/ui (New York), Framer Motion |
| Harness | Claude Code |

---

## On-Chain Receipts

All ERC-8004 transactions are live on Base Sepolia:

- **Settlement TX** (Clínica Suasuna case): [0xb5d338a5...](https://sepolia.basescan.org/tx/0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86)
- **Reputation feedback** (score: 90/100): [0x91efdaca...](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044)
- **Verdict validation**: [0xabff70e4...](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3)
- **Validation Registry deployed**: [0xd770f4ab...](https://sepolia.basescan.org/tx/0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd)

Full agent decision log: [`/agent_log.json`](https://selantar.vercel.app/agent_log.json)

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

Open [selantar.vercel.app/mediation](https://selantar.vercel.app/mediation), pick any case, and watch. Clara analyzes evidence, takes sides, proposes numbers, and executes settlement on-chain — all without human intervention.

**4. Verify every on-chain receipt**

| What | Link |
|------|------|
| Agent identity | [BaseScan](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f) |
| Reputation score (90/100) | [BaseScan](https://sepolia.basescan.org/tx/0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044) |
| Verdict registered | [BaseScan](https://sepolia.basescan.org/tx/0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3) |
| Settlement executed | [BaseScan](https://sepolia.basescan.org/tx/0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86) |

Every TX is real. Every receipt is permanent. Click any link and verify.

---

## The Vision — Where Trust Becomes Capital

**Phase 1 (NOW — Live):** Autonomous mediation protocol. AI that listens to both sides, protects egos, and settles disputes on-chain. The first protocol where machines care about context, not just code.

**Phase 2 (NEXT):** Omnichannel Sentinel. Evidence collected from every channel where business actually happens — WhatsApp, GitHub, CRM, email. Mediation meets you where the context lives.

**Phase 3 (HORIZON):** Trust Economy. On-chain reputation unlocks liquidity, insurance, and credit lines. Your professional truth — not just your payment history — becomes capital. Honesty becomes the most valuable asset in the agent economy.

> Credit is never a cold number. We look past statistics to see the human behind the deal.

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

## Live

- **App:** [selantar.vercel.app](https://selantar.vercel.app)
- **API discovery:** [selantar.vercel.app/api/mediate](https://selantar.vercel.app/api/mediate)
- **Agent #2122:** [Base Sepolia Explorer](https://sepolia.basescan.org/tx/0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f)
- **Agent manifest:** [selantar.vercel.app/agent.json](https://selantar.vercel.app/agent.json)

---

*The Web3 economy finally has a brain, it has hands, and it actually cares. Welcome to Selantar.*