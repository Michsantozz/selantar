/**
 * Filecoin integration utilities.
 * Dual-URI encoding for ERC-8004 feedbackURI/requestURI fields,
 * and PDP-verified storage verification via Synapse SDK.
 */

export interface VerifyResult {
  status: "live" | "pending" | "not_found" | "error";
  providers: Array<{ providerId: string; isLive: boolean }>;
}

// ── Lazy Synapse singleton ──────────────────────────────────────────

async function createSynapseClient() {
  let privateKey =
    process.env.FILECOIN_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) return null;
  if (!privateKey.startsWith("0x")) privateKey = `0x${privateKey}`;

  const { Synapse } = await import("@filoz/synapse-sdk");
  const { calibration } = await import("@filoz/synapse-core/chains");
  const { privateKeyToAccount } = await import("viem/accounts");

  return Synapse.create({
    account: privateKeyToAccount(privateKey as `0x${string}`),
    source: "selantar",
    chain: calibration,
  });
}

let _synapsePromise: ReturnType<typeof createSynapseClient> | null = null;

function getSynapse() {
  if (!_synapsePromise) {
    _synapsePromise = createSynapseClient();
  }
  return _synapsePromise;
}

// ── Dual-URI helpers ────────────────────────────────────────────────

export function buildDualURI(
  ipfsCid: string,
  filecoinPieceCid?: string
): string {
  if (filecoinPieceCid) {
    return `ipfs://${ipfsCid}|filecoin://${filecoinPieceCid}`;
  }
  return `ipfs://${ipfsCid}`;
}

export function parseDualURI(uri: string): {
  ipfsCid?: string;
  filecoinPieceCid?: string;
} {
  const result: { ipfsCid?: string; filecoinPieceCid?: string } = {};
  const parts = uri.split("|");

  for (const part of parts) {
    if (part.startsWith("ipfs://")) {
      result.ipfsCid = part.slice(7);
    } else if (part.startsWith("filecoin://")) {
      result.filecoinPieceCid = part.slice(11);
    }
  }

  return result;
}

// ── Filecoin storage verification ───────────────────────────────────

export async function verifyFilecoinStorage(
  pieceCid: string
): Promise<VerifyResult> {
  try {
    const synapse = await getSynapse();
    if (!synapse) return { status: "error", providers: [] };

    const dataSets = await synapse.storage.findDataSets();
    const providers: VerifyResult["providers"] = [];

    for (const ds of dataSets) {
      try {
        const context = await synapse.storage.createContext({
          dataSetId: ds.pdpVerifierDataSetId,
        });

        for await (const piece of context.getPieces()) {
          if (piece.pieceCid.toString() === pieceCid) {
            providers.push({
              providerId: String(ds.providerId),
              isLive: ds.isLive,
            });
            break;
          }
        }
      } catch {
        // Skip datasets that can't be iterated
      }
    }

    if (providers.length === 0) return { status: "not_found", providers };

    return {
      status: providers.some((p) => p.isLive) ? "live" : "pending",
      providers,
    };
  } catch {
    return { status: "error", providers: [] };
  }
}
