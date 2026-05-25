import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaExternalLinkAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAppModal } from "../../../hooks/useAppModal";

const GidzBuddyChecklistAdminSimple = () => {
  const { showError, showConfirm } = useAppModal();
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_link: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingItem
        ? "/api/gidz-buddy-checklist"
        : "/api/gidz-buddy-checklist";

      const method = editingItem ? "PUT" : "POST";
      const bodyData = editingItem
        ? { ...formData, id: editingItem.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchChecklistItems();
        resetForm();
        setShowAddForm(false);
      } else {
        showError(result.error);
      }
    } catch (error) {
      console.error("Error saving checklist item:", error);
      showError("Error saving checklist item");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      type: "danger",
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/gidz-buddy-checklist?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchChecklistItems();
      } else {
        showError("Error deleting item: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      showError("Error deleting checklist item");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      youtube_link: "",
      display_order: 0,
    });
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      youtube_link: item.youtubeLink || "",
      display_order: item.displayOrder,
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gidz Buddy Checklist Management
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingItem) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? "Edit Checklist Item" : "Add New Checklist Item"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  YouTube Link (Optional)
                </label>
                <input
                  type="url"
                  name="youtube_link"
                  value={formData.youtube_link}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaSave className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Checklist Items List */}
      <div className="space-y-4">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Order: {item.displayOrder}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{item.description}</p>

                {item.youtubeLink && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 mb-3">
                    <FaExternalLinkAlt className="w-3 h-3" />
                    <a
                      href={item.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      YouTube Video Guide
                    </a>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {checklistItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No checklist items found. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GidzBuddyChecklistAdminSimple;
