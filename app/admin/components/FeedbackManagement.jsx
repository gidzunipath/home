"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FaStar } from "react-icons/fa";
import { useAppModal } from "../../../hooks/useAppModal";
import FeedbackPagination from "./feedback/FeedbackPagination";
import {
  FEEDBACK_PAGE_SIZE,
  getFeedbackStatusBadge,
  getFeedbackStatusLabel,
} from "./feedback/feedbackUtils";

const FeedbackManagement = () => {
  const router = useRouter();
  const { showError, showConfirm } = useAppModal();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/feedbacks?includePrivate=true");
      const result = await response.json();

      if (result.success) {
        setFeedbacks(result.data);
        setStats({
          total: result.data.length,
          pending: result.data.filter((f) => f.status === "pending").length,
          approved: result.data.filter((f) => f.status === "approved").length,
          rejected: result.data.filter((f) => f.status === "rejected").length,
        });
      } else {
        setFetchError(result.error || "Failed to load feedbacks");
      }
    } catch (error) {
      setFetchError(error.message || "Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus, imageUrl) => {
    setActionLoading(feedbackId);
    try {
      const response = await fetch("/api/feedbacks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: feedbackId,
          status: newStatus,
          image_url: imageUrl ?? null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchFeedbacks();
      } else {
        showError("Error updating feedback: " + result.error);
      }
    } catch (error) {
      showError("Error updating feedback: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (feedbackId) => {
    const confirmed = await showConfirm({
      type: "danger",
      title: "Delete Feedback",
      message:
        "Are you sure you want to delete this feedback? This action cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    setActionLoading(feedbackId);
    try {
      const response = await fetch(`/api/feedbacks?id=${feedbackId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        await fetchFeedbacks();
      } else {
        showError("Error deleting feedback: " + result.error);
      }
    } catch (error) {
      showError("Error deleting feedback: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFromWebsite = async (feedbackId) => {
    const confirmed = await showConfirm({
      type: "warning",
      title: "Remove from Website",
      message:
        "This feedback will be hidden from the homepage success stories section.",
      confirmLabel: "Remove",
    });
    if (!confirmed) return;

    await handleStatusUpdate(feedbackId, "rejected");
  };

  const openFeedback = (id) => router.push(`/admin/feedbacks/${id}`);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) =>
      statusFilter === "all" ? true : f.status === statusFilter
    );
  }, [feedbacks, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeedbacks.length / FEEDBACK_PAGE_SIZE)
  );

  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * FEEDBACK_PAGE_SIZE;
    return filteredFeedbacks.slice(start, start + FEEDBACK_PAGE_SIZE);
  }, [filteredFeedbacks, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const filters = [
    { value: "all", label: "All", count: stats.total },
    { value: "pending", label: "Pending", count: stats.pending },
    { value: "approved", label: "Approved", count: stats.approved },
    { value: "rejected", label: "Rejected", count: stats.rejected },
  ];

  return (
    <div className="min-h-full bg-appleGray-100">
      {/* Header — matches Applications page */}
      <div className="border-b border-appleGray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-bold text-appleGray-900">Feedbacks</h1>
              <p className="mt-0.5 text-sm text-appleGray-400">
                Review and manage client testimonials
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="rounded-xl border border-appleGray-200 bg-appleGray-50 px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-appleGray-900">{stats.total}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-appleGray-400">
                  Total
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-amber-700">{stats.pending}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">
                  Pending
                </div>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-emerald-700">{stats.approved}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
                  Approved
                </div>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-center">
                <div className="text-lg font-bold text-red-700">{stats.rejected}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-red-400">
                  Rejected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
        {fetchError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {fetchError}
            <button
              type="button"
              onClick={fetchFeedbacks}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 rounded-2xl border border-appleGray-200 bg-white p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-appleGray-400">
            Filter by Status
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  statusFilter === filter.value
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-appleGray-100 text-appleGray-600 hover:bg-appleGray-200"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
              <p className="text-sm text-appleGray-500">Loading feedbacks...</p>
            </div>
          </div>
        ) : paginatedFeedbacks.length === 0 ? (
          <div className="rounded-2xl border border-appleGray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-appleGray-100">
              <Icon icon="material-symbols:rate-review-outline" className="text-2xl text-appleGray-400" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold text-appleGray-800">
              No Feedbacks Found
            </h3>
            <p className="text-sm text-appleGray-400">
              {statusFilter === "all"
                ? "Student reviews will appear here when submitted."
                : `No ${statusFilter} feedbacks.`}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {paginatedFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openFeedback(feedback.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openFeedback(feedback.id);
                    }
                  }}
                  className="cursor-pointer overflow-hidden rounded-2xl border border-appleGray-200 bg-white transition-all duration-200 hover:shadow-soft"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sky-400 to-sky-600">
                        {feedback.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={feedback.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Icon icon="material-symbols:person" className="text-sm text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-appleGray-900">
                            {feedback.client_name}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${getFeedbackStatusBadge(feedback.status)}`}
                          >
                            {getFeedbackStatusLabel(feedback.status)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-appleGray-500">
                          {feedback.title}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          {[...Array(feedback.rating)].map((_, i) => (
                            <FaStar key={i} className="h-3 w-3 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className="mt-3 flex gap-1.5 border-t border-appleGray-100 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openFeedback(feedback.id)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-600 transition-all hover:bg-sky-100"
                      >
                        <Icon icon="material-symbols:visibility" className="text-sm" />
                        Review
                      </button>
                      {feedback.status === "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(feedback.id, "approved", feedback.image_url)
                          }
                          disabled={actionLoading === feedback.id}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Icon icon="material-symbols:check" className="text-sm" />
                          Approve
                        </button>
                      )}
                      {feedback.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromWebsite(feedback.id)}
                          disabled={actionLoading === feedback.id}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600 transition-all hover:bg-orange-100 disabled:opacity-50"
                        >
                          <Icon icon="material-symbols:public-off" className="text-sm" />
                          Remove
                        </button>
                      )}
                      {feedback.status === "rejected" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(feedback.id, "approved", feedback.image_url)
                          }
                          disabled={actionLoading === feedback.id}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Icon icon="material-symbols:public" className="text-sm" />
                          Go live
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-appleGray-200 bg-white lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-appleGray-200 bg-appleGray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-appleGray-500">
                        Client
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-appleGray-500">
                        Review
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-appleGray-500">
                        Program
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-appleGray-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-appleGray-500">
                        Date
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-appleGray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFeedbacks.map((feedback) => (
                      <tr
                        key={feedback.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openFeedback(feedback.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openFeedback(feedback.id);
                          }
                        }}
                        className="cursor-pointer border-b border-appleGray-100 transition-colors duration-150 last:border-b-0 hover:bg-appleGray-50"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sky-400 to-sky-600">
                              {feedback.image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={feedback.image_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Icon icon="material-symbols:person" className="text-sm text-white" />
                              )}
                            </div>
                            <div className="text-sm font-semibold text-appleGray-900">
                              {feedback.client_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-appleGray-800 line-clamp-1">
                            {feedback.title}
                          </div>
                          <div className="mt-1 flex items-center gap-0.5">
                            {[...Array(feedback.rating)].map((_, i) => (
                              <FaStar key={i} className="h-3 w-3 text-yellow-400" />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm text-appleGray-700">
                            {feedback.program_type || "—"}
                          </div>
                          <div className="mt-0.5 text-xs text-appleGray-400">
                            {feedback.university || ""}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getFeedbackStatusBadge(feedback.status)}`}
                          >
                            {getFeedbackStatusLabel(feedback.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-appleGray-600">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openFeedback(feedback.id)}
                              className="rounded-lg border border-sky-100 bg-sky-50 p-1.5 text-sky-600 transition-all hover:bg-sky-100"
                              title="Review"
                            >
                              <Icon icon="material-symbols:visibility" className="text-sm" />
                            </button>
                            {feedback.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      feedback.id,
                                      "approved",
                                      feedback.image_url
                                    )
                                  }
                                  disabled={actionLoading === feedback.id}
                                  className="rounded-lg border border-emerald-100 bg-emerald-50 p-1.5 text-emerald-600 transition-all hover:bg-emerald-100 disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actionLoading === feedback.id ? (
                                    <Icon icon="mdi:loading" className="animate-spin text-sm" />
                                  ) : (
                                    <Icon icon="material-symbols:check" className="text-sm" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusUpdate(feedback.id, "rejected")
                                  }
                                  disabled={actionLoading === feedback.id}
                                  className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <Icon icon="material-symbols:close" className="text-sm" />
                                </button>
                              </>
                            )}
                            {feedback.status === "approved" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFromWebsite(feedback.id)}
                                disabled={actionLoading === feedback.id}
                                className="rounded-lg border border-orange-100 bg-orange-50 p-1.5 text-orange-600 transition-all hover:bg-orange-100 disabled:opacity-50"
                                title="Remove from website"
                              >
                                {actionLoading === feedback.id ? (
                                  <Icon icon="mdi:loading" className="animate-spin text-sm" />
                                ) : (
                                  <Icon icon="material-symbols:public-off" className="text-sm" />
                                )}
                              </button>
                            )}
                            {feedback.status === "rejected" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(feedback.id, "approved", feedback.image_url)
                                }
                                disabled={actionLoading === feedback.id}
                                className="rounded-lg border border-emerald-100 bg-emerald-50 p-1.5 text-emerald-600 transition-all hover:bg-emerald-100 disabled:opacity-50"
                                title="Publish to website"
                              >
                                {actionLoading === feedback.id ? (
                                  <Icon icon="mdi:loading" className="animate-spin text-sm" />
                                ) : (
                                  <Icon icon="material-symbols:public" className="text-sm" />
                                )}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(feedback.id)}
                              disabled={actionLoading === feedback.id}
                              className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                              title="Delete"
                            >
                              <Icon icon="material-symbols:delete" className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <FeedbackPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredFeedbacks.length}
                pageSize={FEEDBACK_PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Mobile pagination */}
            <div className="mt-3 lg:hidden">
              <div className="overflow-hidden rounded-2xl border border-appleGray-200 bg-white">
                <FeedbackPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredFeedbacks.length}
                  pageSize={FEEDBACK_PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
