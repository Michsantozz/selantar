# Care Protocol

**Author:** Michel Santoz
**Date:** 2026-03-28
**Reference Implementation:** Selantar (selantar.vercel.app)
**Onchain Registration:** Base Sepolia — Selantar ERC-8004 Validation Registry
**Version:** 0.1.0 (Draft)

---

## Abstract

Care Protocol is a standard for autonomous, context-aware monitoring and resolution of contractual obligations between economic actors. It defines a six-stage lifecycle — Monitor, Understand, Communicate, Protect, Act, Prove — that an autonomous agent must execute before escalating any contractual friction to formal dispute resolution.

Care Protocol establishes that **prevention is the primary function** of a contract management agent, and resolution is the last resort. Every action taken by a Care Protocol agent must be verifiable, contextual, and proportional to the friction detected.

---

## Motivation

Existing protocols for smart contract enforcement operate on a binary model: a condition is met or it is not. If the condition fails, the contract executes a penalty, freezes funds, or routes to an arbitration mechanism. No existing protocol asks *why* the condition failed before acting.

This gap produces three systemic failures:

1. **Disproportionate response** — a developer who misses a deadline because their child is in hospital receives the same automated penalty as one who deliberately disappeared.

2. **Relationship destruction** — automated enforcement optimizes for correctness, not continuity. The business relationship between parties — which has economic value beyond the contract itself — is treated as irrelevant.

3. **Lost context** — by the time a dispute reaches arbitration, the contextual signals that could have prevented it (unanswered messages, missed access requests, communication gaps) are scattered across WhatsApp, email, GitHub, Slack, and CRM systems. No protocol aggregates and interprets this context.

Care Protocol solves all three failures by inserting a context-aware agent between the contract state and any enforcement action.

---

## Specification

### Core Principle

> A Care Protocol agent must attempt to understand and resolve friction before executing any enforcement action. The agent's reputation is staked on outcomes, not just on correct execution.

### The Six-Stage Care Lifecycle

A compliant Care Protocol agent must implement the following stages in order:

```
MONITOR → UNDERSTAND → COMMUNICATE → PROTECT → ACT → PROVE
```

#### Stage 1 — MONITOR

The agent continuously observes the contract's execution state across all available channels:

- **Onchain signals:** milestone completion, escrow state, payment confirmation
- **Offchain signals:** GitHub commit activity, communication response times, CRM access logs, message threads (WhatsApp, Slack, email)
- **Temporal signals:** days since last activity, proximity to deadline, pattern deviation from baseline

A monitoring event is emitted for every signal that deviates from expected behavior. Monitoring events must be stored in an append-only log with cryptographic integrity (SHA-256 hash-chain or equivalent).

#### Stage 2 — UNDERSTAND

Before any action, the agent must classify the detected friction:

- **Category:** delivery delay, communication gap, access blockage, force majeure, bad faith, scope dispute, payment dispute
- **Severity:** LOW (informational), MEDIUM (intervention warranted), HIGH (escalation likely), CRITICAL (immediate action required)
- **Causality:** who originated the friction, and what contextual signals support that attribution
- **Proportionality factor:** what response is proportional to the severity and cause

Understanding must be based on the full available context, not just the triggering signal. An agent that acts on a missed deadline without checking for a force majeure communication is not Care Protocol compliant.

#### Stage 3 — COMMUNICATE

Before executing any enforcement action, the agent must attempt direct communication with the affected parties:

- Communication must be proportional: LOW severity warrants a check-in, CRITICAL warrants an urgent notification
- Communication must be empathetic: the agent must validate the party's situation before presenting facts or options
- Communication must propose a path: every outreach must include a concrete, actionable suggestion
- Communication must be omnichannel: delivered through whatever channel the party is most responsive to

A Care Protocol agent must wait a minimum response window (configurable, default 48 hours for LOW/MEDIUM, 12 hours for HIGH, 2 hours for CRITICAL) before escalating.

#### Stage 4 — PROTECT

If communication succeeds and parties reach an informal agreement, the agent must protect both the agreement and the relationship:

- Update contract state to reflect the agreed adjustment
- Emit a `CareResolution` event documenting the informal agreement
- Preserve the original contract terms as fallback if the adjustment is not honored
- Record the care interaction as positive evidence for both parties' reputation scores

This stage exists because most contractual friction resolves through communication — never reaching formal dispute. A protocol that skips directly to enforcement misses the majority of resolution opportunities.

#### Stage 5 — ACT

Only when communication fails or is refused does the agent escalate to enforcement:

- **Mediation:** AI-driven structured mediation with evidence analysis, proposed settlement, and both-party consent
- **Arbitration:** formal dispute routing to an arbitration mechanism (onchain jury, institutional arbitrator, or court)
- **Settlement execution:** transfer of funds according to the agreed or decided distribution, via delegated authority from the parties (ERC-7710, ERC-7715, or equivalent)

Enforcement actions must be traceable to a specific failure in stages 2–4. An enforcement action without a documented care history is not Care Protocol compliant.

#### Stage 6 — PROVE

Every care interaction — from the first monitoring event to the final settlement — must be registered as verifiable onchain evidence:

- **Identity proof:** the agent executing the care lifecycle must have a verifiable onchain identity (ERC-8004 Identity Registry or equivalent)
- **Action log:** all care events stored in a tamper-evident hash-chain, publicly verifiable
- **Reputation update:** the agent's reputation score is updated based on outcome (prevention = positive, forced settlement = neutral, arbitration = negative)
- **Verdict registration:** if formal resolution occurred, the verdict is registered as permanent onchain evidence

