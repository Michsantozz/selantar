# Audit Fixes & Bounty Preparation Log — Selantar × Hedera Apex

> Second implementation session: code quality audit fixes, OpenClaw skill creation, and bounty readiness.
> Branch: `hedera-apex` | Date: 2026-03-23 | Author: Claude Opus 4.6 + Michsantoz
> Continues from: `docs/OPENCLAW-INTEGRATION-LOG.md`

---

## 1. Objective

After completing the OpenClaw integration (session 1), this session focused on:
1. **Code quality audit fixes** — Address critical/high findings from `docs/CODE-QUALITY-AUDIT.md`
2. **OpenClaw skill creation** — Teach the OpenClaw agent about Selantar via formal SKILL.md
3. **Bounty readiness** — Vercel deployment with auto-deploy from `hedera-apex`

---

## 2. Code Quality Audit Fixes

### 2.1 "BaseScan" → "HashScan" in Navbar (CRITICAL #4)

**File:** `components/navbar.tsx` (lines 96, 158)

**Problem:** After migrating from Base Sepolia to Hedera Testnet, the explorer link label still said "BaseScan". The URL pointed correctly to HashScan, but the visible text was wrong. A judge clicking the navbar would see a mismatch — instant credibility loss.

**Fix:** Global replace of `BaseScan` → `HashScan` (2 occurrences — desktop and mobile navbar).

---

### 2.2 Agent ID Fallback "2122" → "36" (HIGH #7)

**Files:** `lib/tools/post-feedback.ts`, `lib/tools/register-verdict.ts`, `app/api/create-escrow/route.ts`, `app/api/mediate/route.ts`

**Problem:** All four files used `BigInt(process.env.SELANTAR_AGENT_ID ?? "2122")`. The ID `2122` was from Base Sepolia. On Hedera Testnet, Selantar is **Agent #36** (TX `0xe290eedd...`). If the env var was missing, all ERC-8004 calls would target a nonexistent agent.

**Fix:** Changed all 4 fallbacks from `"2122"` to `"36"`.

---

### 2.3 Centralized Explorer URL Helper (CRITICAL #3)

**File created:** `lib/hedera/explorer.ts`

**Problem:** HashScan URL hardcoded in 11 places across 7 files.

**Fix:**
```typescript
import { hederaTestnet } from "./chains";

export const getExplorerTxUrl = (hash: string) =>
  `${hederaTestnet.blockExplorers.default.url}/transaction/${hash}`;

export const getExplorerAccountUrl = (address: string) =>
  `${hederaTestnet.blockExplorers.default.url}/account/${address}`;
```

Derives base URL from chain definition — single source of truth. Available for new code; existing 11 inline occurrences not migrated this session (bounty priority).

---

## 3. OpenClaw Skill — `selantar`

**File:** `~/.openclaw/workspace/skills/selantar/SKILL.md`

### 3.1 Why a Skill?

The OpenClaw bounty requires "agent-first". Without a skill, the OpenClaw agent doesn't know Selantar exists. The skill is the **proof of integration in the OpenClaw codebase**.

### 3.2 Description (Triggering)

```yaml
description: >
  Autonomous B2B dispute mediation on Hedera via AI agents.
  Use this skill whenever the user mentions disputes, mediation,
  arbitration, contract conflicts, settlement, escrow, reputation
  scoring, ERC-8004, or wants to resolve a disagreement between
  parties. Also triggers when someone asks about Selantar, Clara,
  Sentinel, or anything related to on-chain dispute resolution.
```

Intentionally "pushy" (per skill-creator guidance) to ensure reliable triggering across varied user prompts.

### 3.3 Contents

| Section | Purpose |
|---|---|
| What Selantar Does | Clara (mediator) and Sentinel (monitor) roles explained |
| Your Role as OpenClaw Agent | Communication bridge — gather info, send updates, answer questions |
| How to Send WhatsApp | Evolution API curl commands with typing indicator + message |
| Event Notification Formats | 6 message templates (started, analyzed, proposed, executed, feedback, verdict) |
| The Selantar Pipeline | forge → analyze → sentinel plan → deploy → mediation → settlement |
| ERC-8004 On-Chain Data | Registry addresses, Agent #36, Chain ID 296 |
| Verified Transactions | 4 real TX hashes with full values |
| Web App | Live URL (selantar-hedera.vercel.app) + key pages |
| How to Respond | Decision tree by user intent type |

### 3.4 Evolution API Integration

The skill includes working curl commands:
- `sendPresence` → typing indicator (composing, 1500ms delay)
- `sendText` → actual message delivery (500ms delay)

Instance: `testeultra2` at `whats.vensa.pro`. Hardcoded for hackathon; production would use env vars.

### 3.5 Evolution Over Previous Version

A basic version existed from session 1. Updated version is ~3x more detailed with:
- Evolution API commands (previously missing)
- Notification message formats (previously missing)
- Complete pipeline explanation (previously missing)
- Structured response decision tree (previously minimal)

---

## 4. OpenClaw Gateway Configuration

### 4.1 Hooks Enabled

Added to `~/.openclaw/openclaw.json`:
```json
{
  "hooks": {
    "enabled": true,
    "token": "selantar-hook-2026"
  }
}
```

