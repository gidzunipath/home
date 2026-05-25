/**
 * Generates a referral code using:
 *   [First 3 letters of name (uppercase)][Last digit of year][MMDD]
 *
 * Examples:
 *   "John", 2026-05-23  →  JOH60523
 *   "Alice", 2026-12-01 →  ALI61201
 */
export function generateReferralCode(firstName, date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);

  const namePrefix = (firstName || "")
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  const yearDigit = String(d.getFullYear()).slice(-1);

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${namePrefix}${yearDigit}${mm}${dd}`;
}
