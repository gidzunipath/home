"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FaTrash, FaEye, FaEdit, FaGlobe } from "react-icons/fa";
import { formatBlogDate } from "../../../lib/blogUtils";
import { BLOG_PUBLIC_PATH_PREFIX, BLOG_STATUS } from "../../../lib/blogConstants";

export default function GermanLifeBlogManagement() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/german-life-blog?${params}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setPosts(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const togglePublish = async (post) => {
    const action = post.status === BLOG_STATUS.PUBLISHED ? "unpublish" : "publish";
    setActionLoading(post.id);
    try {
      const res = await fetch(`/api/german-life-blog/${post.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) fetchPosts();
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const res = await fetch(`/api/german-life-blog/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setDeleteTarget(null);
        fetchPosts();
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-large">
            <h3 className="mb-2 text-lg font-bold">Delete article?</h3>
            <p className="mb-6 text-sm text-appleGray-600">
              &ldquo;{deleteTarget.title}&rdquo; will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading === deleteTarget.id}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] flex-1 rounded-xl border border-appleGray-200 px-4 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-appleGray-200 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <Link
          href="/admin/german-life/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Icon icon="mdi:plus" className="h-5 w-5" />
          New article
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-appleGray-500">Loading articles...</p>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <FaGlobe className="mx-auto mb-3 h-10 w-10 text-appleGray-300" />
          <p className="mb-4 text-appleGray-600">No articles yet. Create your first German Life post.</p>
          <Link
            href="/admin/german-life/new"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            <Icon icon="mdi:plus" className="h-5 w-5" />
            New article
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-appleGray-200">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-appleGray-50 text-appleGray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Article</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-appleGray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-appleGray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.thumbnail_url ? (
                        <img
                          src={post.thumbnail_url}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-appleGray-100">
                          <FaGlobe className="text-appleGray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-appleGray-900">{post.title}</p>
                        <p className="text-xs text-appleGray-500">
                          /student/b/{post.slug} · {post.reading_time_minutes} min read
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        post.status === BLOG_STATUS.PUBLISHED
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-appleGray-600">
                    {formatBlogDate(post.published_at)}
                  </td>
                  <td className="px-4 py-3 text-appleGray-600">{post.view_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {post.status === BLOG_STATUS.PUBLISHED && (
                        <a
                          href={`${BLOG_PUBLIC_PATH_PREFIX}/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-appleGray-500 hover:bg-appleGray-100"
                          title="Preview"
                        >
                          <FaEye />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/german-life/${post.id}/edit`)}
                        disabled={actionLoading === post.id}
                        className="rounded-lg p-2 text-sky-600 hover:bg-sky-50"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(post)}
                        disabled={actionLoading === post.id}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-appleGray-600 hover:bg-appleGray-100"
                      >
                        {post.status === BLOG_STATUS.PUBLISHED ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
