/** Stored status value for completed applications (formerly Step6). */
export const SUCCESSFUL_STATUS = "Step7";

/** Stored status value for visa interview stage. */
export const INTERVIEW_STATUS = "Step6";

const TOTAL_JOURNEY_STEPS = 7;

/**
 * Parse application.status (e.g. "Step3") into a numeric step 1–7.
 */
export function getApplicationStepNumber(status) {
  const match = String(status ?? "").match(/(\d+)$/);
  const step = match ? parseInt(match[1], 10) : 1;
  return Number.isFinite(step) && step >= 1 ? step : 1;
}

/** True when the application has reached the final Successful stage. */
export function isSuccessfulApplicationStatus(status) {
  return status === SUCCESSFUL_STATUS;
}

/** Progress percentage for dashboard (Step7 = 100%). */
export function getApplicationProgressPercentage(status) {
  const step = Math.min(
    getApplicationStepNumber(status),
    TOTAL_JOURNEY_STEPS
  );
  return Math.round((step / TOTAL_JOURNEY_STEPS) * 10000) / 100;
}

/** Step4 ("Visa") and later — checklist, dashboard visa stats, etc. */
export function isVisaStageStatus(status) {
  return getApplicationStepNumber(status) >= 4;
}

/** Step5 ("Visa Appointment") and later — student Visa tab. */
export function isVisaAppointmentStageStatus(status) {
  return getApplicationStepNumber(status) >= 5;
}

/** Step6 ("Interview") — student interview prep content (not before or after). */
export function isInterviewStageStatus(status) {
  return status === INTERVIEW_STATUS;
}

/** Step6+ — visa progress step 3 complete on student Visa tab. */
export function isOnOrPastInterviewStage(status) {
  return getApplicationStepNumber(status) >= 6;
}

/** Document checklist on Universities tab when status is Visa (Step4+). */
export function shouldShowVisaDocumentChecklist(status) {
  return isVisaStageStatus(status);
}

/**
 * Visa tab — Step5+ (Visa Appointment) and counselor unlocked (lock_1 === false).
 */
export function canAccessVisaSection(status, lock_1) {
  return isVisaAppointmentStageStatus(status) && !lock_1;
}

/** Visa tab shown as locked in nav (appointment stage reached, not yet unlocked). */
export function isVisaTabLocked(status, lock_1) {
  return isVisaAppointmentStageStatus(status) && !!lock_1;
}

/** German Life tab is visible from Successful (Step7) onward. */
export function canAccessGermanLifeSection(status) {
  return isSuccessfulApplicationStatus(status);
}

const FOCUS_LABELS = {
  1: "University Documents",
  2: "Universities",
  3: "Blocked Account",
  4: "Visa Documents",
  5: "Visa Appointment",
  6: "Interview",
  7: "Complete",
};

export function getJourneyFocusLabel(status) {
  const step = getApplicationStepNumber(status);
  return FOCUS_LABELS[step] ?? FOCUS_LABELS[1];
}

export const TAB_ACCESS_DENIED = {
  tasks: {
    title: "Visa section not available yet",
    message:
      "This section opens after your visa appointment stage. Please complete earlier steps or contact your counselor if you need assistance.",
  },
  germanLife: {
    title: "German Life not available yet",
    message:
      "You don’t have access to view this section at the moment. Please complete the required steps or contact your counselor if you need assistance.",
  },
};
