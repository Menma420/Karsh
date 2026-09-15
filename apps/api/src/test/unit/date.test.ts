import { describe, it, expect } from "vitest";
import { todayInTimezone, computeBackfillWindow, validateOccurredOn, subtractDays, addDays } from "../../lib/date";

describe("Canonical Date Module (apps/api/src/lib/date.ts)", () => {
  const tz = "Asia/Kolkata";

  it("calculates today string in timezone", () => {
    const today = todayInTimezone(tz);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("computes backfill window correctly for N = 7", () => {
    const today = todayInTimezone(tz);
    const window = computeBackfillWindow(tz, 7);
    expect(window.latestAllowed).toBe(today);
    expect(window.earliestAllowed).toBe(subtractDays(today, 7));
  });

  it("computes backfill window correctly for N = 0 (only today allowed)", () => {
    const today = todayInTimezone(tz);
    const window = computeBackfillWindow(tz, 0);
    expect(window.latestAllowed).toBe(today);
    expect(window.earliestAllowed).toBe(today);

    // today should pass
    expect(validateOccurredOn(today, tz, 0)).toEqual({ valid: true });
    // yesterday should fail
    const yesterday = subtractDays(today, 1);
    expect(validateOccurredOn(yesterday, tz, 0).valid).toBe(false);
  });

  it("enforces backfill boundaries accurately for N = 7", () => {
    const today = todayInTimezone(tz);
    const earliest = subtractDays(today, 7);
    const tooOld = subtractDays(today, 8);
    const future = addDays(today, 1);

    // today -> PASS
    expect(validateOccurredOn(today, tz, 7)).toEqual({ valid: true });

    // today - 7 -> PASS
    expect(validateOccurredOn(earliest, tz, 7)).toEqual({ valid: true });

    // today - 8 -> FAIL
    const tooOldRes = validateOccurredOn(tooOld, tz, 7);
    expect(tooOldRes.valid).toBe(false);
    if (!tooOldRes.valid) {
      expect(tooOldRes.reason).toContain("outside your current 7-day recording window");
    }

    // today + 1 -> FAIL
    const futureRes = validateOccurredOn(future, tz, 7);
    expect(futureRes.valid).toBe(false);
    if (!futureRes.valid) {
      expect(futureRes.reason).toBe("Future dates are not supported in MVP.");
    }
  });
});
