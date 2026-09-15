import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { parseISO, addDays as fnsAddDays, subDays as fnsSubDays, format as fnsFormat } from "date-fns";

export interface BackfillWindow {
  earliestAllowed: string; // "YYYY-MM-DD"
  latestAllowed: string;   // "YYYY-MM-DD", always == today
}

/** Pure YYYY-MM-DD date math: subtract N days from ISO date string */
export function subtractDays(dateStr: string, days: number): string {
  const d = parseISO(dateStr);
  return fnsFormat(fnsSubDays(d, days), "yyyy-MM-dd");
}

/** Pure YYYY-MM-DD date math: add N days to ISO date string */
export function addDays(dateStr: string, days: number): string {
  const d = parseISO(dateStr);
  return fnsFormat(fnsAddDays(d, days), "yyyy-MM-dd");
}

/** Today's date string in the user's configured timezone. Single source of truth. */
export function todayInTimezone(timezone: string): string {
  const now = new Date();
  return formatInTimeZone(now, timezone, "yyyy-MM-dd");
}

/** Computes the inclusive backfill window: today minus N days through today. */
export function computeBackfillWindow(timezone: string, backfillDays: number): BackfillWindow {
  const today = todayInTimezone(timezone);
  const earliest = subtractDays(today, backfillDays);
  return { earliestAllowed: earliest, latestAllowed: today };
}

/** Authoritative validation — MUST be called server-side on every entry-create request. */
export function validateOccurredOn(
  occurredOn: string,
  timezone: string,
  backfillDays: number
): { valid: true } | { valid: false; reason: string } {
  const { earliestAllowed, latestAllowed } = computeBackfillWindow(timezone, backfillDays);
  if (occurredOn > latestAllowed) {
    return { valid: false, reason: "Future dates are not supported in MVP." };
  }
  if (occurredOn < earliestAllowed) {
    return {
      valid: false,
      reason: `This date is outside your current ${backfillDays}-day recording window.`,
    };
  }
  return { valid: true };
}
