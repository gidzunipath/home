import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminAuth, updateSessionActivity } from "../../../lib/adminAuth";
import {
  CAREER_POSITIONS,
  CAREER_RESUMES_BUCKET,
  RESUME_ALLOWED_EXTENSIONS,
  RESUME_ALLOWED_MIME_TYPES,
  RESUME_MAX_BYTES,
} from "../../../lib/careersConstants";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getResumeExtension(filename) {
  const lower = (filename || "").toLowerCase();
  const match = RESUME_ALLOWED_EXTENSIONS.find((ext) => lower.endsWith(ext));
  return match || null;
}

function isValidResumeFile(file) {
  if (!file || !(file instanceof File)) return false;
  if (file.size > RESUME_MAX_BYTES) return false;

  const ext = getResumeExtension(file.name);
  if (!ext) return false;

  if (
    file.type &&
    !RESUME_ALLOWED_MIME_TYPES.includes(file.type) &&
    file.type !== "application/octet-stream"
  ) {
    return false;
  }

  return true;
}

function validateApplicationFields({ fullName, email, phone, position }) {
  const errors = {};

  if (!fullName?.trim() || fullName.trim().length < 2) {
    errors.fullName = "Full name is required (at least 2 characters).";
  }

  if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
    errors.email = "A valid email address is required.";
  }

  if (!phone?.trim() || phone.trim().length < 6) {
    errors.phone = "A valid phone number is required.";
  }

  if (!position || !CAREER_POSITIONS.includes(position)) {
    errors.position = "Please select a valid position.";
  }

  return errors;
}

async function uploadResume(file) {
  const ext = getResumeExtension(file.name);
  const safeBase = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 80);
  const filePath = `resumes/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeBase}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabaseAdmin.storage
    .from(CAREER_RESUMES_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(CAREER_RESUMES_BUCKET).getPublicUrl(data.path);

  return {
    resume_url: publicUrl,
    resume_path: data.path,
    resume_filename: file.name,
  };
}

export async function GET(request) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const sessionToken = request.cookies?.get?.("admin_session")?.value;
    if (sessionToken) {
      await updateSessionActivity(sessionToken);
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "active";

    let query = supabaseAdmin
      .from("job_seekers")
      .select(
        "id, full_name, email, phone, position, resume_url, resume_path, resume_filename, deleted_at, created_at"
      )
      .order("created_at", { ascending: false });

    if (view === "deleted") {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching job seekers:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/job-seekers error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const fullName = formData.get("fullName")?.toString() ?? "";
    const email = formData.get("email")?.toString() ?? "";
    const phone = formData.get("phone")?.toString() ?? "";
    const position = formData.get("position")?.toString() ?? "";
    const resume = formData.get("resume");

    const fieldErrors = validateApplicationFields({
      fullName,
      email,
      phone,
      position,
    });

    if (!resume || !(resume instanceof File) || resume.size === 0) {
      fieldErrors.resume = "Resume upload is required.";
    } else if (!isValidResumeFile(resume)) {
      fieldErrors.resume =
        "Resume must be PDF, DOC, or DOCX and no larger than 5MB.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { success: false, errors: fieldErrors },
        { status: 400 }
      );
    }

    const resumeMeta = await uploadResume(resume);

    const { data, error } = await supabaseAdmin
      .from("job_seekers")
      .insert([
        {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          position,
          ...resumeMeta,
        },
      ])
      .select()
      .single();

    if (error) {
      if (resumeMeta.resume_path) {
        await supabaseAdmin.storage
          .from(CAREER_RESUMES_BUCKET)
          .remove([resumeMeta.resume_path]);
      }
      console.error("Error saving job seeker:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message:
        "Thank you for your interest, our team will review your appliaction and reach you out",
    });
  } catch (error) {
    console.error("POST /api/job-seekers error:", error);
    const message =
      error?.message ||
      error?.error_description ||
      (typeof error === "string" ? error : "Internal server error");
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
