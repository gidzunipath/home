"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "../../../lib/supabase";
import { useAppModal } from "../../../hooks/useAppModal";

/** Display labels for upload_by; DB values remain "Us" / "Client". */
const UPLOAD_BY_LABELS = {
  Us: "Visa Document",
  Client: "Student Document",
};

const getUploadByLabel = (value) => UPLOAD_BY_LABELS[value] ?? value;

const DocumentsFromUs = ({ applicationId }) => {
  const { showWarning, showError, showConfirm } = useAppModal();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [newDoc, setNewDoc] = useState({
    name: "",
    upload_by: "Us", // Default to 'Us'
    file: null,
    type: "",
  });
  const [uploading, setUploading] = useState(false); // Track upload state

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
      .eq("upload_by", "Us") // Changed from 'Client' to 'Us'
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching documents:", error.message);
      // Optionally, set a notification state here
    } else {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      showWarning("Only PDF files are allowed.");
      return null;
    }

    // Validate file size (<= 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showWarning("File size should be 5MB or less.");
      return null;
    }

    // Sanitize the file name (replace spaces with underscores)
    const sanitizedFileName = file.name.replace(/\s+/g, "_");
    const fileName = `${Date.now()}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: storageData, error } = await supabase.storage
      .from("documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    console.log("Upload response:", storageData); // Debugging

    if (error) {
      console.error("Error uploading file:", error.message);
      showError("Failed to upload file. Please try again.");
      return null;
    }

    if (!storageData.path) {
      console.error("File path is undefined after upload.");
      showError("Upload failed due to an unknown error.");
      return null;
    }
    debugger;
    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(storageData.path);

    return data.publicUrl;
  };

  const handleAddDocument = async () => {
    const { name, upload_by, file, type } = newDoc;

    // Basic validation
    if (!name) {
      showWarning("Please provide a document name.");
      return;
    }

    if (!upload_by) {
      showWarning("Please select who is uploading the document.");
      return;
    }

    if (!type) {
      showWarning("Please select a document type.");
      return;
    }

    setUploading(true);

    let fileURL = null;
    if (file) {
      fileURL = await handleFileUpload(file);
      if (!fileURL) {
        setUploading(false);
        return; // Stop if upload failed
      }
    }
    debugger;
    // Insert into Supabase
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          application_id: applicationId,
          name,
          upload_by,
          url: fileURL, // Store the file URL
          type,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding document:", error.message);
      showError("Failed to add document. Please try again.");
    } else {
      // Update local state
      setDocuments([...documents, data[0]]);
      // Reset form
      setNewDoc({
        name: "",
        upload_by: "Us",
        file: null,
        type: "",
      });
      setShowAddModal(false);
    }
    setUploading(false);
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

    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("url")
      .eq("id", docId)
      .single();

    if (fetchError) {
      console.error(
        "Error fetching document for deletion:",
        fetchError.message
      );
      showError("Failed to delete document. Please try again.");
      return;
    }

    // Delete the file from storage if URL exists
    if (doc.url) {
      const filePath = doc.url.split("/storage/v1/object/")[1];
      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from("documents")
          .remove([filePath]);

        if (deleteError) {
          console.error(
            "Error deleting file from storage:",
            deleteError.message
          );
          showError("Failed to delete file from storage.");
          return;
        }
      }
    }

    // Now delete the document record
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
    const { id, name, upload_by, file, type } = currentDoc;

    // Basic validation
    if (!name) {
      showWarning("Please provide a document name.");
      return;
    }

    if (!type) {
      showWarning("Please select a document type.");
      return;
    }

    setUploading(true);

    let fileURL = currentDoc.url; // Preserve existing URL
    if (file) {
      fileURL = await handleFileUpload(file);
      if (!fileURL) {
        setUploading(false);
        return; // Stop if upload failed
      }
    }

    const { error } = await supabase
      .from("documents")
      .update({
        name,
        upload_by,
        url: fileURL,
        type,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating document:", error.message);
      showError("Failed to update document. Please try again.");
    } else {
      // Update local state
      setDocuments(
        documents.map((doc) =>
          doc.id === id ? { ...currentDoc, url: fileURL } : doc
        )
      );
      setShowEditModal(false);
      setCurrentDoc(null);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Icon icon="mdi:download" className="text-sm text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Download</h3>
        </div>
        <button
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-semibold"
          onClick={() => setShowAddModal(true)}
        >
          <Icon icon="mdi:plus" className="text-base" />
          Add Document
        </button>
      </div>

      {loading ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-100 text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-3">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="mdi:file-download-outline"
              className="text-2xl text-gray-400"
            />
          </div>
          <p className="text-gray-600 text-base">No documents found.</p>
          <p className="text-gray-500 text-sm mt-1">
            Add a document to get started.
          </p>
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
                    Type
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    View
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
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
                      <span
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
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <Icon icon="mdi:account-check" className="text-sm" />
                        {getUploadByLabel(doc.upload_by)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors duration-200"
                        >
                          <Icon icon="mdi:eye" className="text-base" />
                          Click here to view
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                          <Icon icon="mdi:clock-outline" className="text-sm" />
                          Not Yet Uploaded
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          onClick={() => {
                            setCurrentDoc({ ...doc, file: null });
                            setShowEditModal(true);
                          }}
                          title="Edit document"
                        >
                          <Icon icon="mdi:pencil" className="text-lg" />
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
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., Offer Letter, Visa Documents, etc."
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Select document type</option>
                  <option value="visa">Visa</option>
                  <option value="university">University</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Uploaded By
                </label>
                <select
                  value={newDoc.upload_by}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, upload_by: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="Us">{UPLOAD_BY_LABELS.Us}</option>
                  <option value="Client">{UPLOAD_BY_LABELS.Client}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload PDF{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, file: e.target.files[0] })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowAddModal(false)}
                  disabled={uploading}
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddDocument}
                  disabled={uploading}
                >
                  <Icon
                    icon={uploading ? "mdi:loading" : "mdi:plus"}
                    className={`inline mr-2 ${uploading ? "animate-spin" : ""}`}
                  />
                  {uploading ? "Uploading..." : "Add Document"}
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
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., Offer Letter, Visa Documents, etc."
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Select document type</option>
                  <option value="visa">Visa</option>
                  <option value="university">University</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Uploaded By
                </label>
                <select
                  value={currentDoc.upload_by}
                  onChange={(e) =>
                    setCurrentDoc({ ...currentDoc, upload_by: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="Us">{UPLOAD_BY_LABELS.Us}</option>
                  <option value="Client">{UPLOAD_BY_LABELS.Client}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload New PDF{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setCurrentDoc({ ...currentDoc, file: e.target.files[0] })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {currentDoc.url && (
                  <p className="text-sm text-gray-600 mt-2">
                    Current file:{" "}
                    <a
                      href={currentDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      View existing file
                    </a>
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentDoc(null);
                  }}
                  disabled={uploading}
                >
                  <Icon icon="mdi:close" className="inline mr-2" />
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleEditDocument}
                  disabled={uploading}
                >
                  <Icon
                    icon={uploading ? "mdi:loading" : "mdi:content-save"}
                    className={`inline mr-2 ${uploading ? "animate-spin" : ""}`}
                  />
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsFromUs;
