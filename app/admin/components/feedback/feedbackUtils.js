export const FEEDBACK_PAGE_SIZE = 10;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function getFeedbackStatusBadge(status) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-appleGray-100 text-appleGray-700";
  }
}

export function getFeedbackStatusLabel(status) {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

export function formatFeedbackStatus(status) {
  return getFeedbackStatusLabel(status);
}

export function getStatusColor(status) {
  return getFeedbackStatusBadge(status);
}

// Re-export upload from separate file to keep utils client-safe
export { uploadFeedbackImage } from "./feedbackUpload";
