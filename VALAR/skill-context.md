# Contexto para Feature: F04 - Mediation Lifecycle State Machine
<!-- feature_id: F04 -->

## O que implementar

Criar `lib/case-lifecycle.ts` com a state machine do ciclo de vida de mediação.

**O arquivo deve conter:**

1. **Enum `CaseState`** com 11 estados:
   - `INTAKE`, `EVIDENCE_COLLECTION`, `ANALYSIS`, `NEGOTIATION`, `PROPOSAL`, `COUNTER_PROPOSAL`, `AGREEMENT`, `SETTLEMENT_PENDING`, `SETTLEMENT_EXECUTED`, `CLOSED`, `ABANDONED`

2. **Dict `VALID_TRANSITIONS`** mapeando `CaseState → CaseState[]` — lista de transições permitidas para cada estado.

3. **Classe `MediationCase`** com:
   - Campo `state: CaseState` (começa em `INTAKE`)
   - Campo `caseId: string`
   - Campo `history: Array<{ from: CaseState; to: CaseState; timestamp: string }>` — log interno simplificado de transições
   - Método `transition(newState: CaseState): void` — valida se a transição é permitida via `VALID_TRANSITIONS`, emite evento no `mediationLog` (F01), atualiza `state` e registra em `history`. Lança `Error` se transição inválida.
   - Método `canTransitionTo(newState: CaseState): boolean` — verifica sem executar (útil para guards)
   - Método `getState(): CaseState` — retorna o estado atual
   - Método `getHistory()` — retorna `history`

4. **Map global `caseStore`**: `Map<caseId, MediationCase>` — repositório singleton de todos os cases.

5. **Funções auxiliares**:
   - `createCase(caseId: string): MediationCase` — cria caso em `INTAKE`, salva em `caseStore`, emite `CASE_OPENED` no `mediationLog`
   - `getCase(caseId: string): MediationCase | undefined` — lookup no `caseStore`

6. **Guards nas 3 tools que têm restrições de estado**:
   - `lib/tools/analyze-evidence.ts`: checar se state é `EVIDENCE_COLLECTION` ou `ANALYSIS` antes de executar
   - `lib/tools/propose-settlement.ts`: checar se state é `NEGOTIATION` antes de executar
   - `lib/tools/execute-settlement.ts`: checar se state é `AGREEMENT` antes de executar

   **Comportamento do guard:** se o case não existir no `caseStore`, permitir execução (compatibilidade retroativa com sessions sem case). Se existir mas estado for inválido, retornar objeto de erro estruturado, NÃO lançar exceção.

**Transições permitidas explicitadas no plan.json:**
- Não pode ir para `PROPOSAL` sem completar `ANALYSIS` (ou seja: `ANALYSIS → PROPOSAL` é válido, mas não `NEGOTIATION → PROPOSAL` diretamente sem passar por `ANALYSIS`)
- Não pode `SETTLEMENT_EXECUTED` sem `AGREEMENT` (ou seja: `AGREEMENT → SETTLEMENT_PENDING → SETTLEMENT_EXECUTED`)

## Skills consultadas

- Código existente `lib/mediation-log.ts` — padrão de classe com singleton + `mediationLog.append()`
- Código existente `lib/circuit-breaker.ts` — padrão de class com singleton + guard `canExecute()` retornando objeto estruturado
- Código existente `lib/idempotency.ts` — padrão de Map como store em memória
- Código existente `lib/tools/analyze-evidence.ts` — padrão de `tool()` com `inputSchema`/`execute`, importação de `mediationLog`
- Código existente `lib/tools/execute-settlement.ts` — padrão de guard de retorno rápido antes de lógica (circuit breaker + idempotency)
- `vercel-react-best-practices/js-early-exit` — retornar objeto estruturado imediatamente em caso de guard falhar
- `vercel-react-best-practices/js-set-map-lookups` — usar `Map` para `caseStore` (O(1) lookup), nunca array

## APIs e imports a usar

