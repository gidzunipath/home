"use client";

import React from "react";
import { useAdminAuth } from "../../../../hooks/useAdminAuth";
import GermanLifeBlogEditor from "../../components/GermanLifeBlogEditor";

export default function AdminGermanLifeNewPage() {
  const { loading: authLoading } = useAdminAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-appleGray-500">Loading…</p>
      </div>
    );
  }

  return <GermanLifeBlogEditor />;
}
