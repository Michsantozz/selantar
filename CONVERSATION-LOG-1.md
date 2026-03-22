# Selantar — Conversation Log Session 1

> Human-agent collaboration log for The Synthesis hackathon submission.
> Project: Selantar — Autonomous AI mediator for B2B contract disputes with on-chain ERC-8004 settlements.
> Sessions: 1 (curated)

---

## Session 1 — Project Planning & Architecture

### 🤖 Claude

Analisando a estrutura do projeto e o Guia ERC-8004 em paralelo para montar o plano de arquitetura.

---

### 🤖 Claude

Agora tenho toda a informação necessária. Vou montar o plano de análise.

---

### 🤖 Claude

Plano atualizado com todas as decisões. Resumo das decisões arquiteturais:

- **OpenClaw removido** → AI SDK v6 direto (`@ai-sdk/anthropic`)
- **SURGE removido** → viem direto para ERC-20 transfers + ERC-8004
- **Escopo reduzido** → 3 páginas (Landing, Forge, Mediation)
- **Páginas componentizadas** → `_components/` locais para evitar arquivos gigantes
- **ERC-8004 como módulo isolado** em `lib/erc8004/`

---

## Session 1 — Skills Analysis

### 🧑 Human

que skills vc tem?

---

### 🤖 Claude

Aqui estão as skills disponíveis:

| Skill | O que faz |
|---|---|
| **shadcn** | Gerencia componentes shadcn/ui — adicionar, buscar, corrigir, compor UI |
| **claude-api** | Ajuda a construir apps com Claude API / Anthropic SDK |
| **firecrawl** | Web scraping, busca na web, crawling de sites e automação de browser |
| **vercel-react-best-practices** | Otimização de performance React/Next.js (guidelines da Vercel) |
| **ai-sdk** | AI SDK v6 — ToolLoopAgent, streamText, useChat, tool calling |
| **frontend-design** | Interfaces production-grade com alta qualidade visual |

---

### 🧑 Human

DA uma aprofundada nisso > ai-sdk, FAAÇA FETCH de todos a documentação pra vc realmente entender como funciona

---

### 🤖 Claude

*[Tool: Read → `~/.openclaw/.agents/skills/ai-sdk/SKILL.md`]*

*[Tool: Read → `~/.openclaw/.agents/skills/ai-sdk/references/common-errors.md`]*

*[Tool: Read → `~/.openclaw/.agents/skills/ai-sdk/references/type-safe-agents.md`]*

---

### 🤖 Claude

Análise completa. Aqui está o resumo do **AI SDK v6** (Vercel):

---

## AI SDK v6 — Resumo Completo

### O que é
Framework unificado da Vercel para construir apps com IA. Suporta **múltiplos providers** (Anthropic, OpenAI, Google) com uma única API.

### Componentes Principais

| Componente | O que faz |
|---|---|
| **`ToolLoopAgent`** | Agente autônomo com loop de ferramentas (raciocina → usa tool → raciocina → repete) |
| **`generateText`** | Gera texto em uma única chamada |
| **`streamText`** | Streaming de texto em tempo real |
| **`useChat`** | React hook para chat UI (frontend) |
| **`tool()`** | Define ferramentas type-safe com Zod |
| **AI Gateway** | Acessa qualquer provider via string: `"anthropic/claude-sonnet-4-6"` |

### Por que isso importa para o Selantar

| Aspecto | @anthropic-ai/sdk (rejeitado) | AI SDK v6 (escolhido) |
|---|---|---|
| **Streaming** | Manual com ReadableStream | `streamText()` + `toUIMessageStreamResponse()` built-in |
| **Chat UI** | Implementar do zero | `useChat()` hook pronto |
| **Multi-step agent** | Implementar loop manual | `ToolLoopAgent` pronto |
| **Tools/Ferramentas** | JSON schema manual | `tool()` com Zod, type-safe |
| **Next.js integration** | Manual | Nativo (API routes + React hooks) |
| **Dual-agent** | Orquestrar manualmente | `ToolLoopAgent` com subagents |
| **Provider lock-in** | Só Anthropic | Qualquer provider via Gateway |

### Como fica o Selantar com AI SDK

```typescript
// lib/agents/mediator-agent.ts
import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export const mediatorAgent = new ToolLoopAgent({
  model: anthropic('claude-sonnet-4-6'),
  instructions: 'You are Selantar, an autonomous AI mediator for B2B contract disputes...',
  tools: {
    analyzeEvidence: tool({
      description: 'Analyze contract evidence',
      inputSchema: z.object({ evidence: z.string() }),
      execute: async ({ evidence }) => { /* ... */ },
    }),
    proposeSettlement: tool({
      description: 'Propose settlement terms',
      inputSchema: z.object({ amount: z.number(), rationale: z.string() }),
      execute: async ({ amount, rationale }) => { /* ... */ },
    }),
    executeSettlement: tool({
      description: 'Execute ERC-20 transfer on-chain',
      inputSchema: z.object({ recipient: z.string(), amount: z.number() }),
      execute: async ({ recipient, amount }) => { /* ERC-20 via viem */ },
    }),
  },
  stopWhen: stepCountIs(10),
});
```

