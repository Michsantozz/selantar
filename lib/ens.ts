import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { db } from "@/lib/db";
import { ensCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ENS_RPC_URL = process.env.ENS_RPC_URL || "https://eth.llamarpc.com";
const ENS_TTL_HOURS = 6;
const MAX_RETRIES = 2;

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(ENS_RPC_URL),
});

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

/**
 * Resolve address → ENS name.
 * Checks Postgres cache first (TTL-based), falls back to mainnet RPC.
 */
export async function resolveEnsName(
  address: `0x${string}`
): Promise<string | null> {
  const normalized = address.toLowerCase() as `0x${string}`;

  // 1. Check Postgres cache
  try {
    const [cached] = await db
      .select()
      .from(ensCache)
      .where(eq(ensCache.address, normalized))
      .limit(1);

    if (cached && cached.expiresAt > new Date()) {
      return cached.ensName;
    }
  } catch {
    // DB unavailable — fall through to RPC
  }

  // 2. Resolve via mainnet RPC
  let name: string | null = null;
  try {
    name = await withRetry(() => ensClient.getEnsName({ address: normalized }));
  } catch {
    return null;
  }

  // 3. Upsert into Postgres cache
  const expiresAt = new Date(Date.now() + ENS_TTL_HOURS * 60 * 60 * 1000);
  try {
    await db
      .insert(ensCache)
      .values({ address: normalized, ensName: name, expiresAt })
      .onConflictDoUpdate({
        target: ensCache.address,
        set: { ensName: name, resolvedAt: new Date(), expiresAt },
      });
  } catch {
    // Cache write failure is non-fatal
  }

  return name;
}

/**
 * Resolve ENS name → address.
 */
export async function resolveEnsAddress(
  name: string
): Promise<`0x${string}` | null> {
  try {
    return await withRetry(() =>
      ensClient.getEnsAddress({ name: normalize(name) })
    );
  } catch {
    return null;
  }
}

/**
 * Get ENS avatar URL.
 */
export async function resolveEnsAvatar(
  name: string
): Promise<string | null> {
  try {
    return await withRetry(() =>
      ensClient.getEnsAvatar({ name: normalize(name) })
    );
  } catch {
    return null;
  }
}

/**
 * Format: returns "vitalik.eth" or "0x1234...5678"
 */
export async function formatAddressOrEns(
  address: `0x${string}`
): Promise<string> {
  const name = await resolveEnsName(address);
  if (name) return name;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
