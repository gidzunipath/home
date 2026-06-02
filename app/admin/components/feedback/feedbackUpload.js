import { supabase } from "../../../../lib/supabase";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function uploadFeedbackImage(file, feedbackId) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please upload a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be 5MB or less.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `testimonials/${feedbackId}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Failed to upload image.");
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
