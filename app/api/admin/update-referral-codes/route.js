import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminAuth, updateSessionActivity } from "../../../../lib/adminAuth";
import { generateReferralCode } from "../../../../lib/referralCode";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const sessionToken = request.cookies?.get?.("admin_session")?.value;
    if (sessionToken) {
      await updateSessionActivity(sessionToken);
    }

    const { data: applications, error: fetchError } = await supabaseAdmin
      .from("applications")
      .select("id, first_name, created_at");

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    const updates = [];
    const failures = [];

    for (const app of applications) {
      const createdAt = app.created_at ? new Date(app.created_at) : new Date();
      const referral_code = generateReferralCode(app.first_name, createdAt);

      const { error: updateError } = await supabaseAdmin
        .from("applications")
        .update({ referral_code })
        .eq("id", app.id);

      if (updateError) {
        failures.push({ id: app.id, error: updateError.message });
      } else {
        updates.push({ id: app.id, referral_code });
      }
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      failed: failures.length,
      updates,
      failures,
    });
  } catch (error) {
    console.error("POST /api/admin/update-referral-codes error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
