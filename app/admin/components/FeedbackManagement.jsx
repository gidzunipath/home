"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  FaStar,
  FaUser,
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaFilter,
} from "react-icons/fa";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/feedbacks?includePrivate=true");
      const result = await response.json();

      if (result.success) {
        setFeedbacks(result.data);
        // Calculate stats
        const total = result.data.length;
        const pending = result.data.filter(
          (f) => f.status === "pending"
        ).length;
        const approved = result.data.filter(
          (f) => f.status === "approved"
        ).length;
        const rejected = result.data.filter(
          (f) => f.status === "rejected"
        ).length;

        setStats({ total, pending, approved, rejected });
      } else {
        console.error("Error fetching feedbacks:", result.error);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus, adminNotes = "") => {
    setActionLoading(feedbackId);
    try {
      const response = await fetch("/api/feedbacks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: feedbackId,
          status: newStatus,
          admin_notes: adminNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchFeedbacks(); // Refresh the list
        setShowViewModal(false);
      } else {
        alert("Error updating feedback: " + result.error);
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("Error updating feedback: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (
      !confirm(
        "Are you sure you want to delete this feedback? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(feedbackId);
    try {
      const response = await fetch(`/api/feedbacks?id=${feedbackId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchFeedbacks(); // Refresh the list
      } else {
        alert("Error deleting feedback: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Error deleting feedback: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (statusFilter === "all") return true;
    return feedback.status === statusFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Icon
              icon="mdi:loading"
              className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4"
            />
            <p className="text-appleGray-600">Loading feedbacks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-appleGray-50 via-white to-sky-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-appleGray-800 mb-2">
            Feedback Management
          </h1>
          <p className="text-appleGray-600">
            Review and manage client testimonials
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-appleGray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon
                  icon="mdi:message-text"
                  className="w-6 h-6 text-blue-600"
                />
              </div>
              <div>
                <p className="text-sm text-appleGray-600">Total Feedbacks</p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft border border-appleGray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:clock" className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-appleGray-600">Pending Review</p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft border border-appleGray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Icon
                  icon="mdi:check-circle"
                  className="w-6 h-6 text-green-600"
                />
              </div>
              <div>
                <p className="text-sm text-appleGray-600">Approved</p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft border border-appleGray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Icon
                  icon="mdi:close-circle"
                  className="w-6 h-6 text-red-600"
                />
              </div>
              <div>
                <p className="text-sm text-appleGray-600">Rejected</p>
                <p className="text-2xl font-bold text-appleGray-800">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-appleGray-200 mb-8">
          <div className="flex items-center space-x-4">
            <FaFilter className="w-5 h-5 text-appleGray-600" />
            <span className="font-semibold text-appleGray-800">
              Filter by Status:
            </span>
            <div className="flex space-x-2">
              {[
                { value: "all", label: "All", count: stats.total },
                { value: "pending", label: "Pending", count: stats.pending },
                { value: "approved", label: "Approved", count: stats.approved },
                { value: "rejected", label: "Rejected", count: stats.rejected },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    statusFilter === filter.value
                      ? "bg-sky-500 text-white"
                      : "bg-appleGray-100 text-appleGray-700 hover:bg-appleGray-200"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedbacks Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-appleGray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-appleGray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Rating & Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-appleGray-200">
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <Icon
                          icon="mdi:message-outline"
                          className="w-12 h-12 text-appleGray-400 mx-auto mb-4"
                        />
                        <p className="text-appleGray-600">
                          {statusFilter === "all"
                            ? "No feedbacks found"
                            : `No ${statusFilter} feedbacks found`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <tr
                      key={feedback.id}
                      className="hover:bg-appleGray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-appleGray-800">
                              {feedback.client_name}
                            </p>
                            <p className="text-sm text-appleGray-600">
                              ID: {feedback.application_id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {renderStars(feedback.rating)}
                          <p className="font-medium text-appleGray-800 line-clamp-1">
                            {feedback.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {feedback.program_type && (
                            <p className="text-sm text-appleGray-800">
                              {feedback.program_type}
                            </p>
                          )}
                          {feedback.university && (
                            <p className="text-xs text-appleGray-600">
                              {feedback.university}
                            </p>
                          )}
                          {!feedback.program_type && !feedback.university && (
                            <p className="text-sm text-appleGray-500">
                              Not specified
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            feedback.status
                          )}`}
                        >
                          {feedback.status.charAt(0).toUpperCase() +
                            feedback.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-appleGray-800">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-appleGray-600">
                          {new Date(feedback.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setShowViewModal(true);
                            }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors duration-200"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>

                          {feedback.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(feedback.id, "approved")
                                }
                                disabled={actionLoading === feedback.id}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-colors duration-200 disabled:opacity-50"
                                title="Approve"
                              >
                                {actionLoading === feedback.id ? (
                                  <Icon
                                    icon="mdi:loading"
                                    className="w-4 h-4 animate-spin"
                                  />
                                ) : (
                                  <FaCheck className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleStatusUpdate(feedback.id, "rejected")
                                }
                                disabled={actionLoading === feedback.id}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors duration-200 disabled:opacity-50"
                                title="Reject"
                              >
                                {actionLoading === feedback.id ? (
                                  <Icon
                                    icon="mdi:loading"
                                    className="w-4 h-4 animate-spin"
                                  />
                                ) : (
                                  <FaTimes className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(feedback.id)}
                            disabled={actionLoading === feedback.id}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors duration-200 disabled:opacity-50"
                            title="Delete"
                          >
                            {actionLoading === feedback.id ? (
                              <Icon
                                icon="mdi:loading"
                                className="w-4 h-4 animate-spin"
                              />
                            ) : (
                              <FaTrash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && selectedFeedback && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-large border border-appleGray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-appleGray-800">
                  Feedback Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-10 h-10 bg-appleGray-100 hover:bg-appleGray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <FaTimes className="w-5 h-5 text-appleGray-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Client Info */}
                <div className="bg-appleGray-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-appleGray-800 mb-4">
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-appleGray-600">Name</p>
                      <p className="font-medium text-appleGray-800">
                        {selectedFeedback.client_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-appleGray-600">
                        Application ID
                      </p>
                      <p className="font-medium text-appleGray-800">
                        {selectedFeedback.application_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-appleGray-600">Program</p>
                      <p className="font-medium text-appleGray-800">
                        {selectedFeedback.program_type || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-appleGray-600">University</p>
                      <p className="font-medium text-appleGray-800">
                        {selectedFeedback.university || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating & Title */}
                <div>
                  <h4 className="font-semibold text-appleGray-800 mb-4">
                    Rating & Title
                  </h4>
                  <div className="space-y-3">
                    {renderStars(selectedFeedback.rating)}
                    <h5 className="text-xl font-bold text-appleGray-800">
                      {selectedFeedback.title}
                    </h5>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="font-semibold text-appleGray-800 mb-4">
                    Feedback Message
                  </h4>
                  <div className="bg-appleGray-50 rounded-2xl p-6">
                    <p className="text-appleGray-700 leading-relaxed">
                      &quot;{selectedFeedback.message}&quot;
                    </p>
                  </div>
                </div>

                {/* Status & Settings */}
                <div>
                  <h4 className="font-semibold text-appleGray-800 mb-4">
                    Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-appleGray-700">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedFeedback.status
                        )}`}
                      >
                        {selectedFeedback.status.charAt(0).toUpperCase() +
                          selectedFeedback.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-appleGray-700">
                        Allow display name:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedFeedback.allow_display_name
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedFeedback.allow_display_name ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-appleGray-700">Submitted:</span>
                      <span className="text-appleGray-800 font-medium">
                        {new Date(
                          selectedFeedback.created_at
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          selectedFeedback.created_at
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedFeedback.admin_notes && (
                  <div>
                    <h4 className="font-semibold text-appleGray-800 mb-4">
                      Admin Notes
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                      <p className="text-yellow-800">
                        {selectedFeedback.admin_notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedFeedback.status === "pending" && (
                  <div className="flex items-center space-x-4 pt-4 border-t border-appleGray-200">
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedFeedback.id, "approved")
                      }
                      disabled={actionLoading === selectedFeedback.id}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {actionLoading === selectedFeedback.id ? (
                        <Icon
                          icon="mdi:loading"
                          className="w-5 h-5 animate-spin"
                        />
                      ) : (
                        <FaCheck className="w-4 h-4" />
                      )}
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedFeedback.id, "rejected")
                      }
                      disabled={actionLoading === selectedFeedback.id}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {actionLoading === selectedFeedback.id ? (
                        <Icon
                          icon="mdi:loading"
                          className="w-5 h-5 animate-spin"
                        />
                      ) : (
                        <FaTimes className="w-4 h-4" />
                      )}
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
