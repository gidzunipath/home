"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaImage, FaTimes, FaCheck, FaGlobe } from "react-icons/fa";
import BlogTipTapEditor from "./BlogTipTapEditor";
import { slugifyTitle, parseTagsInput } from "../../../lib/blogUtils";
import { BLOG_PUBLIC_PATH_PREFIX, BLOG_STATUS } from "../../../lib/blogConstants";
import { useAppModal } from "../../../hooks/useAppModal";

async function uploadImage(file, folder) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/german-life-blog/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || "Upload failed");
  return { url: json.url, path: json.path };
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  slugManual: false,
  short_description: "",
  thumbnail_url: "",
  thumbnail_path: "",
  cover_image_url: "",
  cover_image_path: "",
  content: { type: "doc", content: [{ type: "paragraph" }] },
  tags: "",
  status: BLOG_STATUS.DRAFT,
};

export default function GermanLifeBlogEditor({ post }) {
  const { showError } = useAppModal();
  const router = useRouter();
  const isEdit = Boolean(post?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(null); // "draft" | "published" | null
  const [error, setError] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const thumbInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || "",
        slug: post.slug || "",
        slugManual: true,
        short_description: post.short_description || "",
        thumbnail_url: post.thumbnail_url || "",
        thumbnail_path: post.thumbnail_path || "",
        cover_image_url: post.cover_image_url || "",
        cover_image_path: post.cover_image_path || "",
        content: post.content || EMPTY_FORM.content,
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
        status: post.status || BLOG_STATUS.DRAFT,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [post]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !prev.slugManual) {
        next.slug = slugifyTitle(value);
      }
      return next;
    });
  };

  const handleImageUpload = async (e, kind) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const folder = kind === "thumbnail" ? "thumbnails" : "covers";
    const setUploading = kind === "thumbnail" ? setUploadingThumb : setUploadingCover;
    setUploading(true);
    try {
      const { url, path } = await uploadImage(file, folder);
      if (kind === "thumbnail") {
        setForm((p) => ({ ...p, thumbnail_url: url, thumbnail_path: path }));
      } else {
        setForm((p) => ({ ...p, cover_image_url: url, cover_image_path: path }));
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (publishNow = false) => {
    setError("");
    setSavedStatus(null);
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    const slug = (form.slug || slugifyTitle(form.title)).trim().toLowerCase();
    if (!slug) {
      setError("Slug is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug,
        short_description: form.short_description.trim(),
        thumbnail_url: form.thumbnail_url || null,
        thumbnail_path: form.thumbnail_path || null,
        cover_image_url: form.cover_image_url || null,
        cover_image_path: form.cover_image_path || null,
        content: form.content,
        tags: parseTagsInput(form.tags),
        status: publishNow ? BLOG_STATUS.PUBLISHED : form.status,
      };

      if (isEdit) {
        if (post.thumbnail_url && !form.thumbnail_url) {
          payload.remove_thumbnail = true;
          delete payload.thumbnail_url;
          delete payload.thumbnail_path;
        }
        if (post.cover_image_url && !form.cover_image_url) {
          payload.remove_cover = true;
          delete payload.cover_image_url;
          delete payload.cover_image_path;
        }
      }

      const url = isEdit ? `/api/german-life-blog/${post.id}` : "/api/german-life-blog";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let json = {};
      try {
        json = await res.json();
      } catch {
        throw new Error(
          res.status === 401
            ? "Your admin session expired. Please sign in again."
            : `Save failed (HTTP ${res.status}). Check the server console.`
        );
      }
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Save failed (HTTP ${res.status})`);
      }

      if (publishNow && isEdit && json.data.status !== BLOG_STATUS.PUBLISHED) {
        await fetch(`/api/german-life-blog/${post.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "publish" }),
        });
      }

      setSavedStatus(publishNow ? "published" : "draft");
      setTimeout(() => router.push("/admin/german-life"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isPublished = form.status === BLOG_STATUS.PUBLISHED;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-appleGray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <Link
            href="/admin/german-life"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-appleGray-500 transition-colors hover:bg-appleGray-100 hover:text-appleGray-800"
          >
            <FaArrowLeft className="h-3 w-3" />
            Articles
          </Link>
          <span className="text-appleGray-300">/</span>
          <span className="truncate text-sm font-semibold text-appleGray-800">
            {form.title || (isEdit ? "Edit article" : "New article")}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Status pill */}
          <span
            className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex ${
              isPublished
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>

          {savedStatus && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <FaCheck className="h-3 w-3" />
              Saved
            </span>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-xl border border-appleGray-200 bg-white px-4 py-2 text-sm font-semibold text-appleGray-700 transition-colors hover:bg-appleGray-50 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : isPublished ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────── */}
      {error && (
        <div className="flex shrink-0 items-center justify-between gap-3 bg-red-50 px-6 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-1 hover:bg-red-100"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Body: editor + sidebar ─────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

        {/* Main editor column — fills height, editor scrolls inside */}
        <div className="flex min-h-[55vh] min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:min-h-0 lg:px-8 lg:py-5">
          <textarea
            value={form.title}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              updateField("title", e.target.value);
            }}
            rows={1}
            placeholder="Article title…"
            className="mb-4 w-full shrink-0 resize-none appearance-none overflow-hidden border-none bg-transparent text-2xl font-bold text-appleGray-900 placeholder-appleGray-300 outline-none focus:outline-none sm:text-3xl"
          />

          <BlogTipTapEditor
            fillHeight
            value={form.content}
            onChange={(c) => updateField("content", c)}
          />
        </div>

        {/* Sidebar — scrolls independently */}
        <aside className="flex min-h-0 shrink-0 flex-col border-t border-appleGray-200 bg-appleGray-50/60 lg:w-72 lg:border-l lg:border-t-0 xl:w-80">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 admin-main-scroll">
          <div className="space-y-6">

            {/* Status toggle */}
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-appleGray-500">
                Status
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField("status", BLOG_STATUS.DRAFT)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${
                    !isPublished
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-appleGray-200 bg-white text-appleGray-500 hover:bg-appleGray-100"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => updateField("status", BLOG_STATUS.PUBLISHED)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${
                    isPublished
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-appleGray-200 bg-white text-appleGray-500 hover:bg-appleGray-100"
                  }`}
                >
                  Published
                </button>
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-appleGray-500">
                URL slug
              </label>
              <div className="flex items-center overflow-hidden rounded-xl border border-appleGray-200 bg-white text-sm focus-within:ring-2 focus-within:ring-sky-300">
                <span className="shrink-0 border-r border-appleGray-200 bg-appleGray-50 px-2.5 py-2 text-xs text-appleGray-400">
                  /b/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      slugManual: true,
                    }))
                  }
                  className="min-w-0 flex-1 bg-transparent px-2.5 py-2 font-mono text-xs focus:outline-none"
                  placeholder="article-slug"
                />
              </div>
              {form.slug && (
                <p className="mt-1 truncate text-xs text-appleGray-400">
                  {BLOG_PUBLIC_PATH_PREFIX}/{form.slug}
                </p>
              )}
            </div>

            {/* Short description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-appleGray-500">
                Short description
              </label>
              <textarea
                value={form.short_description}
                onChange={(e) => updateField("short_description", e.target.value)}
                rows={3}
                placeholder="Brief summary shown on the article card…"
                className="w-full rounded-xl border border-appleGray-200 bg-white px-3 py-2.5 text-sm text-appleGray-800 placeholder-appleGray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-appleGray-500">
                Tags
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                placeholder="berlin, cost of living, students"
                className="w-full rounded-xl border border-appleGray-200 bg-white px-3 py-2.5 text-sm placeholder-appleGray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <p className="mt-1 text-xs text-appleGray-400">Comma-separated</p>
            </div>

            {/* Thumbnail */}
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-appleGray-500">
                Thumbnail
              </span>
              {form.thumbnail_url ? (
                <div className="group relative">
                  <img
                    src={form.thumbnail_url}
                    alt=""
                    className="h-28 w-full rounded-xl object-cover ring-1 ring-appleGray-200"
                  />
                  <div className="absolute inset-0 hidden items-center justify-center gap-2 rounded-xl bg-black/40 group-hover:flex">
                    <button
                      type="button"
                      onClick={() => thumbInputRef.current?.click()}
                      className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-appleGray-800 hover:bg-white"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, thumbnail_url: "", thumbnail_path: "" }))}
                      className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={uploadingThumb}
                  className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-appleGray-200 bg-white text-appleGray-400 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-500 disabled:opacity-50"
                >
                  <FaImage className="h-5 w-5" />
                  <span className="text-xs font-medium">
                    {uploadingThumb ? "Uploading…" : "Upload thumbnail"}
                  </span>
                </button>
              )}
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "thumbnail")}
              />
            </div>

            {/* Cover */}
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-appleGray-500">
                Cover / banner
              </span>
              {form.cover_image_url ? (
                <div className="group relative">
                  <img
                    src={form.cover_image_url}
                    alt=""
                    className="h-28 w-full rounded-xl object-cover ring-1 ring-appleGray-200"
                  />
                  <div className="absolute inset-0 hidden items-center justify-center gap-2 rounded-xl bg-black/40 group-hover:flex">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-appleGray-800 hover:bg-white"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, cover_image_url: "", cover_image_path: "" }))}
                      className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-appleGray-200 bg-white text-appleGray-400 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-500 disabled:opacity-50"
                >
                  <FaImage className="h-5 w-5" />
                  <span className="text-xs font-medium">
                    {uploadingCover ? "Uploading…" : "Upload cover"}
                  </span>
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "cover")}
              />
            </div>

            {/* Preview link */}
            {isPublished && form.slug && (
              <a
                href={`${BLOG_PUBLIC_PATH_PREFIX}/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-appleGray-200 bg-white py-2.5 text-sm font-semibold text-appleGray-600 transition-colors hover:bg-appleGray-50 hover:text-appleGray-800"
              >
                <FaGlobe className="h-4 w-4" />
                View live article
              </a>
            )}
          </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
