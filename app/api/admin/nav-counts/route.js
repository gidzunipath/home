import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminAuth, updateSessionActivity } from "../../../../lib/adminAuth";
import { countUnansweredConversations } from "../../../../lib/adminNavCounts";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) return auth.response;

    const sessionToken = request.cookies?.get?.("admin_session")?.value;
    if (sessionToken) await updateSessionActivity(sessionToken);

    const { data, error } = await supabaseAdmin
      .from("applications")
      .select("id, messages!inner(sent_by, created_at)")
      .in("status", ["Step1", "Step2", "Step3"]);

    if (error) {
      console.error("nav-counts query error:", error.message, error.code, error.details);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to fetch counts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      unansweredMessages: countUnansweredConversations(data),
    });
  } catch (err) {
    console.error("GET /api/admin/nav-counts error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
