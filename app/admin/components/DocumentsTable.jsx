"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "../../../lib/supabase";
import { useAppModal } from "../../../hooks/useAppModal";

const DocumentsTable = ({ applicationId }) => {
  const { showWarning, showError, showConfirm } = useAppModal();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [newDoc, setNewDoc] = useState({
    name: "",
    url: "",
    type: "",
  });

  // Fetch documents when component mounts or applicationId changes
  useEffect(() => {
    if (applicationId) {
      fetchDocuments(applicationId);
    }
  }, [applicationId]);

  const fetchDocuments = async (appId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("application_id", appId)
      .eq("upload_by", "Client")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching documents:", error.message);
      // Optionally, set a notification state here
    } else {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleAddDocument = async () => {
    const { name, url, type } = newDoc;

    // Basic validation
    if (!name) {
      showWarning("Please provide a document name.");
      return;
    }

    if (!type) {
      showWarning("Please select a document type.");
      return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          application_id: applicationId,
          name,
          url: url || null, // Allow URL to be nullable
          type,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding document:", error.message);
      // Optionally, set a notification state here
    } else {
      // Update local state
      setDocuments([...documents, data[0]]);
      // Reset form
      setNewDoc({
        name: "",
        url: "",
        type: "",
      });
      setShowAddModal(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDocument = async (docId) => {
    const confirmed = await showConfirm({
      type: "danger",
      title: "Delete Document",
      message: "Are you sure you want to delete this document?",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    const { error } = await supabase.from("documents").delete().eq("id", docId);

    if (error) {
      console.error("Error deleting document:", error.message);
      showError("Failed to delete document. Please try again.");
    } else {
      // Update local state
      setDocuments(documents.filter((doc) => doc.id !== docId));
    }
  };

  // Handle Edit Document
  const handleEditDocument = async () => {
    const { id, name, url, type } = currentDoc;

    // Basic validation
    if (!name) {
      showWarning("Please provide a document name.");
      return;
    }

    if (!type) {
      showWarning("Please select a document type.");
      return;
    }

    const { error } = await supabase
      .from("documents")
      .update({
        name,
        url: url || null,
        type,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating document:", error.message);
      showError("Failed to update document. Please try again.");
    } else {
      // Update local state
      setDocuments(documents.map((doc) => (doc.id === id ? currentDoc : doc)));
      setShowEditModal(false);
      setCurrentDoc(null);
    }
  };

  // Handle Download from URL
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Icon icon="mdi:upload" className="text-sm text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Upload</h3>
        </div> */}
      {/* <button
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-semibold"
          onClick={() => setShowAddModal(true)}
        >
          <Icon icon="mdi:plus" className="text-base" />
          Add Document
        </button> */}
      {/* </div> */}

      {loading ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-100 text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-3">Loading documents...</p>
        </div>
      ) : documents.filter((doc) => doc.url).length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="mdi:file-document-outline"
              className="text-2xl text-gray-400"
            />
          </div>
          <p className="text-gray-600 text-base">No documents found.</p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents
                  .filter((doc) => doc.url)
                  .map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Icon
                              icon="mdi:file-document"
                              className="text-white text-sm"
                            />
                          </div>
                          <span className="text-gray-900 font-medium">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {/* <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            doc.type === "visa"
                              ? "bg-purple-100 text-purple-800"
                              : doc.type === "university"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <Icon
                            icon={
                              doc.type === "visa"
                                ? "mdi:passport"
                                : doc.type === "university"
                                ? "mdi:school"
                                : "mdi:file-question"
                            }
                            className="text-sm"
                          />
                          {doc.type === "visa"
                            ? "Visa"
                            : doc.type === "university"
                            ? "University"
                            : doc.type || "Unknown"}
                        </span> */}
                        <span>{doc.category || "-"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {/* <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            title="View document"
                          >
                            <Icon icon="mdi:eye" className="text-lg" />
                          </a> */}
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            onClick={() => handleDownload(doc.url, doc.name)}
                            title="Download document"
                          >
                            <Icon icon="mdi:download" className="text-lg" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            onClick={() => handleDeleteDocument(doc.id)}
                            title="Delete document"
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

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:file-document-plus" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Add New Document</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g., Transcript, ID Card, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={newDoc.type}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, type: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select document type</option>
                  <option value="visa">Visa</option>
                  <option value="university">University</option>
                </select>
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
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                  onClick={handleAddDocument}
                >
                  <Icon icon="mdi:plus" className="inline mr-2" />
                  Add Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {showEditModal && currentDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:file-document-edit" className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Edit Document</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={currentDoc.name}
                  onChange={(e) =>
                    setCurrentDoc({ ...currentDoc, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="e.g., Transcript, ID Card, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={currentDoc.type || ""}
                  onChange={(e) =>
                    setCurrentDoc({ ...currentDoc, type: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="">Select document type</option>
                  <option value="visa">Visa</option>
                  <option value="university">University</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document URL{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={currentDoc.url || ""}
                  onChange={(e) =>
                    setCurrentDoc({ ...currentDoc, url: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentDoc(null);
                  }}
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                  onClick={handleEditDocument}
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

export default DocumentsTable;
