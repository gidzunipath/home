"use client";

import { useCallback, useEffect, useState } from "react";

export { countUnansweredConversations, sortMessagesAsc } from "../lib/adminNavCounts";

export function useAdminNavCounts() {
  const [unansweredMessages, setUnansweredMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/nav-counts", {
        credentials: "include",
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Admin nav counts unavailable:",
            json.error || res.statusText || res.status
          );
        }
        setUnansweredMessages(0);
      } else {
        setUnansweredMessages(json.unansweredMessages ?? 0);
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Admin nav counts fetch failed:", err?.message || err);
      }
      setUnansweredMessages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return { unansweredMessages, loading, refresh: fetchCounts };
}
