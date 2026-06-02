import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const IMAGE_URL_MISSING = "column feedbacks.image_url does not exist";

const SELECT_FIELDS = `
  id,
  application_id,
  client_name,
  rating,
  title,
  message,
  program_type,
  university,
  allow_display_name,
  status,
  admin_notes,
  image_url,
  created_at,
  updated_at
`;

export async function GET(_request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing feedback ID" },
        { status: 400 }
      );
    }

    let { data, error } = await supabaseAdmin
      .from("feedbacks")
      .select(SELECT_FIELDS)
      .eq("id", id)
      .maybeSingle();

    if (error && error.message?.includes(IMAGE_URL_MISSING)) {
      const selectWithoutImage = SELECT_FIELDS.replace(/,\s*image_url/, "");
      const result = await supabaseAdmin
        .from("feedbacks")
        .select(selectWithoutImage)
        .eq("id", id)
        .maybeSingle();

      data = result.data ? { ...result.data, image_url: null } : null;
      error = result.error;
    }

    if (error) {
      console.error("Error fetching feedback:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
