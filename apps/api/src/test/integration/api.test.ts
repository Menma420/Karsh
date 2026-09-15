import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../server";
import { prisma } from "../../db/client";
import { todayInTimezone, subtractDays, addDays } from "../../lib/date";

describe("Phase 0 & Phase 1 Integration Tests", () => {
  let cookie: string;
  const tz = "Asia/Kolkata";
  const today = todayInTimezone(tz);

  beforeAll(async () => {
    // Clean database before test suite
    await prisma.entryTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.experimentEntryLink.deleteMany();
    await prisma.reflectionEntry.deleteMany();
    await prisma.capabilityAssessment.deleteMany();
    await prisma.aIAssessment.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("PHASE 0: Single-user registration succeeds for the first user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "user@capability.os", password: "Password123!" });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("user@capability.os");

    // Cookie set
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    cookie = setCookie[0];
  });

  it("PHASE 0: Single-user registration rejects second registration attempt with 403", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "second@capability.os", password: "Password123!" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("REGISTRATION_DISABLED");
  });

  it("PHASE 0: Login with correct credentials returns 200 and session cookie", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@capability.os", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("user@capability.os");
    cookie = res.headers["set-cookie"][0];
  });

  it("PHASE 1: Multiple entries on the same occurredOn date are completely valid", async () => {
    const dStr = today;

    const res1 = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: dStr, intent: "First entry today", outcome: "Done 1" });

    const res2 = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: dStr, intent: "Second entry today", outcome: "Done 2" });

    const res3 = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: dStr, intent: "Third entry today", outcome: "Done 3" });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res3.status).toBe(201);

    const listRes = await request(app)
      .get(`/reflection-entries?from=${dStr}&to=${dStr}`)
      .set("Cookie", cookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.entries.length).toBe(3);
  });

  it("PHASE 1: Backfill boundary validation (backfillDays = 7)", async () => {
    const validPastDate = subtractDays(today, 7);
    const invalidPastDate = subtractDays(today, 8);
    const futureDate = addDays(today, 1);

    // today - 7 -> PASS
    const resValid = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: validPastDate, intent: "Late capture 7 days ago" });
    expect(resValid.status).toBe(201);
    expect(resValid.body.entry.occurredOn.startsWith(validPastDate)).toBe(true);

    // today - 8 -> FAIL 422
    const resInvalidPast = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: invalidPastDate, intent: "Too old entry" });
    expect(resInvalidPast.status).toBe(422);

    // today + 1 -> FAIL 422
    const resFuture = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: futureDate, intent: "Future entry" });
    expect(resFuture.status).toBe(422);
  });

  it("PHASE 1: Changing backfillDays from 7 to 2 retains historical visibility and editability, but rejects new out-of-window entries", async () => {
    const dayMinus5 = subtractDays(today, 5);

    // Create entry at today - 5 when backfillDays = 7
    const createRes = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: dayMinus5, intent: "Created when N=7" });
    expect(createRes.status).toBe(201);
    const entryId = createRes.body.entry.id;

    // Change backfillDays to 2
    const settingsRes = await request(app)
      .patch("/settings")
      .set("Cookie", cookie)
      .send({ backfillDays: 2 });
    expect(settingsRes.status).toBe(200);
    expect(settingsRes.body.settings.backfillDays).toBe(2);

    // 1. Existing entry is still viewable
    const getRes = await request(app)
      .get(`/reflection-entries/${entryId}`)
      .set("Cookie", cookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body.entry.intent).toBe("Created when N=7");

    // 2. Existing entry is still editable
    const patchRes = await request(app)
      .patch(`/reflection-entries/${entryId}`)
      .set("Cookie", cookie)
      .send({ notes: "Updated note on historical entry" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.entry.notes).toBe("Updated note on historical entry");

    // 3. Creating NEW entry at today - 3 is now rejected
    const dayMinus3 = subtractDays(today, 3);
    const newAttemptRes = await request(app)
      .post("/reflection-entries")
      .set("Cookie", cookie)
      .send({ occurredOn: dayMinus3, intent: "New entry attempt" });
    expect(newAttemptRes.status).toBe(422);
  });
});
