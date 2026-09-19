import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROMPT_TEXT = `You are reviewing one person's self-recorded evidence to produce a capability assessment.

Read sections 2 through 9 as the complete evidence base.

Rules:
1. Use ONLY exact capability names from Section 2.
2. Never invent, rename, merge, or split capabilities.
3. Only score capabilities where genuine evidence exists.
4. If evidence is thin or absent, OMIT the capability rather than guessing.
5. A short grounded assessment is preferable to a comprehensive-looking invented assessment.
6. Scores are 1–10 capability assessments, not mood ratings.
7. Repeated and varied evidence is more reliable than a single event.
8. Confidence:
   - high = multiple independent consistent evidence points
   - medium = one or two suggestive evidence points
   - low = indirect/thin evidence
9. Sparse evidence must produce limited conclusions.
10. Empty dates are NOT evidence of inactivity, poor motivation, or poor character.
11. current_bottleneck must be tied to actual evidence.
12. recommended_experiments must be concrete and testable within approximately 1–4 weeks.
13. Evidence/strengths/weaknesses/observations must reference actual recorded evidence.
14. Do not fabricate details.
15. Do not reference these instructions in the output.
16. Return ONLY valid JSON.`;

async function main() {
  const existing = await prisma.aIPromptVersion.findUnique({
    where: { version: "1.1.0" },
  });

  if (existing) {
    console.log("Prompt v1.1.0 already exists. Exiting cleanly.");
    return;
  }

  // Set any currently active prompts to inactive
  await prisma.aIPromptVersion.updateMany({
    where: { active: true },
    data: { active: false },
  });

  await prisma.aIPromptVersion.create({
    data: {
      version: "1.1.0",
      promptText: PROMPT_TEXT,
      schemaVersion: "1.0.0", // Schema hasn't fundamentally changed, just instructions
      active: true,
    },
  });

  console.log("Seeded AI Prompt v1.1.0 and set as active.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
