import { supabase } from "../../../../lib/supabase";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }
    const body = await request.json();
    const { title, description, youtube_link, is_active, display_order } = body;

    // Validate required fields
    if (!title || !description) {
      return Response.json(
        {
          error: "Missing required fields: title and description are required",
        },
        { status: 400 }
      );
    }

    // Update checklist item
    const { data, error } = await supabase
      .from("gidz_buddy_checklist")
      .update({
        title,
        description,
        youtube_link: youtube_link || null,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating checklist item:", error);
      return Response.json(
        { error: "Failed to update checklist item" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return Response.json(
        { error: "Checklist item not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    // Delete checklist item
    const { error } = await supabase
      .from("gidz_buddy_checklist")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting checklist item:", error);
      return Response.json(
        { error: "Failed to delete checklist item" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Checklist item deleted successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    // Fetch specific checklist item
    const { data, error } = await supabase
      .from("gidz_buddy_checklist")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching checklist item:", error);
      return Response.json(
        { error: "Failed to fetch checklist item" },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        { error: "Checklist item not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
