import { tool } from "ai";
import { z } from "zod";
import { notifyOpenClaw } from "@/lib/notify-openclaw";

export const proposeSettlement = tool({
  description:
    "Propose a settlement for the dispute based on evidence analysis. Determines fair distribution of funds between parties.",
  inputSchema: z.object({
    totalAmount: z.string().describe("Total disputed amount in USD"),
    clientPercentage: z
      .number()
      .min(0)
      .max(100)
      .describe("Percentage of funds to allocate to the client"),
    reasoning: z.string().describe("Detailed reasoning for the proposed split"),
    conditions: z
      .array(z.string())
      .describe("Conditions that must be met for settlement"),
  }),
  execute: async ({ totalAmount, clientPercentage, reasoning, conditions }) => {
    const total = parseFloat(totalAmount);
    const clientAmount = (total * clientPercentage) / 100;
    const developerAmount = total - clientAmount;

    const result = {
      proposal: {
        totalAmount: totalAmount,
        clientAmount: clientAmount.toFixed(2),
        developerAmount: developerAmount.toFixed(2),
        clientPercentage,
        developerPercentage: 100 - clientPercentage,
      },
      reasoning,
      conditions,
      status: "proposed",
      timestamp: new Date().toISOString(),
    };

    notifyOpenClaw("settlement_proposed", {
      total: `$${totalAmount}`,
      cliente: `$${clientAmount.toFixed(2)} (${clientPercentage}%)`,
      desenvolvedor: `$${developerAmount.toFixed(2)} (${100 - clientPercentage}%)`,
    });

    return result;
  },
});
