import { tool } from "ai";
import { z } from "zod";
import {
  generateMonitoringPlan as generatePlan,
  adjustPlan as adjust,
} from "@/lib/agents/sentinel-plan-agents";

export const generateMonitoringPlan = tool({
  description:
    "Generate a monitoring plan for a parsed contract with specific actions, schedules, and integrations.",
  inputSchema: z.object({
    contractData: z
      .string()
      .describe("JSON stringified ParsedContract data from the contract parser"),
  }),
  execute: async ({ contractData }, { abortSignal }) => {
    const plan = await generatePlan(contractData, abortSignal);
    return plan;
  },
});

export const adjustPlan = tool({
  description:
    "Adjust an existing monitoring plan based on user request. Can add, remove, or modify actions.",
  inputSchema: z.object({
    userMessage: z
      .string()
      .describe("The user's request to modify the plan"),
    currentPlan: z
      .string()
      .describe("JSON stringified current MonitoringPlan"),
    contractData: z
      .string()
      .describe("JSON stringified ParsedContract data"),
  }),
  execute: async ({ userMessage, currentPlan, contractData }, { abortSignal }) => {
    const plan = await adjust(userMessage, currentPlan, contractData, abortSignal);
    return plan;
  },
});
