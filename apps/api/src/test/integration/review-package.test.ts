import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../db/client";
import { buildReviewPackage } from "../../modules/ai/review-package";
import { addDays, format, subDays } from "date-fns";

describe("AI Review Package Builder v2", () => {
  let testUserId = "";

  beforeAll(async () => {
    // SECURITY GUARDRAIL
    if (process.env.NEON_BRANCH === "production" || process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("ep-cool-heart")) {
      console.error("FATAL: Refusing to execute integration tests against production DB!");
      process.exit(1);
    }

    // Clean DB
    await prisma.experimentEntryLink.deleteMany();
    await prisma.experiment.deleteMany();
    await prisma.reflectionEntry.deleteMany();
    await prisma.decision.deleteMany();
    await prisma.learningRecord.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();
    await prisma.capabilityAssessment.deleteMany();
    await prisma.capability.deleteMany();

    const testUser = await prisma.user.create({
      data: {
        email: "test.review@karsh.os",
        passwordHash: "test_hash",
      }
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Teardown
    await prisma.experimentEntryLink.deleteMany();
    await prisma.experiment.deleteMany();
    await prisma.reflectionEntry.deleteMany();
    await prisma.decision.deleteMany();
    await prisma.learningRecord.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it("compresses exactly 30 consecutive empty dates", async () => {
    const today = new Date();
    const periodStart = format(subDays(today, 29), "yyyy-MM-dd");
    const periodEnd = format(today, "yyyy-MM-dd");

    const req = {
      periodStart,
      periodEnd,
      include: {
        entries: true,
        outcomes: true,
        experiments: true,
        decisions: true,
        learningRecords: true,
        reviews: true,
        capabilityHistory: true,
      }
    };

    const pkg = await buildReviewPackage(testUserId, req);
    expect(pkg.markdown).toContain(`**${periodStart} to ${periodEnd}** (30 days): No recorded entries.`);
    
    // Check forbidden words
    const mdLower = pkg.markdown.toLowerCase();
    expect(mdLower).not.toContain("missed");
    expect(mdLower).not.toContain("failed");
    expect(mdLower).not.toContain("streak");
    expect(mdLower).not.toContain("skipped");

    // All sections must exist
    expect(pkg.markdown).toContain("## 1. How to read this package");
    expect(pkg.markdown).toContain("## 2. Capability taxonomy");
    expect(pkg.markdown).toContain("## 3. Current objective & prior capability state");
    expect(pkg.markdown).toContain("## 4. Reflection entries");
    expect(pkg.markdown).toContain("## 5. Experiments");
    expect(pkg.markdown).toContain("## 6. Decisions");
    expect(pkg.markdown).toContain("## 7. Learning records");
    expect(pkg.markdown).toContain("## 8. Weekly / monthly reviews");
    expect(pkg.markdown).toContain("## 9. Recurring / unresolved items");
    expect(pkg.markdown).toContain("## 10. AI assessment instructions & output contract");
  });

  it("handles experiments M:N layout consistently with zero and multiple evidence", async () => {
    const today = new Date();
    const periodStart = format(subDays(today, 2), "yyyy-MM-dd");
    const periodEnd = format(today, "yyyy-MM-dd");

    // Create 1 entry
    const entry = await prisma.reflectionEntry.create({
      data: {
        userId: testUserId,
        occurredOn: today,
        title: "Test Entry",
        outcome: "Test Outcome",
      }
    });

    // Create Exp 1 (No evidence)
    await prisma.experiment.create({
      data: {
        userId: testUserId,
        problem: "Exp No Evidence",
        hypothesis: "Hyp 1",
        intervention: "Int 1",
        measurement: "Mes 1",
        startDate: today,
        status: "ACTIVE"
      }
    });

    // Create Exp 2 (With evidence)
    const exp2 = await prisma.experiment.create({
      data: {
        userId: testUserId,
        problem: "Exp With Evidence",
        hypothesis: "Hyp 2",
        intervention: "Int 2",
        measurement: "Mes 2",
        startDate: today,
        status: "ACTIVE"
      }
    });

    await prisma.experimentEntryLink.create({
      data: {
        experimentId: exp2.id,
        entryId: entry.id,
      }
    });

    const req = {
      periodStart,
      periodEnd,
      include: {
        entries: true,
        outcomes: true,
        experiments: true,
        decisions: false,
        learningRecords: false,
        reviews: false,
        capabilityHistory: false,
      }
    };

    const pkg = await buildReviewPackage(testUserId, req);
    
    // Verify Exp 1
    expect(pkg.markdown).toContain(`### Exp No Evidence`);
    expect(pkg.markdown).toContain(`*No evidence linked yet.*`);
    
    // Verify Exp 2
    expect(pkg.markdown).toContain(`### Exp With Evidence`);
    expect(pkg.markdown).toContain(`- ${periodEnd} — "Test Entry": Test Outcome`);
    
    // Both have identical trailing format
    expect(pkg.markdown).toContain("Result:\nNot yet recorded.");
    expect(pkg.markdown).toContain("Lesson:\nNot yet recorded.");
    expect(pkg.markdown).toContain("Next action:\nNot yet recorded.");
  });

  it("renders capability taxonomy dynamically based on active capabilities in the database", async () => {
    // Insert test capabilities
    await prisma.capability.create({
      data: { name: "Test Meta", level: 1, sortOrder: 1, active: true }
    });
    await prisma.capability.create({
      data: { name: "Test Systems", level: 2, sortOrder: 1, active: true }
    });
    
    // Insert an inactive one that should NOT appear
    await prisma.capability.create({
      data: { name: "Test Hidden", level: 3, sortOrder: 1, active: false }
    });

    const periodStart = "2026-09-01";
    const periodEnd = "2026-09-02";

    const pkg = await buildReviewPackage(testUserId, { 
      periodStart, 
      periodEnd, 
      include: {
        entries: true,
        outcomes: true,
        experiments: false,
        decisions: false,
        learningRecords: false,
        reviews: false,
        capabilityHistory: false,
      } 
    });

    expect(pkg.markdown).toContain("## 2. Capability taxonomy");
    expect(pkg.markdown).toContain("Level 1 — Machine");
    expect(pkg.markdown).toContain("- Test Meta");
    expect(pkg.markdown).toContain("Level 2 — Intelligence");
    expect(pkg.markdown).toContain("- Test Systems");

    // Must NOT contain inactive capabilities or empty levels
    expect(pkg.markdown).not.toContain("Test Hidden");
    expect(pkg.markdown).not.toContain("Level 3 — Influence");
    expect(pkg.markdown).not.toContain("Level 4 — Domain");

    // Clean up specifically for next tests
    await prisma.capability.deleteMany();
  });

  it("regression test: renders exact prompt version header (no double vv) and dynamic prompt text", async () => {
    // Setup a dummy active taxonomy so we bypass the fallback guards
    await prisma.capability.create({
      data: { name: "Test Cap", level: 1, sortOrder: 1, active: true }
    });

    // Create a precise mock AIPromptVersion
    const dynamicPromptText = "This string proves section 10 reads dynamically from DB!";
    const testPrompt = await prisma.aIPromptVersion.create({
      data: {
        version: "v9.9.9-beta", // Explicitly contains 'v'
        schemaVersion: "9.9.9",
        active: true,
        promptText: dynamicPromptText,
      }
    });

    const periodStart = "2026-09-01";
    const periodEnd = "2026-09-02";

    const pkg = await buildReviewPackage(testUserId, { 
      periodStart, 
      periodEnd, 
      include: {
        entries: false, outcomes: false, experiments: false, decisions: false, learningRecords: false, reviews: false, capabilityHistory: false
      } 
    });

    // Asset Header regression limit (Only one v)
    expect(pkg.markdown).toContain("Prompt v9.9.9-beta");
    expect(pkg.markdown).not.toContain("Prompt vv9.9.9-beta");
    expect(pkg.markdown).toContain("Schema v9.9.9");

    // Assert exact Section 10 render injection payload
    expect(pkg.markdown).toContain("## 10. AI assessment instructions & output contract");
    expect(pkg.markdown).toContain(dynamicPromptText);

    // Ensure it properly exported metadata payload downstream
    expect(pkg.promptVersionId).toBe(testPrompt.id);

    // Teardown
    await prisma.aIPromptVersion.deleteMany();
    await prisma.capability.deleteMany();
  });

  describe("Failure and Configuration State Handlers", () => {
    it("throws appropriately when active capability taxonomy is missing or entirely absent", async () => {
      await prisma.capability.deleteMany(); // Guaranteed empty

      const req = {
        periodStart: "2026-09-01",
        periodEnd: "2026-09-02",
        include: {
          entries: true,
          outcomes: true,
          experiments: false,
          decisions: false,
          learningRecords: false,
          reviews: false,
          capabilityHistory: false,
        }
      };

      await expect(buildReviewPackage(testUserId, req))
        .rejects
        .toThrow("Capability taxonomy is not initialized.");
        
      // Ensure the renderer performed absolutely NO writes (strict-read)
      const capCount = await prisma.capability.count();
      expect(capCount).toBe(0);
    });

    it("throws appropriately when the active AI Prompt version is missing entirely", async () => {
      await prisma.capability.create({
        data: { name: "Test Meta", level: 1, sortOrder: 1, active: true }
      });
      await prisma.aIPromptVersion.deleteMany(); // Purge all prompts

      const req = {
        periodStart: "2026-09-01",
        periodEnd: "2026-09-02",
        include: {
          entries: true,
          outcomes: true,
          experiments: false,
          decisions: false,
          learningRecords: false,
          reviews: false,
          capabilityHistory: false,
        }
      };

      await expect(buildReviewPackage(testUserId, req))
        .rejects
        .toThrow("Active AI review prompt is not configured.");
        
      // Ensure NO prompts were auto-injected
      const promptCount = await prisma.aIPromptVersion.count();
      expect(promptCount).toBe(0);
        
      await prisma.capability.deleteMany();
    });
  });

  describe("Canonical Seed Idempotency", () => {
    it("permits multiple seed executions without duplicating the 16-capability taxonomy or mutating historical prompts", async () => {
      // Execute the seed logic canonically by requiring it dynamically
      // Alternatively, we safely mimic the exact upsert logic since seed.ts executes on imported
      
      const execSync = require("child_process").execSync;
      // We run the seed script directly
      execSync("npx ts-node src/db/prisma/seed.ts", { 
        cwd: __dirname + "/../../../..", 
        env: { ...process.env } // Pass through vitest's mocked test environment
      });

      // Verify the canonical count is exactly 16
      const count1 = await prisma.capability.count({ where: { active: true } });
      expect(count1).toBe(16);

      // Verify v1.1.1 is active and v1.0.0 and v1.1.0 are inactive
      const activePrompt1 = await prisma.aIPromptVersion.findFirst({ where: { active: true } });
      expect(activePrompt1?.version).toBe("v1.1.1");

      const inactivePrompt1 = await prisma.aIPromptVersion.findFirst({ where: { version: "v1.1.0" } });
      expect(inactivePrompt1?.active).toBe(false);

      // Run it a SECOND time to prove idempotency
      execSync("npx ts-node src/db/prisma/seed.ts", { 
        cwd: __dirname + "/../../../..", 
        env: { ...process.env }
      });

      // Count must still be exactly 16
      const count2 = await prisma.capability.count({ where: { active: true } });
      expect(count2).toBe(16);

      // Only one active prompt should exist and it must still be v1.1.1
      const activePrompts = await prisma.aIPromptVersion.findMany({ where: { active: true } });
      expect(activePrompts.length).toBe(1);
      expect(activePrompts[0].version).toBe("v1.1.1");
      
      // Cleanup seeded data so we don't pollute other future tests
      await prisma.capability.deleteMany();
      await prisma.aIPromptVersion.deleteMany();
    });
  });
});
