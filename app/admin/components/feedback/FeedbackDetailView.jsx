"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FaStar } from "react-icons/fa";
import { useAppModal } from "../../../../hooks/useAppModal";
import FeedbackHomePreview from "./FeedbackHomePreview";
import { uploadFeedbackImage } from "./feedbackUpload";
import {
  getFeedbackStatusBadge,
  getFeedbackStatusLabel,
} from "./feedbackUtils";

export default function FeedbackDetailView({ feedbackId }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { showError, showConfirm } = useAppModal();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [toast, setToast] = useState(null);

  const isBusy = actionLoading || imageUploading;

  const fetchFeedback = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/feedbacks/${feedbackId}`);
      const result = await response.json();
      if (result.success) {
        setFeedback(result.data);
        setImageUrl(result.data.image_url || null);
      } else {
        setFetchError(result.error || "Feedback not found");
      }
    } catch (error) {
      setFetchError(error.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feedbackId) fetchFeedback();
  }, [feedbackId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusUpdate = async (newStatus) => {
    setActionLoading(true);
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
        showToast(
          newStatus === "approved"
            ? "Published to homepage."
            : newStatus === "rejected"
              ? "Removed from homepage."
              : "Updated."
        );
        await fetchFeedback();
      } else {
        showError("Error updating feedback: " + result.error);
      }
    } catch (error) {
      showError("Error updating feedback: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      type: "danger",
      title: "Delete Feedback",
      message:
        "Are you sure you want to delete this feedback? This action cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/feedbacks?id=${feedbackId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        router.push("/admin/feedbacks");
      } else {
        showError("Error deleting feedback: " + result.error);
      }
    } catch (error) {
      showError("Error deleting feedback: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const saveImage = async (file) => {
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadFeedbackImage(file, feedbackId);
      const response = await fetch("/api/feedbacks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: feedbackId, image_url: url }),
      });
      const result = await response.json();
      if (result.success) {
        setImageUrl(url);
        setFeedback((prev) => (prev ? { ...prev, image_url: url } : prev));
        showToast("Photo saved.");
      } else {
        showError("Error saving image: " + result.error);
      }
    } catch (error) {
      showError(error.message || "Failed to upload image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageUploading(true);
    try {
      const response = await fetch("/api/feedbacks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: feedbackId, image_url: null }),
      });
      const result = await response.json();
      if (result.success) {
        setImageUrl(null);
        setFeedback((prev) => (prev ? { ...prev, image_url: null } : prev));
        showToast("Photo removed.");
      } else {
        showError("Error removing image: " + result.error);
      }
    } catch (error) {
      showError("Failed to remove image.");
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-appleGray-100 py-20">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-appleGray-500">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !feedback) {
    return (
      <div className="min-h-full bg-appleGray-100 p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-appleGray-200 bg-white p-12 text-center">
          <Icon icon="material-symbols:error-outline" className="mx-auto mb-3 text-3xl text-appleGray-400" />
          <h2 className="text-base font-semibold text-appleGray-800">Feedback not found</h2>
          <p className="mt-1 text-sm text-appleGray-400">{fetchError}</p>
          <Link
            href="/admin/feedbacks"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            <Icon icon="material-symbols:arrow-back" className="text-base" />
            Back to feedbacks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-appleGray-100">
      {/* Header */}
      <div className="border-b border-appleGray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href="/admin/feedbacks"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-appleGray-200 bg-appleGray-50 text-appleGray-600 transition-colors hover:bg-appleGray-100"
              >
                <Icon icon="material-symbols:arrow-back" className="text-lg" />
              </Link>
              <div>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getFeedbackStatusBadge(feedback.status)}`}
                  >
                    {getFeedbackStatusLabel(feedback.status)}
                  </span>
                  <span className="text-xs text-appleGray-400">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-appleGray-900">
                  {feedback.client_name}
                </h1>
                <p className="mt-0.5 text-sm text-appleGray-400">{feedback.title}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {feedback.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={isBusy}
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-600 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Icon icon="mdi:loading" className="animate-spin text-base" />
                    ) : (
                      <Icon icon="material-symbols:check" className="text-base" />
                    )}
                    Approve & Publish
                  </button>
                </>
              )}
              {feedback.status === "approved" && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={isBusy}
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                >
                  Unpublish
                </button>
              )}
              {feedback.status === "rejected" && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-600 disabled:opacity-50"
                >
                  Approve & Publish
                </button>
              )}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isBusy}
                className="rounded-xl border border-appleGray-200 bg-white p-2 text-appleGray-500 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Delete"
              >
                <Icon icon="material-symbols:delete-outline" className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-2.5 text-center text-sm font-medium text-emerald-700">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-4 px-6 py-5 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-4 lg:col-span-2">
            {/* Review */}
            <div className="rounded-2xl border border-appleGray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-sky-600">
                  <Icon icon="material-symbols:format-quote" className="text-base text-white" />
                </div>
                <h2 className="text-base font-semibold text-appleGray-900">Review</h2>
              </div>
              <div className="mb-3 flex items-center gap-1">
                {[...Array(feedback.rating)].map((_, i) => (
                  <FaStar key={i} className="h-4 w-4 text-yellow-400" />
                ))}
                <span className="ml-1 text-sm text-appleGray-400">
                  {feedback.rating}/5
                </span>
              </div>
              <p className="leading-relaxed text-appleGray-700">{feedback.message}</p>
            </div>

            {/* Photo upload */}
            <div className="rounded-2xl border border-appleGray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600">
                  <Icon icon="material-symbols:add-a-photo-outline" className="text-base text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-appleGray-900">
                    Success Story Photo
                  </h2>
                  <p className="text-xs text-appleGray-400">Optional · shown on homepage when approved</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => !isBusy && fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="group relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-appleGray-200 bg-appleGray-50 transition-colors hover:border-sky-300 hover:bg-sky-50/50 disabled:opacity-50"
                >
                  {imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={feedback.client_name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-appleGray-800">
                          {imageUploading ? "Uploading…" : "Change photo"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-appleGray-400">
                      <Icon icon="material-symbols:cloud-upload" className="text-3xl" />
                      <span className="text-sm font-medium text-appleGray-600">
                        {imageUploading ? "Uploading…" : "Upload photo"}
                      </span>
                      <span className="text-xs">JPEG, PNG, WebP · max 5 MB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isBusy}
                    onChange={(e) => saveImage(e.target.files?.[0])}
                  />
                </button>

                <FeedbackHomePreview feedback={feedback} imageUrl={imageUrl} />
              </div>

              {imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isBusy}
                  className="mt-3 text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-appleGray-200 bg-white p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-appleGray-400">
                Details
              </p>
              <dl className="space-y-3">
                {[
                  { label: "Program", value: feedback.program_type },
                  { label: "University", value: feedback.university },
                  {
                    label: "Display name",
                    value: feedback.allow_display_name ? "Shown" : "Anonymous",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-appleGray-400">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-appleGray-800">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {feedback.application_id && (
              <Link
                href={`/admin/application/${feedback.application_id}`}
                className="flex items-center justify-between rounded-2xl border border-appleGray-200 bg-white p-4 transition-colors hover:border-sky-200 hover:bg-sky-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                    <Icon icon="material-symbols:person-outline" className="text-lg text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-appleGray-800">
                      View application
                    </p>
                    <p className="text-xs text-appleGray-400">Open student profile</p>
                  </div>
                </div>
                <Icon icon="material-symbols:chevron-right" className="text-xl text-appleGray-400" />
              </Link>
            )}

            {feedback.admin_notes && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                  Admin notes
                </p>
                <p className="mt-2 text-sm text-amber-900">{feedback.admin_notes}</p>
              </div>
            )}

            {feedback.status === "pending" && (
              <div className="rounded-2xl border border-appleGray-200 bg-white p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-appleGray-400">
                  Review steps
                </p>
                <ol className="space-y-2 text-sm text-appleGray-600">
                  <li className="flex items-center gap-2">
                    <Icon icon="material-symbols:check-circle" className="text-base text-emerald-500" />
                    Read the review
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="material-symbols:add-a-photo-outline" className="text-base text-sky-500" />
                    Add photo (optional)
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="material-symbols:publish" className="text-base text-sky-500" />
                    Approve to publish
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
