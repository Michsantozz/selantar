import { z } from "zod";

// -- Parties & Header --
export const PartySchema = z.object({
  role: z.string(),
  name: z.string(),
  identifier: z.string(),
  representative: z.string(),
  city: z.string(),
  initials: z.string(),
});

export const ContractHeaderSchema = z.object({
  subject: z.string(),
  parties: z.array(PartySchema).min(2),
  payment: z.object({
    total: z.string(),
    terms: z.string(),
  }),
  timeline: z.object({
    start: z.string(),
    end: z.string(),
    durationDays: z.number(),
  }),
  jurisdiction: z.string(),
});

// -- Risks --
export const RiskItemSchema = z.object({
  id: z.string(),
  clause: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  originalText: z.string(),
  suggestion: z.string(),
});

export const RisksOutputSchema = z.object({
  risks: z.array(RiskItemSchema),
});

// -- Milestones --
export const MilestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(), // plain number, no currency symbols
  deadline: z.string(),
  deliverables: z.string(),
});

export const MilestonesOutputSchema = z.object({
  milestones: z.array(MilestoneSchema),
});

// -- Clause Scores --
export const ClauseScoreSchema = z.object({
  clause: z.string(),
  score: z.number().min(0).max(100),
  verdict: z.enum(["safe", "caution", "danger"]),
  rationale: z.string(),
});

export const ClauseScoresOutputSchema = z.object({
  scores: z.array(ClauseScoreSchema),
});

// -- Deploy Plan --
export const DeployStepSchema = z.object({
  label: z.string(),
  status: z.enum(["done", "current", "pending"]),
  detail: z.string().optional(),
});

export const DeployPlanOutputSchema = z.object({
  steps: z.array(DeployStepSchema),
  parties: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      wallet: z.string(),
    })
  ),
  milestoneSummary: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      deadline: z.string(),
    })
  ),
  escrowTotal: z.string(),
  network: z.string(),
  standard: z.string(),
});

// -- Tipo completo do resultado (parcial — qualquer campo pode faltar) --
export const ParsedContractSchema = z.object({
  header: ContractHeaderSchema.nullable(),
  risks: RisksOutputSchema.nullable(),
  milestones: MilestonesOutputSchema.nullable(),
  clauseScores: ClauseScoresOutputSchema.nullable(),
  deployPlan: DeployPlanOutputSchema.nullable(),
});

// -- Tipos TypeScript inferidos --
export type Party = z.infer<typeof PartySchema>;
export type ContractHeader = z.infer<typeof ContractHeaderSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type ClauseScore = z.infer<typeof ClauseScoreSchema>;
export type DeployPlan = z.infer<typeof DeployPlanOutputSchema>;
export type ParsedContract = z.infer<typeof ParsedContractSchema>;
