import { hederaTestnet } from "./chains";

export const getExplorerTxUrl = (hash: string) =>
  `${hederaTestnet.blockExplorers.default.url}/transaction/${hash}`;

export const getExplorerAccountUrl = (address: string) =>
  `${hederaTestnet.blockExplorers.default.url}/account/${address}`;
