export function slugifyTitle(title) {
  if (!title?.trim()) return "";
  return title
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function extractTextFromTiptapJson(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text" && node.text) return node.text;
  if (!Array.isArray(node.content)) return "";
  return node.content.map(extractTextFromTiptapJson).join(" ");
}

export function calculateReadingTimeMinutes(content, fallbackText = "") {
  let text = fallbackText;
  if (content && typeof content === "object") {
    text = extractTextFromTiptapJson(content);
  } else if (typeof content === "string") {
    text = content;
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function parseTagsInput(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) {
    return value.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Safe admin id for created_by FK (avoids invalid FK → 500). */
export function resolveBlogCreatedBy(adminData) {
  if (!adminData) return null;
  const record = Array.isArray(adminData) ? adminData[0] : adminData;
  const id = record?.id;
  return id && UUID_RE.test(String(id)) ? String(id) : null;
}

/** Ensure Tiptap JSON is a plain object safe for JSONB insert/update. */
export function sanitizeBlogContent(content) {
  const fallback = { type: "doc", content: [{ type: "paragraph" }] };
  if (!content || typeof content !== "object") return fallback;
  try {
    return JSON.parse(JSON.stringify(content));
  } catch {
    return fallback;
  }
}

/** Resolve thumbnail/cover URLs for Next/Image (absolute Supabase public URL). */
export function normalizeBlogImageSrc(src) {
  if (!src || typeof src !== "string") return null;
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;

  if (trimmed.startsWith("/storage/")) {
    return `${base}${trimmed}`;
  }

  const path = trimmed.replace(/^\//, "");
  return `${base}/storage/v1/object/public/blog_images/${path}`;
}

export function formatBlogDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
