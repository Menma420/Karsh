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
        experiments: true,
        decisions: true,
        learningRecords: true,
        reviews: true,
        capabilities: true,
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
        experiments: true,
        decisions: false,
        learningRecords: false,
        reviews: false,
        capabilities: false,
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
});
