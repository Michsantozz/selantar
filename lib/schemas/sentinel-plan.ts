import { z } from "zod";

// -- Acao de monitoramento --
export const MonitoringActionSchema = z.object({
  id: z.string().describe("Unique ID, e.g. act-github-m1"),
  label: z.string().describe("Short label, max 4 words, e.g. 'Monitor GitHub'"),
  description: z.string().describe("Brief description, max 15 words"),
  icon: z.enum([
    "github",
    "whatsapp",
    "deploy",
    "api",
    "escrow",
    "calendar",
    "monitor",
    "email",
    "slack",
  ]),
  frequency: z.string().describe("e.g. daily, weekly, pre-milestone"),
  target: z.string().nullable(),
  milestone: z.string().nullable().describe("Short milestone name, max 3 words"),
  rationale: z.string().describe("1 sentence max explaining why"),
});

// -- Plano completo --
export const MonitoringPlanSchema = z.object({
  summary: z.string().describe("1-2 sentence summary in English"),
  actions: z.array(MonitoringActionSchema),
  milestones: z.array(
    z.object({
      id: z.string(),
      label: z.string().describe("Short label, max 3 words"),
      value: z.string().describe("e.g. R$ 800, $1,200"),
      deadline: z.string(),
      index: z.number(),
    })
  ),
  dates: z.array(
    z.object({
      milestoneId: z.string(),
      day: z.string(),
      month: z.string(),
      isLate: z.boolean().nullable(),
    })
  ),
  riskNotes: z.array(z.string().describe("Max 12 words each")),
});

// -- Tipos TypeScript inferidos --
export type MonitoringAction = z.infer<typeof MonitoringActionSchema>;
export type MonitoringPlan = z.infer<typeof MonitoringPlanSchema>;
