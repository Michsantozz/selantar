import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// F01 — Event log durável
export const mediationEvents = pgTable(
  "mediation_events",
  {
    id:        integer("id").primaryKey().generatedAlwaysAsIdentity(),
    seq:       integer("seq").notNull(),
    caseId:    varchar("case_id", { length: 64 }).notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    timestamp: varchar("timestamp", { length: 40 }).notNull(),
    payload:   jsonb("payload").notNull().$type<Record<string, unknown>>(),
    prevHash:  varchar("prev_hash", { length: 64 }).notNull(),
    hash:      varchar("hash", { length: 64 }).notNull(),
  },
  (t) => [
    index("idx_mediation_events_case_id").on(t.caseId),
    index("idx_mediation_events_seq").on(t.caseId, t.seq),
  ]
);

// F04 — State machine cases
export const cases = pgTable(
  "cases",
  {
    id:        integer("id").primaryKey().generatedAlwaysAsIdentity(),
    caseId:    varchar("case_id", { length: 64 }).notNull().unique(),
    state:     varchar("state", { length: 32 }).notNull().default("INTAKE"),
    history:   jsonb("history").notNull().$type<Array<{ from: string; to: string; timestamp: string }>>().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_cases_case_id").on(t.caseId),
    index("idx_cases_state").on(t.state),
  ]
);

// F17 — Settlement outbox
export const settlements = pgTable(
  "settlements",
  {
    id:          integer("id").primaryKey().generatedAlwaysAsIdentity(),
    caseId:      varchar("case_id", { length: 64 }).notNull(),
    intent:      jsonb("intent").notNull().$type<Record<string, unknown>>(),
    status:      varchar("status", { length: 16 }).notNull().default("pending"),
    txHash:      varchar("tx_hash", { length: 128 }),
    error:       text("error"),
    createdAt:   timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [
    index("idx_settlements_case_id").on(t.caseId),
    index("idx_settlements_status").on(t.status),
  ]
);

// F03 — Idempotency keys com TTL
export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    id:        integer("id").primaryKey().generatedAlwaysAsIdentity(),
    key:       varchar("key", { length: 64 }).notNull().unique(),
    result:    jsonb("result").notNull().$type<unknown>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"), // TTL via soft-delete
  },
  (t) => [
    index("idx_idempotency_keys_key").on(t.key),
    index("idx_idempotency_keys_deleted_at").on(t.deletedAt),
  ]
);

// ENS cache with TTL
export const ensCache = pgTable(
  "ens_cache",
  {
    id:        integer("id").primaryKey().generatedAlwaysAsIdentity(),
    address:   varchar("address", { length: 42 }).notNull().unique(),
    ensName:   varchar("ens_name", { length: 255 }),
    avatar:    text("avatar"),
    resolvedAt: timestamp("resolved_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => [
    index("idx_ens_cache_address").on(t.address),
    index("idx_ens_cache_expires").on(t.expiresAt),
  ]
);

// F02 — Circuit breaker state
export const circuitBreakerState = pgTable("circuit_breaker_state", {
  id:            integer("id").primaryKey().generatedAlwaysAsIdentity(),
  level:         varchar("level", { length: 16 }).notNull().default("NORMAL"),
  settlementsLog: jsonb("settlements_log").notNull().$type<Array<{ timestamp: string; amount: string }>>().default([]),
  locked:        boolean("locked").notNull().default(false),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
});
