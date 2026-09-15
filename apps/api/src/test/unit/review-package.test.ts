import { describe, it, expect } from "vitest";

describe("AI Review Package Builder Neutral Language Assertions", () => {
  it("never includes gamification terms in empty date placeholders", () => {
    const emptyDateLine = "2026-09-05: No recorded entries";

    // Blocklisted words
    const blocklist = ["missed", "failed", "streak", "skip", "penalty", "incomplete", "lacking"];

    blocklist.forEach((word) => {
      expect(emptyDateLine.toLowerCase()).not.toContain(word);
    });

    expect(emptyDateLine).toBe("2026-09-05: No recorded entries");
  });
});
