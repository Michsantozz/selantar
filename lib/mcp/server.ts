import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mediationLog } from "@/lib/mediation-log";
import { caseStore, CaseState, createCase } from "@/lib/case-lifecycle";

export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: "selantar", version: "1.0.0" },
    {
      capabilities: { tools: {} },
      instructions:
        "Selantar is an autonomous B2B dispute mediator. Use these tools to query cases, verify integrity, and submit new disputes.",
    }
  );

  // Tool 1: query_case
  server.registerTool(
    "query_case",
    {
      description: "Returns the current state and event history of a mediation case.",
      inputSchema: { caseId: z.string().describe("Case ID to query") },
    },
    async ({ caseId }) => {
      const mediationCase = caseStore.get(caseId);
      const events = mediationLog.getAll(caseId);
      if (!mediationCase && events.length === 0) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Case not found", caseId }) }],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              caseId,
              state: mediationCase?.getState() ?? null,
              history: mediationCase?.getHistory() ?? [],
              event_count: events.length,
              events,
            }),
          },
        ],
      };
    }
  );

  // Tool 2: verify_mediation
  server.registerTool(
    "verify_mediation",
    {
      description: "Verifies the SHA-256 hash-chain integrity of a mediation case log.",
      inputSchema: { caseId: z.string().describe("Case ID to verify") },
    },
    async ({ caseId }) => {
      const events = mediationLog.getAll(caseId);
      const verification = mediationLog.verifyChain(caseId);
      const lastHash = events.length > 0 ? events[events.length - 1].hash : null;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              caseId,
              chain_length: events.length,
              is_valid: verification.valid,
              verification_timestamp: new Date().toISOString(),
              last_hash: lastHash,
              ...(verification.brokenAt !== undefined && { broken_at: verification.brokenAt }),
              ...(verification.details && { details: verification.details }),
            }),
          },
        ],
      };
    }
  );

  // Tool 3: get_reputation
  server.registerTool(
    "get_reputation",
    {
      description: "Returns the reputation score and mediation history for a given wallet address.",
      inputSchema: { address: z.string().describe("Wallet address (0x...)") },
    },
    async ({ address }) => {
      // Aggregate from event log — find cases where address appears in payloads
      const allCaseIds = Array.from(caseStore.keys());
      const participated: string[] = [];

      for (const caseId of allCaseIds) {
        const events = mediationLog.getAll(caseId);
        const involved = events.some((e) => {
          const payload = JSON.stringify(e.payload);
          return payload.toLowerCase().includes(address.toLowerCase());
        });
        if (involved) participated.push(caseId);
      }

      const resolved = participated.filter((caseId) => {
        const c = caseStore.get(caseId);
        return c?.getState() === CaseState.CLOSED;
      });

      const total = participated.length;
      const resolution_rate = total > 0 ? Math.round((resolved.length / total) * 100) : 0;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              address,
              total_mediations: total,
              resolved_mediations: resolved.length,
              resolution_rate,
              reputation_score: resolution_rate,
              participated_cases: participated,
            }),
          },
        ],
      };
    }
  );

  // Tool 4: list_active_cases
  server.registerTool(
    "list_active_cases",
    {
      description: "Lists all active mediation cases and their current states.",
    },
    async () => {
      const terminal = [CaseState.CLOSED, CaseState.ABANDONED];
      const active: { caseId: string; state: string; event_count: number }[] = [];

      for (const [caseId, mediationCase] of caseStore.entries()) {
        if (!terminal.includes(mediationCase.getState())) {
          active.push({
            caseId,
            state: mediationCase.getState(),
            event_count: mediationLog.getAll(caseId).length,
          });
        }
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ active_cases: active, total: active.length }) }],
      };
    }
  );

  // Tool 5: submit_dispute
  server.registerTool(
    "submit_dispute",
    {
      description:
        "Submits a new dispute for mediation. Returns a caseId to track the mediation.",
      inputSchema: {
        contract: z.string().describe("Contract text or summary"),
        evidence: z.string().describe("Initial evidence or dispute description"),
        party_a: z.string().describe("Address or name of party A (client)"),
        party_b: z.string().describe("Address or name of party B (developer)"),
      },
    },
    async ({ contract, evidence, party_a, party_b }) => {
      const caseId = `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      createCase(caseId);

      mediationLog.append(caseId, "CASE_OPENED", {
        source: "mcp",
        contract: contract.slice(0, 500),
        evidence: evidence.slice(0, 500),
        party_a,
        party_b,
        createdAt: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              caseId,
              status: "submitted",
              status_url: `/api/mediation-log/${caseId}`,
              verify_url: `/api/verify/${caseId}`,
            }),
          },
        ],
      };
    }
  );

  return server;
}
