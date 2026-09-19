import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../server";
import { prisma } from "../../db/client";
import { todayInTimezone, subtractDays, addDays } from "../../lib/date";

describe("Experiments & Evidence M:N Integration Tests", () => {
  let cookie1: string;
  let cookie2: string; // for cross-user tests
  const tz = "Asia/Kolkata";
  const today = todayInTimezone(tz);

  beforeAll(async () => {
    // SECURITY GUARDRAIL: Never allow wiping data against the production branch!
    if (process.env.NEON_BRANCH === "production" || process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("ep-cool-heart")) {
      console.error("FATAL: Refusing to execute integration tests against production DB!");
      process.exit(1);
    }

    // Clean database before test suite
    await prisma.experimentEntryLink.deleteMany();
    await prisma.entryTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.experiment.deleteMany();
    await prisma.reflectionEntry.deleteMany();
    await prisma.decision.deleteMany();
    await prisma.learningRecord.deleteMany();
    await prisma.weeklyReview.deleteMany();
    await prisma.monthlyReview.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.capabilityAssessment.deleteMany();
    await prisma.aIAssessment.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();

    // Setup User A
    const res1 = await request(app)
      .post("/auth/register")
      .send({ email: "user_a@experiments.os", password: "Password123!" });
    cookie1 = res1.headers["set-cookie"][0];
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("1. Creating relationship: Experiment ←→ Entry links successfully", async () => {
    // 1. Create Exp
    const expRes = await request(app)
      .post("/experiments")
      .set("Cookie", cookie1)
      .send({
        problem: "Test Exp 1",
        hypothesis: "H1",
        intervention: "I1",
        measurement: "M1",
        startDate: today
      });
    expect(expRes.status).toBe(201);
    const expId = expRes.body.experiment.id;

    // 2. Create Entry
    const entryRes = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie1)
      .send({ occurredOn: today, title: "Test Entry 1" });
    expect(entryRes.status).toBe(201);
    const entryId = entryRes.body.entry.id;

    // 3. Link them
    const linkRes = await request(app)
      .post(`/experiments/${expId}/link-entry`)
      .set("Cookie", cookie1)
      .send({ entryId });
    expect(linkRes.status).toBe(200);

    // 4. Fetch Experiment to verify link inclusion
    const fetchExp = await request(app)
      .get(`/experiments/${expId}`)
      .set("Cookie", cookie1);
    
    expect(fetchExp.status).toBe(200);
    expect(fetchExp.body.experiment.linkedEntries.length).toBe(1);
    expect(fetchExp.body.experiment.linkedEntries[0].entry.title).toBe("Test Entry 1");
  }, 30000);

  it("2. Multiple evidence entries map correctly and sort chronologically", async () => {
    const expRes = await request(app)
      .post("/experiments")
      .set("Cookie", cookie1)
      .send({ problem: "Sorting Exp", hypothesis: "H", intervention: "I", measurement: "M", startDate: today });
    const expId = expRes.body.experiment.id;

    const day1 = subtractDays(today, 5);
    const day2 = subtractDays(today, 2);

    const [e1, e2] = await Promise.all([
      request(app).post("/reflection-entries").set("Cookie", cookie1).send({ occurredOn: day2, title: "Day 2 Entry" }),
      request(app).post("/reflection-entries").set("Cookie", cookie1).send({ occurredOn: day1, title: "Day 1 Entry" })
    ]);

    await request(app).post(`/experiments/${expId}/link-entry`).set("Cookie", cookie1).send({ entryId: e1.body.entry.id });
    await request(app).post(`/experiments/${expId}/link-entry`).set("Cookie", cookie1).send({ entryId: e2.body.entry.id });

    // Fetch and check chronological sorting
    const fetchExp = await request(app).get(`/experiments/${expId}`).set("Cookie", cookie1);
    expect(fetchExp.body.experiment.linkedEntries.length).toBe(2);
    
    // Day 1 entry must appear first due to chronological sorting rules
    expect(fetchExp.body.experiment.linkedEntries[0].entry.title).toBe("Day 1 Entry");
    expect(fetchExp.body.experiment.linkedEntries[1].entry.title).toBe("Day 2 Entry");
  }, 30000);

  it("3. Unlinking removes relation but preserves root entities", async () => {
    // Generate Exp & Entry
    const expRes = await request(app)
      .post("/experiments")
      .set("Cookie", cookie1)
      .send({ problem: "Unlink target", hypothesis: "H", intervention: "I", measurement: "M", startDate: today });
    const expId = expRes.body.experiment.id;

    const entryRes = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie1)
      .send({ occurredOn: today, title: "To be unlinked" });
    const entryId = entryRes.body.entry.id;

    await request(app).post(`/experiments/${expId}/link-entry`).set("Cookie", cookie1).send({ entryId });

    // Unlink
    const unlinkRes = await request(app).delete(`/experiments/${expId}/entries/${entryId}`).set("Cookie", cookie1);
    expect(unlinkRes.status).toBe(200);

    // Verify Exp has zero links but exists
    const fetchExp = await request(app).get(`/experiments/${expId}`).set("Cookie", cookie1);
    expect(fetchExp.body.experiment.linkedEntries.length).toBe(0);

    // Verify Entry still exists
    const fetchEntry = await request(app).get(`/reflection-entries/${entryId}`).set("Cookie", cookie1);
    expect(fetchEntry.status).toBe(200);
    expect(fetchEntry.body.entry.title).toBe("To be unlinked");
  }, 30000);

  it("4. Duplicate link attempts handle idempotently without duplication", async () => {
    const expRes = await request(app)
      .post("/experiments")
      .set("Cookie", cookie1)
      .send({ problem: "Dup block", hypothesis: "H", intervention: "I", measurement: "M", startDate: today });
    const expId = expRes.body.experiment.id;

    const entryRes = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie1)
      .send({ occurredOn: today, title: "Dup target" });
    const entryId = entryRes.body.entry.id;

    await request(app).post(`/experiments/${expId}/link-entry`).set("Cookie", cookie1).send({ entryId });
    const secondTry = await request(app).post(`/experiments/${expId}/link-entry`).set("Cookie", cookie1).send({ entryId });
    
    expect(secondTry.status).toBe(200); // Idempotent upsert success

    const fetchExp = await request(app).get(`/experiments/${expId}`).set("Cookie", cookie1);
    expect(fetchExp.body.experiment.linkedEntries.length).toBe(1);
  }, 30000);

  it("5. Cross-user isolation protects links (Security)", async () => {
    const expRes = await request(app)
      .post("/experiments")
      .set("Cookie", cookie1)
      .send({ problem: "A Exp", hypothesis: "H", intervention: "I", measurement: "M", startDate: today });
    const expIdA = expRes.body.experiment.id;

    // Direct DB insertion bypassing Auth routes
    const alienUser = await prisma.user.create({ data: { email: "alien@system.os", passwordHash: "x" } });
    const alienEntry = await prisma.reflectionEntry.create({
      data: {
        userId: alienUser.id,
        occurredOn: new Date(today + "T00:00:00.000Z"),
        title: "Alien Evidence"
      }
    });

    // User A cannot link Alien's entry
    const mapAttempt = await request(app)
        .post(`/experiments/${expIdA}/link-entry`)
        .set("Cookie", cookie1)
        .send({ entryId: alienEntry.id });
    expect(mapAttempt.status).toBe(404);
  }, 30000);
  
  it("6. AI package extracts nested Markdown hierarchical evidence mappings safely", async () => {
    // Generate isolated dataset for AI Package testing
    const expRes = await request(app)
      .post("/experiments")
      .set("Cookie", cookie1)
      .send({ problem: "AI Package Exp", hypothesis: "H10", intervention: "Intervention Protocol Node", measurement: "M", startDate: today });
    const expId = expRes.body.experiment.id;

    const entryRes = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie1)
      .send({ occurredOn: today, title: "AI Package Injection", intent: "Root debug" });
    
    await request(app).post(`/experiments/${expId}/link-entry`).set("Cookie", cookie1).send({ entryId: entryRes.body.entry.id });

    // Build the AI Package payload structurally
    const payloadRes = await request(app)
      .post("/ai/review-package")
      .set("Cookie", cookie1)
      .send({
        periodStart: subtractDays(today, 5),
        periodEnd: addDays(today, 2),
        include: {
          experiments: true,
          decisions: false,
          learningRecords: false,
          reviews: false,
          capabilityHistory: false
        }
      });
      
    expect(payloadRes.status).toBe(200);
    const md = payloadRes.body.markdown;

    // Verify relationships compiled functionally
    expect(md).toContain("### AI Package Exp");
    expect(md).toContain("Protocol:");
    expect(md).toContain("Intervention Protocol Node");
    expect(md).toContain("Linked Evidence:");
    expect(md).toContain("AI Package Injection");
  }, 30000);
});
