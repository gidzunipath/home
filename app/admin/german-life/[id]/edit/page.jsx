"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useAdminAuth } from "../../../../../hooks/useAdminAuth";
import GermanLifeBlogEditor from "../../../components/GermanLifeBlogEditor";

export default function AdminGermanLifeEditPage() {
  const { id } = useParams();
  const { loading: authLoading } = useAdminAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || authLoading) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/german-life-blog/${id}`, { credentials: "include" });
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
    })();

    return () => { cancelled = true; };
  }, [id, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-appleGray-500">{authLoading ? "Loading…" : "Loading article…"}</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-lg font-semibold text-red-600">{error || "Article not found"}</p>
        <Link
          href="/admin/german-life"
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Back to articles
        </Link>
      </div>
    );
  }

  return <GermanLifeBlogEditor post={post} />;
}
