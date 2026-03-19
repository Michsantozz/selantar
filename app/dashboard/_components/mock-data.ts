// Mock data for dashboard visualization
// These populate the panels when no real mediation session is active
// Chat mock is rendered inline in chat-panel.tsx (MockConversation component)

export const MOCK_CHAT_MESSAGES = [] as const;

export const MOCK_TOOL_PARTS = [
  {
    type: "tool-analyzeEvidence",
    state: "output-available" as const,
    output: {
      keyFindings: [
        "Contrato assinado em 15/01/2026 com clausula de entrega em 60 dias",
        "Desenvolvedor entregou 3 de 5 milestones dentro do prazo",
        "Cliente nao forneceu acesso ao ambiente de staging conforme acordado",
        "Comunicacao por email confirma extensao verbal de 2 semanas",
      ],
      credibilityScore: 78,
    },
    input: {
      evidence: "Contrato PDF + emails + commits do repositorio",
    },
    messageId: "mock-1",
  },
  {
    type: "tool-proposeSettlement",
    state: "output-available" as const,
    output: {
      proposal: {
        clientAmount: "3,200",
        developerAmount: "4,800",
        clientPercentage: 40,
      },
      reasoning:
        "O desenvolvedor completou 60% dos milestones dentro do prazo. O atraso parcial foi agravado pela falta de acesso ao staging fornecido pelo cliente. Proposta reflete responsabilidade compartilhada.",
    },
    input: {
      disputeAmount: "8000",
      currency: "USDC",
    },
    messageId: "mock-2",
  },
  {
    type: "tool-executeSettlement",
    state: "output-available" as const,
    output: {
      txHash: "0x7a3f8e2b1c9d4a5f6e7b8c9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      status: "confirmed",
      chain: "Base Sepolia",
    },
    input: {
      clientAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68",
      developerAddress: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
    },
    messageId: "mock-3",
  },
  {
    type: "tool-postFeedback",
    state: "output-available" as const,
    output: {
      txHash: "0xb4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
      status: "confirmed",
      chain: "Base Sepolia",
      rating: 4,
    },
    input: {
      agentId: "selantar-mediator-v1",
      rating: 4,
      comment: "Mediacao conduzida de forma justa e eficiente",
    },
    messageId: "mock-4",
  },
  {
    type: "tool-registerVerdict",
    state: "output-available" as const,
    output: {
      txHash: "0xc5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
      status: "confirmed",
      chain: "Base Sepolia",
      verdictHash: "0xabc123...def456",
    },
    input: {
      disputeId: "dispute-2026-0042",
      verdict: "settlement-partial",
    },
    messageId: "mock-5",
  },
];

export const MOCK_SETTLEMENT_DATA = [
  {
    type: "proposeSettlement",
    output: {
      proposal: {
        clientAmount: "3,200",
        developerAmount: "4,800",
        clientPercentage: 40,
      },
      reasoning:
        "O desenvolvedor completou 60% dos milestones dentro do prazo. O atraso parcial foi agravado pela falta de acesso ao staging fornecido pelo cliente. Proposta reflete responsabilidade compartilhada.",
    },
  },
  {
    type: "executeSettlement",
    output: {
      txHash: "0x7a3f8e2b1c9d4a5f6e7b8c9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      status: "confirmed",
      chain: "Base Sepolia",
    },
  },
  {
    type: "postFeedback",
    output: {
      txHash: "0xb4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
      status: "confirmed",
      chain: "Base Sepolia",
    },
  },
  {
    type: "registerVerdict",
    output: {
      txHash: "0xc5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
      status: "confirmed",
      chain: "Base Sepolia",
    },
  },
];