```typescript
// lib/case-lifecycle.ts

// Dependência de F01 — import obrigatório
import { mediationLog, MediationEventType } from "@/lib/mediation-log";

// Nenhuma dependência externa nova — apenas types TypeScript nativos e Node.js

// Enum como string literal enum (TypeScript nativo)
export enum CaseState {
  INTAKE              = "INTAKE",
  EVIDENCE_COLLECTION = "EVIDENCE_COLLECTION",
  ANALYSIS            = "ANALYSIS",
  NEGOTIATION         = "NEGOTIATION",
  PROPOSAL            = "PROPOSAL",
  COUNTER_PROPOSAL    = "COUNTER_PROPOSAL",
  AGREEMENT           = "AGREEMENT",
  SETTLEMENT_PENDING  = "SETTLEMENT_PENDING",
  SETTLEMENT_EXECUTED = "SETTLEMENT_EXECUTED",
  CLOSED              = "CLOSED",
  ABANDONED           = "ABANDONED",
}

// Map de transições — extraído diretamente das constraints do plan.json
export const VALID_TRANSITIONS: Record<CaseState, CaseState[]> = { ... };

// Nos tools — import do caseStore
import { getCase, CaseState } from "@/lib/case-lifecycle";
```

```typescript
// Nos tools — pattern de guard (adaptado do circuitBreaker.canExecute())
const mediationCase = getCase(caseId);
if (mediationCase) {
  const allowed = [CaseState.EVIDENCE_COLLECTION, CaseState.ANALYSIS];
  if (!allowed.includes(mediationCase.getState())) {
    return {
      status:        "blocked",
      reason:        `analyzeEvidence requires state EVIDENCE_COLLECTION or ANALYSIS, current: ${mediationCase.getState()}`,
      currentState:  mediationCase.getState(),
      caseId,
      timestamp:     new Date().toISOString(),
    };
  }
}
```

## Pattern obrigatório

### Estrutura de VALID_TRANSITIONS

```typescript
// Copiado das constraints do plan.json para F04:
// "nao pode ir pra PROPOSAL sem ANALYSIS completa"
// "nao pode SETTLEMENT_EXECUTED sem AGREEMENT"
// O fluxo esperado é:
// INTAKE → EVIDENCE_COLLECTION → ANALYSIS → NEGOTIATION → PROPOSAL
//       → COUNTER_PROPOSAL → PROPOSAL (ciclo) → AGREEMENT
//       → SETTLEMENT_PENDING → SETTLEMENT_EXECUTED → CLOSED
// ABANDONED pode vir de qualquer estado (exceto CLOSED e SETTLEMENT_EXECUTED)

export const VALID_TRANSITIONS: Record<CaseState, CaseState[]> = {
  [CaseState.INTAKE]:              [CaseState.EVIDENCE_COLLECTION, CaseState.ABANDONED],
  [CaseState.EVIDENCE_COLLECTION]: [CaseState.ANALYSIS, CaseState.ABANDONED],
  [CaseState.ANALYSIS]:            [CaseState.NEGOTIATION, CaseState.ABANDONED],
  [CaseState.NEGOTIATION]:         [CaseState.PROPOSAL, CaseState.ABANDONED],
  [CaseState.PROPOSAL]:            [CaseState.COUNTER_PROPOSAL, CaseState.AGREEMENT, CaseState.ABANDONED],
  [CaseState.COUNTER_PROPOSAL]:    [CaseState.PROPOSAL, CaseState.AGREEMENT, CaseState.ABANDONED],
  [CaseState.AGREEMENT]:           [CaseState.SETTLEMENT_PENDING],
  [CaseState.SETTLEMENT_PENDING]:  [CaseState.SETTLEMENT_EXECUTED],
  [CaseState.SETTLEMENT_EXECUTED]: [CaseState.CLOSED],
  [CaseState.CLOSED]:              [],
  [CaseState.ABANDONED]:           [],
};
```

### Classe MediationCase — copiada do padrão de CircuitBreaker

