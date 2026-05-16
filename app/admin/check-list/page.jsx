"use client";

import React from "react";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import GidzBuddyChecklistAdmin from "../components/GidzBuddyChecklistAdmin";
import { Icon } from "@iconify/react";

const ChecklistPage = () => {
  const { loading: authLoading, admin, isAuthenticated } = useAdminAuth();

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-soft border border-appleGray-200 text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
            <p className="text-appleGray-600 mt-3">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-appleGray-800">
                Gidz Buddy Checklist
              </h1>
              <p className="text-appleGray-600 mt-2">
                Manage checklist items for student guidance and recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 overflow-hidden">
          <div className="p-6">
            <GidzBuddyChecklistAdmin />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-appleGray-500 text-sm">
            Manage checklist items that appear in the student portal
            recommendations
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
