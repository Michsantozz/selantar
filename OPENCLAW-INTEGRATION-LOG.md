# OpenClaw Integration Log — Selantar × Hedera Apex Hackathon

> Implementation log for the OpenClaw bounty ($8K) integration.
> Branch: `hedera-apex` | Date: 2026-03-23 | Author: Claude Opus 4.6 + Michsantoz

---

## 1. Objective

Integrate OpenClaw (personal AI assistant framework) with Selantar (autonomous B2B dispute mediator) to demonstrate **agent-to-agent communication** — where an AI SDK agent (Clara) communicates with an OpenClaw agent via WhatsApp, creating a real-time notification pipeline for dispute mediation events on Hedera Testnet.

### Bounty Requirements Addressed

| Requirement | Implementation |
|---|---|
| Agent-first | Clara (AI SDK ToolLoopAgent) operates autonomously; human observes |
| Autonomous behavior | Clara analyzes, proposes, executes settlement without intervention |
| Multi-agent value | Clara (mediator) + Sentinel (monitor) + OpenClaw agent (notification) |
| Hedera EVM | viem + ERC-8004 Identity/Reputation on Hedera Testnet |
| UI shows agent flow | React Flow (@xyflow/react) with 40+ animated steps |
| ERC-8004 trust | Identity Registry (Agent #36) + Reputation feedback on-chain |

---

## 2. Architecture Created

```
┌─────────────────────────────────────────────────────┐
│                    SELANTAR (Next.js 16)             │
│                                                     │
│  /forge                                             │
│  ├── 2 demo contract cards (clinica + ecommerce)    │
│  └── Click → /forge/analyze?scenario=<id>           │
│                                                     │
│  /forge/analyze                                     │
│  ├── Pre-fill textarea with contractDocument        │
│  ├── Auto-trigger streamText (OpenRouter/GPT-5.4)   │
│  └── CTA → /contract/sentinel-plan                  │
│                                                     │
│  /contract/sentinel-plan                            │
│  ├── React Flow: contract→analysis→milestones→actions│
│  ├── 40 simulation steps with status transitions    │
│  ├── WhatsApp notifications via Evolution API       │
│  └── Deploy Cinematic → /api/create-escrow (ERC-8004)│
│                                                     │
│  /mediation                                         │
│  ├── Clara (ToolLoopAgent) with 6 tools             │
│  ├── notifyAgent tool → Evolution API → WhatsApp    │
│  └── Settlement execution → Hedera Testnet          │
│                                                     │
│  AI SDK v6 (Vercel)          Evolution API           │
│  ├── streamText()            ├── sendPresence()     │
│  ├── useChat()               ├── sendText()         │
│  ├── ToolLoopAgent           └── whats.vensa.pro    │
│  ├── DefaultChatTransport                           │
│  └── toUIMessageStreamResponse()                    │
│                                                     │
│  OpenClaw Gateway (localhost:18789)                  │
│  ├── hooks.enabled + token                          │
│  ├── WhatsApp via Baileys                           │
│  └── Gemini 3.1 Pro (agent brain)                   │
│                                                     │
│  Hedera Testnet (Chain ID 296)                      │
│  ├── ERC-8004 Identity Registry                     │
│  ├── ERC-8004 Reputation Registry                   │
│  ├── ERC-8004 Validation Registry                   │
│  └── HBAR settlement transfers                      │
└─────────────────────────────────────────────────────┘
```

### Agent-to-Agent Communication Flow

```
Clara (AI SDK ToolLoopAgent)
    │
    ├── analyzeEvidence → scores credibility
    ├── proposeSettlement → calculates split
    ├── executeSettlement → on-chain HBAR transfer
    ├── postFeedback → ERC-8004 reputation
    ├── registerVerdict → ERC-8004 validation
    │
    └── notifyAgent ─────► Evolution API ─────► WhatsApp
                           (whats.vensa.pro)    (+5562994161690)
                                │
                    OpenClaw Gateway (backup path)
                    (localhost:18789/hooks/agent)
                                │
                         Gemini 3.1 Pro
                                │
                         WhatsApp (Baileys)
```

---

## 3. Files Created

### `lib/tools/notify-agent.ts` (NEW — 95 lines)

**Purpose:** Formal AI SDK tool enabling agent-to-agent communication.

**Technical details:**
- Defined with `tool()` from `ai` package using `inputSchema: z.object()`
- Accepts: `event` (enum of 7 mediation events), `summary` (string), `txHash` (optional)
- Sends WhatsApp typing indicator (`sendPresence`) before message for realistic UX
- Uses Evolution API (`whats.vensa.pro`) as primary delivery channel
- Fire-and-forget: returns success/failure but never throws — mediation continues regardless
- Environment variables: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`, `OPENCLAW_NOTIFY_TO`

**Why Evolution API instead of OpenClaw directly:**
During implementation, the OpenClaw gateway's Gemini 3.1 Pro model hit rate limits (HTTP 429) which blocked message delivery. The Evolution API provides direct WhatsApp access without requiring an LLM turn, making it more reliable for time-sensitive notifications. OpenClaw remains configured as a backup path via `lib/notify-openclaw.ts`.

### `lib/notify-openclaw.ts` (NEW — 63 lines)

**Purpose:** Webhook bridge to OpenClaw Gateway for WhatsApp delivery via `/hooks/agent`.

**Technical details:**
- POST to `http://127.0.0.1:18789/hooks/agent` with Bearer token auth
- Formats mediation events with Portuguese labels
- Instructs OpenClaw agent to reformat as WhatsApp notification
- Fire-and-forget via `void fetch(...).catch(() => {})`
- Environment variables: `OPENCLAW_HOOKS_URL`, `OPENCLAW_HOOKS_TOKEN`, `OPENCLAW_NOTIFY_TO`

### `lib/hedera/chains.ts` (NEW)

**Purpose:** Hedera Testnet chain definition for viem using `defineChain()`.

---

## 4. Files Modified

### `app/api/analyze-contract/route.ts`

**Problem:** The route expected `body.contractText` (direct string) but `useChat` with `DefaultChatTransport` sends `body.messages` (array of message objects with parts). This incompatibility meant the `/forge/analyze` page could never work with streaming.

**Solution:** Added dual-format body parsing:
```typescript
// 1. Direct format (backward-compatible)
if (typeof body?.contractText === "string") { ... }
// 2. useChat/DefaultChatTransport format
else if (Array.isArray(body?.messages)) {
  const lastUserMsg = [...body.messages].reverse().find(m => m.role === "user");
  const textPart = lastUserMsg.parts?.find(p => p.type === "text");
  contractText = textPart?.text || lastUserMsg.content || "";
}
```

**Verification:** Tested both formats with `curl` — streaming confirmed working for both.

### `lib/scenarios.ts`

**Problem:** The 3 scenarios had `contextMessage` (agent instructions) but no actual contract document text. The `/forge/analyze` page needed realistic contract text for the AI to analyze.

**Solution:** Added `contractDocument?: string` to the `Scenario` interface and populated it for 2 scenarios:

1. **clinica-suasuna** — ~400 word formal contract in Portuguese (BRL, CRM development, 3 phases, R$45,000, 90 days) with 8 clauses including escrow, obligations, dispute resolution via Selantar
2. **ecommerce-quebrado** — ~350 word service agreement in English (USD, Stripe integration, $12,000, 30 days) with 8 clauses including limitation of liability (force majeure) and Selantar mediation clause

**Design decision:** Contract text is derived from existing `contextMessage` data but formatted as a real legal document with clause numbers, party identification, signatures, and dates. This gives the AI something substantive to analyze while maintaining narrative consistency.

### `app/forge/page.tsx`

**Problem:** ParseCard showed "Coming Soon" badge with disabled upload zone. No way to actually analyze a contract.

**Changes:**
- Removed "Coming Soon" badge and disabled upload zone
- Added 2 clickable demo contract cards (clinica-suasuna + ecommerce-quebrado) with emoji, title, tagline, escrow value
- Each card links to `/forge/analyze?scenario=<id>`
- Bottom CTA changed from disabled "Analyze a Contract" to active link
- Removed unused imports: `useState`, `useRouter`, `AnimatePresence`, `LoaderIcon`
- Removed unused state/router logic from ParseCard

### `app/forge/analyze/page.tsx`

**Problem:** Page worked with manual paste + analyze, but had no way to pre-load a demo contract or auto-trigger analysis.

**Changes:**
- Added `useSearchParams` to read `?scenario=` from URL
- Lookup scenario from `scenarios` array by ID
- Pass `initialText={scenario?.contractDocument}` to ContractUpload (pre-fills textarea)
- Auto-trigger analysis after 800ms delay via `useEffect` with `useRef` guard (prevents double-fire)
- Changed post-analysis CTA from "Start Mediation" → "Generate Sentinel Plan" linking to `/contract/sentinel-plan`
- Wrapped export in `<Suspense>` boundary (required for `useSearchParams` in Next.js 16)
- Renamed component to `AnalyzeContent` (inner) + `AnalyzePage` (export with Suspense)

### `app/forge/_components/contract-upload.tsx`

**Change:** Added `initialText?: string` prop to `ContractUploadProps`. The textarea initializes with `useState(initialText ?? "")` so demo contracts appear pre-filled.

### `lib/agents/mediator-agent.ts`

**Changes:**
- Imported `notifyAgent` from `../tools/notify-agent`
- Added `notifyAgent` to the tools object in the ToolLoopAgent constructor
- Added instruction in Clara's system prompt: "notifyAgent: send WhatsApp notification after important actions"

This means Clara now **consciously decides** when to notify stakeholders via WhatsApp as part of her mediation workflow — it's not a side-effect, it's a deliberate agent action.

### Other Modified Files (pre-existing Hedera migration)

| File | Change |
|---|---|
| `lib/wallet.ts` | Hedera Testnet RPC + chain config |
| `lib/erc8004/addresses.ts` | Hedera Testnet contract addresses |
| `lib/erc8004/identity.ts` | Updated for Hedera chain |
| `lib/erc8004/reputation.ts` | Updated for Hedera chain |
| `lib/erc8004/validation.ts` | Updated for Hedera chain |
| `lib/tools/analyze-evidence.ts` | Added notifyOpenClaw call |
| `lib/tools/execute-settlement.ts` | Hedera settlement + notifyOpenClaw |
| `lib/tools/post-feedback.ts` | Added notifyOpenClaw call |
| `lib/tools/propose-settlement.ts` | Added notifyOpenClaw call |
| `lib/tools/register-verdict.ts` | Added notifyOpenClaw call |
| `app/contract/sentinel-plan/*` | Evolution API WhatsApp integration |
| `app/contract/setup/*` | Hedera deploy review |
| `scripts/register-agent.ts` | Hedera Testnet registration |

---

## 5. Difficulties Encountered & Resolutions

### 5.1 OpenClaw Gemini Rate Limit (429)

**Problem:** After configuring OpenClaw hooks (`hooks.enabled: true`, `hooks.token`) and sending test webhooks, the gateway accepted requests (`ok: true, runId: ...`) but the Gemini 3.1 Pro model consistently returned HTTP 429 ("You exceeded your current quota"). This prevented message delivery to WhatsApp via the OpenClaw path.

**Investigation:** Checked logs via `openclaw logs` — confirmed the webhook was accepted, agent run started, but Gemini API rejected every call. The auth profile entered cooldown (exponential backoff: 1min → 5min → 25min → 1h).

**Resolution:** Created `lib/tools/notify-agent.ts` using Evolution API as primary delivery channel. Evolution API sends WhatsApp messages directly without requiring an LLM turn, bypassing the rate limit entirely. OpenClaw remains as backup path via `lib/notify-openclaw.ts` for when Gemini quota resets.

**Lesson:** For time-sensitive notifications, direct API integration (Evolution) is more reliable than routing through an LLM agent (OpenClaw). The LLM adds latency and failure modes (rate limits, timeouts, context issues).

### 5.2 useChat / API Route Incompatibility

**Problem:** The `/forge/analyze` page used `useChat` with `DefaultChatTransport` which sends `{ messages: [...] }`, but the API route read `body.contractText`. The streaming never started — the route returned 400 "contractText is required".

**Investigation:** Read the AI SDK skill's `common-errors.md` reference which documents the message format: `messages[].parts[].text`. Inspected what `DefaultChatTransport` actually sends.

**Resolution:** Modified the API route to accept both formats with a fallback chain: `body.contractText` → `body.messages[last user].parts[text].text` → `body.messages[last user].content`. Verified both formats work via `curl`.

### 5.3 WhatsApp Listener Disconnection

**Problem:** OpenClaw logs showed `"No active WhatsApp Web listener (account: default)"` intermittently. The health monitor detected a stale socket and restarted the provider, but reconnection sometimes failed during our test window.

**Investigation:** Baileys (WhatsApp Web library) uses WebSocket connections that timeout after inactivity. The OpenClaw health monitor (`gateway/health-monitor`) detects stale sockets and restarts, but during restart there's a brief window where messages fail.

**Resolution:** This is transient — the gateway auto-recovers. For demo reliability, the Evolution API path (`notify-agent.ts`) avoids this entirely since it uses the Evolution API server which manages its own Baileys connection independently.

### 5.4 Node.js Version Mismatch

**Problem:** System Node was 12.22.9 (`/usr/bin/node`) which is far below OpenClaw's minimum (22.16+). The gateway used NVM's v22.22.1 but service installation failed because WSL2 lacks systemd.

**Resolution:** Installed Node 24 via NVM (`nvm install 24`). Ran gateway manually (`openclaw gateway`) instead of via systemd service. For production, would enable systemd in WSL2 via `/etc/wsl.conf`.

### 5.5 Vercel Deployment Configuration

**Problem:** Initial deploy to `selantar-hedera.vercel.app` returned 404. The project was created via CLI (`vercel project add`) but wasn't linked to a Git repository or configured with the correct framework.

**Resolution:**
1. Connected Git repository (Michsantozz/selantar) via Vercel dashboard
2. Pushed `hedera-apex` branch to GitHub (`git push origin hedera-apex`)
3. Set Framework Preset to Next.js (was "Other")
4. Changed Production Branch from `main` to `hedera-apex`
5. Added all 25 environment variables via CLI (`vercel env add`)
6. Created Deploy Hook for `hedera-apex` branch

---

## 6. Complete Demo Pipeline

```
Step 1: /forge
  User sees 2 demo contract cards
  Clicks "The Suasuna Clinic" (R$15,000 escrow)
      │
Step 2: /forge/analyze?scenario=clinica-suasuna
  Textarea pre-fills with formal contract text (auto)
  AI analysis starts streaming after 800ms (REAL — OpenRouter/GPT-5.4-mini)
  Risk assessment, key clauses, recommendations appear in real-time
  CTA appears: "Generate Sentinel Plan"
      │
Step 3: /contract/sentinel-plan
  React Flow animates 40 steps:
  ├── Contract received → Analysis starts → Analysis complete
  ├── 4 milestones revealed (M1-M4 with dates and values)
  ├── 6 monitoring actions suggested (GitHub, WhatsApp, Deploy, API, Escrow)
  ├── Each action transitions: pending → suggested → approved → sent → waiting
  ├── WhatsApp notifications sent via Evolution API (REAL)
  └── Sentinel summary displayed
  User clicks "Approve plan and activate contract"
      │
Step 4: Deploy Cinematic
  Full-screen animation:
  ├── Structure validated (4 milestones, R$15,000, Hedera Testnet)
  ├── Milestones encoded (ABI generated)
  ├── Broadcasting to Hedera Testnet
  └── Registering on ERC-8004 (Validation Registry)
  POST /api/create-escrow → real TX on Hedera Testnet
  TX hash + HashScan link displayed
      │
Step 5: /mediation (separate flow)
  Clara (ToolLoopAgent) mediates dispute:
  ├── analyzeEvidence → WhatsApp: "Evidence analyzed, score 78%"
  ├── proposeSettlement → WhatsApp: "Proposal: R$12k dev, R$3k client"
  ├── executeSettlement → WhatsApp: "Settlement executed! Tx: 0xabc..."
  ├── postFeedback → WhatsApp: "Reputation posted on ERC-8004"
  └── registerVerdict → WhatsApp: "Verdict registered on-chain"
  Each step triggers notifyAgent → Evolution API → WhatsApp (REAL)
```

---

## 7. Technology Stack Used

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.2.0 | App Router, RSC, API routes |
| React | React | 19.2.3 | UI rendering |
| AI Framework | AI SDK (Vercel) | 6.x | streamText, useChat, ToolLoopAgent |
| AI Provider | OpenRouter | - | GPT-5.4-mini for contract analysis |
| AI Provider | Google | - | Gemini 3.1 Pro for mediation |
| Visualization | @xyflow/react | 12.10.1 | React Flow for agent workflow |
| Animation | framer-motion | 12.x | Page transitions, reveals |
| Blockchain | viem | latest | Hedera Testnet transactions |
| Chain | Hedera Testnet | Chain ID 296 | Settlement + ERC-8004 |
| WhatsApp | Evolution API | - | Direct message delivery |
| WhatsApp (backup) | OpenClaw + Baileys | 2026.3.13 | Agent-mediated delivery |
| UI Components | shadcn/ui | new-york | Buttons, textarea, cards |
| CSS | Tailwind CSS | 4.x | Styling with semantic tokens |
| Schema | Zod | - | Tool input validation |
| Deployment | Vercel | - | Auto-deploy from hedera-apex |

---

## 8. Environment Variables

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Contract analysis streaming (GPT-5.4-mini) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Mediation agent (Gemini 3.1 Pro) |
| `AGENT_PRIVATE_KEY` | Hedera wallet for settlement execution |
| `CLIENT_PRIVATE_KEY` | Client wallet for reputation feedback |
| `HEDERA_RPC_URL` | Hedera Testnet RPC endpoint |
| `HEDERA_CHAIN_ID` | 296 (Hedera Testnet) |
| `EVOLUTION_API_URL` | Evolution API base URL (whats.vensa.pro) |
| `EVOLUTION_API_KEY` | Evolution API authentication |
| `EVOLUTION_INSTANCE` | WhatsApp instance (testeultra2) |
| `OPENCLAW_HOOKS_URL` | OpenClaw webhook endpoint (backup) |
| `OPENCLAW_HOOKS_TOKEN` | OpenClaw webhook auth token |
| `OPENCLAW_NOTIFY_TO` | WhatsApp notification target number |
| `SELANTAR_AGENT_ID` | ERC-8004 registered agent ID (#36) |

---

## 9. Verified Transactions on Hedera Testnet

| TX | Hash | Purpose |
|---|---|---|
| Agent Registration | `0xe290eedd...` | ERC-8004 Identity, Agent ID 36 |
| Settlement | `0xc90d1cf1...` | 0.01 HBAR transfer |
| Client Funding | `0x11f93d3c...` | 10 HBAR |
| Reputation | `0x3a68bdb5...` | ERC-8004 feedback, score 85 |

All transactions verifiable on [HashScan Testnet](https://hashscan.io/testnet).

---

## 10. Commit History

```
9c52967 feat: forge demo contracts + notifyAgent tool + Hedera migration
ec3d16c fix: settlement sends to client, not self-transfer + tx confirmation + chainId in signature
bda8fbe fix: security audit — remove hardcoded wallets, add input validation, crypto salt
8e03ecd feat: add pitch video page, contract setup, UI updates, and all pending changes
05fe3d7 feat: include planning docs and audit reports for hackathon submission
40f47ff fix: remove unused demo-flow-camera import breaking Vercel build
```

---

## 11. Deployment

- **URL:** https://selantar-hedera.vercel.app
- **Branch:** `hedera-apex` (auto-deploy configured)
- **Production Branch:** `hedera-apex`
- **Framework:** Next.js 16
- **Node:** 24.x
- **Region:** Washington, D.C. (iad1)

---

> Document generated on 2026-03-23 by Claude Opus 4.6 during Hedera Hello Future Apex hackathon implementation session.
