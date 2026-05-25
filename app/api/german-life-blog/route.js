import { NextResponse } from "next/server";
import { requireAdminAuth, updateSessionActivity } from "../../../lib/adminAuth";
import { supabaseBlogAdmin, isSlugTaken } from "../../../lib/blogApi";
import { BLOG_STATUS } from "../../../lib/blogConstants";
import {
  slugifyTitle,
  calculateReadingTimeMinutes,
  parseTagsInput,
  sanitizeBlogContent,
  resolveBlogCreatedBy,
} from "../../../lib/blogUtils";

function apiError(message, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

const LIST_COLUMNS =
  "id, title, slug, short_description, thumbnail_url, cover_image_url, tags, status, reading_time_minutes, view_count, published_at, updated_at, created_at";

const DEFAULT_CONTENT = { type: "doc", content: [{ type: "paragraph" }] };

async function touchAdminSession(request) {
  const sessionToken = request.cookies?.get?.("admin_session")?.value;
  if (sessionToken) await updateSessionActivity(sessionToken);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status");

    if (scope === "public") {
      let query = supabaseBlogAdmin
        .from("german_life_blog_posts")
        .select(LIST_COLUMNS)
        .eq("status", BLOG_STATUS.PUBLISHED)
        .order("published_at", { ascending: false });

      if (q) {
        const pattern = `%${q}%`;
        query = query.or(
          `title.ilike.${pattern},short_description.ilike.${pattern},slug.ilike.${pattern}`
        );
      }

      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: data || [], count: data?.length ?? 0 });
    }

    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) return auth.response;
    await touchAdminSession(request);

    let query = supabaseBlogAdmin
      .from("german_life_blog_posts")
      .select(`${LIST_COLUMNS}, content`)
      .order("updated_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `title.ilike.${pattern},short_description.ilike.${pattern},slug.ilike.${pattern}`
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [], count: data?.length ?? 0 });
  } catch (error) {
    console.error("GET /api/german-life-blog error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) return auth.response;
    await touchAdminSession(request);

    const body = await request.json();
    const {
      title,
      slug: slugInput,
      short_description,
      thumbnail_url,
      thumbnail_path,
      cover_image_url,
      cover_image_path,
      content,
      tags,
      status,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = (slugInput?.trim() || slugifyTitle(title)).toLowerCase();
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "A valid slug is required" },
        { status: 400 }
      );
    }

    const slugCheck = await isSlugTaken(slug);
    if (slugCheck.error) {
      return apiError(slugCheck.error, 500);
    }
    if (slugCheck.taken) {
      return NextResponse.json(
        { success: false, error: "This slug is already in use" },
        { status: 409 }
      );
    }

    const postStatus = status === BLOG_STATUS.PUBLISHED ? BLOG_STATUS.PUBLISHED : BLOG_STATUS.DRAFT;
    const parsedContent = sanitizeBlogContent(content || DEFAULT_CONTENT);
    const readingTime = calculateReadingTimeMinutes(parsedContent, short_description);

    const row = {
      title: title.trim(),
      slug,
      short_description: short_description?.trim() || null,
      thumbnail_url: thumbnail_url || null,
      thumbnail_path: thumbnail_path || null,
      cover_image_url: cover_image_url || null,
      cover_image_path: cover_image_path || null,
      content: parsedContent,
      tags: parseTagsInput(tags),
      status: postStatus,
      reading_time_minutes: readingTime,
      published_at: postStatus === BLOG_STATUS.PUBLISHED ? new Date().toISOString() : null,
      created_by: resolveBlogCreatedBy(auth.adminData),
    };

    const { data, error } = await supabaseBlogAdmin
      .from("german_life_blog_posts")
      .insert(row)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/german-life-blog error:", error);
    return apiError(error?.message || "Internal server error", 500);
  }
}
