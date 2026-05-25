"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { Icon } from "@iconify/react";

// A reusable backdrop for modals
const ModalBackdrop = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
    onClick={onClick}
  />
);

const WorkQuery = () => {
  const [works, setWorks] = useState([]);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [referralFilterOnly, setReferralFilterOnly] = useState(false);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralLookupId, setReferralLookupId] = useState(null);
  const [referralErrorModal, setReferralErrorModal] = useState(null);

  // Get current user information
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/admin-auth/validate");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentUser(data.admin);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
      setIsLoading(false);
    };

    getCurrentUser();
  }, []);

  // Fetch work_visa data
  useEffect(() => {
    if (!currentUser) return;

    const fetchWorks = async () => {
      setIsLoading(true);
      try {
      // First get the work visa data
      let query = supabase.from("work_visa").select("*");

      // If user is staff, only show assigned works
      if (currentUser.role === "staff") {
        query = query.eq("assigned_to", currentUser.id);
      }

      console.log("🔍 Fetching works with query:", query);
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching data:", error.message);
        return;
      }

      console.log("🔍 Raw work data from database:", data);

      const parsedData = data.map((row) => {
        const workData = JSON.parse(row.data);
        return {
          id: row.id,
          ...workData,
          MarkasRead: workData.MarkasRead ?? false,
        };
      });

      setWorks(parsedData);
      setFilteredWorks(parsedData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorks();
  }, [currentUser]);

  // Filter works based on search term and referral code
  useEffect(() => {
    let filtered = works;

    if (referralFilterOnly) {
      filtered = filtered.filter((work) => work.referenceCode?.trim());
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (work) =>
          work.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          work.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          work.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWorks(filtered);
  }, [searchTerm, referralFilterOnly, works]);

  // Toggle MarkasRead status
  const toggleMarkasRead = async (workId, currentStatus) => {
    // Find the work in the list
    const work = works.find((s) => s.id === workId);
    if (!work) return;

    // Update MarkasRead value
    const updatedData = {
      ...work,
      MarkasRead: !currentStatus, // Toggle true/false
    };

    // Remove `id` before storing (since it's a separate column)
    delete updatedData.id;

    // ✅ Ensure JSON is properly stored as an array of a single string
    const { error } = await supabase
      .from("work_visa")
      .update({ data: JSON.stringify(updatedData) }) // Store JSON inside an array
      .eq("id", workId);

    if (error) {
      console.error("Error updating MarkasRead:", error.message);
    } else {
      setWorks((prevWorks) =>
        prevWorks.map((s) =>
          s.id === workId ? { ...s, MarkasRead: !currentStatus } : s
        )
      );
    }
  };

  // Open Delete Confirmation Modal
  const confirmDelete = (workerId) => {
    setWorkerToDelete(workerId);
    setIsDeleteModalOpen(true);
  };

  // Delete Worker
  const deleteWorker = async () => {
    if (!workerToDelete) return;

    const { error } = await supabase
      .from("work_visa")
      .delete()
      .eq("id", workerToDelete);

    if (error) {
      console.error("Error deleting worker:", error.message);
    } else {
      setWorks(works.filter((work) => work.id !== workerToDelete));
    }

    // Close Modal
    setIsDeleteModalOpen(false);
    setWorkerToDelete(null);
  };

  // Open WorkDetails in a new tab
  const openNewTab = (work) => {
    sessionStorage.setItem("selectedWorkId", work.id);
    window.open("/admin/entries/view-work", "_blank");
  };

  const showReferralError = (code) => {
    setReferralErrorModal({
      code: code?.trim() || null,
      message:
        "No application was found for this referral code. It may be invalid or not yet linked to an account.",
    });
  };

  const handleReferralClick = async (code) => {
    if (!code?.trim()) {
      showReferralError(code);
      return;
    }

    setReferralLookupId(code);
    try {
      const response = await fetch(
        `/api/admin/referral-lookup?code=${encodeURIComponent(code.trim())}`
      );
      const data = await response.json();

      if (response.ok && data.success && data.found) {
        window.open(`/applications/${data.id}`, "_blank");
      } else {
        showReferralError(code);
      }
    } catch (error) {
      console.error("Error looking up referral code:", error);
      showReferralError(code);
    } finally {
      setReferralLookupId(null);
    }
  };

  return (
    <div className="bg-appleGray-100">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-appleGray-500">
              Loading work visa applications...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-0">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-appleGray-200 p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Icon
                      icon="material-symbols:search"
                      className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-appleGray-400 text-lg"
                    />
                    <input
                      type="text"
                      placeholder="Search workers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReferralFilterOnly((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      referralFilterOnly
                        ? "bg-sky-500 text-white shadow-sm"
                        : "bg-appleGray-100 text-appleGray-600 hover:bg-appleGray-200"
                    }`}
                  >
                    <Icon icon="material-symbols:confirmation-number" className="text-sm" />
                    <span>With referral code</span>
                  </button>
                  <div className="text-xs text-appleGray-400 font-medium">
                    {filteredWorks.length} of {works.length} applications
                  </div>
                </div>
              </div>
            </div>

            {/* Workers Table */}
            <div className="bg-white rounded-2xl border border-appleGray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-appleGray-50 border-b border-appleGray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Icon icon="material-symbols:work" className="text-sm" />
                          <span>Worker</span>
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Icon icon="material-symbols:mail" className="text-sm" />
                          <span>Email</span>
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Icon icon="material-symbols:confirmation-number" className="text-sm" />
                          <span>Referral code</span>
                        </div>
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-appleGray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1.5">
                          <Icon icon="material-symbols:mark-email-read" className="text-sm" />
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-appleGray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorks.map((work) => (
                      <tr
                        key={work.id}
                        className="border-b border-appleGray-100 last:border-b-0 hover:bg-appleGray-50 transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                              <Icon
                                icon="material-symbols:work"
                                className="text-white text-sm"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-appleGray-900">
                                {work.firstName} {work.lastName}
                              </div>
                              <div className="text-xs text-appleGray-400 font-mono">
                                #{work.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm text-appleGray-600">{work.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          {(() => {
                            const referralCode = work.referenceCode?.trim();
                            return (
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-appleGray-600 font-mono truncate max-w-[100px]">
                                  {referralCode || (
                                    <span className="text-appleGray-300 font-sans">—</span>
                                  )}
                                </div>
                                {referralCode && (
                                  <button
                                    type="button"
                                    onClick={() => handleReferralClick(referralCode)}
                                    disabled={referralLookupId === referralCode}
                                    className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-colors duration-200 disabled:opacity-50"
                                    title="View referrer details"
                                  >
                                    <Icon
                                      icon={
                                        referralLookupId === referralCode
                                          ? "material-symbols:progress-activity"
                                          : "material-symbols:link"
                                      }
                                      className={`text-base ${referralLookupId === referralCode ? "animate-spin" : ""}`}
                                    />
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!work.MarkasRead}
                              onChange={() =>
                                toggleMarkasRead(work.id, work.MarkasRead)
                              }
                              className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-appleGray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            <span className="ml-2 text-xs text-appleGray-500">
                              {work.MarkasRead ? "Read" : "Unread"}
                            </span>
                          </label>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openNewTab(work)}
                              className="bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
                            >
                              <Icon
                                icon="material-symbols:visibility"
                                className="text-sm"
                              />
                              <span>View</span>
                            </button>
                            {currentUser?.role !== "staff" && (
                              <button
                                onClick={() => confirmDelete(work.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
                              >
                                <Icon
                                  icon="material-symbols:delete"
                                  className="text-sm"
                                />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {filteredWorks.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon
                        icon="material-symbols:search-off"
                        className="text-2xl text-appleGray-400"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-appleGray-700 mb-1">
                      {searchTerm || referralFilterOnly
                        ? "No workers found"
                        : currentUser?.role === "staff"
                        ? "No assigned applications"
                        : "No work applications yet"}
                    </h3>
                    <p className="text-xs text-appleGray-400">
                      {searchTerm || referralFilterOnly
                        ? "Try adjusting your search or filter criteria"
                        : currentUser?.role === "staff"
                        ? "You haven't been assigned any work visa applications yet"
                        : "Work visa applications will appear here once submitted"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Referral lookup error modal */}
      {referralErrorModal && (
        <>
          <ModalBackdrop onClick={() => setReferralErrorModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-white rounded-2xl border border-appleGray-200 shadow-medium w-full max-w-md">
              <div className="border-b border-appleGray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-appleGray-900">
                  Referral code not found
                </h2>
                <button
                  type="button"
                  onClick={() => setReferralErrorModal(null)}
                  className="w-8 h-8 bg-appleGray-100 hover:bg-appleGray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <Icon icon="material-symbols:close" className="text-lg text-appleGray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100">
                    <Icon icon="material-symbols:confirmation-number" className="text-xl text-amber-600" />
                  </div>
                  {referralErrorModal.code && (
                    <p className="text-sm font-mono font-semibold text-appleGray-800 mb-2">
                      {referralErrorModal.code}
                    </p>
                  )}
                  <p className="text-sm text-appleGray-600">
                    {referralErrorModal.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReferralErrorModal(null)}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <>
          <ModalBackdrop onClick={() => setIsDeleteModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-white rounded-2xl border border-appleGray-200 shadow-medium w-full max-w-md">
              <div className="border-b border-appleGray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-appleGray-900">
                  Confirm Deletion
                </h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-8 h-8 bg-appleGray-100 hover:bg-appleGray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <Icon icon="material-symbols:close" className="text-lg text-appleGray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-100">
                    <Icon icon="material-symbols:warning" className="text-xl text-red-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-appleGray-900 mb-1.5">
                    Are you sure you want to delete this work application?
                  </h3>
                  <p className="text-xs text-appleGray-400">
                    This action cannot be undone. All worker data will be permanently removed.
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={deleteWorker}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 bg-appleGray-100 hover:bg-appleGray-200 text-appleGray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkQuery;
