import {
  Client,
  TopicMessageSubmitTransaction,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";

const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID ?? "0.0.8347018";
const HEDERA_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY ?? "";
const HCS_TOPIC_ID = process.env.HCS_TOPIC_ID ?? "0.0.8351168";

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
 * Submit a mediation event to Hedera Consensus Service.
 * Each message is an immutable, timestamped audit log entry.
 * Fire-and-forget — never throws, mediation continues regardless.
 */
export async function logToHCS(
  event: string,
  data: Record<string, unknown>
): Promise<string | null> {
  try {
    const client = getClient();

    const message = JSON.stringify({
      agent: "selantar",
      agentId: 36,
      event,
      timestamp: new Date().toISOString(),
      ...data,
    });

    const response = await new TopicMessageSubmitTransaction()
      .setTopicId(HCS_TOPIC_ID)
      .setMessage(message)
      .execute(client);

    const receipt = await response.getReceipt(client);
    const sequenceNumber = receipt.topicSequenceNumber?.toString() ?? "0";

    return sequenceNumber;
  } catch (err) {
    console.warn("[HCS] Failed to log event:", event, err);
    return null;
  }
}
