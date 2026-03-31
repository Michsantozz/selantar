import { z } from "zod";

// -- Acao de monitoramento --
export const MonitoringActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
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
  frequency: z.string(),
  target: z.string().nullable(),
  milestone: z.string().nullable(),
  rationale: z.string(),
});

// -- Plano completo --
export const MonitoringPlanSchema = z.object({
  summary: z.string(),
  actions: z.array(MonitoringActionSchema),
  milestones: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
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
  riskNotes: z.array(z.string()),
});

// -- Tipos TypeScript inferidos --
export type MonitoringAction = z.infer<typeof MonitoringActionSchema>;
export type MonitoringPlan = z.infer<typeof MonitoringPlanSchema>;
