# Prompt para Atualização do README — Branch `hedera-apex`

> Cole este prompt inteiro em outra conversa de AI.

---

## PROMPT:

```
Estou na branch `hedera-apex` do projeto Selantar (/home/michsantoz/selantar).
Preciso atualizar o README.md para o Hedera Hello Future Apex Hackathon.

Leia estes arquivos pra contexto:
- docs/HEDERA-MIGRATION-LOG.md (tudo que foi feito)
- docs/OPENCLAW-INTEGRATION-LOG.md (integração OpenClaw)
- docs/AUDIT-FIXES-AND-BOUNTY-PREP-LOG.md (fixes e bounty prep)
- CLAUDE.md (arquitetura do projeto)

O README precisa ter:

1. **Header** — Nome, tagline "The oracle for human intention", badges (Hedera Testnet, ERC-8004, HCS, HTS)
2. **What is Selantar** — 3 frases max
3. **Demo** — Link: selantar-hedera.vercel.app + screenshot se possível
4. **How it works** — Pipeline em 6 passos (forge → analyze → sentinel → deploy → mediation → settlement)
5. **Hedera Integration** — Tabela com 3 serviços (EVM, HCS, HTS) + endereços + TXs reais:
   - EVM: ERC-8004 Identity (0x8004A818BFB912233c491871b3d84c89A494BD9e), Reputation (0x8004B663056A597Dffe9eCcC1965A193B7388713), Validation (0xf3dd86fcc060639d3dd56fbf652b171aeabb1b58)
   - HCS: Topic 0.0.8351168 — Mediation audit log
   - HTS: Token 0.0.8351617 (SLNTR) — Mediation receipt NFTs
6. **ERC-8004** — 3 registries com endereços e o que cada um faz
7. **Tech Stack** — Next.js 16, AI SDK v6, viem, @hashgraph/sdk, React Flow (@xyflow/react), OpenClaw, Tailwind CSS v4, framer-motion
8. **Setup** — git clone, npm install, env vars necessárias (.env.local), npm run dev
   Env vars obrigatórias:
   - AGENT_PRIVATE_KEY (Hedera wallet)
   - HEDERA_RPC_URL (https://testnet.hashio.io/api)
   - HEDERA_ACCOUNT_ID (0.0.XXXXXXX)
   - HCS_TOPIC_ID (0.0.8351168)
   - HTS_TOKEN_ID (0.0.8351617)
   - SELANTAR_AGENT_ID (36)
   - OPENROUTER_API_KEY (pra contract analysis)
   - GOOGLE_GENERATIVE_AI_API_KEY (pra mediation)
9. **On-Chain Transactions** — Tabela com as 9 TXs/operações verificáveis:
   | # | Operation | TX/ID | Verify |
   |---|-----------|-------|--------|
   | 1 | Agent Registration (ERC-8004 Identity) | 0xe290eedd9382668979d523687975914feda4d601c78e188da2510a890cd2761f | HashScan |
   | 2 | Settlement Test (0.01 HBAR) | 0xc90d1cf17300ec1b4b6943a452d258e2e690f23af15f4132b5a9651d0970bae1 | HashScan |
   | 3 | Client Funding (10 HBAR) | 0x11f93d3c83951d5425b8cf342c06d80b0baafca1937a16060f86e82025c8e18e | HashScan |
   | 4 | Reputation Feedback (ERC-8004) | 0x3a68bdb5c364dad2131b04c32c79a985aa34dee7a867bfa9cee9357d4d9e06d6 | HashScan |
   | 5 | ValidationRegistry Deploy | 0x8048e03744e2811ebeeb69a559848076bccb3ac9e81789d83d82a18bc20ad013 | HashScan |
   | 6 | HCS Topic Created | Topic 0.0.8351168 | Mirror Node |
   | 7 | HCS Test Message | Seq #1 | Mirror Node |
   | 8 | HTS Token Created (SLNTR) | Token 0.0.8351617 | HashScan |
   | 9 | HTS NFT Minted (#1) | Serial #1 | HashScan |
10. **Architecture** — Diagrama ASCII:
    ```
    User → /forge (contract upload)
         → /forge/analyze (AI risk analysis — OpenRouter/GPT-5.4-mini)
         → /contract/sentinel-plan (React Flow — 40 animated steps)
         → Deploy Cinematic (ERC-8004 Validation Registry — real TX)
         → /mediation (Clara ToolLoopAgent — dual agent)
              ├── analyzeEvidence → HCS log
              ├── proposeSettlement → HCS log
              ├── executeSettlement → HBAR transfer + HCS log
              ├── postFeedback → ERC-8004 Reputation + HCS log
              ├── registerVerdict → ERC-8004 Validation + HCS log + HTS NFT mint
              └── notifyAgent → WhatsApp (Evolution API + OpenClaw)
    ```
11. **OpenClaw Integration** — Skill Selantar, WhatsApp notifications via Evolution API, agent-to-agent communication
12. **Hackathon** — "Built for Hedera Hello Future Apex 2026"
    - Track: AI & Agents ($40K)
    - Bounty: OpenClaw — Killer App for the Agentic Society ($8K)
    - Agent ID: 36 (ERC-8004 Identity Registry)
    - Network: Hedera Testnet (Chain ID 296)
13. **Market Context** (pra judges) —
    - $40-50B/year lost to commercial disputes globally
    - 11% of SMB revenue lost to contract friction
    - 400M small businesses worldwide
    - Average arbitration costs $10K-50K and takes 6-18 months
    - Selantar resolves in minutes for ~$0.01 in gas

REGRAS:
- Confirmar que está na branch hedera-apex antes de editar
- Inglês (judges são globais)
- Conciso — judge tem 50+ projetos pra ler
- Links clicáveis pro HashScan (https://hashscan.io/testnet/transaction/{hash})
- Links clicáveis pro Mirror Node (https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.8351168/messages)
- NÃO mencionar The Synthesis em nenhum lugar
- NÃO fazer commit — eu reviso antes
```
