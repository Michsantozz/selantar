import {
  Client,
  TokenMintTransaction,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";

const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID ?? "0.0.8347018";
const HEDERA_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY ?? "";
const HTS_TOKEN_ID = process.env.HTS_TOKEN_ID ?? "0.0.8351617";

let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;

  const accountId = AccountId.fromString(HEDERA_ACCOUNT_ID);
  const privateKey = PrivateKey.fromStringECDSA(
    HEDERA_PRIVATE_KEY.startsWith("0x")
      ? HEDERA_PRIVATE_KEY.slice(2)
      : HEDERA_PRIVATE_KEY
  );

  _client = Client.forTestnet();
  _client.setOperator(accountId, privateKey);
  return _client;
}

/**
 * Mint a Selantar Mediation Receipt NFT on Hedera Token Service.
 * Each completed mediation = 1 unique NFT minted to Agent #36's treasury.
 * The NFT metadata contains the mediation summary as on-chain proof.
 * Fire-and-forget — never throws, mediation continues regardless.
 */
export async function mintMediationReceipt(
  data: Record<string, unknown>
): Promise<{ serialNumber: string; tokenId: string } | null> {
  try {
    const client = getClient();

    const metadata = JSON.stringify({
      agent: "selantar",
      agentId: 36,
      type: "mediation_receipt",
      timestamp: new Date().toISOString(),
      ...data,
    });

    // NFT metadata as bytes (max 100 bytes per metadata entry on HTS)
    // Use a hash reference for larger payloads
    const metadataBytes = Buffer.from(metadata.slice(0, 100));

    const response = await new TokenMintTransaction()
      .setTokenId(HTS_TOKEN_ID)
      .addMetadata(metadataBytes)
      .execute(client);

    const receipt = await response.getReceipt(client);
    const serialNumber = receipt.serials?.[0]?.toString() ?? "0";

    return { serialNumber, tokenId: HTS_TOKEN_ID };
  } catch (err) {
    console.warn("[HTS] Failed to mint mediation receipt:", err);
    return null;
  }
}