```typescript
export interface StateTransition {
  from:      CaseState;
  to:        CaseState;
  timestamp: string;
}

export class MediationCase {
  private state:   CaseState      = CaseState.INTAKE;
  readonly caseId: string;
  private history: StateTransition[] = [];

  constructor(caseId: string) {
    this.caseId = caseId;
  }

  transition(newState: CaseState): void {
    const allowed = VALID_TRANSITIONS[this.state];
    if (!allowed.includes(newState)) {
      throw new Error(
        `Invalid transition: ${this.state} → ${newState}. Allowed: ${allowed.join(", ") || "none"}`
      );
    }

    const from = this.state;
    this.state = newState;
    this.history.push({ from, to: newState, timestamp: new Date().toISOString() });

    // Emitir evento no log (dependência F01)
    // Mapear para MediationEventType disponível — usar CASE_CLOSED para CLOSED,
    // SETTLEMENT_EXECUTED para SETTLEMENT_EXECUTED, e evento genérico para demais
    mediationLog.append(this.caseId, resolveEventType(newState), {
      from,
      to:        newState,
      timestamp: new Date().toISOString(),
    });
  }

  canTransitionTo(newState: CaseState): boolean {
    return VALID_TRANSITIONS[this.state].includes(newState);
  }

  getState(): CaseState {
    return this.state;
  }

  getHistory(): StateTransition[] {
    return [...this.history]; // retornar cópia — imutabilidade
  }
}
```

### Mapeamento de estados para MediationEventType (F01)

```typescript
// Os MediationEventType existentes em lib/mediation-log.ts são:
// CASE_OPENED | EVIDENCE_SUBMITTED | ANALYSIS_COMPLETE | SETTLEMENT_PROPOSED
// SETTLEMENT_ACCEPTED | SETTLEMENT_REJECTED | SETTLEMENT_EXECUTED
// VERDICT_REGISTERED | CASE_CLOSED | CIRCUIT_BREAKER_TRIGGERED

// F04 precisa emitir eventos de transição de estado.
// Como o MediationEventType não tem um tipo genérico "STATE_TRANSITION",
// duas opções são válidas:

// OPÇÃO A (preferida): Adicionar "STATE_TRANSITION" ao union type em mediation-log.ts
// (mesma estratégia usada em F02 que adicionou "CIRCUIT_BREAKER_TRIGGERED")
export type MediationEventType =
  | "CASE_OPENED"
  | "EVIDENCE_SUBMITTED"
  | "ANALYSIS_COMPLETE"
  | "SETTLEMENT_PROPOSED"
  | "SETTLEMENT_ACCEPTED"
  | "SETTLEMENT_REJECTED"
  | "SETTLEMENT_EXECUTED"
  | "VERDICT_REGISTERED"
  | "CASE_CLOSED"
  | "CIRCUIT_BREAKER_TRIGGERED"
  | "STATE_TRANSITION"; // ← adicionar esta linha em lib/mediation-log.ts

// OPÇÃO B (fallback): mapear cada estado para o MediationEventType mais próximo
// Usar OPÇÃO A — é mais correto e segue o precedente de F02.
```

### Funções auxiliares — copiado do padrão de mediationLog/circuitBreaker

```typescript
// Map singleton de cases — padrão js-set-map-lookups
const caseStore = new Map<string, MediationCase>();

export function createCase(caseId: string): MediationCase {
  const existing = caseStore.get(caseId);
  if (existing) return existing; // idempotente — retorna existente se já criado

  const mediationCase = new MediationCase(caseId);
  caseStore.set(caseId, mediationCase);

  // Emitir CASE_OPENED (F01)
  mediationLog.append(caseId, "CASE_OPENED", {
    initialState: CaseState.INTAKE,
    createdAt:    new Date().toISOString(),
  });

  return mediationCase;
}

export function getCase(caseId: string): MediationCase | undefined {
  // js-early-exit: retorno O(1) via Map
  return caseStore.get(caseId);
}

// Exportar o Map para uso em admin/metrics futuro (F13)
export { caseStore };
```

### Guard em analyze-evidence.ts — copiado do padrão circuitBreaker.canExecute()

```typescript
// lib/tools/analyze-evidence.ts
import { tool } from "ai";
import { z } from "zod";
import { mediationLog } from "@/lib/mediation-log";
import { getCase, CaseState } from "@/lib/case-lifecycle"; // ← adicionar import

export const analyzeEvidence = tool({
  description: "...", // manter descrição existente
  inputSchema: z.object({
    evidence:     z.string().describe("..."),
    perspective:  z.enum(["client", "developer", "neutral"]).describe("..."),
    evidenceType: z.enum(["contract", "communication", "deliverable", "payment", "other"]).describe("..."),
    caseId:       z.string().describe("Case reference ID for event logging"),
  }),
  execute: async ({ evidence, perspective, evidenceType, caseId }) => {
    // Guard de estado — PRIMEIRO bloco (padrão circuitBreaker.canExecute())
    const mediationCase = getCase(caseId);
    if (mediationCase) {
      const allowed = [CaseState.EVIDENCE_COLLECTION, CaseState.ANALYSIS];
      if (!allowed.includes(mediationCase.getState())) {
        return {
          status:       "blocked",
          reason:       `analyzeEvidence requires state EVIDENCE_COLLECTION or ANALYSIS, current: ${mediationCase.getState()}`,
          currentState: mediationCase.getState(),
          caseId,
          timestamp:    new Date().toISOString(),
        };
      }
    }

    // ... resto da lógica existente inalterada ...
  },
});
```

