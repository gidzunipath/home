"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSystem, AUTH_TYPES } from "../../hooks/useAuthSystem";
import { supabase } from "../../lib/supabase";
import { Icon } from "@iconify/react";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState("all");
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    completedApplications: 0,
    pendingApplications: 0,
  });
  const router = useRouter();
  const { type, isAuthenticated, loading } = useAuthSystem();

  // Function to fetch applications from Supabase - same logic as admin panel
  const fetchUsers = async (Step = "all", term = "") => {
    let query = supabase.from("applications").select("*");

    // Apply Step filter if not 'all'
    if (Step !== "all") {
      query = query.eq("status", Step);
    }

    // If there's a search term, filter by name or email
    if (term.trim()) {
      // Use .or() with .ilike() for case-insensitive partial match
      query = query.or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching applications:", error.message);
    } else {
      setApplications(data);

      // Calculate dashboard stats
      const total = data.length;
      const step1 = data.filter((app) => app.status === "Step1").length;
      const step2 = data.filter((app) => app.status === "Step2").length;
      const step3 = data.filter((app) => app.status === "Step3").length;
      const step4 = data.filter((app) => app.status === "Step4").length;

      setDashboardStats({
        totalApplications: total,
        activeApplications: step1 + step2 + step3,
        completedApplications: step4,
        pendingApplications: step1,
      });
    }
  };

  // Helper function to map backend steps to labels - same as admin panel
  const getStatusLabel = (status) => {
    const statusMap = {
      Step1: "Documents",
      Step2: "University",
      Step3: "Blocked Account",
      Step4: "Successful",
    };
    return statusMap[status] || status;
  };
  useEffect(() => {
    // Redirect non-admin users
    if (!loading) {
      if (!isAuthenticated || type !== AUTH_TYPES.ADMIN) {
        console.log(
          "Unauthorized access to /applications. Redirecting to /application"
        );
        router.push("/application"); // Redirect to the public application status page
        return;
      }
    }
  }, [loading, isAuthenticated, type, router]);

  // Fetch applications on mount and when currentStep or searchTerm changes
  useEffect(() => {
    if (isAuthenticated && type === AUTH_TYPES.ADMIN && !loading) {
      fetchUsers(currentStep, searchTerm);
    }
  }, [currentStep, searchTerm, isAuthenticated, type, loading]);

  // Handle the search button click
  const handleSearch = () => {
    // Re-fetch the list filtered by the current search term and Step
    fetchUsers(currentStep, searchTerm);
  };

  // Define the Steps for tabs with user-friendly labels - same as admin panel
  const Steps = [
    { value: "all", label: "All" },
    { value: "Step1", label: "Documents" },
    { value: "Step2", label: "University" },
    { value: "Step3", label: "Blocked Account" },
    { value: "Step4", label: "Successful" },
  ];

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-appleGray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto"></div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-appleGray-800">
              Loading Applications
            </h3>
            <p className="text-appleGray-600">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated as admin, don't render anything (redirect is happening)
  if (!isAuthenticated || type !== AUTH_TYPES.ADMIN) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };
  return (
    <div className="min-h-screen bg-appleGray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-appleGray-800 mb-2">
                Applications Management
              </h1>
              <p className="text-appleGray-600">
                Admin-only access to manage all applications across the system
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/admin")}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="material-symbols:dashboard" className="text-lg" />
                <span>Admin Dashboard</span>
              </button>
              <button
                onClick={() => router.push("/admin/entries")}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Icon icon="material-symbols:add" className="text-lg" />
                <span>New Entry</span>
              </button>
            </div>
          </div>
        </div>
        {/* Controls Section - Search and Filter */}
        <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6 mb-8">
          {/* Step Tabs */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-appleGray-800 mb-4">
              Filter by Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {Steps.map((step) => (
                <button
                  key={step.value}
                  onClick={() => setCurrentStep(step.value)}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                    currentStep === step.value
                      ? "bg-sky-500 text-white shadow-soft"
                      : "bg-appleGray-100 text-appleGray-700 hover:bg-appleGray-200 hover:shadow-soft"
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <Icon
                  icon="material-symbols:search"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-appleGray-500 text-xl"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium transition-all duration-200 btn-apple-hover flex items-center space-x-2"
              >
                <Icon icon="material-symbols:search" className="text-lg" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-appleGray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {dashboardStats.totalApplications}
                </p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center">
                <Icon
                  icon="material-symbols:description"
                  className="text-xl text-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-appleGray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {dashboardStats.pendingApplications}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Icon
                  icon="material-symbols:pending"
                  className="text-xl text-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-appleGray-600">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {dashboardStats.activeApplications}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Icon
                  icon="material-symbols:sync"
                  className="text-xl text-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-appleGray-600">
                  Completed
                </p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {dashboardStats.completedApplications}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Icon
                  icon="material-symbols:check-circle"
                  className="text-xl text-green-500"
                />
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-8 py-6 border-b border-appleGray-200">
              <h2 className="text-xl font-semibold text-appleGray-800">
                Recent Applications
              </h2>
              <p className="text-appleGray-600 mt-1">
                Manage and review all application submissions
              </p>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-appleGray-50 border-b border-appleGray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-appleGray-200">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-appleGray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center">
                            <Icon
                              icon="material-symbols:person"
                              className="text-lg text-white"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-appleGray-800">
                              {app.first_name} {app.last_name}
                            </div>
                            <div className="text-sm text-appleGray-600">
                              ID: {app.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-appleGray-800">
                            {app.email}
                          </div>
                          <div className="text-sm text-appleGray-600">
                            {app.telephone || "No phone"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === "Step4"
                              ? "bg-green-100 text-green-700"
                              : app.status === "Step3"
                              ? "bg-blue-100 text-blue-700"
                              : app.status === "Step2"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-appleGray-800">
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "No date"}
                        </div>
                        <div className="text-xs text-appleGray-600">
                          {app.passport_number
                            ? `Passport: ${app.passport_number}`
                            : "No passport"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/application/${app.id}`)
                            }
                            className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all duration-200"
                            title="View Details"
                          >
                            <Icon
                              icon="material-symbols:visibility"
                              className="text-sm"
                            />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/applications/${app.id}`)
                            }
                            className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-200"
                            title="Edit Application"
                          >
                            <Icon
                              icon="material-symbols:edit"
                              className="text-sm"
                            />
                          </button>
                          <button
                            onClick={() =>
                              console.log(
                                `Download PDF for ${app.first_name} ${app.last_name}`
                              )
                            }
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200"
                            title="Download PDF"
                          >
                            <Icon
                              icon="material-symbols:download"
                              className="text-sm"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-soft border border-appleGray-200 p-12 text-center">
            <div className="w-20 h-20 bg-appleGray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="material-symbols:search-off"
                className="text-3xl text-appleGray-400"
              />
            </div>
            <h3 className="text-xl font-semibold text-appleGray-800 mb-3">
              No Applications Found
            </h3>
            <p className="text-appleGray-600 mb-6">
              {searchTerm || currentStep !== "all"
                ? "Try adjusting your search or filter criteria."
                : "There are currently no applications to display. Applications will appear here once submitted."}
            </p>
            {!searchTerm && currentStep === "all" && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/admin")}
                  className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Icon icon="material-symbols:dashboard" className="text-lg" />
                  <span>Go to Admin Dashboard</span>
                </button>
                <button
                  onClick={() => router.push("/admin/entries")}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Icon icon="material-symbols:add" className="text-lg" />
                  <span>Create New Application</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
