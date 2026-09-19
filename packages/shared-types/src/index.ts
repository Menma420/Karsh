import { z } from "zod";

// --- Auth Schemas ---
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// --- Settings Schema ---
export const UpdateSettingsSchema = z.object({
  backfillDays: z.number().int().min(0).max(730).optional(),
  timezone: z.string().min(1).optional(),
});
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// --- Reflection Entry Schemas ---
export const CreateEntrySchema = z.object({
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "occurredOn must be YYYY-MM-DD"),
  occurredAt: z.string().datetime().optional().nullable(),
  title: z.string().optional().nullable(),
  intent: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  wentWell: z.string().optional().nullable(),
  struggle: z.string().optional().nullable(),
  whyItHappened: z.string().optional().nullable(),
  learned: z.string().optional().nullable(),
  willChange: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});
export type CreateEntryInput = z.infer<typeof CreateEntrySchema>;

export const UpdateEntrySchema = CreateEntrySchema.omit({ occurredOn: true }).partial();
export type UpdateEntryInput = z.infer<typeof UpdateEntrySchema>;

// --- Experiment Schemas ---
export const ExperimentStatusEnum = z.enum(["PLANNED", "ACTIVE", "COMPLETED", "ABANDONED"]);
export type ExperimentStatus = z.infer<typeof ExperimentStatusEnum>;

export const CreateExperimentSchema = z.object({
  problem: z.string().min(1, "Problem description is required"),
  hypothesis: z.string().min(1, "Hypothesis is required"),
  intervention: z.string().min(1, "Intervention is required"),
  measurement: z.string().min(1, "Measurement method is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  status: ExperimentStatusEnum.default("PLANNED"),
  result: z.string().optional().nullable(),
  lesson: z.string().optional().nullable(),
  nextAction: z.string().optional().nullable(),
});
export type CreateExperimentInput = z.infer<typeof CreateExperimentSchema>;

export const UpdateExperimentSchema = CreateExperimentSchema.partial();
export type UpdateExperimentInput = z.infer<typeof UpdateExperimentSchema>;

// --- Decision Schemas ---
export const CreateDecisionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  decision: z.string().min(1, "Decision description is required"),
  context: z.string().optional().nullable(),
  options: z.array(z.string()).optional().nullable(),
  chosenOption: z.string().optional().nullable(),
  reasoning: z.string().optional().nullable(),
  assumptions: z.string().optional().nullable(),
  expectedOutcome: z.string().optional().nullable(),
  confidence: z.number().int().min(1).max(10).optional().nullable(),
  actualOutcome: z.string().optional().nullable(),
  lesson: z.string().optional().nullable(),
});
export type CreateDecisionInput = z.infer<typeof CreateDecisionSchema>;

export const UpdateDecisionSchema = CreateDecisionSchema.partial();
export type UpdateDecisionInput = z.infer<typeof UpdateDecisionSchema>;

// --- Learning Record Schemas ---
export const CreateLearningRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  topic: z.string().min(1, "Topic is required"),
  source: z.string().optional().nullable(),
  whatLearned: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  application: z.string().optional().nullable(),
  unresolvedQuestions: z.string().optional().nullable(),
});
export type CreateLearningRecordInput = z.infer<typeof CreateLearningRecordSchema>;

// --- Review Schemas ---
export const WeeklyReviewSchema = z.object({
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answers: z.record(z.string()),
}).refine(data => {
  const start = new Date(data.periodStart);
  const end = new Date(data.periodEnd);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}, { message: "Weekly review period cannot exceed 7 days", path: ["periodEnd"] });
export type WeeklyReviewInput = z.infer<typeof WeeklyReviewSchema>;

export const MonthlyReviewSchema = z.object({
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answers: z.record(z.string()),
}).refine(data => {
  const start = new Date(data.periodStart);
  const end = new Date(data.periodEnd);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 31;
}, { message: "Monthly review period cannot exceed 31 days", path: ["periodEnd"] });
export type MonthlyReviewInput = z.infer<typeof MonthlyReviewSchema>;

// --- AI Review Package Request ---
export const ReviewPackageRequestSchema = z.object({
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  include: z.object({
    outcomes: z.boolean().default(true),
    entries: z.boolean().default(true),
    reviews: z.boolean().default(true),
    experiments: z.boolean().default(true),
    decisions: z.boolean().default(true),
    learningRecords: z.boolean().default(true),
    capabilityHistory: z.boolean().default(true),
  }).default({}),
});
export type ReviewPackageRequest = z.infer<typeof ReviewPackageRequestSchema>;

// --- AI Assessment Output JSON Contract (PRD §20 & Engineering Plan §8) ---
export const CapabilityScoreSchema = z.object({
  capability: z.string(),
  score: z.number().int().min(1).max(10),
  previous_score: z.number().int().min(1).max(10).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  observations: z.array(z.string()).default([]),
});
export type CapabilityScore = z.infer<typeof CapabilityScoreSchema>;

export const AIAssessmentSchema = z.object({
  assessment_period: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  capabilities: z.array(CapabilityScoreSchema).min(1),
  current_bottleneck: z.object({
    capability: z.string(),
    reason: z.string(),
  }),
  recurring_patterns: z.array(z.string()).default([]),
  successful_interventions: z.array(z.string()).default([]),
  failed_interventions: z.array(z.string()).default([]),
  recommended_experiments: z.array(z.string()).default([]),
  strategic_observations: z.array(z.string()).default([]),
});
export type AIAssessmentPayload = z.infer<typeof AIAssessmentSchema>;

// --- Capability Taxonomy Levels ---
export const CAPABILITY_LEVELS = [
  { level: 1, name: "Machine", items: ["Metacognition", "Self-regulation", "Learning agility"] },
  { level: 2, name: "Intelligence", items: ["General reasoning", "Mental models", "Systems thinking"] },
  { level: 3, name: "Influence", items: ["Communication", "Social insight", "Persuasion", "Negotiation", "Leadership"] },
  { level: 4, name: "Domain", items: ["Software/backend engineering"] },
  { level: 5, name: "Leverage", items: ["Strategy", "Opportunity recognition", "Resource acquisition", "Scalable output"] }
] as const;
