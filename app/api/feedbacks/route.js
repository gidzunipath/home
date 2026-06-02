// Feedback Management API
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const IMAGE_URL_MISSING = "column feedbacks.image_url does not exist";

// GET: Fetch feedbacks
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const status = searchParams.get("status");
    const includePrivate = searchParams.get("includePrivate") === "true";

    const selectFields = `
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

    let query = supabaseAdmin
      .from("feedbacks")
      .select(selectFields)
      .order("created_at", { ascending: false });

    if (applicationId) query = query.eq("application_id", applicationId);
    if (status) query = query.eq("status", status);

    if (!includePrivate) {
      query = query.eq("status", "approved").eq("allow_display_name", true);
    }

    let { data, error } = await query;

    // Graceful fallback if image_url column doesn't exist yet
    if (error && error.message?.includes(IMAGE_URL_MISSING)) {
      const selectWithoutImage = selectFields.replace(/,\s*image_url/, "");
      let fallbackQuery = supabaseAdmin
        .from("feedbacks")
        .select(selectWithoutImage)
        .order("created_at", { ascending: false });

      if (applicationId) fallbackQuery = fallbackQuery.eq("application_id", applicationId);
      if (status) fallbackQuery = fallbackQuery.eq("status", status);

      if (!includePrivate) {
        fallbackQuery = fallbackQuery
          .eq("status", "approved")
          .eq("allow_display_name", true);
      }

      const result = await fallbackQuery;
      data = (result.data || []).map((row) => ({ ...row, image_url: null }));
      error = result.error;
    }

    if (error) {
      console.error("Error fetching feedbacks:", error);
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
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new feedback
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      application_id,
      client_name,
      rating,
      title,
      message,
      program_type,
      university,
      allow_display_name = true,
    } = body;

    if (!application_id || !client_name || !rating || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: application_id, client_name, rating, title, message",
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("feedbacks")
      .insert([
        {
          application_id,
          client_name,
          rating: parseInt(rating),
          title,
          message,
          program_type,
          university,
          allow_display_name,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating feedback:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Feedback submitted successfully! It will be reviewed by our team.",
    });
  } catch (error) {
    console.error("API Error in POST /api/feedbacks:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

// PUT: Update feedback (Admin only — status, notes, image)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, admin_notes, image_url } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const updates = { updated_at: new Date().toISOString() };

    if (status !== undefined) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid status. Must be: pending, approved, or rejected",
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (admin_notes !== undefined) updates.admin_notes = admin_notes;
    if (image_url !== undefined) updates.image_url = image_url;

    if (Object.keys(updates).length === 1) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("feedbacks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // If image_url column missing, retry without it
      if (error.message?.includes(IMAGE_URL_MISSING) && image_url !== undefined) {
        const { image_url: _drop, ...updatesWithoutImage } = updates;
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from("feedbacks")
          .update(updatesWithoutImage)
          .eq("id", id)
          .select()
          .single();

        if (fallbackError) {
          return NextResponse.json(
            { success: false, error: fallbackError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: false,
          error:
            "Photo requires a database column. Run in Supabase SQL Editor: ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS image_url TEXT;",
          data: fallbackData,
        });
      }

      console.error("Error updating feedback:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: status
        ? `Feedback ${status} successfully!`
        : "Feedback updated successfully!",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete feedback (Admin only)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing feedback ID" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("feedbacks")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully!",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
