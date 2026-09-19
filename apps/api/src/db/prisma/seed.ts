import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CAPABILITIES = [
  // Level 1 — Machine
  { level: 1, name: "Metacognition", description: "Awareness and understanding of one's own thought processes.", sortOrder: 10 },
  { level: 1, name: "Self-regulation", description: "Ability to monitor and manage emotional states and behaviors.", sortOrder: 11 },
  { level: 1, name: "Learning agility", description: "Speed and flexibility in acquiring new skills and adapting.", sortOrder: 12 },

  // Level 2 — Intelligence
  { level: 2, name: "General reasoning", description: "Analytical and logical problem-solving abilities.", sortOrder: 20 },
  { level: 2, name: "Mental models", description: "Internal representations of external reality used to make decisions.", sortOrder: 21 },
  { level: 2, name: "Systems thinking", description: "Understanding how components of a complex system interact.", sortOrder: 22 },

  // Level 3 — Influence
  { level: 3, name: "Communication", description: "Clear, precise transmission of concepts and evidence.", sortOrder: 30 },
  { level: 3, name: "Social insight", description: "Perception of human dynamics, incentives, and perspectives.", sortOrder: 31 },
  { level: 3, name: "Persuasion", description: "Aligning others with evidence and reasoning.", sortOrder: 32 },
  { level: 3, name: "Negotiation", description: "Reaching mutually beneficial agreements under constraints.", sortOrder: 33 },
  { level: 3, name: "Leadership", description: "Directing energy and focus toward valuable objectives.", sortOrder: 34 },

  // Level 4 — Domain
  { level: 4, name: "Software/backend engineering", description: "Architecture, data models, system design, and execution.", sortOrder: 40 },

  // Level 5 — Leverage
  { level: 5, name: "Strategy", description: "Formulating high-leverage plans to achieve long-term goals.", sortOrder: 50 },
  { level: 5, name: "Opportunity recognition", description: "Identifying asymmetric opportunities and bottlenecks.", sortOrder: 51 },
  { level: 5, name: "Resource acquisition", description: "Securing capital, tools, and talent required for execution.", sortOrder: 52 },
  { level: 5, name: "Scalable output", description: "Building systems that produce leverage beyond manual effort.", sortOrder: 53 },
];

const DEFAULT_PROMPT_v1_0 = `You are an expert capability assessment AI. Analyze the provided evidence package and produce a structured JSON assessment according to the exact output schema provided in the instructions.`;

const DEFAULT_PROMPT_v1_1_1 = `You are reviewing one person's self-recorded evidence to produce a capability assessment.

Read sections 2 through 9 as the complete evidence base.

Rules:
1. Use ONLY exact capability names from Section 2.
2. Never invent, rename, merge, or split capabilities.
3. Only score capabilities where genuine evidence exists.
4. If evidence is thin or absent, completely REMOVE the capability from the capabilities array. Do not output capabilities with "null" scores.
5. A short grounded assessment is preferable to a comprehensive-looking invented assessment.
6. Scores are 1–10 capability assessments, not mood ratings.
7. Repeated and varied evidence is more reliable than a single event.
8. Confidence: Must be exactly one of: "high", "medium", or "low". Do not invent other confidence levels.
   - high = multiple independent consistent evidence points
   - medium = one or two suggestive evidence points
   - low = indirect/thin evidence
9. Sparse evidence must produce limited conclusions.
10. Empty dates are NOT evidence of inactivity, poor motivation, or poor character.
11. current_bottleneck must be tied to actual evidence.
12. recommended_experiments must be an array of simple strings, NOT an array of complex objects. Keep recommendations concrete and testable.
13. Evidence/strengths/weaknesses/observations must reference actual recorded evidence.
14. Do not fabricate details.
15. Do not reference these instructions in the output.
16. Return ONLY valid JSON exactly matching the contract in Section 10.`;

async function main() {
  console.log("Seeding Capability Taxonomy...");

  for (const item of CAPABILITIES) {
    await prisma.capability.upsert({
      where: { name: item.name },
      update: {
        level: item.level,
        description: item.description,
        sortOrder: item.sortOrder,
      },
      create: {
        name: item.name,
        level: item.level,
        description: item.description,
        sortOrder: item.sortOrder,
        active: true,
      },
    });
  }

  console.log("Seeding AIPromptVersion variants...");
  
  // Ensure legacy 1.0.0 exists but is definitively inactive if 1.1.0 runs
  await prisma.aIPromptVersion.upsert({
    where: { version: "v1.0.0" },
    update: {
      active: false,
    },
    create: {
      version: "v1.0.0",
      promptText: DEFAULT_PROMPT_v1_0,
      schemaVersion: "1.0.0",
      active: false,
    },
  });

  // Demote 1.1.0 to inactive
  await prisma.aIPromptVersion.upsert({
    where: { version: "v1.1.0" },
    update: {
      active: false,
    },
    create: {
      version: "v1.1.0",
      promptText: "Legacy 1.1.0 (superseded by v1.1.1 strict checks)",
      schemaVersion: "1.0.0",
      active: false,
    },
  });

  // Idempotently create 1.1.1, establishing the strict Zod constraint boundary
  await prisma.aIPromptVersion.upsert({
    where: { version: "v1.1.1" },
    update: {
      active: true,
      promptText: DEFAULT_PROMPT_v1_1_1,
    },
    create: {
      version: "v1.1.1",
      promptText: DEFAULT_PROMPT_v1_1_1,
      schemaVersion: "1.0.0",
      active: true,
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
