# EXECUTION PLAN — Selantar → 1o Lugar no Synthesis

> Plano completo de execucao. Inclui TUDO: trabalho do agente + trabalho do humano.
> Meta: 90% de chance de ganhar pelo menos 1 track.

**Deadline:** 22 Mar 2026, 23:59 PST (domingo)
**Judging:** 23-25 Mar
**Tracks alvo:** ERC-8004 ($8k), Let the Agent Cook ($8k), Open Track ($25k)
**Prize maximo possivel:** ~$11-14k (~R$63-80k)
**Prize esperado (realista):** ~$4-6.5k (~R$23-37k)

---

## ✅ O QUE JÁ ESTÁ FEITO (19 Mar 2026)

### Código e Produto
- [x] 5 tools reais com fallback graceful (analyzeEvidence, proposeSettlement, executeSettlement, postFeedback, registerVerdict)
- [x] 3 cenários pré-prontos (A Clínica Suasuna, O E-commerce Quebrado, O Freelancer Fantasma)
- [x] Dual-agent: mediator Clara + client personas (pt-BR / en)
- [x] API /mediation-chat — ToolLoopAgent funcional
- [x] API /client-chat — 3 personas respondem in-character
- [x] API /analyze-contract — streaming real via AI SDK v6
- [x] API /execute-settlement — ETH transfer real na Base Sepolia
- [x] Build sem erros (17 pages, 4 API routes, 0 TypeScript errors)
- [x] Teste E2E local — 10/10 testes passaram

### ERC-8004 On-Chain
- [x] Self-custody transfer — Agent NFT #2122 transferido para wallet própria
  - TX: `0xf6a996e3d77f0f6211d8636679b57b9ff4bd161b5cd412a0612ca4a6612ff32f`
- [x] Reputation feedback postado (score 90/100, tags: mediationSuccess, softwareDispute)
  - TX: `0x91efdaca7a28fbf135f1db0c6a79ebfa3365910dd4815c85323d58400d1db044`
- [x] Validation Registry deployada (oficial não existia na Base Sepolia — deployamos spec-compliant)
  - Deploy TX: `0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd`
  - Contrato: `0xd6f7d27ce23830c7a59acfca20197f9769a17120`
- [x] Verdict registrado on-chain via Validation Registry
  - TX: `0xabff70e40d61bd4f5322343f37d9a5dde7a4bfa254a7d1b752e62cc1544115f3`
- [x] Settlement TX confirmado on-chain
  - TX: `0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86`
- [x] agent_log.json criado (DevSpot Agent Manifest com 5 decisões, receipts, autonomy metrics)
- [x] agent.json + .well-known preenchidos

### GitHub e Deploy
- [x] Repo público criado: `github.com/Michsantozz/selantar`
- [x] Código pushado — commit `caa24be`
- [x] README profissional com TXs linkadas para Basescan
- [x] .gitignore limpo (sem credentials, sem arquivos internos)
- [x] CLAUDE.md sem referências suspeitas
- [x] Assets renomeados (old branding → selantar-logo)
- [x] Deploy Vercel: **https://selantar.vercel.app** ✅
- [x] Todas URLs atualizadas para `selantar.vercel.app`

---

## ❌ O QUE AINDA FALTA

### BLOQUEADOR CRÍTICO — sem isso as APIs não funcionam no Vercel
- [ ] **[HUMANO]** Configurar env vars no Vercel dashboard
  - `OPENROUTER_API_KEY`
  - `AGENT_PRIVATE_KEY`
  - `CLIENT_PRIVATE_KEY`
  - `SELANTAR_AGENT_ID=2122`
  - Após adicionar: fazer redeploy (ou usar `vercel redeploy`)

### HUMANO — tarefas operacionais
- [ ] Testar deploy live após env vars: landing → /mediation → selecionar cenário → mediação funciona
- [ ] **Gravar vídeo demo (3-5 min)** — É O QUE MAIS MOVE A AGULHA
  - 30s: Landing + value prop
  - 30s: Selecionar cenário "Clínica Suasuna"
  - 1min: Clara mediando ao vivo — tool cards aparecendo
  - 30s: Settlement TX → abrir Basescan com TX confirmada
  - 30s: Mostrar agent_log.json + reputação on-chain
- [ ] Upload vídeo YouTube (Unlisted) → pegar URL
- [ ] Criar post no Moltbook anunciando o projeto → pegar URL do post

### AGENTE — após ter vídeo + Moltbook URL
- [ ] Preparar conversationLog (baseado nos CONVERSATION-LOG*.md)
- [ ] Criar draft project no Synthesis API (POST /projects)
- [ ] Publicar projeto (POST /projects/:uuid/publish)
- [x] Atualizar tokenURI on-chain: `setAgentURI(2122, "https://selantar.vercel.app/agent.json")`
  - TX: `0xea3da51da249518babc341730363466a03cedf58b79709dfba3c99c755088c67`

---

## Track UUIDs para Submission

| Track | UUID | Prize |
|-------|------|-------|
| Agents With Receipts — ERC-8004 | `3bf41be958da497bbb69f1a150c76af9` | $4k / $3k / $1k |
| Let the Agent Cook | `10bd47fac07e4f85bda33ba482695b24` | $4k / $2.5k / $1.5k |
| Synthesis Open Track | `fdb76d08812b43f6a5f454744b66f590` | $25k pool |

---

## Submission Metadata (pronto para usar)

```json
{
  "agentFramework": "vercel-ai-sdk",
  "agentHarness": "claude-code",
  "model": "openai/gpt-5.4-mini",
  "skills": ["ai-sdk", "shadcn", "vercel-react-best-practices", "firecrawl", "ai-elements"],
  "tools": ["viem", "Next.js 16", "Tailwind CSS v4", "Framer Motion", "ERC-8004 Registries", "Base Sepolia"],
  "helpfulResources": [
    "https://sdk.vercel.ai/docs",
    "https://viem.sh/docs",
    "https://8004.org",
    "https://ui.shadcn.com"
  ],
  "helpfulSkills": [
    { "name": "ai-sdk", "reason": "Critical for ToolLoopAgent pattern, useChat transport migration, and avoiding all v5→v6 breaking changes" },
    { "name": "shadcn", "reason": "Rapid UI composition with semantic tokens — built entire mediation 3-panel layout in one session" },
    { "name": "ai-elements", "reason": "Chat interface patterns for streaming messages and tool card rendering" }
  ],
  "intention": "continuing",
  "intentionNotes": "Planning to expand to WhatsApp mediation channel and multi-language support post-hackathon"
}
```

---

## Próximos Passos — Ordem de Execução

```
1. HUMANO → adicionar env vars no Vercel
2. HUMANO → testar selantar.vercel.app ao vivo
3. HUMANO → gravar vídeo demo
4. HUMANO → postar no Moltbook
5. AGENTE → criar e publicar submission no Synthesis API
6. HUMANO → verificar submission publicada
```

**Deadline: 22 Mar 2026, 23:59 PST. Hoje é 19 Mar. Faltam 3 dias.**
