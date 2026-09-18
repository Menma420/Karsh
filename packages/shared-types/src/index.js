"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAPABILITY_LEVELS = exports.AIAssessmentSchema = exports.CapabilityScoreSchema = exports.ReviewPackageRequestSchema = exports.MonthlyReviewSchema = exports.WeeklyReviewSchema = exports.CreateLearningRecordSchema = exports.UpdateDecisionSchema = exports.CreateDecisionSchema = exports.UpdateExperimentSchema = exports.CreateExperimentSchema = exports.ExperimentStatusEnum = exports.UpdateEntrySchema = exports.CreateEntrySchema = exports.UpdateSettingsSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
// --- Auth Schemas ---
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1, "Password is required"),
});
// --- Settings Schema ---
exports.UpdateSettingsSchema = zod_1.z.object({
    backfillDays: zod_1.z.number().int().min(0).max(730).optional(),
    timezone: zod_1.z.string().min(1).optional(),
});
// --- Reflection Entry Schemas ---
exports.CreateEntrySchema = zod_1.z.object({
    occurredOn: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "occurredOn must be YYYY-MM-DD"),
    occurredAt: zod_1.z.string().datetime().optional().nullable(),
    title: zod_1.z.string().optional().nullable(),
    intent: zod_1.z.string().optional().nullable(),
    outcome: zod_1.z.string().optional().nullable(),
    wentWell: zod_1.z.string().optional().nullable(),
    struggle: zod_1.z.string().optional().nullable(),
    whyItHappened: zod_1.z.string().optional().nullable(),
    learned: zod_1.z.string().optional().nullable(),
    willChange: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.UpdateEntrySchema = exports.CreateEntrySchema.omit({ occurredOn: true }).partial();
// --- Experiment Schemas ---
exports.ExperimentStatusEnum = zod_1.z.enum(["PLANNED", "ACTIVE", "COMPLETED", "ABANDONED"]);
exports.CreateExperimentSchema = zod_1.z.object({
    problem: zod_1.z.string().min(1, "Problem description is required"),
    hypothesis: zod_1.z.string().min(1, "Hypothesis is required"),
    intervention: zod_1.z.string().min(1, "Intervention is required"),
    measurement: zod_1.z.string().min(1, "Measurement method is required"),
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    status: exports.ExperimentStatusEnum.default("PLANNED"),
    result: zod_1.z.string().optional().nullable(),
    lesson: zod_1.z.string().optional().nullable(),
    nextAction: zod_1.z.string().optional().nullable(),
});
exports.UpdateExperimentSchema = exports.CreateExperimentSchema.partial();
// --- Decision Schemas ---
exports.CreateDecisionSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    decision: zod_1.z.string().min(1, "Decision description is required"),
    context: zod_1.z.string().optional().nullable(),
    options: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    chosenOption: zod_1.z.string().optional().nullable(),
    reasoning: zod_1.z.string().optional().nullable(),
    assumptions: zod_1.z.string().optional().nullable(),
    expectedOutcome: zod_1.z.string().optional().nullable(),
    confidence: zod_1.z.number().int().min(1).max(10).optional().nullable(),
    actualOutcome: zod_1.z.string().optional().nullable(),
    lesson: zod_1.z.string().optional().nullable(),
});
exports.UpdateDecisionSchema = exports.CreateDecisionSchema.partial();
// --- Learning Record Schemas ---
exports.CreateLearningRecordSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    topic: zod_1.z.string().min(1, "Topic is required"),
    source: zod_1.z.string().optional().nullable(),
    whatLearned: zod_1.z.string().optional().nullable(),
    explanation: zod_1.z.string().optional().nullable(),
    application: zod_1.z.string().optional().nullable(),
    unresolvedQuestions: zod_1.z.string().optional().nullable(),
});
// --- Review Schemas ---
exports.WeeklyReviewSchema = zod_1.z.object({
    periodStart: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    answers: zod_1.z.record(zod_1.z.string()),
});
exports.MonthlyReviewSchema = zod_1.z.object({
    periodStart: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    answers: zod_1.z.record(zod_1.z.string()),
});
// --- AI Review Package Request ---
exports.ReviewPackageRequestSchema = zod_1.z.object({
    periodStart: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    include: zod_1.z.object({
        outcomes: zod_1.z.boolean().default(true),
        entries: zod_1.z.boolean().default(true),
        reviews: zod_1.z.boolean().default(true),
        experiments: zod_1.z.boolean().default(true),
        decisions: zod_1.z.boolean().default(true),
        learningRecords: zod_1.z.boolean().default(true),
        capabilityHistory: zod_1.z.boolean().default(true),
    }).default({}),
});
// --- AI Assessment Output JSON Contract (PRD §20 & Engineering Plan §8) ---
exports.CapabilityScoreSchema = zod_1.z.object({
    capability: zod_1.z.string(),
    score: zod_1.z.number().int().min(1).max(10),
    previous_score: zod_1.z.number().int().min(1).max(10).nullable(),
    confidence: zod_1.z.enum(["low", "medium", "high"]),
    evidence: zod_1.z.array(zod_1.z.string()).default([]),
    strengths: zod_1.z.array(zod_1.z.string()).default([]),
    weaknesses: zod_1.z.array(zod_1.z.string()).default([]),
    observations: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.AIAssessmentSchema = zod_1.z.object({
    assessment_period: zod_1.z.object({
        start: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    capabilities: zod_1.z.array(exports.CapabilityScoreSchema).min(1),
    current_bottleneck: zod_1.z.object({
        capability: zod_1.z.string(),
        reason: zod_1.z.string(),
    }),
    recurring_patterns: zod_1.z.array(zod_1.z.string()).default([]),
    successful_interventions: zod_1.z.array(zod_1.z.string()).default([]),
    failed_interventions: zod_1.z.array(zod_1.z.string()).default([]),
    recommended_experiments: zod_1.z.array(zod_1.z.string()).default([]),
    strategic_observations: zod_1.z.array(zod_1.z.string()).default([]),
});
// --- Capability Taxonomy Levels ---
exports.CAPABILITY_LEVELS = [
    { level: 1, name: "Machine", items: ["Metacognition", "Self-regulation", "Learning agility"] },
    { level: 2, name: "Intelligence", items: ["General reasoning", "Mental models", "Systems thinking"] },
    { level: 3, name: "Influence", items: ["Communication", "Social insight", "Persuasion", "Negotiation", "Leadership"] },
    { level: 4, name: "Domain", items: ["Software/backend engineering"] },
    { level: 5, name: "Leverage", items: ["Strategy", "Opportunity recognition", "Resource acquisition", "Scalable output"] }
];
