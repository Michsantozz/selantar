import { NextRequest, NextResponse } from "next/server";
import { resolveEnsName } from "@/lib/ens";

const RATE_LIMIT = new Map<string, number[]>();
const MAX_REQUESTS = 30; // per minute per IP
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = RATE_LIMIT.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);
  RATE_LIMIT.set(ip, recent);
  if (recent.length >= MAX_REQUESTS) return true;
  recent.push(now);
  return false;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const address = req.nextUrl.searchParams.get("address");

  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const ensName = await resolveEnsName(address as `0x${string}`);

  return NextResponse.json({
    address,
    ensName,
    displayName: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
  });
}
