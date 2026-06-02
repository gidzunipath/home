"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import UserCard from "./UserCard";
import { supabase } from "../../../lib/supabase";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useAuthSystem, AUTH_TYPES } from "../../../hooks/useAuthSystem";
import { generateReferralCode } from "../../../lib/referralCode";
import { useAppModal } from "../../../hooks/useAppModal";
import {
  ChangeStatusModal,
  getStatusLabel,
  getStatusBadgeClass,
} from "./ApplicationStatusModal";

const PAGE_SIZE = 15;

// A reusable backdrop for modals
const ModalBackdrop = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
    onClick={onClick}
  />
);

const EMPTY_CREATE_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  telephone: "",
  address: "",
  passport_number: "",
  status: "Step1",
};

// CREATE APPLICATION MODAL
const CreateApplicationModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState(EMPTY_CREATE_FORM);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setIsSubmitting(true);

    const referral_code = generateReferralCode(formData.first_name, new Date());
    const result = await onCreate({ ...formData, referral_code });

    setIsSubmitting(false);

    if (result?.success) {
      setFormData(EMPTY_CREATE_FORM);
      onClose();
      return;
    }

    if (result?.code === "duplicate_email") {
      setEmailError(result.message);
    }
  };

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
        <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-appleGray-200 px-8 py-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-appleGray-800">
                Create New Application
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-appleGray-100 hover:bg-appleGray-200 rounded-2xl flex items-center justify-center transition-colors duration-200"
              >
                <Icon icon="material-symbols:close" className="text-xl text-appleGray-600" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-appleGray-700 mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-appleGray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Email Address</label>
              <input
                type="email"
                className={`w-full px-4 py-3 bg-appleGray-100 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  emailError
                    ? "border-red-400 focus:ring-red-400"
                    : "border-appleGray-200 focus:ring-sky-500"
                }`}
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => {
                  setEmailError("");
                  setFormData({ ...formData, email: e.target.value });
                }}
                required
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1.5">
                  <Icon icon="material-symbols:error-outline" className="text-base shrink-0 mt-0.5" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Phone Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter phone number"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Address</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Passport Number (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter passport number"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Initial Status</label>
              <select
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Step1">Documents</option>
                <option value="Step2">University</option>
                <option value="Step3">Blocked Account</option>
                <option value="Step4">Successful</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-appleGray-200">
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-appleGray-100 hover:bg-appleGray-200 text-appleGray-700 rounded-2xl font-medium transition-all duration-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 btn-apple-hover"
              >
                {isSubmitting ? "Creating..." : "Create Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// EDIT APPLICATION MODAL
const EditApplicationModal = ({ application, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    first_name: application.first_name || "",
    last_name: application.last_name || "",
    email: application.email || "",
    telephone: application.telephone || "",
    address: application.address || "",
    passport_number: application.passport_number || "",
    status: application.status || "Step1",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(application.id, formData);
    onClose();
  };

  return (
    <>
      <ModalBackdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
        <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-appleGray-200 px-8 py-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-appleGray-800">Edit Application</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-appleGray-100 hover:bg-appleGray-200 rounded-2xl flex items-center justify-center transition-colors duration-200"
              >
                <Icon icon="material-symbols:close" className="text-xl text-appleGray-600" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-appleGray-700 mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-appleGray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Phone Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter phone number"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Address</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Passport Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter passport number"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-appleGray-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-3 bg-appleGray-100 border border-appleGray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Step1">University Documents</option>
                <option value="Step2">University</option>
                <option value="Step3">Blocked Account</option>
                <option value="Step4">Visa</option>
                <option value="Step5">Visa Appointment</option>
                <option value="Step6">Interview</option>
                <option value="Step7">Successful</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-appleGray-200">
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-appleGray-100 hover:bg-appleGray-200 text-appleGray-700 rounded-2xl font-medium transition-all duration-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium transition-all duration-200 btn-apple-hover"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const AdminApplicationsManager = () => {
  const router = useRouter();
  const { type, isAuthenticated, loading } = useAuthSystem();
  const { showSuccess, showError, showConfirm } = useAppModal();

  const [applications, setApplications] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editApplication, setEditApplication] = useState(null);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [currentChangingApplication, setCurrentChangingApplication] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentStep, setCurrentStep] = useState("all");
  const [loadingStatusId, setLoadingStatusId] = useState(null);
  const [updatingCodes, setUpdatingCodes] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    completedApplications: 0,
    pendingApplications: 0,
  });

  const loadMoreRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auth protection
  useEffect(() => {
    if (!loading && (!isAuthenticated || type !== AUTH_TYPES.ADMIN)) {
      router.push("/my-admin");
    }
  }, [loading, isAuthenticated, type, router]);

  // Fetch a page of applications with DB-level filtering
  const fetchPage = useCallback(
    async (from, search, step) => {
      let query = supabase
        .from("applications")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (step !== "all") {
        query = query.eq("status", step);
      }

      if (search.trim()) {
        query = query.or(
          `first_name.ilike.%${search.trim()}%,last_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,referral_code.ilike.%${search.trim()}%`
        );
      }

      const { data, error, count } = await query;
      if (error) {
        console.error("Error fetching applications:", error.message);
        return null;
      }

      return {
        items: data || [],
        hasMore: (data?.length || 0) === PAGE_SIZE,
        nextOffset: from + (data?.length || 0),
        total: count ?? 0,
      };
    },
    []
  );

  // Fetch global stats separately (lightweight — only status column, no pagination)
  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from("applications").select("status");
    if (!data) return;
    const total = data.length;
    const completed = data.filter((a) => a.status === "Step7").length;
    const step1 = data.filter((a) => a.status === "Step1").length;
    const active = data.filter((a) => a.status !== "Step7").length;
    setDashboardStats({
      totalApplications: total,
      activeApplications: active,
      completedApplications: completed,
      pendingApplications: step1,
    });
  }, []);

  const loadInitial = useCallback(async () => {
    if (!isAuthenticated || type !== AUTH_TYPES.ADMIN) return;

    setIsDataLoading(true);
    setApplications([]);
    setOffset(0);
    setHasMore(true);

    try {
      const result = await fetchPage(0, debouncedSearch, currentStep);
      if (!result) return;
      setApplications(result.items);
      setHasMore(result.hasMore);
      setOffset(result.nextOffset);
      setTotalCount(result.total);
    } finally {
      setIsDataLoading(false);
    }
  }, [isAuthenticated, type, fetchPage, debouncedSearch, currentStep]);

  const loadMore = useCallback(async () => {
    if (isDataLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchPage(offset, debouncedSearch, currentStep);
      if (!result) return;
      setApplications((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setOffset(result.nextOffset);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isDataLoading, isLoadingMore, hasMore, offset, fetchPage, debouncedSearch, currentStep]);

  // Re-fetch on filter/search/auth changes
  useEffect(() => {
    if (!loading) {
      loadInitial();
    }
  }, [loadInitial, loading]);

  // Fetch stats once on auth ready, and keep them fresh after mutations
  useEffect(() => {
    if (isAuthenticated && type === AUTH_TYPES.ADMIN && !loading) {
      fetchStats();
    }
  }, [isAuthenticated, type, loading, fetchStats]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || isDataLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, isDataLoading]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto"></div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-appleGray-800">Loading Admin Panel</h3>
            <p className="text-appleGray-600">Authenticating your access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || type !== AUTH_TYPES.ADMIN) {
    return null;
  }

  // Create
  const handleCreateApplication = async (newApp) => {
    const { error } = await supabase.from("applications").insert([newApp]);
    if (error) {
      console.error("Error creating application:", error.message);

      const isDuplicateEmail =
        error.code === "23505" ||
        error.message.includes("applications_email_key");

      if (isDuplicateEmail) {
        return {
          success: false,
          code: "duplicate_email",
          message: `An application already exists for "${newApp.email}". Use a different email or open the existing application from the list.`,
        };
      }

      await showError(
        error.message || "Something went wrong. Please try again.",
        "Could Not Create Application"
      );
      return { success: false };
    }

    await loadInitial();
    fetchStats();
    await showSuccess("Application created successfully.");
    return { success: true };
  };

  // Update
  const handleUpdateApplication = async (id, updatedFields) => {
    const { error } = await supabase
      .from("applications")
      .update(updatedFields)
      .eq("id", id);
    if (error) {
      console.error("Error updating application:", error.message);
    } else {
      await loadInitial();
      fetchStats();
    }
  };

  // Delete
  const handleDeleteApplication = async (id) => {
    const confirmed = await showConfirm({
      type: "danger",
      title: "Delete Application",
      message: "Are you sure you want to delete this application?",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      console.error("Error deleting application:", error.message);
    } else {
      await loadInitial();
      fetchStats();
    }
  };

  const handleOpenApplication = (id) => {
    router.push(`/admin/application/${id}`);
  };

  const openCreateModal = () => setShowCreateModal(true);
  const openEditModal = (application) => { setEditApplication(application); setShowEditModal(true); };
  const openChangeStatusModal = (application) => { setCurrentChangingApplication(application); setShowChangeStatusModal(true); };

  const handleRegenerateReferralCodes = async () => {
    const confirmed = await showConfirm({
      type: "warning",
      title: "Regenerate Referral Codes",
      message: "This will regenerate referral codes for ALL existing applications using the new format (e.g. JOH60523). Continue?",
      confirmLabel: "Continue",
    });
    if (!confirmed) return;

    setUpdatingCodes(true);
    try {
      const res = await fetch("/api/admin/update-referral-codes", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        await showSuccess(
          `Done! Updated ${result.updated} referral code${result.updated !== 1 ? "s" : ""}.${result.failed > 0 ? ` (${result.failed} failed)` : ""}`
        );
        await loadInitial();
      } else {
        await showError(result.error);
      }
    } catch (err) {
      await showError("Failed to update referral codes. Please try again.");
      console.error(err);
    } finally {
      setUpdatingCodes(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (!currentChangingApplication) return;

    setLoadingStatusId(currentChangingApplication.id);
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", currentChangingApplication.id);

    if (error) {
      console.error("Error updating status:", error.message);
      await showError("Failed to update status. Please try again.");
    } else {
      await loadInitial();
      fetchStats();
    }
    setLoadingStatusId(null);
  };

  const Steps = [
    { value: "all", label: "All" },
    { value: "Step1", label: "University Documents" },
    { value: "Step2", label: "University" },
    { value: "Step3", label: "Blocked Account" },
    { value: "Step4", label: "Visa" },
    { value: "Step5", label: "Visa Appointment" },
    { value: "Step6", label: "Interview" },
    { value: "Step7", label: "Successful" },
  ];

  return (
    <div className="min-h-full bg-appleGray-100">
      {/* Header */}
      <div className="bg-white border-b border-appleGray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-appleGray-900">Applications</h1>
              <p className="text-sm text-appleGray-400 mt-0.5">
                Manage applications and track student progress
              </p>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-appleGray-50 border border-appleGray-200 rounded-xl px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-appleGray-900">{dashboardStats.totalApplications}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-appleGray-400">Total</div>
              </div>
              <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-sky-700">{dashboardStats.activeApplications}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-400">Active</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-emerald-700">{dashboardStats.completedApplications}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">Done</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-amber-700">{dashboardStats.pendingApplications}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-appleGray-200 p-4 mb-4">
          {/* Status Tabs */}
          <div className="mb-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-appleGray-400 mb-2">
              Filter by Status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Steps.map((step) => (
                <button
                  key={step.value}
                  onClick={() => setCurrentStep(step.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentStep === step.value
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-appleGray-100 text-appleGray-600 hover:bg-appleGray-200"
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Icon
                  icon={debouncedSearch !== searchTerm ? "material-symbols:progress-activity" : "material-symbols:search"}
                  className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 text-appleGray-400 text-lg ${debouncedSearch !== searchTerm ? "animate-spin" : ""}`}
                />
                <input
                  type="text"
                  className="w-full pl-9 pr-8 py-2 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Search by name, email or referral code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-appleGray-400 hover:text-appleGray-600"
                  >
                    <Icon icon="material-symbols:close" className="text-base" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
             
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                >
                  <Icon icon="material-symbols:add" className="text-lg" />
                  <span>New Application</span>
                </button>
                <button
                  onClick={handleRegenerateReferralCodes}
                  disabled={updatingCodes}
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-appleGray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                >
                  <Icon
                    icon={updatingCodes ? "material-symbols:sync" : "material-symbols:confirmation-number"}
                    className={`text-lg ${updatingCodes ? "animate-spin" : ""}`}
                  />
                  <span>{updatingCodes ? "Updating…" : "Regenerate Referral Codes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isDataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-appleGray-500">Loading applications...</p>
            </div>
          </div>
        ) : applications.length > 0 ? (
          <>
            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:hidden">
              {applications.map((application) => (
                <div
                  key={application.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenApplication(application.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenApplication(application.id);
                    }
                  }}
                  className="bg-white rounded-2xl border border-appleGray-200 overflow-hidden hover:shadow-soft transition-all duration-200 cursor-pointer"
                >
                  <div className="p-4">
                    <UserCard application={application} />

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-appleGray-100">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-appleGray-400">Referral Code</p>
                        <p className="text-sm font-mono font-semibold text-sky-600 tracking-wider">
                          {application.referral_code || "—"}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-appleGray-400">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                          {getStatusLabel(application.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(application)}
                        className="flex-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
                      >
                        <Icon icon="material-symbols:edit" className="text-sm" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => openChangeStatusModal(application)}
                        className="flex-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
                      >
                        <Icon icon="material-symbols:sync" className="text-sm" />
                        <span>Status</span>
                      </button>
                      {application.status === "Step4" && (
                        <button
                          onClick={() => handleDeleteApplication(application.id)}
                          className="flex-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
                        >
                          <Icon icon="material-symbols:delete" className="text-sm" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl border border-appleGray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-appleGray-50 border-b border-appleGray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">Student</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr
                        key={application.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenApplication(application.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenApplication(application.id);
                          }
                        }}
                        className="border-b border-appleGray-100 last:border-b-0 hover:bg-appleGray-50 transition-colors duration-150 cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center shrink-0">
                              <Icon icon="material-symbols:person" className="text-sm text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-appleGray-900">
                                {application.first_name} {application.last_name}
                              </div>
                              <div className="text-xs text-sky-600 font-mono font-semibold tracking-wider">
                                {application.referral_code || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <div className="text-sm text-appleGray-700">{application.email}</div>
                            <div className="text-xs text-appleGray-400 mt-0.5">{application.telephone}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenApplication(application.id)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-all duration-200 border border-sky-100"
                              title="View Details"
                            >
                              <Icon icon="material-symbols:visibility" className="text-sm" />
                            </button>
                            <button
                              onClick={() => openEditModal(application)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all duration-200 border border-amber-100"
                              title="Edit"
                            >
                              <Icon icon="material-symbols:edit" className="text-sm" />
                            </button>
                            <button
                              onClick={() => openChangeStatusModal(application)}
                              className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-all duration-200 border border-purple-100"
                              title="Change Status"
                            >
                              <Icon icon="material-symbols:sync" className="text-sm" />
                            </button>
                            {application.status === "Step4" && (
                              <button
                                onClick={() => handleDeleteApplication(application.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 border border-red-100"
                                title="Delete"
                              >
                                <Icon icon="material-symbols:delete" className="text-sm" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="py-5 flex justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-xs text-appleGray-400">
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  Loading more...
                </div>
              )}
              {!isLoadingMore && !hasMore && applications.length > 0 && (
                <p className="text-xs text-appleGray-400">You've reached the end. All {totalCount} applications are shown.</p>
              )}
         
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-appleGray-200 p-12 text-center">
            <div className="w-14 h-14 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon icon="material-symbols:search-off" className="text-2xl text-appleGray-400" />
            </div>
            <h3 className="text-base font-semibold text-appleGray-800 mb-1.5">No Applications Found</h3>
            <p className="text-sm text-appleGray-400 mb-5">
              {searchTerm || currentStep !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start by creating your first application."}
            </p>
            {!searchTerm && currentStep === "all" && (
              <button
                onClick={openCreateModal}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-all duration-200"
              >
                Create First Application
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateApplicationModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateApplication} />
      )}
      {showEditModal && editApplication && (
        <EditApplicationModal
          application={editApplication}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateApplication}
        />
      )}
      {showChangeStatusModal && currentChangingApplication && (
        <ChangeStatusModal
          application={currentChangingApplication}
          onClose={() => setShowChangeStatusModal(false)}
          onChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  );
};

export default AdminApplicationsManager;
