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

const DEFAULT_PROMPT = `You are an expert capability assessment AI. Analyze the provided evidence package and produce a structured JSON assessment according to the exact output schema provided in the instructions.`;

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

  console.log("Seeding AIPromptVersion v1.0.0...");
  await prisma.aIPromptVersion.upsert({
    where: { version: "v1.0.0" },
    update: {
      promptText: DEFAULT_PROMPT,
      schemaVersion: "1.0.0",
    },
    create: {
      version: "v1.0.0",
      promptText: DEFAULT_PROMPT,
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