### Guard em propose-settlement.ts

```typescript
// lib/tools/propose-settlement.ts
import { getCase, CaseState } from "@/lib/case-lifecycle"; // ← adicionar import

// No início do execute:
const mediationCase = getCase(caseId);
if (mediationCase) {
  if (mediationCase.getState() !== CaseState.NEGOTIATION) {
    return {
      status:       "blocked",
      reason:       `proposeSettlement requires state NEGOTIATION, current: ${mediationCase.getState()}`,
      currentState: mediationCase.getState(),
      caseId,
      timestamp:    new Date().toISOString(),
    };
  }
}
```

### Guard em execute-settlement.ts

```typescript
// lib/tools/execute-settlement.ts
import { getCase, CaseState } from "@/lib/case-lifecycle"; // ← adicionar import

// execute: async ({ clientAmount, developerAmount, contractRef, reasoning }) => {
//   ORDEM DOS GUARDS (obrigatória):
//   1. circuitBreaker.canExecute()         ← já existe
//   2. idempotencyStore.checkIdempotency() ← já existe
//   3. STATE MACHINE GUARD ← adicionar aqui

const mediationCase = getCase(contractRef);
if (mediationCase) {
  if (mediationCase.getState() !== CaseState.AGREEMENT) {
    return {
      status:       "blocked",
      reason:       `executeSettlement requires state AGREEMENT, current: ${mediationCase.getState()}`,
      currentState: mediationCase.getState(),
      contractRef,
      timestamp:    new Date().toISOString(),
    };
  }
}
//   4. lógica de settlement (locus/erc7715/delegation/direct)  ← já existe
```

## O que NÃO fazer

```typescript
// ERRADO — usar array para caseStore (anti-pattern js-set-map-lookups)
const cases: MediationCase[] = [];
const found = cases.find(c => c.caseId === caseId); // O(n)
```
**Por que é errado:** `Array.find` é O(n). `caseStore` deve ser `Map<string, MediationCase>` para lookup O(1). Fonte: `vercel-react-best-practices/js-set-map-lookups`.

---

```typescript
// ERRADO — lançar exceção no guard da tool (interrompe o loop do ToolLoopAgent)
execute: async ({ caseId }) => {
  const c = getCase(caseId);
  if (c && c.getState() !== CaseState.NEGOTIATION) {
    throw new Error("Invalid state"); // ← NUNCA lançar exceção em tool.execute
  }
}
```
**Por que é errado:** o `ToolLoopAgent` do AI SDK não recupera de exceções em `tool.execute` — o agente para. O padrão do projeto (cf. `circuitBreaker.canExecute()` em `execute-settlement.ts`) é retornar um objeto `{ status: "blocked", reason: "..." }` e deixar o agente decidir o próximo passo. Fonte: código existente `lib/tools/execute-settlement.ts` linhas 20-29.

---

```typescript
// ERRADO — usar "parameters" no tool (API deprecated)
export const myTool = tool({
  parameters: z.object({ ... }), // ← deprecated
});
```
**Por que é errado:** a API correta é `inputSchema`. Fonte: `CLAUDE.md` do projeto, seção 9. Todos os tools existentes usam `inputSchema`.

---

```typescript
// ERRADO — permitir transições não listadas em VALID_TRANSITIONS sem erro
transition(newState: CaseState): void {
  this.state = newState; // sem validar
}
```
**Por que é errado:** a state machine perde todo o valor se não enforce as regras. `transition()` DEVE lançar `Error` se a transição não está em `VALID_TRANSITIONS[this.state]`. Fonte: descrição da feature no `plan.json` F04: "transition(newState) que valida transicao".