---

### 🧑 Human

vercel-react-best-practices

da um aprofundada nesse pra o que ela ensina

---

### 🤖 Claude

## Vercel React Best Practices — 58 Regras em 8 Categorias

Guia de performance mantido pela engenharia da Vercel.

### Regras mais relevantes para o Selantar

#### CRITICAL

| Regra | O que ensina | Onde aplicar |
|---|---|---|
| **`async-parallel`** | Usar `Promise.all()` para operações independentes (2-10x mais rápido) | API routes: buscar dados do contrato + evidências em paralelo |
| **`async-suspense-boundaries`** | Usar `<Suspense>` para streaming | Forge (análise de risco) e Mediation (chat loading) |
| **`bundle-barrel-imports`** | Importar direto do arquivo, não de barrel files | Todos os imports de `lucide-react`, `@radix-ui` |
| **`bundle-dynamic-imports`** | `next/dynamic` para componentes pesados | Framer Motion, componentes de chat |

---

### 🧑 Human

Acha isso essencial pro projeto?

---

### 🤖 Claude

Não. Para um hackathon com deadline dia 22 de março (4 dias), **performance optimization é a última prioridade**.

O que importa agora:
1. **Funcionar** — mediação end-to-end com settlement on-chain
2. **ERC-8004 integrado** — o diferencial competitivo
3. **Visual impactante** — juízes interagem entre 23-25/março

As regras CRITICAL como `Promise.all()` e `Suspense` são bom senso que já aplicamos naturalmente. As outras 50+ regras são micro-otimizações que só fazem sentido em produto em produção com milhares de usuários.

**Veredicto: útil pra consulta pontual, mas não essencial. Não vale gastar tempo nisso agora.**

---

## Session 1 — Synthesis Hackathon Research

### 🧑 Human

https://synthesis.md/

baixa pra vc e faz de outras páginas se for necessário

---

### 🤖 Claude

*[Tool: Bash → `firecrawl scrape "https://synthesis.md/" -o .firecrawl/synthesis-main.md`]*

*[Tool: Bash → `firecrawl scrape "https://synthesis.md/hack" -o .firecrawl/synthesis-hack.md`]*

*[Tool: Bash → `firecrawl scrape "https://synthesis.md/skill.md" -o .firecrawl/synthesis-skill.md`]*

*[Tool: Bash → `firecrawl scrape "https://synthesis.md/themes.md" -o .firecrawl/synthesis-themes.md`]*

---

### 🤖 Claude

## Synthesis Hackathon — Resumo Estratégico

### O que é
Hackathon online de 14 dias onde **AI agents e humanos constroem juntos**. Julgado por **agentes IA + humanos**. ERC-8004 é central — o registro cria identidade on-chain na **Base Mainnet**.

### Timeline crítica
| Data | Evento |
|---|---|
| 13 Mar | Building começou |
| **18 Mar** | Agentic judging feedback |
| **22 Mar** | Building fecha — submissão final |
| 25 Mar | Winners anunciados |

### Tracks relevantes para o Selantar

| Track | Prêmios | Por que encaixa |
|---|---|---|
| **Agents With Receipts — ERC-8004** (Protocol Labs) | 1o: $4k, 2o: $3k, 3o: $1k | Exatamente o que estamos construindo — agente com ERC-8004, verifiability on-chain |
| **Let the Agent Cook — No Humans Required** (Protocol Labs) | 1o: $4k, 2o: $2.5k, 3o: $1.5k | Agente autônomo end-to-end: discover → plan → execute → verify |
| **Synthesis Open Track** | $25k+ | Pool comunitário geral |

### Regras que impactam o projeto
1. **Ship something that works** — demos, protótipos, contratos deployados. Ideias não ganham.
2. **Agent deve ser participante real** — não wrapper. Contribuição significativa.
3. **Tudo on-chain conta** — mais artefatos on-chain = submissão mais forte.
4. **Open source obrigatório** — código público até deadline.
5. **Documentar o processo** — `conversationLog` com a colaboração humano-agente.

---

## Session — Agent Registration

### 🧑 Human

OK, vamos fazer inscrição então

---

### 🤖 Claude

*[Tool: Bash → `curl -X POST https://synthesis.devfolio.co/register ...`]*

---

### 🤖 Claude

Registro feito com sucesso! O Selantar agora tem identidade on-chain via ERC-8004 na Base Mainnet.

Credenciais salvas em `.env.local`:
- `SYNTHESIS_API_KEY`
- `PARTICIPANT_ID`
- `TEAM_ID`

Duas coisas importantes:

1. **Entre no grupo do Telegram** para ficar por dentro das atualizações: https://nsb.dev/synthesis-updates

2. **Deadline**: 22 de março de 2026, 23:59 PST — temos 4 dias.

---

## Session — ERC-8004 Implementation Planning

### 🧑 Human

Sobre o protocolo de 8004 falta oque?

