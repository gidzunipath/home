import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

function getYoutubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const u = url.trim();
  const short = u.match(/youtu\.be\/([^?&#/]+)/);
  if (short) return short[1];
  const watch = u.match(/[?&]v=([^?&#]+)/);
  if (watch) return watch[1];
  const embed = u.match(/youtube\.com\/embed\/([^?&#/]+)/);
  if (embed) return embed[1];
  const shorts = u.match(/youtube\.com\/shorts\/([^?&#/]+)/);
  if (shorts) return shorts[1];
  return null;
}

const GidzBuddyChecklistAdmin = () => {
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_link: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchChecklistItems();
  }, []);

  const fetchChecklistItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gidz-buddy-checklist");
      const result = await response.json();

      if (result.success) {
        setChecklistItems(result.data);
      }
    } catch (error) {
      console.error("Error fetching checklist items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    const { title, description, youtube_link, is_active } = formData;

    // Basic validation
    if (!title || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    // Create the data with auto-calculated display order
    const itemData = {
      ...formData,
      display_order: checklistItems.length + 1, // Use array length as order
    };

    try {
      console.log("Making POST request to:", "/api/gidz-buddy-checklist");
      console.log("Request body:", itemData);

      const response = await fetch("/api/gidz-buddy-checklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log("Response data:", result);

        if (result.success) {
          await fetchChecklistItems();
          resetForm();
          setShowAddModal(false);
        } else {
          alert("Error: " + result.error);
        }
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        alert(
          "Server returned an unexpected response. Check console for details."
        );
      }
    } catch (error) {
      console.error("Error creating checklist item:", error);
      alert("Error creating checklist item: " + error.message);
    }
  };

  const handleEditItem = async () => {
    const { title, description, youtube_link, is_active, display_order } =
      currentItem;

    // Basic validation
    if (!title || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      console.log(
        "Making PUT request to:",
        `/api/gidz-buddy-checklist/${currentItem.id}`
      );
      console.log("Request body:", currentItem);

      const response = await fetch(
        `/api/gidz-buddy-checklist/${currentItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentItem),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log("Response data:", result);

        if (result.success) {
          await fetchChecklistItems();
          setShowEditModal(false);
          setCurrentItem(null);
        } else {
          alert("Error: " + result.error);
        }
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        alert(
          "Server returned an unexpected response. Check console for details."
        );
      }
    } catch (error) {
      console.error("Error updating checklist item:", error);
      alert("Error updating checklist item: " + error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this checklist item?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/gidz-buddy-checklist/${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setChecklistItems(checklistItems.filter((item) => item.id !== itemId));
        setViewItem((v) => (v && v.id === itemId ? null : v));
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      alert("Error deleting checklist item");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      youtube_link: "",
      is_active: true,
      display_order: 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItem((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-appleGray-50/60 backdrop-blur-sm rounded-2xl p-8 border border-appleGray-200 text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-appleGray-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-appleGray-200 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-appleGray-600 mt-3 font-medium">
            Loading checklist items...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Icon
              icon="mdi:format-list-checks"
              className="text-white text-lg"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Checklist Items
            </h2>
            <p className="text-gray-600 text-sm">
              {checklistItems.length} items configured
            </p>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-semibold"
          onClick={() => setShowAddModal(true)}
        >
          <Icon icon="mdi:plus" className="text-base" />
          Add New Item
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:check-circle-plus" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Add Checklist Item</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g., Open Bank Account, Register for Insurance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Detailed description of this checklist item..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  YouTube Link{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  name="youtube_link"
                  value={formData.youtube_link}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Active Item
                    </span>
                  </label>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-700 text-center">
                    <Icon icon="mdi:information" className="inline mr-1" />
                    New items will be added at the end of the list automatically
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  <Icon icon="mdi:plus" className="inline mr-2" />
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:check-circle-edit" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Edit Checklist Item</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={currentItem.title}
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="e.g., Open Bank Account, Register for Insurance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={currentItem.description}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Detailed description of this checklist item..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  YouTube Link{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  name="youtube_link"
                  value={currentItem.youtube_link || ""}
                  onChange={handleEditInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={currentItem.display_order}
                    onChange={handleEditInputChange}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    min="0"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={currentItem.is_active}
                      onChange={handleEditInputChange}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Active
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentItem(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditItem}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  <Icon icon="mdi:content-save" className="inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checklist-view-title"
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-appleGray-200 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 text-white shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wide">
                    Checklist item
                  </p>
                  <h2
                    id="checklist-view-title"
                    className="text-lg font-semibold leading-snug mt-1 break-words"
                  >
                    {viewItem.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setViewItem(null)}
                  className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-appleGray-500 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm text-appleGray-800 leading-relaxed whitespace-pre-wrap">
                  {viewItem.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-appleGray-500 uppercase tracking-wider mb-2">
                  Video guide
                </h3>
                {(() => {
                  const videoId = getYoutubeVideoId(viewItem.youtube_link);
                  if (videoId && viewItem.youtube_link) {
                    return (
                      <a
                        href={viewItem.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block overflow-hidden rounded-xl border border-appleGray-200 shadow-md bg-black aspect-video"
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${videoId}/hq720.jpg`}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          onError={(e) => {
                            e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/45 transition-colors">
                          <Icon
                            icon="mdi:play-circle"
                            className="text-white text-6xl drop-shadow-lg opacity-95 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="sr-only">Open video on YouTube</span>
                      </a>
                    );
                  }
                  if (viewItem.youtube_link) {
                    return (
                      <a
                        href={viewItem.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100"
                      >
                        <Icon icon="mdi:youtube" className="text-xl" />
                        Open video link
                      </a>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-appleGray-200 bg-appleGray-50 py-10 text-appleGray-500 text-sm">
                      <Icon icon="mdi:video-off" className="text-3xl" />
                      No video linked for this item
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-appleGray-100 bg-appleGray-50/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="w-full py-3 rounded-xl bg-appleGray-200 text-appleGray-800 font-semibold text-sm hover:bg-appleGray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Items Table */}
      {checklistItems.length === 0 ? (
        <div className="bg-appleGray-50/60 backdrop-blur-sm rounded-2xl p-8 border border-appleGray-200 text-center">
          <div className="w-16 h-16 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="mdi:clipboard-list-outline"
              className="text-2xl text-appleGray-400"
            />
          </div>
          <p className="text-appleGray-600 text-base font-medium">
            No checklist items found
          </p>
          <p className="text-appleGray-500 text-sm mt-1">
            Create your first checklist item to get started
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-appleGray-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-appleGray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-appleGray-700 uppercase tracking-wider">
                    Checklist Item
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-appleGray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-appleGray-700 uppercase tracking-wider">
                    Video Guide
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-appleGray-700 uppercase tracking-wider">
                    Display Order
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-appleGray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-appleGray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-appleGray-200">
                {checklistItems.map((item) => (
                  <tr
                    key={item.id}
                    tabIndex={0}
                    className="hover:bg-appleGray-50/70 transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    onClick={() => setViewItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setViewItem(item);
                      }
                    }}
                  >
                    <td className="py-4 px-6 max-w-[16rem] overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-5 w-5 shrink-0  bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-soft"
                          aria-hidden
                        >
                          <Icon
                            icon="mdi:check-bold"
                            className="text-white text-lg shrink-0"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-sm text-appleGray-900 truncate"
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-appleGray-600 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.youtube_link ? (
                        <a
                          href={item.youtube_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm hover:underline transition-colors duration-200 bg-red-50 px-3 py-1.5 rounded-full"
                        >
                          <Icon icon="mdi:youtube" className="text-base" />
                          Watch Guide
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-appleGray-100 text-appleGray-600 rounded-full text-xs font-medium">
                          <Icon icon="mdi:video-off" className="text-sm" />
                          No Video
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">
                        <Icon
                          icon="mdi:sort-numeric-variant"
                          className="text-sm"
                        />
                        {item.display_order}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          item.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <Icon
                          icon={
                            item.is_active
                              ? "mdi:check-circle"
                              : "mdi:pause-circle"
                          }
                          className="text-sm"
                        />
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentItem(item);
                            setShowEditModal(true);
                          }}
                          className="p-2.5 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors duration-200 border border-sky-200 hover:border-sky-300"
                          title="Edit checklist item"
                        >
                          <Icon icon="mdi:pencil" className="text-lg" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 border border-red-200 hover:border-red-300"
                          title="Delete checklist item"
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
    </div>
  );
};

export default GidzBuddyChecklistAdmin;