The proof layer is not optional. A Care Protocol agent that acts without leaving verifiable receipts cannot be trusted by other agents or institutions.

---

## Care Events

A compliant implementation must define and emit the following event types:

| Event | Stage | Description |
|-------|-------|-------------|
| `CareMonitor.SignalDetected` | MONITOR | A deviation from expected contract state was detected |
| `CareMonitor.ContextAggregated` | MONITOR | Offchain signals were collected and attached to the case |
| `CareUnderstand.CaseClassified` | UNDERSTAND | Friction was categorized and severity assigned |
| `CareUnderstand.CausalityAssigned` | UNDERSTAND | Causality was attributed with supporting evidence |
| `CareCommunicate.OutreachSent` | COMMUNICATE | Agent contacted a party |
| `CareCommunicate.ResponseReceived` | COMMUNICATE | Party responded to outreach |
| `CareCommunicate.WindowExpired` | COMMUNICATE | Response window elapsed without reply |
| `CareProtect.InformalAgreement` | PROTECT | Parties reached informal resolution |
| `CareProtect.ContractAdjusted` | PROTECT | Contract terms updated to reflect agreement |
| `CareAct.MediationInitiated` | ACT | Formal mediation process started |
| `CareAct.SettlementProposed` | ACT | Agent proposed a settlement distribution |
| `CareAct.SettlementExecuted` | ACT | Settlement executed onchain |
| `CareProve.VerdictRegistered` | PROVE | Final outcome registered as onchain evidence |
| `CareProve.ReputationUpdated` | PROVE | Agent and party reputation scores updated |

---

## Agent Requirements

A Care Protocol compliant agent must:

1. **Have a verifiable identity** — registered in a decentralized identity registry with an onchain address and metadata URI
2. **Maintain an append-only event log** — with SHA-256 hash-chain integrity, publicly queryable
3. **Stake reputation on outcomes** — reputation score must be updated after every resolved case, visible to all parties
4. **Support delegated authority** — settlement execution must use scoped delegations from the parties, not the agent's own funds
5. **Be discoverable** — expose a machine-readable service manifest (e.g., `/agent.json`) describing capabilities, pricing, and registry addresses
6. **Support agent-to-agent invocation** — accept dispute submissions from other agents via standard interfaces (MCP, x402, or equivalent)

---

## Differentiation from Existing Protocols

| Protocol | Trigger | Response | Context | Empathy | Proof |
|----------|---------|----------|---------|---------|-------|
| Smart contract automation | Condition = true/false | Execute predefined function | None | None | TX hash |
| Chainlink Automation | Onchain condition | Call contract function | None | None | TX hash |
| Kleros | Dispute filed | Summon human jurors | Evidence only | None | Onchain vote |
| Traditional mediation | Dispute filed | Human mediator | Full | Human | Document |
| **Care Protocol** | **Signal deviation** | **Context-aware staged response** | **Full — onchain + offchain** | **Built-in** | **Hash-chain + onchain receipts** |

---

## Reference Implementation

**Selantar** is the first Care Protocol implementation:

- **Agent:** Clara — registered as Agent #2122 on ERC-8004 Identity Registry (Base Sepolia)
- **Care loop:** active monitoring of GitHub commits, WhatsApp communication, CRM logs
- **Mediation engine:** ToolLoopAgent with 6 tools (classifyCase, analyzeEvidence, proposeSettlement, executeSettlement, postFeedback, registerVerdict)
- **Settlement:** multi-path execution via ERC-7710 + ERC-7715 delegations + ERC-4337 bundler
- **Proof layer:** ERC-8004 Identity + Reputation + Validation registries (all 3 deployed)
- **Agent-to-agent:** x402 ($0.10 USDC/call) + MCP server (5 tools)
- **Live:** selantar.vercel.app

---

## Open Questions

The following design decisions are open for community input:

1. **Minimum response window** — should the 48h default be configurable per contract, per jurisdiction, or per dispute category?
2. **Reputation decay** — should agent reputation decay over time without active cases, or remain static?
3. **Cross-agent delegation** — can a Care Protocol agent sub-delegate care responsibilities to a specialist agent (e.g., a domain-specific mediator)?
4. **Privacy** — what portions of the care event log must be public vs. encrypted (parties may not want communication logs exposed)?
5. **Jurisdiction** — how does Care Protocol interact with legal frameworks that require human mediators (e.g., Brazil's Lei 13.140/2015)?

---

## Conclusion

Care Protocol defines a new category of autonomous agent behavior: one that prioritizes prevention over resolution, context over condition, and relationships over correctness.

The gap it fills is not technical — it is philosophical. Existing protocols treat contracts as agreements between wallets. Care Protocol treats contracts as agreements between humans, executed through wallets.

Every contract deserves care. Every dispute that never happens is a relationship preserved, a business saved, and a receipt that doesn't need to exist.

---

*Care Protocol v0.1.0 — Michel Santoz — 2026-03-28*
*Reference implementation: Selantar — selantar.vercel.app*

---

## Cryptographic Proof of Authorship

This document is timestamped on Bitcoin mainnet via OpenTimestamps.
The receipt file is `CARE-PROTOCOL.md.ots` (included in this repository).

**Verify (terminal):** `ots verify CARE-PROTOCOL.md.ots`
**Verify (web):** [opentimestamps.org](https://opentimestamps.org) — upload `CARE-PROTOCOL.md.ots`
