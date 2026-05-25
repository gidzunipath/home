import { createClient } from "@supabase/supabase-js";
import { BLOG_IMAGES_BUCKET } from "./blogConstants";

export const supabaseBlogAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BLOG_PUBLIC_URL_MARKER = `/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/`;

/** Resolve storage object path from a Supabase public URL (or return path if already relative). */
export function getStoragePathFromBlogImageUrl(url) {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed.includes("://") && !trimmed.startsWith("/")) {
    return trimmed.replace(/^\/+/, "") || null;
  }

  const markerIdx = trimmed.indexOf(BLOG_PUBLIC_URL_MARKER);
  if (markerIdx !== -1) {
    return decodeURIComponent(
      trimmed.slice(markerIdx + BLOG_PUBLIC_URL_MARKER.length).split("?")[0]
    );
  }

  return null;
}

/** Collect unique storage paths for all images embedded in Tiptap JSON. */
export function collectImagePathsFromContent(content) {
  const paths = new Set();

  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "image" && node.attrs?.src) {
      const path = getStoragePathFromBlogImageUrl(node.attrs.src);
      if (path) paths.add(path);
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  }

  if (content && typeof content === "object") {
    walk(content);
  }

  return [...paths];
}

/** Paths used by thumbnail/cover fields (stored path or parsed from URL). */
export function getPostImagePaths({ thumbnail_path, thumbnail_url, cover_image_path, cover_image_url }) {
  const paths = new Set();
  if (thumbnail_path) paths.add(thumbnail_path);
  else {
    const p = getStoragePathFromBlogImageUrl(thumbnail_url);
    if (p) paths.add(p);
  }
  if (cover_image_path) paths.add(cover_image_path);
  else {
    const p = getStoragePathFromBlogImageUrl(cover_image_url);
    if (p) paths.add(p);
  }
  return [...paths];
}

/** All storage paths for a post row (hero images + inline content images). */
export function collectAllPostImagePaths(post) {
  const paths = new Set(getPostImagePaths(post));
  collectImagePathsFromContent(post?.content).forEach((p) => paths.add(p));
  return [...paths];
}

/** Images removed from content on update (not still referenced elsewhere on the post). */
export function getOrphanedContentImagePaths(oldContent, newContent, keepPaths = []) {
  const oldPaths = collectImagePathsFromContent(oldContent);
  const newPaths = new Set(collectImagePathsFromContent(newContent));
  const keep = new Set(keepPaths.filter(Boolean));
  return oldPaths.filter((p) => !newPaths.has(p) && !keep.has(p));
}

export async function uploadBlogImage(file, folder = "content") {
  const ext = (file.name || "").split(".").pop()?.toLowerCase() || "jpg";
  const safeName = (file.name || "image")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 60);
  const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseBlogAdmin.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabaseBlogAdmin.storage
    .from(BLOG_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, path: filePath };
}

export async function deleteBlogImage(path) {
  if (!path) return { success: true };
  const { data, error } = await supabaseBlogAdmin.storage
    .from(BLOG_IMAGES_BUCKET)
    .remove([path]);

  if (error) {
    console.error(`Failed to delete blog image "${path}":`, error.message);
    return { success: false, error: error.message };
  }

  return { success: true, deleted: data };
}

export async function deleteBlogImages(paths) {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return { success: true, deleted: [] };

  const { data, error } = await supabaseBlogAdmin.storage
    .from(BLOG_IMAGES_BUCKET)
    .remove(unique);

  if (error) {
    console.error("Failed to delete blog images:", error.message, unique);
    return { success: false, error: error.message, paths: unique };
  }

  return { success: true, deleted: data };
}

export async function isSlugTaken(slug, excludeId = null) {
  if (!slug) return { taken: false, error: null };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      taken: false,
      error: "Server configuration error: Supabase credentials are missing.",
    };
  }

  try {
    let query = supabaseBlogAdmin
      .from("german_life_blog_posts")
      .select("id")
      .eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      if (error.code === "PGRST116") {
        return { taken: true, error: null };
      }
      if (error.code === "42P01") {
        return {
          taken: false,
          error:
            "Blog table not found. Run database/migrations/007_create_german_life_blog.sql in Supabase.",
        };
      }
      return { taken: false, error: error.message || "Could not verify slug" };
    }

    return { taken: Boolean(data), error: null };
  } catch (err) {
    return { taken: false, error: err?.message || "Could not verify slug" };
  }
}
