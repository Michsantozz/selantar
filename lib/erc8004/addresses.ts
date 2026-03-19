// ERC-8004 Registry contract addresses
// Source: https://github.com/erc-8004/erc-8004-contracts
// Note: ERC-8004 spec defines Identity + Reputation registries on-chain.
// Validation is handled off-chain via hashing + identity metadata.

export const ERC8004_ADDRESSES = {
  // Base Sepolia (testnet — use during development)
  baseSepolia: {
    identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as `0x${string}`,
    reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713" as `0x${string}`,
    // Deployed by Selantar on 2026-03-19 — official ERC-8004 Validation Registry not yet deployed on Base Sepolia
    // Contract: ValidationRegistry (ERC-8004 spec compliant) — TX: 0xd770f4ab10efb44f90d1517d525cae3ddabf772b6246db977b148de3282313cd
    validationRegistry: "0xd6f7d27ce23830c7a59acfca20197f9769a17120" as `0x${string}`,
  },
  // Base Mainnet (production)
  base: {
    identityRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
    reputationRegistry: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as `0x${string}`,
    validationRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
  },
} as const;
