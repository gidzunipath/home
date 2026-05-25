/**
 * Stored `universities.status` values and display labels.
 * Legacy: progress → Submitted, yes → Accepted, no → Rejected.
 */

export const UNIVERSITY_STATUSES = [
  { value: "started", label: "Started" },
  { value: "submitted", label: "Submitted" },
  { value: "verification", label: "Verification" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const LEGACY_TO_CANONICAL = {
  progress: "submitted",
  "in progress": "submitted",
  yes: "accepted",
  no: "rejected",
  approved: "accepted",
  declined: "rejected",
};

export function normalizeUniversityStatus(status) {
  if (status == null || status === "") return "";
  const key = String(status).trim().toLowerCase();
  return LEGACY_TO_CANONICAL[key] ?? key;
}

export function getUniversityStatusLabel(status) {
  const v = normalizeUniversityStatus(status);
  const found = UNIVERSITY_STATUSES.find((s) => s.value === v);
  if (found) return found.label;
  if (status) return String(status);
  return "—";
}

/**
 * Client UI: progress bar fill for each university application status.
 * @returns {{ percent: number, tone: "green" | "red" | "neutral" }}
 */
export function getUniversityApplicationProgress(status) {
  const v = normalizeUniversityStatus(status);
  switch (v) {
    case "started":
      return { percent: 20, tone: "green" };
    case "submitted":
      return { percent: 50, tone: "green" };
    case "verification":
      return { percent: 70, tone: "green" };
    case "accepted":
      return { percent: 100, tone: "green" };
    case "rejected":
      return { percent: 100, tone: "red" };
    default:
      return { percent: 0, tone: "neutral" };
  }
}
