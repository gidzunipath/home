import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminAuth, updateSessionActivity } from "../../../../lib/adminAuth";
import { CAREER_RESUMES_BUCKET } from "../../../../lib/careersConstants";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const sessionToken = request.cookies?.get?.("admin_session")?.value;
    if (sessionToken) {
      await updateSessionActivity(sessionToken);
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing application ID" },
        { status: 400 }
      );
    }

    if (action !== "soft_delete") {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("job_seekers")
      .select("id, deleted_at")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    if (existing.deleted_at) {
      return NextResponse.json(
        { success: false, error: "Application is already deleted" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("job_seekers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Application moved to deleted applicants.",
    });
  } catch (error) {
    console.error("PATCH /api/job-seekers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const sessionToken = request.cookies?.get?.("admin_session")?.value;
    if (sessionToken) {
      await updateSessionActivity(sessionToken);
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing application ID" },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("job_seekers")
      .select("id, resume_path, deleted_at")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    if (!existing.deleted_at) {
      return NextResponse.json(
        {
          success: false,
          error: "Application must be soft-deleted before permanent deletion",
        },
        { status: 400 }
      );
    }

    if (existing.resume_path) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(CAREER_RESUMES_BUCKET)
        .remove([existing.resume_path]);

      if (storageError) {
        console.error("Error deleting resume file:", storageError);
      }
    }

    const { error } = await supabaseAdmin.from("job_seekers").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application and resume permanently deleted.",
    });
  } catch (error) {
    console.error("DELETE /api/job-seekers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
