/**
 * Vanity address generator — finds a wallet starting with 0xca2e ("care")
 * Run: npx tsx scripts/forge-vanity.ts
 */

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const PREFIX = "0xca2e";
let attempts = 0;

console.log(`\nForging vanity address with prefix ${PREFIX}...\n`);

const start = Date.now();

while (true) {
  attempts++;
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  if (account.address.toLowerCase().startsWith(PREFIX)) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`Found in ${attempts.toLocaleString()} attempts (${elapsed}s)\n`);
    console.log(`Address:     ${account.address}`);
    console.log(`Private Key: ${privateKey}`);
    console.log(`\nAdd to .env.local:`);
    console.log(`CARE_WALLET_ADDRESS=${account.address}`);
    console.log(`CARE_PRIVATE_KEY=${privateKey}`);
    break;
  }

  if (attempts % 100_000 === 0) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  ${attempts.toLocaleString()} attempts... (${elapsed}s)`);
  }
}
