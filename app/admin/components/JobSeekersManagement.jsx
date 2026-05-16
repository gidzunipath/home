"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  FaUser,
  FaTrash,
  FaEye,
  FaDownload,
  FaUndo,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

function ConfirmDeleteModal({ applicant, type, loading, onCancel, onConfirm }) {
  const isPermanent = type === "permanent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        disabled={loading}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isPermanent ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            <FaExclamationTriangle
              className={`h-6 w-6 ${
                isPermanent ? "text-red-600" : "text-amber-600"
              }`}
            />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1 text-appleGray-400 hover:bg-appleGray-100 hover:text-appleGray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <h2
          id="confirm-delete-title"
          className="mb-2 text-xl font-bold text-appleGray-900"
        >
          {isPermanent ? "Permanently delete application?" : "Move to deleted applicants?"}
        </h2>

        <p className="mb-1 text-sm text-appleGray-600">
          <span className="font-semibold text-appleGray-800">{applicant.full_name}</span>
          {applicant.position ? ` · ${applicant.position}` : ""}
        </p>

        <p className="mb-6 text-sm text-appleGray-600">
          {isPermanent
            ? "This will permanently remove the application and resume file from storage. This action cannot be undone."
            : "This application will be moved to the Deleted Applicants list. You can permanently delete it later from there."}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-appleGray-200 bg-white px-4 py-2.5 text-sm font-semibold text-appleGray-700 hover:bg-appleGray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
              isPermanent
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isPermanent ? (
              <>
                <FaTrash className="h-4 w-4" />
                Delete permanently
              </>
            ) : (
              <>
                <FaTrash className="h-4 w-4" />
                Move to deleted
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function JobSeekersManagement() {
  const [applicants, setApplicants] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [view, setView] = useState("active");
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const fetchApplicants = useCallback(async () => {
    setTableLoading(true);
    try {
      const response = await fetch(`/api/job-seekers?view=${view}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setApplicants(result.data || []);
      } else {
        console.error("Error fetching applicants:", result.error);
        setApplicants([]);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setApplicants([]);
    } finally {
      setTableLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const runSoftDelete = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/job-seekers/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "soft_delete" }),
      });
      const result = await response.json();
      if (result.success) {
        setConfirmModal(null);
        await fetchApplicants();
      } else {
        alert(result.error || "Failed to delete application.");
      }
    } catch {
      alert("Failed to delete application.");
    } finally {
      setActionLoading(null);
    }
  };

  const runPermanentDelete = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/job-seekers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setConfirmModal(null);
        await fetchApplicants();
      } else {
        alert(result.error || "Failed to permanently delete application.");
      }
    } catch {
      alert("Failed to permanently delete application.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!confirmModal) return;
    if (confirmModal.type === "permanent") {
      runPermanentDelete(confirmModal.applicant.id);
    } else {
      runSoftDelete(confirmModal.applicant.id);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-br from-appleGray-50 via-white to-sky-50 p-6 sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="mb-8 shrink-0">
          <h1 className="mb-2 text-3xl font-bold text-appleGray-800">Job Seekers</h1>
          <p className="text-appleGray-600">
            Review career applications and manage resumes
          </p>
        </div>

        <div className="mb-6 flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setView("active")}
            disabled={tableLoading}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:cursor-wait ${
              view === "active"
                ? "bg-sky-500 text-white"
                : "bg-appleGray-100 text-appleGray-700 hover:bg-appleGray-200"
            }`}
          >
            Active Applications
          </button>
          <button
            type="button"
            onClick={() => setView("deleted")}
            disabled={tableLoading}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:cursor-wait ${
              view === "deleted"
                ? "bg-red-500 text-white"
                : "bg-appleGray-100 text-appleGray-700 hover:bg-appleGray-200"
            }`}
          >
            Deleted Applicants
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-appleGray-200 bg-white shadow-soft">
          {tableLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3">
                <Icon icon="mdi:loading" className="h-10 w-10 animate-spin text-sky-500" />
                <p className="text-sm text-appleGray-600">Loading applications...</p>
              </div>
            </div>
          )}
          <div className="min-h-[min(70vh,560px)] flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-[1] bg-appleGray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">Applicant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">Resume</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-appleGray-200">
                {!tableLoading && applicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center text-appleGray-600">
                      {view === "active"
                        ? "No active applications yet."
                        : "No deleted applications."}
                    </td>
                  </tr>
                ) : (
                  applicants.map((app) => (
                    <tr key={app.id} className="transition-colors hover:bg-appleGray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                            <FaUser className="h-5 w-5 text-sky-600" />
                          </div>
                          <span className="font-semibold text-appleGray-800">{app.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-appleGray-800">{app.email}</p>
                        <p className="text-sm text-appleGray-600">{app.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-appleGray-800">{app.position}</td>
                      <td className="px-6 py-4">
                        {app.resume_url ? (
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={app.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
                            >
                              <FaEye className="h-3.5 w-3.5" />
                              View
                            </a>
                            <a
                              href={app.resume_url}
                              download={app.resume_filename || "resume"}
                              className="inline-flex items-center gap-1 rounded-lg bg-appleGray-100 px-3 py-1.5 text-sm font-medium text-appleGray-700 hover:bg-appleGray-200"
                            >
                              <FaDownload className="h-3.5 w-3.5" />
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-sm text-appleGray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-appleGray-800">
                        {formatDate(app.created_at)}
                        {view === "deleted" && app.deleted_at && (
                          <p className="mt-1 text-xs text-red-600">
                            Deleted: {formatDate(app.deleted_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {view === "active" ? (
                          <button
                            type="button"
                            disabled={actionLoading === app.id || tableLoading}
                            onClick={() => setConfirmModal({ type: "soft", applicant: app })}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <FaTrash className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={actionLoading === app.id || tableLoading}
                            onClick={() => setConfirmModal({ type: "permanent", applicant: app })}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <FaUndo className="h-3.5 w-3.5" />
                            Delete Permanently
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {confirmModal && (
        <ConfirmDeleteModal
          applicant={confirmModal.applicant}
          type={confirmModal.type}
          loading={actionLoading === confirmModal.applicant.id}
          onCancel={() => !actionLoading && setConfirmModal(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      </div>
    </div>
  );
}
