"use client";

import React from "react";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import GermanLifeBlogManagement from "../components/GermanLifeBlogManagement";

export default function AdminGermanLifePage() {
  const { loading: authLoading } = useAdminAuth();

  if (authLoading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-appleGray-200 bg-white p-8 text-center shadow-soft">
          <p className="text-appleGray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-appleGray-800">German Life Blog</h1>
          <p className="mt-2 text-appleGray-600">
            Create and manage blog articles for students exploring life in Germany.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-appleGray-200 bg-white shadow-soft">
          <div className="p-6">
            <GermanLifeBlogManagement />
          </div>
        </div>
      </div>
    </div>
  );
}
