"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function sortMessagesAsc(messages) {
  if (!messages?.length) return [];
  return [...messages].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
}

export function countUnansweredConversations(applications) {
  if (!applications?.length) return 0;

  return applications.filter((app) => {
    const messages = sortMessagesAsc(app.messages);
    const last = messages[messages.length - 1];
    return last && last.sent_by !== "Gidz";
  }).length;
}

export function useAdminNavCounts() {
  const [unansweredMessages, setUnansweredMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("id, messages(sent_by, created_at)")
      .in("status", ["Step1", "Step2", "Step3"])
      .not("messages", "is", null);

    if (error) {
      console.error("Error fetching message counts:", error);
      setUnansweredMessages(0);
    } else {
      setUnansweredMessages(countUnansweredConversations(data));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return { unansweredMessages, loading, refresh: fetchCounts };
}
