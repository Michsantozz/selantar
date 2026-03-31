import { config } from "dotenv";
config({ path: ".env.local" });

import { canonicalJSON } from "@/lib/canonical-json";

async function main() {
  let privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY not found");
  if (!privateKey.startsWith("0x")) privateKey = `0x${privateKey}`;

  const { Synapse } = await import("@filoz/synapse-sdk");
  const { calibration } = await import("@filoz/synapse-core/chains");
  const { privateKeyToAccount } = await import("viem/accounts");

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log("Wallet:", account.address);

  const synapse = Synapse.create({
    account,
    source: "selantar",
    chain: calibration,
  });

  const testData = {
    type: "filecoin-integration-test",
    agent: "selantar",
    agentId: 2122,
    timestamp: new Date().toISOString(),
    evidence: {
      contractRef: "CSX-TEST-FILECOIN",
      settlement: { clientAmount: "0.008", developerAmount: "0.002" },
      reasoning: "Synapse SDK + Filecoin Calibration + PDP verification",
    },
  };

  const jsonStr = canonicalJSON(testData);
  const bytes = new TextEncoder().encode(jsonStr);
  const payload = bytes.length < 127
    ? new Uint8Array(127).fill(0).map((_, i) => (i < bytes.length ? bytes[i] : 0))
    : bytes;

  console.log(`Payload: ${payload.byteLength} bytes`);

  // 1. Prepare (fund + approve)
  console.log("Preparing account...");
  const prep = await synapse.storage.prepare({
    dataSize: BigInt(payload.byteLength),
  });
  console.log("Deposit needed:", prep.costs.depositNeeded.toString());
  console.log("Ready:", prep.costs.ready);

  if (prep.transaction) {
    console.log("Executing deposit + approval tx...");
    const { hash } = await prep.transaction.execute();
    console.log("TX:", hash);
  }

  // 2. Upload
  console.log("Uploading to Filecoin...");
  const start = Date.now();
  const result = await synapse.storage.upload(payload, {
    copies: 1,
    metadata: { Application: "Selantar", Type: "evidence" },
    pieceMetadata: { filename: "test-evidence.json", contentType: "application/json" },
  });

  const elapsed = Date.now() - start;
  console.log(`\n=== RESULTADO ===`);
  console.log(`PieceCID: ${result.pieceCid}`);
  console.log(`Complete: ${result.complete}`);
  console.log(`Copies: ${result.copies.length}`);
  console.log(`Time: ${elapsed}ms`);

  for (const copy of result.copies) {
    console.log(`  Provider ${copy.providerId}: dataset=${copy.dataSetId}, piece=${copy.pieceId}`);
  }

  if (result.failedAttempts.length > 0) {
    console.log(`Failed attempts: ${result.failedAttempts.length}`);
    for (const f of result.failedAttempts) {
      console.log(`  Provider ${f.providerId}: ${f.error}`);
    }
  }

  console.log("\n=== FILECOIN INTEGRATION TEST PASSED ===");
}

main().catch((e) => {
  console.error("FALHOU:", e.message || e);
  if (e.cause) console.error("Cause:", e.cause);
  process.exit(1);
});
