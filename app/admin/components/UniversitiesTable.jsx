"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "../../../lib/supabase";
import {
  UNIVERSITY_STATUSES,
  normalizeUniversityStatus,
  getUniversityStatusLabel,
} from "../../../lib/university-status";

function universityStatusIconName(status) {
  const v = normalizeUniversityStatus(status);
  switch (v) {
    case "accepted":
      return "mdi:check-circle";
    case "rejected":
      return "mdi:close-circle";
    case "submitted":
      return "mdi:file-send-outline";
    case "verification":
      return "mdi:shield-search";
    case "started":
      return "mdi:play-circle-outline";
    default:
      return "mdi:help-circle-outline";
  }
}

function universityStatusBadgeClass(status) {
  const v = normalizeUniversityStatus(status);
  switch (v) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "submitted":
      return "bg-amber-100 text-amber-800";
    case "verification":
      return "bg-indigo-100 text-indigo-800";
    case "started":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

const UniversitiesTable = ({ applicationId }) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUni, setCurrentUni] = useState(null);
  const [newUni, setNewUni] = useState({
    uni_name: "",
    course: "",
    place: "",
    language: "",
    deadline: "",
    status: "",
  });

  // Fetch universities when component mounts or applicationId changes
  useEffect(() => {
    if (applicationId) {
      fetchUniversities(applicationId);
    }
  }, [applicationId]);

  const fetchUniversities = async (appId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("universities")
      .select("*")
      .eq("application_id", appId)
      .order("deadline", { ascending: false });

    if (error) {
      console.error("Error fetching universities:", error.message);
      // Optionally, set a notification state here
    } else {
      setUniversities(data);
    }
    setLoading(false);
  };

  const handleAddUniversity = async () => {
    const { uni_name, course, place, language, deadline, status } = newUni;

    // Basic validation
    if (!uni_name || !course || !place || !language || !deadline || !status) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("universities")
        .insert([
          {
            application_id: applicationId,
            uni_name,
            course,
            deadline,
            place,
            language,
            status,
          },
        ])
        .select("*"); // Ensure response includes inserted row

      if (error) throw error;

      if (data && data.length > 0) {
        setUniversities((prev) =>
          [...prev, data[0]].sort((a, b) => b.deadline - a.deadline)
        );
      } else {
        console.error("No data returned after insert.");
      }

      // Reset form and close modal
      setNewUni({
        uni_name: "",
        course: "",
        deadline: "",
        place: "",
        language: "",
        status: "",
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding university:", err.message);
    }
  };

  // Handle Delete University
  const handleDeleteUniversity = async (uniId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this university?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("universities")
      .delete()
      .eq("id", uniId);

    if (error) {
      console.error("Error deleting university:", error.message);
      alert("Failed to delete university. Please try again.");
    } else {
      // Update local state
      setUniversities(universities.filter((uni) => uni.id !== uniId));
    }
  };

  // Handle Edit University
  const handleEditUniversity = async () => {
    const { uni_name, course, place, language, deadline, status } = currentUni;

    // Basic validation
    if (!uni_name || !course || !place || !language || !deadline || !status) {
      alert("Please fill in all fields.");
      return;
    }

    const { error } = await supabase
      .from("universities")
      .update({
        uni_name,
        course,
        deadline,
        place,
        language,
        status,
      })
      .eq("id", currentUni.id);

    if (error) {
      console.error("Error updating university:", error.message);
      alert("Failed to update university. Please try again.");
    } else {
      // Update local state
      setUniversities(
        universities.map((uni) => (uni.id === currentUni.id ? currentUni : uni))
      );
      setShowEditModal(false);
      setCurrentUni(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Icon icon="mdi:university" className="text-sm text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Universities</h3>
        </div>
        <button
          className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2.5 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-semibold"
          onClick={() => setShowAddModal(true)}
        >
          <Icon icon="mdi:plus" className="text-base" />
          Add University
        </button>
      </div>

      {loading ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-100 text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-3">Loading universities...</p>
        </div>
      ) : universities.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="mdi:university-outline"
              className="text-2xl text-gray-400"
            />
          </div>
          <p className="text-gray-600 text-base">No universities found.</p>
          <p className="text-gray-500 text-sm mt-1">
            Add a university to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    University Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Place
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {universities.map((uni) => (
                  <tr
                    key={uni.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <Icon
                            icon="mdi:university"
                            className="text-white text-sm"
                          />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {uni.uni_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900 font-medium">
                        {uni.course}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mdi:map-marker"
                          className="text-gray-500 text-sm"
                        />
                        <span className="text-gray-700">{uni.place}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        <Icon icon="mdi:translate" className="text-sm" />
                        {uni.language}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mdi:calendar"
                          className="text-gray-500 text-sm"
                        />
                        <span className="text-gray-700">{uni.deadline}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${universityStatusBadgeClass(
                          uni.status
                        )}`}
                      >
                        <Icon
                          icon={universityStatusIconName(uni.status)}
                          className="text-sm"
                        />
                        {getUniversityStatusLabel(uni.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          onClick={() => {
                            setCurrentUni({
                              ...uni,
                              status: normalizeUniversityStatus(uni.status),
                            });
                            setShowEditModal(true);
                          }}
                          title="Edit university"
                        >
                          <Icon icon="mdi:pencil" className="text-lg" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          onClick={() => handleDeleteUniversity(uni.id)}
                          title="Delete university"
                        >
                          <Icon icon="mdi:delete" className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add University Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:university-plus" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Add New University</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    University Name
                  </label>
                  <input
                    type="text"
                    value={newUni.uni_name}
                    onChange={(e) =>
                      setNewUni({ ...newUni, uni_name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., Harvard University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    value={newUni.course}
                    onChange={(e) =>
                      setNewUni({ ...newUni, course: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., Software Engineering"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Place
                  </label>
                  <input
                    type="text"
                    value={newUni.place}
                    onChange={(e) =>
                      setNewUni({ ...newUni, place: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., Berlin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={newUni.language}
                    onChange={(e) =>
                      setNewUni({ ...newUni, language: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., English"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newUni.deadline}
                    onChange={(e) =>
                      setNewUni({ ...newUni, deadline: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newUni.status}
                    onChange={(e) =>
                      setNewUni({ ...newUni, status: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  >
                    <option value="">Select status</option>
                    {UNIVERSITY_STATUSES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={() => setShowAddModal(false)}
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 font-medium"
                  onClick={handleAddUniversity}
                >
                  <Icon icon="mdi:plus" className="inline mr-2" />
                  Add University
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit University Modal */}
      {showEditModal && currentUni && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:university-edit" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Edit University</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    University Name
                  </label>
                  <input
                    type="text"
                    value={currentUni.uni_name}
                    onChange={(e) =>
                      setCurrentUni({ ...currentUni, uni_name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., Harvard University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    value={currentUni.course}
                    onChange={(e) =>
                      setCurrentUni({ ...currentUni, course: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., Software Engineering"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Place
                  </label>
                  <input
                    type="text"
                    value={currentUni.place}
                    onChange={(e) =>
                      setCurrentUni({ ...currentUni, place: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., Berlin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={currentUni.language}
                    onChange={(e) =>
                      setCurrentUni({ ...currentUni, language: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="e.g., English"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={currentUni.deadline}
                    onChange={(e) =>
                      setCurrentUni({ ...currentUni, deadline: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={currentUni.status}
                    onChange={(e) =>
                      setCurrentUni({ ...currentUni, status: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  >
                    <option value="">Select status</option>
                    {UNIVERSITY_STATUSES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentUni(null);
                  }}
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 font-medium"
                  onClick={handleEditUniversity}
                >
                  <Icon icon="mdi:content-save" className="inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitiesTable;
