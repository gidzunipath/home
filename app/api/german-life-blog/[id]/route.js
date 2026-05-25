import { NextResponse } from "next/server";
import { requireAdminAuth, updateSessionActivity } from "../../../../lib/adminAuth";
import {
  supabaseBlogAdmin,
  isSlugTaken,
  deleteBlogImage,
  deleteBlogImages,
  collectAllPostImagePaths,
  getOrphanedContentImagePaths,
  getPostImagePaths,
} from "../../../../lib/blogApi";
import { BLOG_STATUS } from "../../../../lib/blogConstants";
import {
  slugifyTitle,
  calculateReadingTimeMinutes,
  parseTagsInput,
  sanitizeBlogContent,
} from "../../../../lib/blogUtils";

function apiError(message, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function touchAdminSession(request) {
  const sessionToken = request.cookies?.get?.("admin_session")?.value;
  if (sessionToken) await updateSessionActivity(sessionToken);
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) return auth.response;
    await touchAdminSession(request);

    const { id } = await params;
    const { data, error } = await supabaseBlogAdmin
      .from("german_life_blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/german-life-blog/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) return auth.response;
    await touchAdminSession(request);

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const { data: existing, error: fetchError } = await supabaseBlogAdmin
      .from("german_life_blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    if (action === "publish" || action === "unpublish") {
      const nextStatus =
        action === "publish" ? BLOG_STATUS.PUBLISHED : BLOG_STATUS.DRAFT;
      const updates = {
        status: nextStatus,
        published_at:
          action === "publish"
            ? existing.published_at || new Date().toISOString()
            : existing.published_at,
      };

      const { data, error } = await supabaseBlogAdmin
        .from("german_life_blog_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

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
      remove_thumbnail,
      remove_cover,
    } = body;

    const updates = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        return NextResponse.json(
          { success: false, error: "Title is required" },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (slugInput !== undefined) {
      const slug = (slugInput?.trim() || slugifyTitle(title || existing.title)).toLowerCase();
      if (!slug) {
        return NextResponse.json(
          { success: false, error: "A valid slug is required" },
          { status: 400 }
        );
      }
      const slugCheck = await isSlugTaken(slug, id);
      if (slugCheck.error) {
        return apiError(slugCheck.error, 500);
      }
      if (slugCheck.taken) {
        return NextResponse.json(
          { success: false, error: "This slug is already in use" },
          { status: 409 }
        );
      }
      updates.slug = slug;
    }

    if (short_description !== undefined) {
      updates.short_description = short_description?.trim() || null;
    }

    if (content !== undefined) {
      const sanitizedContent = sanitizeBlogContent(content);
      updates.content = sanitizedContent;
      updates.reading_time_minutes = calculateReadingTimeMinutes(
        sanitizedContent,
        short_description ?? existing.short_description
      );

      try {
        const keepPaths = [
          existing.thumbnail_path,
          existing.cover_image_path,
          thumbnail_path,
          cover_image_path,
          ...getPostImagePaths({
            thumbnail_path: thumbnail_path ?? existing.thumbnail_path,
            thumbnail_url: thumbnail_url ?? existing.thumbnail_url,
            cover_image_path: cover_image_path ?? existing.cover_image_path,
            cover_image_url: cover_image_url ?? existing.cover_image_url,
          }),
        ];
        const orphaned = getOrphanedContentImagePaths(
          existing.content,
          sanitizedContent,
          keepPaths
        );
        if (orphaned.length > 0) {
          await deleteBlogImages(orphaned);
        }
      } catch (cleanupErr) {
        console.warn("Blog image cleanup skipped:", cleanupErr?.message || cleanupErr);
      }
    }

    if (tags !== undefined) {
      updates.tags = parseTagsInput(tags);
    }

    if (status !== undefined) {
      const nextStatus =
        status === BLOG_STATUS.PUBLISHED ? BLOG_STATUS.PUBLISHED : BLOG_STATUS.DRAFT;
      updates.status = nextStatus;
      if (nextStatus === BLOG_STATUS.PUBLISHED && !existing.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }

    if (remove_thumbnail) {
      const oldPaths = getPostImagePaths({
        thumbnail_path: existing.thumbnail_path,
        thumbnail_url: existing.thumbnail_url,
      });
      if (oldPaths.length > 0) await deleteBlogImages(oldPaths);
      updates.thumbnail_url = null;
      updates.thumbnail_path = null;
    } else if (thumbnail_url !== undefined || thumbnail_path !== undefined) {
      const oldPaths = getPostImagePaths({
        thumbnail_path: existing.thumbnail_path,
        thumbnail_url: existing.thumbnail_url,
      });
      const newPaths = getPostImagePaths({
        thumbnail_path:
          thumbnail_path !== undefined ? thumbnail_path : existing.thumbnail_path,
        thumbnail_url:
          thumbnail_url !== undefined ? thumbnail_url : existing.thumbnail_url,
      });
      const toRemove = oldPaths.filter((p) => !newPaths.includes(p));
      if (toRemove.length > 0) await deleteBlogImages(toRemove);
      updates.thumbnail_url =
        thumbnail_url !== undefined ? thumbnail_url : (existing.thumbnail_url ?? null);
      updates.thumbnail_path =
        thumbnail_path !== undefined ? thumbnail_path : (existing.thumbnail_path ?? null);
    }

    if (remove_cover) {
      const oldPaths = getPostImagePaths({
        cover_image_path: existing.cover_image_path,
        cover_image_url: existing.cover_image_url,
      });
      if (oldPaths.length > 0) await deleteBlogImages(oldPaths);
      updates.cover_image_url = null;
      updates.cover_image_path = null;
    } else if (cover_image_url !== undefined || cover_image_path !== undefined) {
      const oldPaths = getPostImagePaths({
        cover_image_path: existing.cover_image_path,
        cover_image_url: existing.cover_image_url,
      });
      const newPaths = getPostImagePaths({
        cover_image_path:
          cover_image_path !== undefined ? cover_image_path : existing.cover_image_path,
        cover_image_url:
          cover_image_url !== undefined ? cover_image_url : existing.cover_image_url,
      });
      const toRemove = oldPaths.filter((p) => !newPaths.includes(p));
      if (toRemove.length > 0) await deleteBlogImages(toRemove);
      updates.cover_image_url =
        cover_image_url !== undefined ? cover_image_url : (existing.cover_image_url ?? null);
      updates.cover_image_path =
        cover_image_path !== undefined ? cover_image_path : (existing.cover_image_path ?? null);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, data: existing });
    }

    const { data, error } = await supabaseBlogAdmin
      .from("german_life_blog_posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/german-life-blog/[id] error:", error);
    return apiError(error?.message || "Internal server error", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) return auth.response;
    await touchAdminSession(request);

    const { id } = await params;

    const { data: existing, error: fetchError } = await supabaseBlogAdmin
      .from("german_life_blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    const imagePaths = collectAllPostImagePaths(existing);
    if (imagePaths.length > 0) {
      const storageResult = await deleteBlogImages(imagePaths);
      if (!storageResult.success) {
        console.warn(
          "Some blog images may not have been deleted from storage:",
          storageResult.error
        );
      }
    }

    const { error } = await supabaseBlogAdmin
      .from("german_life_blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch (error) {
    console.error("DELETE /api/german-life-blog/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
