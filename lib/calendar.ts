/**
 * Ethiopian Calendar (EC) <-> Gregorian Calendar (GC) year conversions.
 *
 * NOTE ON CONVERSION APPROXIMATION:
 * Since only a year is collected (no month or day), an Ethiopian year
 * cannot map to a single exact Gregorian year. An Ethiopian year spans
 * parts of two Gregorian calendar years because the Ethiopian New Year
 * (Enkutatash) falls on September 11 (or September 12 in a leap year).
 *
 * We use the standard day-level approximation:
 * - Stored in DB: GC = EC + 8 (the majority of the Ethiopian year's days
 *   fall in the latter Gregorian year, from January 1 to September 10).
 * - Loaded for edit: EC = GC - 8.
 * - Live dual-year preview: An Ethiopian year EC spans Gregorian years
 *   (EC + 7) and (EC + 8), formatted as "{EC+7}/{last 2 digits of EC+8} gc"
 *   (e.g. 2018 EC -> "2025/26 gc").
 */

/**
 * Converts an Ethiopian calendar year to the approximate stored Gregorian year.
 */
export function ecToGc(ecYear: number): number {
  return ecYear + 8;
}

/**
 * Converts a stored Gregorian year back to the Ethiopian calendar year for editing.
 */
export function gcToEc(gcYear: number): number {
  return gcYear - 8;
}

/**
 * Formats an Ethiopian calendar year as the Gregorian dual-year range it spans.
 * Output format: "{firstYear}/{lastTwoDigitsOfSecondYear} gc" (e.g., "2025/26 gc").
 * Returns null if the year is invalid or non-positive.
 */
export function formatEcAsGcRange(ecYear: number): string | null {
  if (!Number.isInteger(ecYear) || ecYear <= 0) {
    return null;
  }
  const gcStart = ecYear + 7;
  const gcEnd = ecYear + 8;
  const gcEndTwoDigits = String(Math.abs(gcEnd) % 100).padStart(2, "0");
  return `${gcStart}/${gcEndTwoDigits} gc`;
}

/**
 * Formats a stored Gregorian birth year for public display with both its
 * Ethiopian calendar year and Gregorian dual-year span.
 * Example: "2018 E.C. (2025/26 gc)" or with custom label.
 */
export function formatStoredGcYearDisplay(gcYear: number): string {
  const ec = gcToEc(gcYear);
  const range = formatEcAsGcRange(ec);
  if (!range) return String(gcYear);
  return `${ec} (${range})`;
}