Gateway hot-reloaded without restart (confirmed: `config hot reload applied (hooks.enabled, hooks.token)`).

### 4.2 WhatsApp Allowlist Updated

Changed from `dmPolicy: "pairing"` to `dmPolicy: "allowlist"` with `+5562994161690` for direct message delivery without pairing codes.

### 4.3 Gemini Rate Limit Issue

During webhook testing, Gemini 3.1 Pro returned 429. Webhook accepted (`ok: true`) but agent couldn't process.

**Resolution:** Dual delivery path:
1. **Primary:** Evolution API (direct WhatsApp, no LLM turn) — `lib/tools/notify-agent.ts`
2. **Backup:** OpenClaw webhook — `lib/notify-openclaw.ts`

Evolution API verified working: message delivered to `+5562994161690`.

---

## 5. Vercel Deployment — `selantar-hedera`

### 5.1 Project Setup

| Property | Value |
|---|---|
| Project | `selantar-hedera` |
| URL | `https://selantar-hedera.vercel.app` |
| Production branch | `hedera-apex` |
| Framework | Next.js |
| Node | 24.x |
| Auto-deploy | ON (push to hedera-apex) |

### 5.2 Steps

1. `npx vercel project add selantar-hedera`
2. `npx vercel link --project selantar-hedera --yes`
3. Added 25 env vars via `npx vercel env add`
4. Connected Git repo via dashboard
5. `git push origin hedera-apex` (branch wasn't on remote)
6. Changed Production Branch to `hedera-apex` (Settings → Environments → Production → Branch Tracking)
7. Created Deploy Hook for `hedera-apex`
8. Changed Framework Preset from "Other" to Next.js
9. Added Evolution API env vars: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`

### 5.3 Difficulties

- **Framework "Other"** → 404 on first deploy. Fixed: Next.js preset.
- **Branch not on GitHub** → Deploy Hook rejected. Fixed: `git push origin hedera-apex`.
- **Production Branch location** → Not in Settings → General, but in Settings → Environments → Production → Branch Tracking.

---

## 6. Files Changed This Session

| # | File | Action | Purpose |
|---|---|---|---|
| 1 | `components/navbar.tsx` | Edit | BaseScan → HashScan (2x) |
| 2 | `lib/tools/post-feedback.ts` | Edit | Agent ID 2122 → 36 |
| 3 | `lib/tools/register-verdict.ts` | Edit | Agent ID 2122 → 36 |
| 4 | `app/api/create-escrow/route.ts` | Edit | Agent ID 2122 → 36 |
| 5 | `app/api/mediate/route.ts` | Edit | Agent ID 2122 → 36 |
| 6 | `lib/hedera/explorer.ts` | **Create** | Centralized HashScan URL helper |
| 7 | `~/.openclaw/workspace/skills/selantar/SKILL.md` | **Update** | Full OpenClaw skill with Evolution API |
| 8 | `~/.openclaw/openclaw.json` | Edit | Hooks enabled + token + allowlist |

---

## 7. Bounty Readiness Status

| Requirement | Status | Evidence |
|---|---|---|
| Agent-first | Done | Clara autonomous; OpenClaw skill teaches agent about Selantar |
| Autonomous behavior | Done | Dual-agent mediates without intervention |
| Multi-agent value | Done | Clara + Sentinel + OpenClaw agent + Client agent |
| Hedera EVM | Done | 4+ real TXs, viem, ERC-8004 |
| UI shows agent flow | Done | React Flow 40+ steps, SentinelPanel |
| ERC-8004 trust | Done | Identity #36, Reputation score 85 |
| Repo public | Done | github.com/Michsantozz/selantar |
| Demo URL live | Done | selantar-hedera.vercel.app |
| Video demo < 3 min | Pending | |
| README + walkthrough | Pending | |

---

## 8. Architecture (Post-Session 2)

```
┌──────────────────────────────────────────────────────┐
│                   SELANTAR ECOSYSTEM                  │
│                                                      │
│  AI SDK v6 (Clara + Sentinel)                        │
│       │ notifyAgent tool                             │
│       ▼                                              │
│  Evolution API (whats.vensa.pro)                     │
│       │                                              │
│       ▼                                              │
│  WhatsApp (+5562994161690)                           │
│                                                      │
│  OpenClaw Gateway (localhost:18789)                   │
│  ├── Skill: selantar (SKILL.md)                      │
│  ├── Model: Gemini 3.1 Pro                           │
│  ├── WhatsApp: Baileys (backup path)                 │
│  └── Hooks: /hooks/agent (selantar-hook-2026)        │
│                                                      │
│  Hedera Testnet (Chain ID 296)                       │
│  ├── ERC-8004 Identity (#36)                         │
│  ├── ERC-8004 Reputation (score 85)                  │
│  └── HBAR settlements                                │
│                                                      │
│  Vercel: selantar-hedera.vercel.app                  │
│  └── Auto-deploy from hedera-apex branch             │
└──────────────────────────────────────────────────────┘
```

---

> Generated 2026-03-23, session 2. Previous: `docs/OPENCLAW-INTEGRATION-LOG.md`
