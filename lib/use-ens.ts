"use client";

import { useMemo, useSyncExternalStore } from "react";

type CacheEntry = {
  ensName: string | null;
  status: "pending" | "done";
};

const cache = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function resolve(address: string) {
  const key = address.toLowerCase();
  if (cache.has(key)) return;

  cache.set(key, { ensName: null, status: "pending" });
  notify();

  fetch(`/api/ens?address=${address}`)
    .then((r) => r.json())
    .then((data: { ensName: string | null }) => {
      cache.set(key, { ensName: data.ensName, status: "done" });
      notify();
    })
    .catch(() => {
      cache.set(key, { ensName: null, status: "done" });
      notify();
    });
}

/**
 * React hook to resolve Ethereum address → ENS name.
 * Calls /api/ens which checks Postgres cache (TTL 6h) then mainnet RPC.
 * Client-side results cached in-memory for the session.
 */
export function useEnsName(address: string | undefined) {
  const key = address?.toLowerCase();

  if (address && address.startsWith("0x") && address.length === 42) {
    resolve(address);
  }

  const entry = useSyncExternalStore(
    subscribe,
    () => (key ? cache.get(key) ?? null : null),
    () => null
  );

  const displayName = useMemo(
    () =>
      entry?.ensName ||
      (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""),
    [entry?.ensName, address]
  );

  return {
    ensName: entry?.ensName ?? null,
    displayName,
    isLoading: entry?.status === "pending",
  };
}
