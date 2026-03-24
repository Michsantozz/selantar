# Hedera EVM Essentials — Selantar Migration Guide

> Referencia rapida para migrar o Selantar de Base/Base Sepolia para Hedera.
> O Selantar ja usa viem — Hedera e EVM-compatible, so precisa trocar chain config.

---

## 1. Network Config (viem)

### Hedera Testnet

| Campo | Valor |
|-------|-------|
| **Network Name** | Hedera Testnet |
| **RPC Endpoint** | `https://testnet.hashio.io/api` |
| **Chain ID** | `296` |
| **Currency Symbol** | HBAR |
| **Block Explorer** | `https://hashscan.io/testnet` |

### Hedera Mainnet

| Campo | Valor |
|-------|-------|
| **Network Name** | Hedera Mainnet |
| **RPC Endpoint** | `https://mainnet.hashio.io/api` |
| **Chain ID** | `295` |
| **Currency Symbol** | HBAR |
| **Block Explorer** | `https://hashscan.io/mainnet` |

### viem Chain Definition

```typescript
import { defineChain } from 'viem'

export const hederaTestnet = defineChain({
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
})

export const hederaMainnet = defineChain({
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
})
```

---

## 2. Faucet (Testnet HBAR)

1. Ir em: https://portal.hedera.com/faucet
2. Colar endereco EVM (0x...) da wallet do agente
3. Recebe HBAR testnet automaticamente (conta criada se nao existir)
4. Verificar saldo: https://hashscan.io/testnet/account/{endereco}

**Nota:** Faucet cria conta Hedera automaticamente ao receber HBAR pela primeira vez.

---

## 3. O que muda no Selantar (viem)

### Antes (Base Sepolia)
```typescript
import { baseSepolia } from 'viem/chains'

const client = createWalletClient({
  chain: baseSepolia,
  transport: http(),
})
```

### Depois (Hedera Testnet)
```typescript
import { hederaTestnet } from '@/lib/hedera/chains'

const client = createWalletClient({
  chain: hederaTestnet,
  transport: http('https://testnet.hashio.io/api'),
})
```

### Checklist de migracao

- [ ] Definir chain Hedera em `lib/hedera/chains.ts`
- [ ] Atualizar `lib/wallet.ts` — trocar chain de Base Sepolia para Hedera Testnet
- [ ] Atualizar `lib/erc8004/addresses.ts` — novos enderecos de contratos na Hedera
- [ ] Atualizar `.env.local` — RPC URL da Hedera
- [ ] Fazer deploy dos contratos ERC-8004 na Hedera (via Hardhat ou viem)
- [ ] Testar settlement ERC-20 na Hedera
- [ ] Verificar contratos no HashScan

---

## 4. Deploy de Smart Contract (Hardhat na Hedera)

### hardhat.config.ts
```typescript
import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: { version: "0.8.28" },
      production: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    },
  },
  networks: {
    testnet: {
      type: "http",
      url: configVariable("HEDERA_RPC_URL"),
      accounts: [configVariable("HEDERA_PRIVATE_KEY")],
    },
  },
};

export default config;
```

### Verificar contrato no HashScan
```bash
npx hardhat verify --network testnet CONTRACT_ADDRESS "arg1" "arg2"
```

---

## 5. Diferencas Hedera vs Base/Ethereum

| Aspecto | Hedera | Base/Ethereum |
|---------|--------|---------------|
| **Consenso** | Hashgraph (aBFT) | Optimistic Rollup / PoS |
| **Finalidade** | ~3-5 segundos | ~2 min (Base) / 12 min (Ethereum) |
| **Gas** | Pago em HBAR, fees baixas | Pago em ETH |
| **Chain ID** | 295 (mainnet) / 296 (testnet) | 8453 (Base) / 84532 (Base Sepolia) |
| **EVM** | Totalmente compativel | Nativo |
| **Block Explorer** | HashScan (hashscan.io) | BaseScan |
| **RPC (dev)** | hashio.io (dev only) | Vários |

**Nota importante:** Hashio e apenas para dev/teste. Para producao usar JSON-RPC Relay comercial ou self-hosted.

---

## 6. Links essenciais

- Docs oficiais: https://docs.hedera.com/
- EVM Getting Started: https://docs.hedera.com/hedera/getting-started-evm-developers
- Faucet: https://portal.hedera.com/faucet
- Portal (criar conta): https://portal.hedera.com/register
- HashScan Explorer: https://hashscan.io
- Hedera Agent Kit: https://github.com/hedera-dev/hedera-agent-kit
- HOL Registry: https://hol.org/registry/docs
- Discord: https://go.hellofuturehackathon.dev/apex-discord
