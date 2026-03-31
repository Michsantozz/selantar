# Selantar — Project Summary

**Track:** Fresh Code · AI & Robotics
**Bounties:** Agents With Receipts — ERC-8004 · Let the Agent Cook · Filecoin

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

## Scale

17 API endpoints, 7 agent tools, 50+ lib modules, 170+ components, 40 tests across 7 modules, PostgreSQL with event sourcing, MCP server for agent-to-agent integration, WhatsApp + GitHub live monitoring — built in 10 days by a solo founder.

## Why It Matters

When agents start making deals on behalf of humans, they'll need a neutral resolution layer that's as fast, trustless, and verifiable as the transactions themselves. Selantar is that layer — where care becomes infrastructure, and every dispute leaves a permanent, provable receipt.

**Live:** [selantar.vercel.app](https://selantar.vercel.app) · **Agent #2122:** [BaseScan](https://sepolia.basescan.org/tx/0xd96cad52e144d98de68ce97aa8f9f3619302302c95feb8546a28b64e3fc72cf4)