---

### 🤖 Claude

*[Tool: Read → `Guia ERC-8004`]*

---

### 🤖 Claude

Aqui o status do ERC-8004 para o Selantar:

### O que já temos
| Item | Status |
|---|---|
| **Identity on-chain (Synthesis)** | ✅ Feito — registro automático via Synthesis, tx confirmada na Base Mainnet |
| **API Key + IDs** | ✅ Salvos no `.env.local` |

### O que falta implementar

| # | Item | Prioridade | Descrição |
|---|---|---|---|
| 1 | **`agent.json`** | 🔴 Obrigatório | Arquivo de identidade ERC-8004 servido em `/public/agent.json` |
| 2 | **Endereços dos contratos** | 🔴 Obrigatório | 3 registries na Base — salvar em `lib/erc8004/addresses.ts` |
| 3 | **Interfaces Solidity** | 🔴 Obrigatório | 3 arquivos `.sol` em `contracts/interfaces/` |
| 4 | **`lib/erc8004/identity.ts`** | 🔴 Obrigatório | Helper `registerAgent()` — registro próprio no Identity Registry |
| 5 | **`scripts/register-agent.ts`** | 🔴 Obrigatório | Script one-time pra rodar o registro |
| 6 | **`lib/erc8004/reputation.ts`** | 🟡 Recomendado | `postMediationFeedback()` — posta feedback on-chain após cada mediação |
| 7 | **`lib/erc8004/validation.ts`** | 🟢 Bonus | `registerVerdictAsValidation()` — registra veredito como evidência verificável |
| 8 | **`AGENTS.md`** | 🔴 Obrigatório | Soul do Selantar com identity ERC-8004 |

### Blocker principal

Os **endereços dos contratos** na Base (item 2) — sem eles nada on-chain funciona.

---

### 🧑 Human

Qual nível de dificuldade disso?

---

### 🤖 Claude

**Baixo.** A maior parte é copiar/colar do guia que já temos.

| Item | Dificuldade | Por que |
|---|---|---|
| `agent.json` | Trivial | JSON estático, já está pronto no guia |
| Interfaces Solidity | Trivial | Copiar 3 arquivos do guia, não precisa deployar nada |
| `addresses.ts` | Fácil | Pesquisar e colar 6 endereços |
| `identity.ts` | Fácil | ~30 linhas, chamada viem padrão |
| `reputation.ts` | Fácil | ~40 linhas, mesma lógica |
| `validation.ts` | Fácil | ~30 linhas, mesma lógica |
| `register-agent.ts` | Fácil | Script de 15 linhas, roda uma vez |
| `AGENTS.md` | Trivial | Markdown descritivo |

O único ponto de atenção real: **ter uma wallet com ETH na Base pra pagar gas** das transações on-chain.

O que dá mais trabalho no projeto não é o ERC-8004 — é o **app em si** (Forge, Mediation, AI agent, UI). O ERC-8004 é a cereja do bolo.

---

### 🧑 Human

O que tem atrapalha ou muda sendo projeto Next.js?

---

### 🤖 Claude

Nada. Encaixa perfeitamente.

- **`agent.json`** → vai em `/public/agent.json` — Next.js serve automaticamente
- **`.well-known/`** → vai em `/public/.well-known/` — servido estaticamente
- **Interfaces Solidity** → `/contracts/interfaces/` — ficam no repo como referência, Next.js ignora
- **`lib/erc8004/`** → importado normalmente nos API routes (`app/api/`) — roda server-side
- **`scripts/register-agent.ts`** → roda com `npx tsx`, independente do Next.js
- **viem** → funciona 100% em server-side (API routes / server actions)

A única regra: **as chamadas on-chain (viem + private key) só rodam no servidor** — nunca no client. Mas como já estamos usando API routes pra tudo, isso já é o padrão natural.

---

### 🧑 Human

OK, vamos resolver essa questão do 8004? Ou acha que não deve prioridade agora? Eu quero apenas ver isso validado depois fazemos ajustes finos

---

### 🤖 Claude

Faz sentido validar primeiro. O blocker são os endereços dos contratos — vou pesquisar agora.

*[Tool: Agent — pesquisar endereços ERC-8004 na Base Mainnet e Base Sepolia]*

---

### 🧑 Human

VAMOS Fazer outro, seu contexto já esta estourado, CRIE UM documento em formato de prompt, para próximo 'VC' seu próximo eu, executar, ele precisa entender o que fizemos e entender o que executar

---

### 🤖 Claude

*[Tool: Write → `HANDOFF.md`]*

Pronto. O HANDOFF.md tem tudo:

- **O que já fizemos** e decisões tomadas
- **Decisões técnicas** confirmadas (AI SDK, viem, ERC-8004)
- **O que falta** em ordem (Fase 0-5)
- **Estrutura final** do projeto
- **Padrões AI SDK v6** pra não errar
- **Prizes** que estamos mirando
- **Instrução clara**: começa pelo ERC-8004, pesquisa endereços, depois scaffold

---
