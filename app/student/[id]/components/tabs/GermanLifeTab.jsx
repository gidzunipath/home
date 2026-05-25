"use client";

import { useState, useEffect, useCallback } from "react";
import { FaGlobe, FaSearch, FaClock, FaEye } from "react-icons/fa";
import BlogPostThumbnail from "../../../../components/blog/BlogPostThumbnail";
import { formatBlogDate } from "../../../../../lib/blogUtils";
import { BLOG_PUBLIC_PATH_PREFIX } from "../../../../../lib/blogConstants";

export default function GermanLifeTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ scope: "public" });
      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
      const res = await fetch(`/api/german-life-blog?${params}`);
      const json = await res.json();
      if (json.success) setPosts(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openArticle = (slug) => {
    const url = `${BLOG_PUBLIC_PATH_PREFIX}/${slug}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
            <FaGlobe className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-appleGray-800">German Life</h3>
            <p className="text-sm text-appleGray-600">
              Tips and guides for living and studying in Germany
            </p>
          </div>
        </div>

        <div className="relative mt-4 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-appleGray-400" />
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-appleGray-200 py-2.5 pl-10 pr-4 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-appleGray-500">Loading articles...</p>
      ) : posts.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-appleGray-200 bg-appleGray-50/50">
          <div className="text-center">
            <FaGlobe className="mx-auto mb-3 h-10 w-10 text-appleGray-300" />
            <p className="text-appleGray-600">
              {debouncedSearch
                ? "No articles match your search."
                : "No articles published yet. Check back soon!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => openArticle(post.slug)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-appleGray-200 bg-white text-left shadow-soft transition-all hover:border-sky-200 hover:shadow-medium"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-appleGray-100">
                <BlogPostThumbnail
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="transition-transform group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h4 className="line-clamp-2 font-semibold text-appleGray-900 group-hover:text-sky-700">
                  {post.title}
                </h4>
                {post.short_description && (
                  <p className="mt-1 line-clamp-2 text-sm text-appleGray-600">
                    {post.short_description}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-3 text-xs text-appleGray-500">
                  <span>{formatBlogDate(post.published_at)}</span>
                  <span className="inline-flex items-center gap-1">
                    <FaClock className="h-3 w-3" />
                    {post.reading_time_minutes} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FaEye className="h-3 w-3" />
                    {post.view_count ?? 0}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
