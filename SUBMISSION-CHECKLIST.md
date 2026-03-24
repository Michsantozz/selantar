# Submission Checklist — Hedera Hello Future Apex 2026

> Branch: `hedera-apex` | Track: AI & Agents | Bounty: OpenClaw
> Deadline: 23 March 2026, 11:59 PM ET
> Submissão leva 20-30 min. Chegar 1h antes do deadline.

---

## 1. Formulário de Submissão (StackUp)

### Project Description (max 100 palavras):

```
Selantar is an autonomous B2B dispute mediator powered by AI agents on Hedera. When contracts break, Clara — Agent #36 — steps in. She reads the contract, analyzes evidence from both sides, mediates without ego or judgment, and executes settlements on-chain. No lawyers, no months of waiting. Every mediation generates 9 Hedera operations across 3 native services: EVM smart contracts (ERC-8004 identity, reputation, and validation registries), Consensus Service (immutable audit trail), and Token Service (NFT mediation receipts). The oracle for human intention — because behind every contract, there's just people.
```

### Selected Track:

```
AI & Agents
```

### Bounty:

```
OpenClaw — Killer App for the Agentic Society ($8K)
```

### Tech Stack:

```
Next.js 16, React 19, AI SDK v6 (Vercel), viem, @hashgraph/sdk, @xyflow/react (React Flow), OpenClaw, Tailwind CSS v4, framer-motion, shadcn/ui, Zod, TypeScript, Hedera Testnet (EVM + HCS + HTS), ERC-8004, Evolution API (WhatsApp), Vercel
```

### GitHub Repo:

```
https://github.com/Michsantozz/selantar
Branch: hedera-apex
```

### Demo Link:

```
https://selantar-hedera.vercel.app
```

### Demo Video URL (YouTube, max 5 min):

```
[TODO — gravar e subir pro YouTube]
```

### Pitch Deck (PDF):

```
[TODO — criar via page + screenshot → PDF]
```

---

## 2. Links Verificáveis (pra colocar no deck/README)

### Essenciais:

| O que | Link |
|-------|------|
| Agent #36 (wallet) | https://hashscan.io/testnet/account/0xFE5561A1a064ae13DbcF23BA1e3ff85Fc3da7B04 |
| HCS Audit Trail | https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.8351168/messages |
| Token SLNTR (HTS) | https://hashscan.io/testnet/token/0.0.8351617 |
| Demo Live | https://selantar-hedera.vercel.app |

### Transações On-Chain:

| # | Operação | HashScan Link |
|---|----------|---------------|
| 1 | Agent Registration | https://hashscan.io/testnet/transaction/0xe290eedd9382668979d523687975914feda4d601c78e188da2510a890cd2761f |
| 2 | Settlement (0.01 HBAR) | https://hashscan.io/testnet/transaction/0xc90d1cf17300ec1b4b6943a452d258e2e690f23af15f4132b5a9651d0970bae1 |
| 3 | Client Funding (10 HBAR) | https://hashscan.io/testnet/transaction/0x11f93d3c83951d5425b8cf342c06d80b0baafca1937a16060f86e82025c8e18e |
| 4 | Reputation Feedback | https://hashscan.io/testnet/transaction/0x3a68bdb5c364dad2131b04c32c79a985aa34dee7a867bfa9cee9357d4d9e06d6 |
| 5 | ValidationRegistry Deploy | https://hashscan.io/testnet/transaction/0x8048e03744e2811ebeeb69a559848076bccb3ac9e81789d83d82a18bc20ad013 |

### Contratos ERC-8004:

| Registry | Endereço |
|----------|---------|
| Identity | 0x8004A818BFB912233c491871b3d84c89A494BD9e |
| Reputation | 0x8004B663056A597Dffe9eCcC1965A193B7388713 |
| Validation | 0xf3dd86fcc060639d3dd56fbf652b171aeabb1b58 |

### Hedera Services:

| Serviço | ID/Endereço |
|---------|-------------|
| HCS Topic | 0.0.8351168 |
| HTS Token (SLNTR) | 0.0.8351617 |
| Agent Account | 0.0.8347018 |

---

## 3. Feedback Questions (compulsórias na submissão)

Respostas prontas pra copiar:

### "What inspired this project?"

