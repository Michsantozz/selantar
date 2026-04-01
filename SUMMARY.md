# Selantar — Project Summary

**Tracks:** Fresh Code · Existing Code · AI & Robotics · Crypto · Infrastructure & Digital Rights
**Bounties:** Agents With Receipts — ERC-8004 · Let the Agent Cook · Filecoin · Community Vote

---

## The Problem

Every year, $1 trillion evaporates in B2B contract disputes. Not because the contracts are bad — because no one watches them after they're signed. Smart contracts are rigid and binary. Existing dispute resolution (Kleros, arbitration, courts) only reacts *after* something breaks. By then, the relationship is damaged, evidence is scattered, and resolution takes weeks.

## The Solution

Selantar is the world's first **Care Protocol** — an autonomous AI mediator that lives inside contracts from day one. It monitors deliveries, detects friction before it becomes conflict, and communicates between parties proactively. When prevention fails, Clara (the mediator agent) resolves disputes in 24 hours with full context already loaded, executes settlement on-chain, and registers every verdict permanently.

## Architecture

Built on Next.js 16 with Vercel AI SDK v6, Selantar runs two **ToolLoopAgents**: a contract parser (5 parallel sub-agents) and a mediation engine with 7 autonomous tools — `classifyCase`, `analyzeEvidence`, `proposeSettlement`, `executeSettlement`, `postFeedback`, `registerVerdict`, and `parseContract`. Before every response, Clara receives invisible counsel from two advisory chains — an **Empath** (clinical psychologist) and a **Strategist** (Harvard PON negotiation advisor) — both powered by Claude Sonnet 4.6. Settlements execute via MetaMask Delegations (ERC-7710 + ERC-7715) with a 5-path cascade. Infrastructure includes event sourcing with SHA-256 hash-chains, circuit breakers, idempotency, a self-improving reputation engine, a replay engine for auditing decisions, and a pay-per-use x402 API ($0.10 USDC per mediation).

## Sponsor Integration

**ERC-8004:** Selantar is Agent #2122 on all three registries — Identity (verifiable economic actor), Reputation (score updated after every mediation), and Validation (verdict as cryptographic evidence). Every receipt is a real transaction on Base Sepolia.

**Filecoin (Synapse SDK):** Every verdict and feedback report is stored on Filecoin with **Proof of Data Possession (PDP)** — continuous cryptographic proof that evidence still exists. Dual storage: IPFS for instant availability, Filecoin for provable retention. Public verification endpoint confirms liveness in real time.

**x402 (Mediation-as-a-Service):** Any agent can discover and pay for mediation with $0.10 USDC via HTTP header — no account, no API key. `GET /api/mediate` returns schema + price; `POST` executes the full 6-tool pipeline and returns ERC-8004 receipts. First pay-per-use Care Protocol in the agent economy.

**MetaMask Delegations (ERC-7710 + ERC-7715):** Settlement funds move from the party's own Smart Account via scoped delegation — the agent executes with cryptographically limited authority. [Delegation redeemed on-chain](https://sepolia.basescan.org/tx/0xd6ad6b07722b4df8e5b44b3c3b2f7a190a6c15ddcea5440623f10a367e32ba6f) — real ETH moved between addresses.

## Infrastructure & Digital Rights

Selantar is decentralized evidence infrastructure for autonomous dispute resolution. Every mediation verdict is stored on **IPFS** (instant availability) and **Filecoin** (PDP-verified retention) — censorship-resistant, provably alive evidence that no single entity can delete or tamper with. Cryptographic integrity runs through every layer: **SHA-256 hash-chains** link every event in an append-only log, **keccak256 hashes** anchor evidence on-chain, **canonical JSON serialization** guarantees deterministic hashing, and **HMAC signatures** protect the reputation oracle. Data ownership is enforced through **ERC-7715 scoped delegations** — parties grant granular, time-limited, amount-capped consent for the agent to act on their behalf. Public verification endpoints let anyone audit the chain (`/api/verify/[caseId]`) or confirm Filecoin liveness (`/api/verify-evidence?pieceCid=...`) without trusting Selantar. The building blocks of trustworthy autonomous systems on an open internet.

## Scale

22 API endpoints, 7 agent tools, 51 lib modules, 168 components, 40 tests across 7 modules, PostgreSQL with event sourcing, MCP server for agent-to-agent integration, WhatsApp + GitHub live monitoring — built in 10 days by a solo founder.

## Why It Matters

When agents start making deals on behalf of humans, they'll need a neutral resolution layer that's as fast, trustless, and verifiable as the transactions themselves. Selantar is that layer — where care becomes infrastructure, and every dispute leaves a permanent, provable receipt.

**Live:** [selantar.vercel.app](https://selantar.vercel.app) · **Agent #2122:** [BaseScan](https://sepolia.basescan.org/tx/0xd96cad52e144d98de68ce97aa8f9f3619302302c95feb8546a28b64e3fc72cf4)
