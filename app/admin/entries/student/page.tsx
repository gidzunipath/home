"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "../../../../lib/supabase";
import { Icon } from "@iconify/react";

const PAGE_SIZE = 10;

const parseStudentRow = (row) => {
  const raw = row.data;
  const jsonStr = Array.isArray(raw) ? raw[0] : raw;
  const studentData = JSON.parse(jsonStr);
  return {
    id: row.id,
    ...studentData,
    MarkasRead: studentData.MarkasRead ?? false,
  };
};

// A reusable backdrop for modals
const ModalBackdrop = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
    onClick={onClick}
  />
);

const StudentQuery = () => {
  const [students, setStudents] = useState([]);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [referralFilterOnly, setReferralFilterOnly] = useState(false);
  const [unreadFilterOnly, setUnreadFilterOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [referralLookupId, setReferralLookupId] = useState(null);
  const [referralErrorModal, setReferralErrorModal] = useState(null);
  const loadMoreRef = useRef(null);

  // Debounce the search term so we don't hit the DB on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // Fetch a single page of student_visa data, with optional DB-level search
  const fetchPage = useCallback(
    async (from, search = "") => {
      let query = supabase
        .from("student_visa")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (currentUser?.role === "staff") {
        query = query.eq("assigned_to", currentUser.id);
      }

      // Search across the entire JSON data column at the DB level
      if (search.trim()) {
        query = query.filter("data::text", "ilike", `%${search.trim()}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching data:", error.message);
        return null;
      }

      const parsed = (data || []).map(parseStudentRow);

      return {
        items: parsed,
        hasMore: (data?.length || 0) === PAGE_SIZE,
        nextOffset: from + (data?.length || 0),
        total: count ?? 0,
      };
    },
    [currentUser]
  );

  const loadInitial = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setStudents([]);
    setOffset(0);
    setHasMore(true);

    try {
      let allItems = [];
      let from = 0;
      let more = true;
      let total = 0;

      while (true) {
        const result = await fetchPage(from, debouncedSearch);
        if (!result) break;

        allItems = [...allItems, ...result.items];
        from = result.nextOffset;
        more = result.hasMore;
        total = result.total;

        if (
          !unreadFilterOnly ||
          allItems.filter((s) => !s.MarkasRead).length >= PAGE_SIZE ||
          !more
        ) {
          break;
        }
      }

      setStudents(allItems);
      setHasMore(more);
      setOffset(from);
      setTotalCount(total);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchPage, unreadFilterOnly, debouncedSearch]);

  const loadMore = useCallback(async () => {
    if (!currentUser || isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchPage(offset, debouncedSearch);
      if (!result) return;

      setStudents((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setOffset(result.nextOffset);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentUser, isLoading, isLoadingMore, hasMore, offset, fetchPage, debouncedSearch]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || isLoading) return;

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
  }, [loadMore, isLoading]);

  // Client-side filters (unread, referral) applied on top of DB-searched results
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (unreadFilterOnly) {
      filtered = filtered.filter((student) => !student.MarkasRead);
    }

    if (referralFilterOnly) {
      filtered = filtered.filter((student) =>
        student.AdditionalInformation?.ReferenceCode?.trim()
      );
    }

    return filtered;
  }, [students, referralFilterOnly, unreadFilterOnly]);

  // Toggle MarkasRead status
  const toggleMarkasRead = async (studentId, currentStatus) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedData = {
      ...student,
      MarkasRead: !currentStatus,
    };

    delete updatedData.id;

    const { error } = await supabase
      .from("student_visa")
      .update({ data: [`${JSON.stringify(updatedData)}`] })
      .eq("id", studentId);

    if (error) {
      console.error("Error updating MarkasRead:", error.message);
    } else {
      setStudents((prevStudents) =>
        prevStudents.map((s) =>
          s.id === studentId ? { ...s, MarkasRead: !currentStatus } : s
        )
      );
    }
  };

  // Open Delete Confirmation Modal
  const confirmDelete = (studentId) => {
    setStudentToDelete(studentId);
    setIsDeleteModalOpen(true);
  };

  // Delete Student
  const deleteStudent = async () => {
    if (!studentToDelete) return;

    const { error } = await supabase
      .from("student_visa")
      .delete()
      .eq("id", studentToDelete);

    if (error) {
      console.error("Error deleting student:", error.message);
    } else {
      setStudents(students.filter((student) => student.id !== studentToDelete));
    }

    setIsDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  // Open New Tab with Student Details
  const openNewTab = (student) => {
    sessionStorage.setItem("selectedStudentId", student.id);
    window.open("/admin/entries/view-student", "_blank");
  };

  const showReferralError = (code) => {
    setReferralErrorModal({
      code: code?.trim() || null,
      message:
        "No application was found for this referral code.",
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
              Loading student applications...
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
                      icon={debouncedSearch !== searchTerm ? "material-symbols:progress-activity" : "material-symbols:search"}
                      className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 text-appleGray-400 text-lg ${debouncedSearch !== searchTerm ? "animate-spin" : ""}`}
                    />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm"
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
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setUnreadFilterOnly((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      unreadFilterOnly
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-appleGray-100 text-appleGray-600 hover:bg-appleGray-200"
                    }`}
                  >
                    <Icon icon="material-symbols:mark-email-unread" className="text-sm" />
                    <span>Unread only</span>
                  </button>
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
                    {filteredStudents.length} shown · {students.length} of {totalCount} loaded
                  </div>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-appleGray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-appleGray-50 border-b border-appleGray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Icon icon="material-symbols:person" className="text-sm" />
                          <span>Student</span>
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-appleGray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Icon icon="material-symbols:mail" className="text-sm" />
                          <span>Contact</span>
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
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-appleGray-100 last:border-b-0 hover:bg-appleGray-50 transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon
                                icon="material-symbols:person"
                                className="text-white text-sm"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-appleGray-900 truncate">
                                {student.PersonalInformation?.FirstName}{" "}
                                {student.PersonalInformation?.LastName}
                              </div>
                              <div className="text-xs text-appleGray-400 font-mono truncate">
                                #{student.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm text-appleGray-600 truncate">
                            {student.ContactInformation?.Email}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {(() => {
                            const referralCode =
                              student.AdditionalInformation?.ReferenceCode?.trim();
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
                              checked={!!student.MarkasRead}
                              onChange={() =>
                                toggleMarkasRead(student.id, student.MarkasRead)
                              }
                              className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-appleGray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                            <span className="ml-2 text-xs text-appleGray-700">
                              {student.MarkasRead ? "Read" : "Unread"}
                            </span>
                          </label>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openNewTab(student)}
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
                                onClick={() => confirmDelete(student.id)}
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
                {filteredStudents.length === 0 && !isLoading && (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon
                        icon="material-symbols:search-off"
                        className="text-2xl text-appleGray-400"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-appleGray-700 mb-1">
                      {debouncedSearch || referralFilterOnly || unreadFilterOnly
                        ? "No students found"
                        : currentUser?.role === "staff"
                        ? "No assigned applications"
                        : "No student applications yet"}
                    </h3>
                    <p className="text-xs text-appleGray-400">
                      {debouncedSearch || referralFilterOnly || unreadFilterOnly
                        ? "Try adjusting your search or filter criteria"
                        : currentUser?.role === "staff"
                        ? "You haven't been assigned any student visa applications yet"
                        : "Student visa applications will appear here once submitted"}
                    </p>
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                {!isLoading && (filteredStudents.length > 0 || (hasMore && unreadFilterOnly)) && (
                  <div ref={loadMoreRef} className="py-4 flex justify-center">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-xs text-appleGray-400">
                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        Loading more...
                      </div>
                    )}
                    {!isLoadingMore && !hasMore && (
                      <p className="text-xs text-appleGray-400">All applications loaded</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

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
                        Are you sure you want to delete this student application?
                      </h3>
                      <p className="text-xs text-appleGray-400">
                        This action cannot be undone. All student data will be permanently removed.
                      </p>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={deleteStudent}
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
        </>
      )}
    </div>
  );
};

export default StudentQuery;
