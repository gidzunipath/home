import { NextResponse } from "next/server";
import { supabaseBlogAdmin } from "../../../../../lib/blogApi";
import { BLOG_STATUS } from "../../../../../lib/blogConstants";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get("incrementView") === "true";

    const { data, error } = await supabaseBlogAdmin
      .from("german_life_blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", BLOG_STATUS.PUBLISHED)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    if (incrementView) {
      await supabaseBlogAdmin
        .from("german_life_blog_posts")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);
      data.view_count = (data.view_count || 0) + 1;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/german-life-blog/by-slug/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
