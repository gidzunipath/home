"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaClock, FaEye, FaArrowLeft, FaGlobe, FaTag } from "react-icons/fa";
import BlogContentRenderer from "../../../components/blog/BlogContentRenderer";
import BlogPostThumbnail from "../../../components/blog/BlogPostThumbnail";
import { formatBlogDate } from "../../../../lib/blogUtils";

export default function GermanLifeBlogArticlePage() {
  const params = useParams();
  const slug = params?.slug;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/german-life-blog/by-slug/${encodeURIComponent(slug)}?incrementView=true`
        );
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setError(json.error || "Article not found");
          setPost(null);
        } else {
          setPost(json.data);
        }
      } catch {
        if (!cancelled) setError("Failed to load article");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading article…</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <FaGlobe className="mb-4 h-12 w-12 text-slate-200" />
        <h1 className="text-xl font-semibold text-slate-800">Article not found</h1>
        <p className="mt-2 text-slate-500 text-sm max-w-xs">{error}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          <FaArrowLeft className="h-3 w-3" />
          Back to portal
        </Link>
      </div>
    );
  }

  const heroImage = post.cover_image_url || post.thumbnail_url;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Top nav bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors"
          >
            <FaArrowLeft className="h-3 w-3" />
            Back
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FaGlobe className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-medium text-slate-600">German Life</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero image — full width, tall, rounded */}
        {heroImage && (
          <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] overflow-hidden rounded-2xl bg-slate-100 mb-10 shadow-sm">
            <BlogPostThumbnail src={heroImage} alt={post.title} />
            {/* subtle gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl pointer-events-none" />
          </div>
        )}

        {/* Two-column layout: article + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-10">
          {/* ── Article body ── */}
          <article>
            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-100 px-3 py-0.5 text-xs font-medium text-sky-700"
                  >
                    <FaTag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              {post.title}
            </h1>

            {/* Short description / subtitle */}
            {post.short_description && (
              <p className="mt-4 text-lg sm:text-xl text-slate-500 leading-relaxed font-normal">
                {post.short_description}
              </p>
            )}

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400 border-y border-slate-100 py-4">
              <span className="font-medium text-slate-600">
                {formatBlogDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="h-3.5 w-3.5" />
                {post.reading_time_minutes} min read
              </span>
              <span className="flex items-center gap-1.5">
                <FaEye className="h-3.5 w-3.5" />
                {post.view_count ?? 0} views
              </span>
              {post.updated_at && post.updated_at !== post.published_at && (
                <span className="text-xs text-slate-400 italic">
                  Updated {formatBlogDate(post.updated_at)}
                </span>
              )}
            </div>

            {/* Body content */}
            <div className="mt-8 text-slate-700 text-[1.0625rem] leading-[1.8]">
              <BlogContentRenderer content={post.content} />
            </div>

            {/* Footer */}
            <div className="mt-14 pt-8 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <p className="text-xs text-slate-400">
                Published by <span className="font-semibold text-slate-600">GIDZ Uni Path</span>
              </p>
              <button
                type="button"
                onClick={() => window.close()}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                <FaArrowLeft className="h-3 w-3" />
                Back to German Life
              </button>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* About card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                    <FaGlobe className="h-4 w-4 text-sky-600" />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">German Life</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tips, guides and insights for living and studying in Germany — curated by the GIDZ Uni Path team.
                </p>
              </div>

              {/* Article meta card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Article info
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Published</span>
                    <span className="font-medium">{formatBlogDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Read time</span>
                    <span className="font-medium">{post.reading_time_minutes} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Views</span>
                    <span className="font-medium">{post.view_count ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Tags card */}
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-50 border border-slate-200 px-3 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
