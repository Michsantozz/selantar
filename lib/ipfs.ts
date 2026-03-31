import { canonicalJSON } from "@/lib/canonical-json";

export interface FilecoinResult {
  pieceCid: string;
  copies: Array<{ providerId: string; dataSetId: string; pieceId: string }>;
  complete: boolean;
}

export interface PinResult {
  cid: string;
  filecoinPromise: Promise<FilecoinResult | null>;
}

/**
 * Pin JSON evidence to IPFS + Filecoin (Synapse SDK).
 * Provider priority: Pinata (free tier) → local CID fallback.
 * Filecoin layer: Synapse SDK uploads in background for PDP-verified storage.
 *
 * Uses pinFileToIPFS (NOT pinJSONToIPFS) because Pinata's JSON endpoint
 * re-serializes internally and produces a different CID than the bytes
 * we hash on-chain. pinFileToIPFS sends exact bytes → CID matches keccak256.
 *
 * Reference: docs/sentinel8004/src/ipfs.ts (battle-tested on 3,300+ mainnet writes).
 */
export async function pinEvidence(
  data: unknown,
  name: string
): Promise<PinResult> {
  const errors: string[] = [];

  // 1. Try Pinata (primary — returns IPFS CID used on-chain)
  const pinataJwt = process.env.PINATA_JWT;
  if (pinataJwt) {
    try {
      const cid = await pinViaPinata(data, name, pinataJwt);

      const filecoinPromise = storeOnFilecoin(data, name).catch((e) => {
        console.warn(`Filecoin background upload failed: ${(e as Error).message}`);
        return null;
      });

      return { cid, filecoinPromise };
    } catch (e) {
      errors.push(`Pinata: ${(e as Error).message}`);
    }
  }

  // 2. Fallback: compute CID locally without uploading.
  // Evidence lives in the git repo + mediation-logs for verification.
  try {
    const cid = await computeCIDLocally(data);
    const reason =
      errors.length > 0 ? "provider failed" : "no provider configured";
    console.warn(`IPFS ${reason}, computed CID locally: ${cid}`);

    const filecoinPromise = storeOnFilecoin(data, name).catch((e) => {
      console.warn(`Filecoin background upload failed: ${(e as Error).message}`);
      return null;
    });

    return { cid, filecoinPromise };
  } catch (e) {
    errors.push(`Local CID: ${(e as Error).message}`);
  }

  throw new Error(`All IPFS methods failed: ${errors.join("; ")}`);
}

async function pinViaPinata(
  data: unknown,
  name: string,
  jwt: string
): Promise<string> {
  const jsonStr = canonicalJSON(data);
  const blob = new Blob([jsonStr], { type: "application/json" });

  const formData = new FormData();
  formData.append("file", blob, `${name}.json`);
  formData.append("pinataMetadata", JSON.stringify({ name }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pinata ${response.status}: ${text}`);
    }

    const result = (await response.json()) as { IpfsHash: string };
    return result.IpfsHash;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Compute IPFS CIDv0 locally without uploading.
 * Uses the same dag-pb + UnixFS encoding as IPFS nodes.
 * Produces identical CIDs to what pinning services return.
 */
async function computeCIDLocally(data: unknown): Promise<string> {
  // @ts-expect-error -- ipfs-only-hash has no type declarations
  const Hash = (await import("ipfs-only-hash")).default;
  const jsonStr = canonicalJSON(data);
  return Hash.of(Buffer.from(jsonStr, "utf-8")) as string;
}

/**
 * Store evidence on Filecoin via Synapse SDK (PDP-verified storage).
 * Runs as background task — never blocks the main IPFS pinning flow.
 *
 * Filecoin Calibration testnet (chainId 314159).
 * Requires FILECOIN_PRIVATE_KEY env var (or falls back to AGENT_PRIVATE_KEY).
 * Requires tFIL + USDFC from faucets for gas + storage fees.
 */
async function storeOnFilecoin(
  data: unknown,
  name: string
): Promise<FilecoinResult | null> {
  let privateKey = process.env.FILECOIN_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.warn("Filecoin: no private key configured, skipping");
    return null;
  }
  if (!privateKey.startsWith("0x")) privateKey = `0x${privateKey}`;

  const { Synapse } = await import("@filoz/synapse-sdk");
  const { calibration } = await import("@filoz/synapse-core/chains");
  const { privateKeyToAccount } = await import("viem/accounts");

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const synapse = Synapse.create({
    account,
    source: "selantar",
    chain: calibration,
  });

  const jsonStr = canonicalJSON(data);
  const bytes = new TextEncoder().encode(jsonStr);

  // Pad to minimum 127 bytes if needed
  const payload = bytes.length < 127
    ? new Uint8Array(127).fill(0).map((_, i) => (i < bytes.length ? bytes[i] : 0))
    : bytes;

  // Ensure account is funded and approved
  const prep = await synapse.storage.prepare({
    dataSize: BigInt(payload.byteLength),
  });
  if (prep.transaction) {
    await prep.transaction.execute();
  }

  // Upload with metadata for traceability
  const result = await synapse.storage.upload(payload, {
    copies: 1,
    metadata: {
      Application: "Selantar",
      Type: "evidence",
    },
    pieceMetadata: {
      filename: `${name}.json`,
      contentType: "application/json",
    },
  });

  if (!result.complete) {
    console.warn(`Filecoin: upload incomplete — ${result.failedAttempts.length} copies failed`);
  }

  const pieceCid = result.pieceCid.toString();
  const copies = result.copies.map((copy) => ({
    providerId: String(copy.providerId),
    dataSetId: String(copy.dataSetId),
    pieceId: String(copy.pieceId),
  }));
  return { pieceCid, copies, complete: result.complete };
}
