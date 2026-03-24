# Code Quality Audit — Selantar

> Análise completa de qualidade, reuso, e eficiência do código.
> Branch: `hedera-apex` | Data: 23 de março de 2026
> Fontes: ai-sdk skill, vercel-react-best-practices skill, simplify skill

---

## Metodologia

Três agentes de review rodaram em paralelo analisando o diff `main...hedera-apex` (43 arquivos, +397/-13882 linhas):
1. **Code Reuse Review** — busca por duplicação e utilidades existentes não usadas
2. **Code Quality Review** — padrões hacky, abstrações quebradas, state redundante
3. **Efficiency Review** — performance, concorrência, hot paths, memory leaks

Cada finding cita arquivo, linha, e a regra/skill que fundamenta a conclusão.

---

## CRÍTICO (Fix now)

### 1. Wallet Client recriado a cada tool call

**Arquivos:** `lib/wallet.ts:7-52`, `lib/tools/execute-settlement.ts:17-18`, `lib/tools/post-feedback.ts:21`, `lib/tools/register-verdict.ts:20`

**Problema:** Cada tool call (`executeSettlement`, `postFeedback`, `registerVerdict`) chama `getWalletClient()` que re-deriva a private key criptograficamente e cria novo HTTP transport. São 5+ recriações por mediação.

**Fonte:** `vercel-react-best-practices/rules/server-cache-lru.md` — "Use LRU cache for cross-request caching"

**Fix:** Cachear clients no module level:
```typescript
let _walletClient: ReturnType<typeof createWalletClient> | null = null;
export function getWalletClient() {
  if (!_walletClient) {
    // ... derivação + criação
    _walletClient = createWalletClient({...});
  }
  return _walletClient;
}
```

---

### 2. PublicClient duplicado em 3 arquivos ERC-8004

**Arquivos:** `lib/erc8004/identity.ts:29-32`, `lib/erc8004/reputation.ts:60-62`, `lib/erc8004/validation.ts:47-49`

**Problema:** Cada helper cria `createPublicClient()` via `await import("viem")` em vez de usar `getPublicClient()` que já existe em `lib/wallet.ts:26-31`.

**Fonte:** Simplify skill — "Search for existing utilities that could replace newly written code"

**Fix:** Substituir por `import { getPublicClient } from "@/lib/wallet"` nos 3 arquivos.

---

### 3. Explorer URL hardcoded em 11 lugares

**Arquivos:** `lib/tools/execute-settlement.ts:154,201,233,246`, `lib/tools/post-feedback.ts:41,52`, `lib/tools/register-verdict.ts:43,54`, `lib/tools/notify-agent.ts:55`, `app/api/create-escrow/route.ts:84`, `app/api/delegation/erc7715/route.ts:36`

**Problema:** `https://hashscan.io/testnet/transaction/${hash}` repetido 11 vezes. Se mudar pra mainnet ou outro explorer, precisa editar 11 arquivos.

**Fonte:** Simplify skill — "Flag any inline logic that could use an existing utility"

**Fix:** Criar `lib/hedera/explorer.ts`:
```typescript
import { hederaTestnet } from "./chains";
export const getExplorerTxUrl = (hash: string) =>
  `${hederaTestnet.blockExplorers.default.url}/transaction/${hash}`;
```

---

### 4. Label "BaseScan" na navbar após migração

**Arquivo:** `components/navbar.tsx:96,158`

**Problema:** Explorer URL aponta pra HashScan (correto) mas o label ainda diz "BaseScan". Judge vai ver isso.

**Fonte:** Code Quality Review — "Migration Artifact"

**Fix:** Trocar `BaseScan` → `HashScan`.

---

## ALTO (Fix before submission)

### 5. Settlement payments sequenciais (missed concurrency)

**Arquivo:** `lib/tools/execute-settlement.ts:21-116`

**Problema:** No path Locus, os pagamentos client e dev são feitos sequencialmente:
```typescript
const clientRes = await fetch(...);  // espera
const devRes = await fetch(...);     // espera de novo
```

**Fonte:** `vercel-react-best-practices/rules/async-parallel.md` — "Use Promise.all() for independent operations"

**Fix:** `const [clientRes, devRes] = await Promise.all([fetch(...), fetch(...)]);`

---

### 6. Dynamic imports em hot paths

**Arquivos:** `lib/tools/execute-settlement.ts:121-123,165-166`, `lib/erc8004/reputation.ts:60`, `lib/erc8004/validation.ts:47`

**Problema:** `await import("viem")` e `await import("@/lib/delegation/erc7715")` dentro de funções que rodam a cada request. Overhead de parsing + instantiation a cada chamada.

**Fonte:** `vercel-react-best-practices/rules/bundle-dynamic-imports.md` — Dynamic imports são pra lazy-load componentes UI pesados, não pra módulos backend leves

**Fix:** Mover pra top-level imports. Usar lógica condicional em vez de import condicional.

---

### 7. Agent ID hardcoded "2122" como fallback em 3 arquivos

**Arquivos:** `lib/tools/post-feedback.ts:22`, `lib/tools/register-verdict.ts:21`, `app/api/create-escrow/route.ts:29`

**Problema:** `BigInt(process.env.SELANTAR_AGENT_ID ?? "2122")` — o fallback "2122" é o ID da Base Sepolia, não da Hedera (que é 36).

**Fonte:** Code Reuse Review — "Duplicate Agent ID Reference"

