// ERC-8004 Registry contract addresses
// Source: https://github.com/erc-8004/erc-8004-contracts
// Note: ERC-8004 spec defines Identity + Reputation registries on-chain.
// Validation is handled off-chain via hashing + identity metadata.

export const ERC8004_ADDRESSES = {
  // Hedera Testnet (Apex Hackathon — active)
  // Identity + Reputation: official ERC-8004 vanity deploys (same addresses cross-chain)
  // Validation: deployed by Selantar (custom implementation of IValidationRegistry)
  hederaTestnet: {
    identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as `0x${string}`,
    reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713" as `0x${string}`,
    // Deployed by Selantar — TX: 0x8048e03744e2811ebeeb69a559848076bccb3ac9e81789d83d82a18bc20ad013
    validationRegistry: "0xf3dd86fcc060639d3dd56fbf652b171aeabb1b58" as `0x${string}`,
  },
  // Base Sepolia (original deployment)
  baseSepolia: {
    identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as `0x${string}`,
    reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713" as `0x${string}`,
    validationRegistry: "0xd6f7d27ce23830c7a59acfca20197f9769a17120" as `0x${string}`,
  },
  // Base Mainnet (production)
  base: {
    identityRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
    reputationRegistry: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as `0x${string}`,
    validationRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
  },
} as const;
