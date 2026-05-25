/**
 * Parse application.status (e.g. "Step3") into a numeric step 1–6.
 */
export function getApplicationStepNumber(status) {
  const match = String(status ?? "").match(/(\d+)$/);
  const step = match ? parseInt(match[1], 10) : 1;
  return Number.isFinite(step) && step >= 1 ? step : 1;
}

/** Visa tab, visa stats, and visa journey steps are visible from Step4 onward. */
export function canAccessVisaSection(status) {
  return getApplicationStepNumber(status) >= 4;
}

/** German Life tab is visible from Step6 onward (after Step5). */
export function canAccessGermanLifeSection(status) {
  return getApplicationStepNumber(status) >= 6;
}

const FOCUS_LABELS = {
  1: "University Documents",
  2: "Universities",
  3: "Blocked Account",
  4: "Visa Documents",
  5: "Visa Appointment",
  6: "Complete",
};

export function getJourneyFocusLabel(status) {
  const step = getApplicationStepNumber(status);
  return FOCUS_LABELS[step] ?? FOCUS_LABELS[1];
}

export const TAB_ACCESS_DENIED = {
  tasks: {
    title: "Visa section not available yet",
    message:
      "You don’t have access to view this section at the moment. Please complete the required steps or contact your counselor if you need assistance.",
  },
  germanLife: {
    title: "German Life not available yet",
    message:
      "You don’t have access to view this section at the moment. Please complete the required steps or contact your counselor if you need assistance.",
  },
};