```
The realization that $40-50 billion gets stuck in business disputes every year — not because people are dishonest, but because the conversation is awkward. Nobody wants to chase money. Nobody wants to be chased. We built Selantar because the world needs a mediator with no ego, no judgment, and no skin in the game. An AI that understands the human side of contracts.
```

### "What challenges did you face?"

```
Three main challenges: (1) The ERC-8004 Validation Registry wasn't deployed on Hedera Testnet — we had to compile and deploy our own implementation. (2) Hedera's JSON-RPC doesn't support HCS, so we integrated the native @hashgraph/sdk alongside viem for EVM operations — two SDKs coexisting. (3) Balancing fire-and-forget patterns (HCS logging, HTS minting) with reliable settlement execution required careful error handling design.
```

### "What did you learn?"

```
Hedera's multi-service architecture (EVM + HCS + HTS) is genuinely powerful when used together — each service solves a different trust problem. EVM for settlement execution, HCS for immutable audit trails, HTS for proof-of-completion receipts. We also learned that the hardest part of AI mediation isn't the AI — it's protecting both parties' egos while finding the truth.
```

### "What's next for this project?"

```
Phase 1 (now): AI mediation with on-chain settlement on Hedera Testnet. Phase 2: Expand context channels — WhatsApp, GitHub, CRM integration via OpenClaw. The Sentinel agent monitors work in real-time, not just after disputes. Phase 3: On-chain reputation bureau — consent-based professional trust scores that replace cold credit ratings with verified proof of the value you create.
```

### "How does your project use Hedera?"

```
Selantar uses three Hedera native services: (1) EVM Smart Contracts — three ERC-8004 registries for agent identity, reputation scoring, and verdict validation, plus HBAR settlement transfers. (2) Hedera Consensus Service — every mediation step is logged as an immutable, timestamped message on HCS Topic 0.0.8351168, creating a verifiable audit trail. (3) Hedera Token Service — each completed mediation mints a unique SLNTR NFT receipt (Token 0.0.8351617) as on-chain proof of resolution. 9 operations per mediation across all 3 services.
```

---

## 4. Entregáveis — Status

| # | Entregável | Status | Nota |
|---|------------|--------|------|
| 1 | GitHub repo público | DONE | hedera-apex branch |
| 2 | Project description (100 palavras) | DONE | Acima |
| 3 | Track selecionada | DONE | AI & Agents |
| 4 | Tech stack list | DONE | Acima |
| 5 | Pitch Deck PDF | TODO | Criar via page + screenshot |
| 6 | Demo Video (YouTube, max 5 min) | TODO | Gravar |
| 7 | Demo Link | DONE | selantar-hedera.vercel.app |
| 8 | README atualizado | EM ANDAMENTO | Outro agente fazendo |
| 9 | Feedback questions | DONE | Respostas acima |
| 10 | Commit + push final | TODO | Após tudo pronto |

---

## 5. Bounty Submission (OpenClaw — separado)

Submeter em: https://go.hellofuturehackathon.dev/submit-bounty

### Requisitos:

| Requisito | Evidência |
|-----------|-----------|
| Agent-first | OpenClaw Skill + Clara autônoma |
| Autônomo | Dual-agent sem intervenção humana |
| Multi-agent | Clara + Sentinel + OpenClaw + Client agent |
| Hedera EVM/HTS/HCS | 3 serviços, 9 operações |
| UI mostra agent flow | React Flow 40+ steps |
| ERC-8004 trust | Identity #36, Reputation 85 |
| Repo público | GitHub |
| Demo URL | selantar-hedera.vercel.app |
| Video < 3 min | TODO — cortar do video principal |
| README + walkthrough | EM ANDAMENTO |

---

## 6. Timing

```
Deadline: 23 March 2026, 11:59 PM ET (= 24 March 00:59 AM ET)

Plano:
- [ ] README finalizado
- [ ] Pitch deck PDF criado
- [ ] Demo video gravado + upload YouTube
- [ ] Commit + push final (hedera-apex)
- [ ] Esperar Vercel auto-deploy confirmar
- [ ] Submeter main track (AI & Agents) no StackUp
- [ ] Submeter bounty (OpenClaw) no link separado
- [ ] Reservar 1h pra feedback questions

LEMBRETE: Submissão leva 20-30 min. Começar pelo menos 1h antes do deadline.
```
