import { eq } from "drizzle-orm";
import { db, mediationEvents, cases, settlements, idempotencyKeys } from "@/lib/db";

async function main() {
  const CASE_ID = "test-pg-qa-" + Date.now();

  // --- mediation_events ---
  const [evt] = await db.insert(mediationEvents).values({
    seq: 0, caseId: CASE_ID, eventType: "CASE_OPENED",
    timestamp: new Date().toISOString(),
    payload: { partyA: "0xaaa", partyB: "0xbbb" },
    prevHash: "0".repeat(64), hash: "a".repeat(64),
  }).returning();
  console.log("✓ mediation_events insert id:", evt.id);

  const evtRows = await db.select().from(mediationEvents).where(eq(mediationEvents.caseId, CASE_ID));
  console.log("✓ mediation_events select:", evtRows.length, "row(s), eventType:", evtRows[0]?.eventType);

  // --- cases ---
  const [c] = await db.insert(cases).values({
    caseId: CASE_ID, state: "INTAKE", history: [],
  }).returning();
  console.log("✓ cases insert id:", c.id, "state:", c.state);

  const [cUpdated] = await db.update(cases)
    .set({ state: "EVIDENCE_COLLECTION" })
    .where(eq(cases.caseId, CASE_ID))
    .returning();
  console.log("✓ cases update state ->", cUpdated.state);

  // --- idempotency_keys ---
  const [ik] = await db.insert(idempotencyKeys).values({
    key: "test-idem-" + Date.now(),
    result: { cached: true },
  }).returning();
  console.log("✓ idempotency_keys insert id:", ik.id, "deletedAt:", ik.deletedAt);

  // --- settlements ---
  const [s] = await db.insert(settlements).values({
    caseId: CASE_ID,
    intent: { clientAmount: "500", developerAmount: "0", reasoning: "qa test" },
    status: "pending",
  }).returning();
  console.log("✓ settlements insert id:", s.id, "status:", s.status);

  const [sUpdated] = await db.update(settlements)
    .set({ status: "completed", txHash: "0xdeadbeef", completedAt: new Date() })
    .where(eq(settlements.id, s.id))
    .returning();
  console.log("✓ settlements update status ->", sUpdated.status, "txHash:", sUpdated.txHash);

  // --- Cleanup ---
  await db.delete(mediationEvents).where(eq(mediationEvents.caseId, CASE_ID));
  await db.delete(cases).where(eq(cases.caseId, CASE_ID));
  await db.delete(settlements).where(eq(settlements.caseId, CASE_ID));
  await db.delete(idempotencyKeys).where(eq(idempotencyKeys.id, ik.id));
  console.log("✓ cleanup ok");
  console.log("\n✅ Postgres: todas as tabelas funcionando.");
}

main().catch(e => { console.error("✗ FALHOU:", e.message); process.exit(1); });
