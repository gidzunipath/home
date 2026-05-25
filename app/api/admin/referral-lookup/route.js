import { NextResponse } from "next/server";
import { validateAdminSession } from "../../../../lib/adminAuth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { isValid } = await validateAdminSession(request);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim();

    if (!code) {
      return NextResponse.json(
        { success: false, found: false, error: "Referral code is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("applications")
      .select("id, first_name, last_name, referral_code")
      .ilike("referral_code", code)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Referral lookup error:", error);
      return NextResponse.json(
        { success: false, found: false, error: "Lookup failed" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        found: false,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      id: data.id,
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      referral_code: data.referral_code,
    });
  } catch (error) {
    console.error("GET /api/admin/referral-lookup error:", error);
    return NextResponse.json(
      { success: false, found: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