**Fix:** Centralizar em `lib/constants.ts` e corrigir fallback pra `"36"`.

---

### 8. `as any` cast no x402 network type

**Arquivo:** `app/api/mediate/route.ts:128`

**Problema:** `network: "hedera-testnet" as any` — esconde erro de tipo.

**Fonte:** Code Quality Review — "Type Cast Escape Hatch"

**Fix:** Aceitar como hack temporário de hackathon, mas documentar com comentário `// TODO: add hedera-testnet to x402 network types`.

---

## MÉDIO (Nice to fix)

### 9. State redundante na mediação

**Arquivo:** `app/mediation/page.tsx:55-60,313-347`

**Problema:** Três camadas de state pra mensagens: `messages` (useChat), `clientMessages` (useState), `displayMessages` (computed). O `displayMessages` é reconstruído do zero em cada render.

**Fonte:** `vercel-react-best-practices/rules/rerender-derived-state.md` — "Derive state during render, not effects"

**Fix:** Usar `useMemo` pro `displayMessages` (já usa parcialmente, mas a lógica de interleaving é complexa demais).

---

### 10. setTimeout 1500ms pra client response

**Arquivo:** `app/mediation/page.tsx:179-246`

**Problema:** Delay fixo de 1500ms antes de gerar resposta do cliente. Não garante que a resposta do mediator terminou.

**Fonte:** Code Quality Review — "Hacky setTimeout Pattern"

**Fix:** Substituir por callback após `isLoading` transicionar pra `false`.

---

### 11. Wallet connection duplicada em 3 componentes

**Arquivos:** `components/navbar.tsx:49-58`, `app/mediation/_components/settlement-modal.tsx:44-82`, `app/mediation/page.tsx:103-118`

**Problema:** Mesma lógica de `window.ethereum.request({ method: "eth_requestAccounts" })` copy-pasted com variações mínimas.

**Fonte:** Simplify skill — "Copy-paste with slight variation"

**Fix:** Extrair pra `lib/wallet-browser.ts` com `requestWallet()` e `personalSign()`.

---

### 12. SSE parsing com string concatenation O(n²)

**Arquivo:** `app/mediation/page.tsx:206-218`

**Problema:** `clientText += data.delta` em loop — concatenação de string é O(n²).

**Fonte:** `vercel-react-best-practices/rules/js-combine-iterations.md`

**Fix:** Coletar chunks em array, `.join("")` no final.

---

### 13. Settlement data scan O(n²)

**Arquivo:** `app/mediation/page.tsx:79-100`

**Problema:** `useMemo` percorre TODAS as mensagens buscando `proposeSettlement`. A cada nova mensagem, re-scanneia tudo desde o início.

**Fonte:** `vercel-react-best-practices/rules/js-early-exit.md` — "Return early from functions"

**Fix:** Scan reverso — buscar de trás pra frente e retornar no primeiro match.

---

### 14. ValidationRegistry endereço zero na Hedera

**Arquivo:** `lib/erc8004/addresses.ts:13-14`

**Problema:** `validationRegistry: "0x0000...0000"` — contrato não deployado na Hedera. Calls vão falhar silenciosamente.

**Fonte:** Code Quality Review — "TODO Address (Zero)"

**Fix:** Documentar como limitação conhecida no README. O `create-escrow` já tem try/catch.

---

## BAIXO (Polish)

### 15. Imports não usados

**Arquivo:** `app/mediation/_components/mediation-chat.tsx:14-23`

**Problema:** `MessageResponse`, `ChainOfThoughtStep` importados mas não usados.

**Fix:** Remover imports mortos.

---

### 16. Typewriter state thrashing

**Arquivo:** `app/contract/sentinel-plan/_components/deploy-cinematic.tsx:70-85`

**Problema:** `setInterval` a cada 18ms gerando setState → re-render por caractere. 4 instâncias simultâneas.

**Fonte:** `vercel-react-best-practices/rules/rerender-transitions.md`

**Fix:** Considerar CSS `@keyframes` ou `requestAnimationFrame` em vez de setState por frame.

---

### 17. Cores hardcoded (oklch) em vez de tokens semânticos

**Arquivos:** `app/contract/sentinel-plan/page.tsx`, `app/contract/sentinel-flow/page.tsx`

**Problema:** Cores inline como `oklch(0.72 0.19 154)`, `#22c55e`, `#ef4444` em vez de tokens Tailwind.

**Fonte:** `CLAUDE.md` seção 9 — "Nunca cores cruas, usar tokens semânticos"

**Fix:** Substituir por `bg-emerald`, `bg-destructive`, `text-accent`.

---

## Resumo

| Severidade | Total | Fix rápido? |
|-----------|-------|------------|
| CRÍTICO | 4 | Sim (30 min total) |
| ALTO | 4 | Sim (20 min total) |
| MÉDIO | 6 | Parcial (1-2h) |
| BAIXO | 3 | Sim (10 min) |

### Top 5 fixes por impacto/esforço:

1. **Label "BaseScan" → "HashScan"** na navbar (2 min, judge vai ver)
2. **Agent ID fallback "2122" → "36"** (5 min, evita bug real)
3. **Cachear wallet clients** no module level (10 min, performance)
4. **Centralizar explorer URL** num helper (15 min, manutenibilidade)
5. **Substituir publicClient duplicado** por getPublicClient() (10 min, DRY)
