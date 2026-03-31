"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, ChevronRight } from "lucide-react";

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface Param {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

interface EndpointDef {
  id: string;
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  category: string;
  feature: string;
  params?: Param[];
  body?: Param[];
  response: string;
  example?: string;
  rateLimit?: string;
  auth?: string;
  streaming?: boolean;
}

/* ══════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════ */
const ENDPOINTS: EndpointDef[] = [
  {
    id: "intake",
    method: "POST",
    path: "/api/intake",
    summary: "Submit dispute case",
    description:
      "Opens a new mediation case. Idempotent — same dispute returns the original case. Rate-limited to 10 req/h per IP.",
    category: "Cases",
    feature: "F11",
    body: [
      { name: "contract_text", type: "string", required: true, description: "Full contract text or extracted clauses" },
      { name: "evidence", type: "Evidence[]", required: false, description: "Array of { type, content } objects" },
      { name: "party_a", type: "Party", required: true, description: "{ address: string, name: string }" },
      { name: "party_b", type: "Party", required: true, description: "{ address: string, name: string }" },
      { name: "dispute_description", type: "string", required: true, description: "Short description of the dispute" },
    ],
    response: `{
  "caseId": "v8k3mNpL2xQw",
  "status": "INTAKE",
  "status_url": "/api/mediation-log/v8k3mNpL2xQw",
  "verify_url": "/api/verify/v8k3mNpL2xQw",
  "created_at": "2026-03-27T12:00:00.000Z",
  "_idempotent": false
}`,
    example: `curl -X POST https://selantar.xyz/api/intake \\
  -H "Content-Type: application/json" \\
  -d '{
    "contract_text": "Service agreement...",
    "party_a": { "address": "0xABC...", "name": "Acme Corp" },
    "party_b": { "address": "0xDEF...", "name": "Dev Studio" },
    "dispute_description": "Milestone 3 delivered late"
  }'`,
    rateLimit: "10 req / h / IP",
    auth: "x402 — $0.05",
  },
  {
    id: "mediation-chat",
    method: "POST",
    path: "/api/mediation-chat",
    summary: "Stream AI mediation",
    description:
      "Streams a ToolLoopAgent dual-agent session (mediator + analyst). Returns UI message stream compatible with AI SDK v6 useChat.",
    category: "Mediation",
    feature: "Core",
    streaming: true,
    body: [
      { name: "messages", type: "UIMessage[]", required: true, description: "AI SDK message history" },
      { name: "caseId", type: "string", required: false, description: "Existing case ID to continue" },
    ],
    response: `// Content-Type: text/plain; charset=utf-8
// AI SDK UIMessageStream — text, reasoning, tool-{name} parts`,
    example: `const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({
    api: "/api/mediation-chat"
  })
});`,
    auth: "None",
  },
  {
    id: "analyze-contract",
    method: "POST",
    path: "/api/analyze-contract",
    summary: "Analyze contract risks",
    description:
      "Streams AI risk analysis of a contract. Returns key clauses, risk scores (0–100), and recommendations.",
    category: "Mediation",
    feature: "Core",
    streaming: true,
    body: [
      { name: "contract", type: "string", required: true, description: "Contract text or extracted content" },
    ],
    response: `// Streaming UIMessageStream
// Fields: risk_score (0-100), clauses[], recommendations[]`,
    auth: "None",
  },
  {
    id: "mediation-log",
    method: "GET",
    path: "/api/mediation-log/[caseId]",
    summary: "Get case event log",
    description:
      "Full append-only hash-chained event log for a case. Every event includes timestamp, type, payload, prev_hash, and SHA-256 hash.",
    category: "Audit",
    feature: "F01",
    params: [
      { name: "caseId", type: "string", required: true, description: "Nanoid case identifier" },
    ],
    response: `{
  "caseId": "v8k3mNpL2xQw",
  "events": [{
    "id": "evt_01",
    "event_type": "CASE_OPENED",
    "timestamp": "2026-03-27T12:00:00.000Z",
    "payload": { "partyA": "0xABC...", "...": "..." },
    "prev_hash": null,
    "hash": "a3f9c2d8..."
  }]
}`,
    auth: "None",
  },
  {
    id: "verify",
    method: "GET",
    path: "/api/verify/[caseId]",
    summary: "Verify hash-chain integrity",
    description:
      "Recomputes SHA-256 of every event and verifies continuity. Anyone can confirm a mediation audit trail was not tampered with.",
    category: "Audit",
    feature: "F06",
    params: [
      { name: "caseId", type: "string", required: true, description: "Nanoid case identifier" },
    ],
    response: `{
  "caseId": "v8k3mNpL2xQw",
  "chain_length": 9,
  "is_valid": true,
  "verification_timestamp": "2026-03-27T12:05:00.000Z",
  "last_hash": "d72af1c3..."
}`,
    example: `curl https://selantar.xyz/api/verify/v8k3mNpL2xQw`,
    auth: "None — public",
  },
  {
    id: "oracle",
    method: "GET",
    path: "/api/oracle/[address]/reputation",
    summary: "Get reputation score",
    description:
      "Composite reputation score (0–100) for a wallet address. Signed by the agent via viem. Response includes anti-Goodhart notice header.",
    category: "Oracle",
    feature: "F08",
    params: [
      { name: "address", type: "string", required: true, description: "EVM wallet address (0x...)" },
    ],
    response: `{
  "address": "0xABC...",
  "total_mediations": 14,
  "resolution_rate": 0.86,
  "compliance_rate": 0.93,
  "reputation_score": 88,
  "agent_signature": "0x...",
  "computed_at": "2026-03-27T12:00:00.000Z"
}`,
    example: `curl https://selantar.xyz/api/oracle/0xABC.../reputation`,
    auth: "None — public",
  },
  {
    id: "mcp",
    method: "GET",
    path: "/api/mcp",
    summary: "MCP server (SSE)",
    description:
      "Model Context Protocol endpoint via SSE transport. Exposes 5 tools for external AI agents over JSON-RPC 2.0.",
    category: "MCP",
    feature: "F07",
    response: `// MCP tools available:
// query_case(caseId)
// verify_mediation(caseId)
// get_reputation(address)
// list_active_cases()
// submit_dispute(contract, evidence, parties)`,
    example: `// Claude Desktop — mcp config
{
  "mcpServers": {
    "selantar": {
      "command": "npx",
      "args": ["mcp-remote", "https://selantar.xyz/api/mcp"]
    }
  }
}`,
    auth: "None — public",
  },
  {
    id: "replay",
    method: "POST",
    path: "/api/replay/[caseId]",
    summary: "Replay mediation (dry-run)",
    description:
      "Re-executes a completed mediation with optional overrides. Compares original vs replay outcome. No real on-chain actions.",
    category: "Dev",
    feature: "F12",
    params: [
      { name: "caseId", type: "string", required: true, description: "Completed case to replay" },
    ],
    body: [
      { name: "model", type: "string", required: false, description: "Override LLM model" },
      { name: "temperature", type: "number", required: false, description: "Override temperature (0–2)" },
      { name: "systemPrompt", type: "string", required: false, description: "Override Clara's system prompt" },
    ],
    response: `{
  "caseId": "v8k3mNpL2xQw",
  "original_outcome": { "verdict": "partial_refund", "amount": 0.5 },
  "replay_outcome":   { "verdict": "full_refund",    "amount": 1.0 },
  "score_diff": { "evidence_quality": 12 },
  "reasoning_divergences": ["Step 3: different delay weighting"]
}`,
    auth: "None",
  },
  {
    id: "settlements",
    method: "GET",
    path: "/api/settlements/[caseId]",
    summary: "Get settlement outbox",
    description:
      "Settlement outbox state for a case. Tracks through the outbox pattern: pending → executing → completed / failed.",
    category: "Settlements",
    feature: "F17",
    params: [
      { name: "caseId", type: "string", required: true, description: "Nanoid case identifier" },
    ],
    response: `{
  "caseId": "v8k3mNpL2xQw",
  "status": "completed",
  "intent": { "amount": "0.5", "token": "USDC", "recipient": "0xDEF..." },
  "tx_hash": "0x7f3a...",
  "completed_at": "2026-03-27T12:02:15.000Z",
  "error": null
}`,
    auth: "None — public",
  },
  {
    id: "execute-settlement",
    method: "POST",
    path: "/api/execute-settlement",
    summary: "Execute on-chain settlement",
    description:
      "ERC-20 transfer via viem + ERC-8004 verdict + reputation feedback. Blocked by circuit breaker in LOCKDOWN or EMERGENCY state.",
    category: "Settlements",
    feature: "Core + F02",
    body: [
      { name: "caseId", type: "string", required: true, description: "Case in AGREEMENT state" },
      { name: "amount", type: "string", required: true, description: "Settlement amount (token units)" },
      { name: "token", type: "string", required: true, description: "ERC-20 token address" },
      { name: "recipient", type: "string", required: true, description: "Recipient wallet address" },
    ],
    response: `{
  "success": true,
  "tx_hash": "0x7f3a...",
  "erc8004_verdict_tx": "0x9b2c...",
  "reputation_updated": true
}`,
    auth: "Agent only",
  },
];

/* ══════════════════════════════════════════════════════
   SIDEBAR NAV DATA
══════════════════════════════════════════════════════ */
const NAV_SECTIONS = [
  {
    title: "Getting Started",
    items: [
      { id: "authentication", label: "Authentication" },
      { id: "base-url", label: "Base URL" },
      { id: "common-headers", label: "Common headers" },
      { id: "errors", label: "Error responses" },
    ],
  },
  {
    title: "Cases",
    items: [{ id: "intake", label: "POST /api/intake" }],
  },
  {
    title: "Mediation",
    items: [
      { id: "mediation-chat", label: "POST /api/mediation-chat" },
      { id: "analyze-contract", label: "POST /api/analyze-contract" },
    ],
  },
  {
    title: "Audit",
    items: [
      { id: "mediation-log", label: "GET /api/mediation-log" },
      { id: "verify", label: "GET /api/verify" },
    ],
  },
  {
    title: "Oracle",
    items: [{ id: "oracle", label: "GET /api/oracle" }],
  },
  {
    title: "MCP",
    items: [{ id: "mcp", label: "GET /api/mcp" }],
  },
  {
    title: "Settlements",
    items: [
      { id: "settlements", label: "GET /api/settlements" },
      { id: "execute-settlement", label: "POST /api/execute-settlement" },
    ],
  },
  {
    title: "Dev",
    items: [{ id: "replay", label: "POST /api/replay" }],
  },
  {
    title: "Reference",
    items: [
      { id: "event-types", label: "Event Types" },
      { id: "case-lifecycle", label: "Case Lifecycle" },
      { id: "circuit-breaker", label: "Circuit Breaker" },
    ],
  },
];

const ON_THIS_PAGE = [
  { id: "authentication", label: "Authentication" },
  { id: "base-url", label: "Base URL" },
  { id: "common-headers", label: "Common headers" },
  { id: "errors", label: "Error responses" },
  { id: "endpoints", label: "Endpoints" },
  { id: "event-types", label: "Event Types" },
  { id: "case-lifecycle", label: "Case Lifecycle" },
  { id: "circuit-breaker", label: "Circuit Breaker" },
];

/* ══════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════ */
function CopyBtn({ text, small }: { text: string; small?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      }}
      className={cn(
        "flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-foreground",
        small ? "text-[10px] font-mono" : "text-[11px] font-mono"
      )}
    >
      {ok ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
      {ok ? "copied" : "copy"}
    </button>
  );
}

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2 h-[20px] text-[10px] font-bold font-mono tracking-widest rounded",
        method === "GET"
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-primary/15 text-primary"
      )}
    >
      {method}
    </span>
  );
}

function StreamBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20">
      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
      stream
    </span>
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-md overflow-hidden border border-border/50 bg-[hsl(0_0%_6%)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-[hsl(0_0%_8%)]">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {lang ?? "json"}
        </span>
        <CopyBtn text={code} small />
      </div>
      <pre className="p-4 text-[12px] font-mono leading-[1.8] overflow-x-auto text-foreground/70 scrollbar-thin">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded px-1.5 py-0.5 text-[12px] font-mono bg-border/30 text-foreground/85">
      {children}
    </code>
  );
}

function ParamTable({ params, title }: { params: Param[]; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2">
        {title}
      </p>
      <div className="rounded-md border border-border/50 overflow-hidden divide-y divide-border/30">
        {params.map((p) => (
          <div key={p.name} className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 items-start text-[13px]">
            <div className="flex items-center gap-1.5 w-36 shrink-0">
              <span className="font-mono text-foreground/90">{p.name}</span>
              {p.required && (
                <span className="text-[9px] uppercase tracking-wider text-primary font-bold">req</span>
              )}
            </div>
            <span className="font-mono text-primary/70 w-24 shrink-0">{p.type}</span>
            <span className="text-muted-foreground flex-1 min-w-[200px] leading-relaxed">
              {p.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ENDPOINT SECTION
══════════════════════════════════════════════════════ */
function EndpointSection({ ep }: { ep: EndpointDef }) {
  const [tab, setTab] = useState<"response" | "example">("response");
  const tabs = ["response", ...(ep.example ? ["example"] : [])] as ("response" | "example")[];

  return (
    <div id={ep.id} className="scroll-mt-20 pt-10 first:pt-0 border-t border-border/30 first:border-0">
      {/* Title row */}
      <div className="flex items-center gap-3 mb-1">
        <MethodBadge method={ep.method} />
        {ep.streaming && <StreamBadge />}
        <h3 className="font-mono text-[15px] text-foreground/90">{ep.path}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{ep.summary}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] font-mono mb-5">
        {ep.auth && (
          <span className="text-muted-foreground">
            Auth <span className="text-foreground/70">{ep.auth}</span>
          </span>
        )}
        {ep.rateLimit && (
          <span className="text-muted-foreground">
            Rate limit <span className="text-foreground/70">{ep.rateLimit}</span>
          </span>
        )}
        <span className="text-muted-foreground">
          Feature <span className="text-foreground/70">{ep.feature}</span>
        </span>
      </div>

      <p className="text-sm text-foreground/70 leading-relaxed mb-5 max-w-2xl">
        {ep.description}
      </p>

      {ep.params && ep.params.length > 0 && (
        <div className="mb-4">
          <ParamTable params={ep.params} title="Path Parameters" />
        </div>
      )}
      {ep.body && ep.body.length > 0 && (
        <div className="mb-4">
          <ParamTable params={ep.body} title="Request Body" />
        </div>
      )}

      {/* Code tabs */}
      <div>
        <div className="flex items-center gap-1 mb-2 border-b border-border/30">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 pb-2 pt-1 text-[12px] font-mono tracking-wide border-b-2 -mb-px transition-colors",
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "response" && <CodeBlock code={ep.response} lang="json" />}
        {tab === "example" && ep.example && (
          <CodeBlock code={ep.example} lang="bash" />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function DocsPage() {
  const [activeId, setActiveId] = useState("authentication");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const allIds = [
      ...ON_THIS_PAGE.map((i) => i.id),
      ...ENDPOINTS.map((e) => e.id),
    ];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-border/40 bg-background/95 backdrop-blur-sm py-8 px-6">
        <div className="mb-6 px-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Selantar
          </p>
          <p className="text-[13px] font-medium text-foreground">API Reference</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">v1.0 · Base Sepolia</p>
        </div>

        <nav className="space-y-5 text-[13px]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-2 mb-1 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/70 font-semibold">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setActiveId(item.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors font-mono text-[12px]",
                        activeId === item.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-border/30"
                      )}
                    >
                      {activeId === item.id && (
                        <ChevronRight size={10} className="shrink-0 text-primary" />
                      )}
                      <span className={activeId === item.id ? "ml-0" : "ml-[14px]"}>
                        {item.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl px-6 lg:px-10 py-12">

          {/* Page header */}
          <div className="mb-12 pb-10 border-b border-border/60">
            <div className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground mb-5">
              <span>Selantar</span>
              <span>/</span>
              <span className="text-foreground/80">API Reference</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
              API Reference
            </h1>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-xl">
              The Selantar API provides programmatic access to autonomous dispute mediation.{" "}
              {ENDPOINTS.length} endpoints, append-only event logs, on-chain settlements, and
              on-chain reputation — no humans required.
            </p>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Last updated{" "}
              <span className="text-foreground/70">March 27, 2026</span>
            </p>
          </div>

          {/* ── Authentication ── */}
          <section id="authentication" className="scroll-mt-20 mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Authentication</h2>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              Most endpoints are open and require no authentication. The{" "}
              <InlineCode>/api/intake</InlineCode> endpoint uses x402 micropayments ($0.05
              per call). The <InlineCode>/api/execute-settlement</InlineCode> endpoint is
              agent-internal only.
            </p>
            <CodeBlock
              code={`// x402 payment header (intake only)
x-payment: <x402-payment-token>`}
              lang="http"
            />
          </section>

          {/* ── Base URL ── */}
          <section id="base-url" className="scroll-mt-20 mb-12 border-t border-border/60 pt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Base URL</h2>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              All endpoints are accessed through the following base URL. Deployed on Vercel with
              Node.js runtime and 120s max duration for streaming routes.
            </p>
            <div className="flex items-center gap-3 border border-border/50 rounded-md px-4 py-3 bg-card/30 w-fit">
              <span className="font-mono text-[13px] text-foreground/85">https://selantar.xyz</span>
              <CopyBtn text="https://selantar.xyz" />
            </div>
          </section>

          {/* ── Common Headers ── */}
          <section id="common-headers" className="scroll-mt-20 mb-12 border-t border-border/60 pt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Common headers</h2>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              The following headers apply to all requests.
            </p>
            <div className="rounded-md border border-border/50 overflow-hidden divide-y divide-border/30 text-[13px]">
              {[
                { header: "Content-Type", type: "string", req: true, desc: "application/json for POST requests" },
                { header: "Accept", type: "string", req: false, desc: "text/plain for streaming endpoints" },
              ].map((row) => (
                <div key={row.header} className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 items-start">
                  <div className="flex items-center gap-1.5 w-36 shrink-0">
                    <InlineCode>{row.header}</InlineCode>
                    {row.req && (
                      <span className="text-[9px] uppercase tracking-wider text-primary font-bold">req</span>
                    )}
                  </div>
                  <span className="font-mono text-primary/70 w-24 shrink-0">{row.type}</span>
                  <span className="text-muted-foreground flex-1">{row.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Errors ── */}
          <section id="errors" className="scroll-mt-20 mb-12 border-t border-border/60 pt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Error responses</h2>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              All errors return a JSON body with a <InlineCode>code</InlineCode> and{" "}
              <InlineCode>message</InlineCode> field.
            </p>
            <div className="rounded-md border border-border/50 overflow-hidden divide-y divide-border/30 text-[13px] mb-4">
              {[
                { code: "400", label: "Bad Request", desc: "Missing or invalid parameters" },
                { code: "402", label: "Payment Required", desc: "x402 payment header missing or invalid" },
                { code: "404", label: "Not Found", desc: "Case ID does not exist" },
                { code: "409", label: "Conflict", desc: "Idempotent request — original case returned" },
                { code: "429", label: "Too Many Requests", desc: "Rate limit exceeded" },
                { code: "503", label: "Service Unavailable", desc: "Circuit breaker in LOCKDOWN or EMERGENCY state" },
              ].map((row) => (
                <div key={row.code} className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 items-start">
                  <span className={cn(
                    "font-mono w-10 shrink-0 font-semibold",
                    row.code.startsWith("4") ? "text-amber-400" : "text-destructive"
                  )}>
                    {row.code}
                  </span>
                  <span className="font-mono text-foreground/80 w-36 shrink-0">{row.label}</span>
                  <span className="text-muted-foreground flex-1">{row.desc}</span>
                </div>
              ))}
            </div>
            <CodeBlock code={`{
  "code": "CASE_NOT_FOUND",
  "message": "No case found with id v8k3mNpL2xQw"
}`} lang="json" />
          </section>

          {/* ── Endpoints ── */}
          <section id="endpoints" className="scroll-mt-20 border-t border-border/30 pt-10">
            <h2 className="text-xl font-semibold text-foreground mb-1">Endpoints</h2>
            <p className="text-[13px] text-muted-foreground mb-8">
              {ENDPOINTS.length} endpoints across{" "}
              {[...new Set(ENDPOINTS.map((e) => e.category))].length} categories.
            </p>
            <div className="space-y-0">
              {ENDPOINTS.map((ep) => (
                <EndpointSection key={ep.id} ep={ep} />
              ))}
            </div>
          </section>

          {/* ── Event Types ── */}
          <section id="event-types" className="scroll-mt-20 border-t border-border/60 pt-12 mt-12">
            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-semibold">
                F01 — append-only log
              </span>
              <h2 className="text-xl font-semibold text-foreground mt-1 mb-2">Event Types</h2>
              <p className="text-[13px] text-muted-foreground max-w-xl">
                Every action appended to the hash-chain. Tamper-evident, publicly verifiable.
              </p>
            </div>
            <div className="rounded-md border border-border/50 overflow-hidden divide-y divide-border/30 text-[13px]">
              {[
                ["CASE_OPENED",               "New case via /api/intake"],
                ["EVIDENCE_SUBMITTED",        "Evidence attached to case"],
                ["ANALYSIS_COMPLETE",         "LLM evidence analysis done"],
                ["SETTLEMENT_PROPOSED",       "Clara proposed terms"],
                ["SETTLEMENT_ACCEPTED",       "Both parties agreed"],
                ["SETTLEMENT_REJECTED",       "Proposal rejected"],
                ["SETTLEMENT_EXECUTED",       "ERC-20 transfer completed"],
                ["VERDICT_REGISTERED",        "ERC-8004 validation posted"],
                ["CASE_CLOSED",               "Mediation concluded"],
                ["CIRCUIT_BREAKER_TRIGGERED", "Emergency halt activated"],
                ["WEIGHT_ADJUSTMENT",         "Reputation weights updated"],
              ].map(([type, desc]) => (
                <div key={type} className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 items-start hover:bg-card/20 transition-colors">
                  <span className="font-mono text-[12px] font-semibold text-emerald-400 w-52 shrink-0">
                    {type}
                  </span>
                  <span className="text-muted-foreground flex-1">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Case Lifecycle ── */}
          <section id="case-lifecycle" className="scroll-mt-20 border-t border-border/60 pt-12 mt-12">
            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-semibold">
                F04 — state machine
              </span>
              <h2 className="text-xl font-semibold text-foreground mt-1 mb-2">Case Lifecycle</h2>
              <p className="text-[13px] text-muted-foreground max-w-xl">
                11 states, guarded transitions. Terminal states are final.
              </p>
            </div>
            <div className="rounded-md border border-border/50 overflow-hidden divide-y divide-border/30 text-[13px]">
              {[
                { s: "INTAKE",              terminal: false },
                { s: "EVIDENCE_COLLECTION", terminal: false },
                { s: "ANALYSIS",            terminal: false },
                { s: "NEGOTIATION",         terminal: false },
                { s: "PROPOSAL",            terminal: false },
                { s: "COUNTER_PROPOSAL",    terminal: false },
                { s: "AGREEMENT",           terminal: false },
                { s: "SETTLEMENT_PENDING",  terminal: false },
                { s: "SETTLEMENT_EXECUTED", terminal: true, ok: true },
                { s: "CLOSED",              terminal: true, ok: true },
                { s: "ABANDONED",           terminal: true, ok: false },
              ].map(({ s, terminal, ok }) => (
                <div key={s} className="px-4 py-3 flex items-center gap-6 hover:bg-card/20 transition-colors">
                  <span className="font-mono text-[12px] font-semibold text-foreground/80 w-52 shrink-0">
                    {s}
                  </span>
                  <span className={cn(
                    "text-[11px] font-mono px-2 py-0.5 rounded",
                    terminal && ok  && "bg-emerald-500/10 text-emerald-400",
                    terminal && !ok && "bg-destructive/10 text-destructive",
                    !terminal       && "bg-border/30 text-muted-foreground"
                  )}>
                    {!terminal ? "active" : ok ? "terminal — success" : "terminal — failure"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Circuit Breaker ── */}
          <section id="circuit-breaker" className="scroll-mt-20 border-t border-border/60 pt-12 mt-12 pb-24">
            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-semibold">
                F02 — kill switch
              </span>
              <h2 className="text-xl font-semibold text-foreground mt-1 mb-2">Circuit Breaker</h2>
              <p className="text-[13px] text-muted-foreground max-w-xl">
                Four protection levels. Automatically escalates on anomalies.
              </p>
            </div>
            <div className="rounded-md border border-border/50 overflow-hidden divide-y divide-border/30 text-[13px]">
              {[
                {
                  level: "NORMAL",
                  dot: "bg-emerald-400",
                  label: "text-emerald-400",
                  desc: "All operations allowed.",
                },
                {
                  level: "CAUTION",
                  dot: "bg-primary",
                  label: "text-primary",
                  desc: "3+ settlements in 10 min — warning logged.",
                },
                {
                  level: "LOCKDOWN",
                  dot: "bg-amber-400",
                  label: "text-amber-400",
                  desc: ">1 ETH or 5+ settlements/h — manual confirmation required.",
                },
                {
                  level: "EMERGENCY",
                  dot: "bg-destructive",
                  label: "text-destructive",
                  desc: "On-chain failure — everything blocked.",
                },
              ].map(({ level, dot, label, desc }) => (
                <div key={level} className="px-4 py-3.5 flex flex-wrap gap-x-6 gap-y-1 items-start hover:bg-card/20 transition-colors">
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <span className={cn("size-1.5 rounded-full shrink-0", dot)} />
                    <span className={cn("font-mono text-[12px] font-semibold", label)}>{level}</span>
                  </div>
                  <span className="text-muted-foreground flex-1">{desc}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ═══ RIGHT "ON THIS PAGE" ═══ */}
      <aside className="hidden xl:flex flex-col w-52 shrink-0 sticky top-0 h-screen overflow-y-auto py-12 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-2">
          On this page
        </p>
        <nav className="space-y-0.5">
          {ON_THIS_PAGE.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "block px-2 py-1 rounded text-[12px] transition-colors",
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

    </div>
  );
}