---

```typescript
// ERRADO — emitir evento APENAS em transições de estado (esquecer CASE_OPENED em createCase)
export function createCase(caseId: string): MediationCase {
  const c = new MediationCase(caseId);
  caseStore.set(caseId, c);
  return c; // ← sem mediationLog.append(caseId, "CASE_OPENED", ...)
}
```
**Por que é errado:** F04 depende de F01 (Event Sourcing). O plan.json F01 exige que "cada tool call deve emitir evento no log". A criação do case é o início da cadeia de eventos — CASO_OPENED deve ser emitido. Este anti-pattern foi a causa da reprovação da F01 no meta-log (linhas 6-13 do meta-log.json).

---

```typescript
// ERRADO — bloquear execução se caseId não existir no caseStore
execute: async ({ caseId }) => {
  const c = getCase(caseId);
  if (!c) {
    return { status: "blocked", reason: "Case not found" }; // ← bloqueia sessões antigas
  }
}
```
**Por que é errado:** o contexto do `skill-context.md` define que o guard só atua SE o case existir (compatibilidade retroativa). Sessions de mediação que não passaram pelo `createCase()` não devem ser bloqueadas — as tools devem continuar funcionando normalmente. O pattern correto é `if (mediationCase) { /* verificar estado */ }`.

---

```typescript
// ERRADO — não adicionar "STATE_TRANSITION" ao MediationEventType antes de usar
mediationLog.append(caseId, "STATE_TRANSITION", { ... });
// ↑ TypeScript vai reclamar se "STATE_TRANSITION" não for adicionado ao union type
```
**Por que é errado:** `MediationEventType` é um union type literal em `lib/mediation-log.ts`. Adicionar qualquer eventType não listado causa erro TypeScript. O Task Agent DEVE adicionar `"STATE_TRANSITION"` ao union type em `lib/mediation-log.ts` antes de usar (mesmo precedente de F02 que adicionou `"CIRCUIT_BREAKER_TRIGGERED"`).

## Padrão do projeto

### Singleton com Map — copiado de lib/idempotency.ts e lib/circuit-breaker.ts

```typescript
// lib/idempotency.ts linha 18:
private store = new Map<string, IdempotencyRecord>();

// lib/idempotency.ts linha 60-61:
export const idempotencyStore = new IdempotencyStore();

// lib/circuit-breaker.ts última linha:
export const circuitBreaker = new CircuitBreaker();

// lib/case-lifecycle.ts — deve seguir o mesmo padrão:
const caseStore = new Map<string, MediationCase>();
// (caseStore é exportado mas NÃO é envolto em uma classe — é um Map direto)
// (funções auxiliares createCase/getCase atuam como a interface pública)
```

### Guard de retorno rápido — copiado de lib/tools/execute-settlement.ts (linhas 19-29)

```typescript
// O padrão estabelecido pelo circuitBreaker em execute-settlement.ts:
execute: async ({ clientAmount, developerAmount, contractRef, reasoning }) => {
  // Circuit breaker guard — FIRST check before any transfer
  const check = circuitBreaker.canExecute();
  if (!check.allowed) {
    return {
      status:    "blocked",
      level:     check.level,
      reason:    check.reason,
      contractRef,
      timestamp: new Date().toISOString(),
    };
  }
  // ... continua ...
}

// F04 segue EXATAMENTE este pattern para os guards de estado nas tools.
// O campo "status: 'blocked'" é o padrão do projeto para guards que negam execução.
```

### Import de alias @/ — padrão do projeto

```typescript
// Todos os imports internos usam @/ (tsconfig paths)
import { mediationLog } from "@/lib/mediation-log";     // ✓ correto
import { circuitBreaker } from "@/lib/circuit-breaker"; // ✓ correto
import { getCase, CaseState } from "@/lib/case-lifecycle"; // ✓ a usar em F04

// Nunca usar caminhos relativos nas tools/agents
import { mediationLog } from "../mediation-log";        // ✗ errado (fora dos agents)
import { mediationLog } from "../../lib/mediation-log"; // ✗ errado
```

### Tool sem parâmetros novos em inputSchema para propose-settlement

`propose-settlement.ts` já tem `caseId` no `inputSchema` (adicionado em F01). O guard pode usar `caseId` diretamente — NÃO é necessário adicionar campos novos ao inputSchema. Mesma situação para `analyze-evidence.ts`.

`execute-settlement.ts` usa `contractRef` como `caseId` (lookup no caseStore deve usar `contractRef`).

## Checklist pro QA

- [ ] `lib/case-lifecycle.ts` existe com enum `CaseState` de exatamente 11 estados (INTAKE, EVIDENCE_COLLECTION, ANALYSIS, NEGOTIATION, PROPOSAL, COUNTER_PROPOSAL, AGREEMENT, SETTLEMENT_PENDING, SETTLEMENT_EXECUTED, CLOSED, ABANDONED)?
- [ ] `VALID_TRANSITIONS` é `Record<CaseState, CaseState[]>` e AGREEMENT → SETTLEMENT_PENDING está listado (não AGREEMENT → SETTLEMENT_EXECUTED diretamente)?
- [ ] `transition()` lança `Error` se transição inválida (não retorna silenciosamente)?
- [ ] `transition()` chama `mediationLog.append()` com `"STATE_TRANSITION"` antes de atualizar `this.state`?
- [ ] `"STATE_TRANSITION"` foi adicionado ao union type `MediationEventType` em `lib/mediation-log.ts`?
- [ ] `createCase()` chama `mediationLog.append(caseId, "CASE_OPENED", ...)` ao criar novo case?
- [ ] `createCase()` é idempotente — retorna case existente se `caseId` já está no `caseStore`?
- [ ] `caseStore` é `Map<string, MediationCase>` (não array)?
- [ ] Guard em `analyze-evidence.ts` usa `if (mediationCase) { ... }` (não bloqueia se case não existe)?
- [ ] Guard em `analyze-evidence.ts` permite estados `EVIDENCE_COLLECTION` E `ANALYSIS` (não apenas um)?
- [ ] Guard em `propose-settlement.ts` permite apenas `NEGOTIATION`?
- [ ] Guard em `execute-settlement.ts` permite apenas `AGREEMENT`?
- [ ] Guard em `execute-settlement.ts` é o 3º guard (depois de circuitBreaker e idempotency)?
- [ ] Guards retornam `{ status: "blocked", reason: "...", currentState: "...", ... }` (objeto estruturado, não exceção)?
- [ ] `canTransitionTo()` existe e retorna `boolean` sem modificar estado?
- [ ] `getHistory()` retorna cópia do array (não referência mutável)?
- [ ] Nenhum `parameters:` nos tools modificados — sempre `inputSchema:`?
- [ ] Build passa sem erros TypeScript novos?

## Lacunas

**Skills de índice não instaladas:** o projeto não possui skills `*-index/SKILL.md`. O contexto foi montado inteiramente a partir do código existente e das constraints do `plan.json`. Não há skill externa cobrindo "state machine em TypeScript" instalada — o pattern foi derivado do código existente.

**Mapeamento STATE_TRANSITION → MediationEventType:** o `MediationEventType` existente não tem um tipo genérico para transições de estado. A solução recomendada (Opção A) é adicionar `"STATE_TRANSITION"` ao union — o mesmo precedente de F02 que adicionou `"CIRCUIT_BREAKER_TRIGGERED"`. Se o Task Agent preferir não modificar `mediation-log.ts`, pode usar `"EVIDENCE_SUBMITTED"` para EVIDENCE_COLLECTION, `"ANALYSIS_COMPLETE"` para ANALYSIS etc. — mas Opção A é mais correta e rastreável.

**Persistência:** `caseStore` é em memória (Map). Estado perdido em restart do servidor. Aceitável para demo do hackathon — F16/F18 (Postgres) cobrirão persistência futura.

**Tools `post-feedback.ts` e `register-verdict.ts`:** o plan.json F04 menciona apenas 5 tools mas não especifica guards para post-feedback (CASE_CLOSED state) e register-verdict (VERDICT_REGISTERED state). Este skill-context não inclui guards para essas duas tools — se o Task Agent julgar necessário, deve parar e pedir esclarecimento, não inventar.

**Integração com `mediator-agent.ts`:** o agente não precisa ser modificado para F04 — os guards ficam nas tools individuais. O `ToolLoopAgent` chama as tools, as tools verificam o estado internamente.
