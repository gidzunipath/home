"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "../../../lib/supabase";
import { useAppModal } from "../../../hooks/useAppModal";

const ProfilePic = ({ applicationId }) => {
  const { showWarning, showError, showInfo, showConfirm } = useAppModal();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [newDoc, setNewDoc] = useState({
    name: "",
    url: "",
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
      .eq("name", "Profile Picture");

    if (error) {
      console.error("Error fetching documents:", error.message);
      // Optionally, set a notification state here
    } else {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleAddDocument = async () => {
    const { name, url } = newDoc;

    // Basic validation
    if (!name) {
      showWarning("Please provide a document name.");
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
    const { id, name, url } = currentDoc;

    // Basic validation
    if (!name) {
      showWarning("Please provide a document name.");
      return;
    }

    const { error } = await supabase
      .from("documents")
      .update({
        name,
        url: url || null,
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

  return (
    <div className="mt-8">
      {loading ? (
        <div className="text-center">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="text-center">No documents found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Document Name</th>
                <th className="py-2 px-4 border-b">View</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr key={documents[0].id}>
                <td className="py-2 px-4 border-b">{documents[0].name}</td>
                <td className="py-2 px-4 border-b">
                  {documents[0].url ? (
                    <a
                      href={documents[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Click here to view
                    </a>
                  ) : (
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => showInfo("Document not yet uploaded.")}
                      disabled
                    >
                      Not Yet Uploaded
                    </button>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="text-blue-500 hover:text-blue-700 mr-2"
                    onClick={() => {
                      setShowEditModal(true);
                    }}
                  >
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteDocument(documents[0].id)}
                  >
                    <Icon icon="mdi:delete" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ==============================
              ADD DOCUMENT MODAL
      ============================== */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-96 p-6 rounded-md relative">
            <h2 className="text-xl font-semibold mb-4">Add New Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">
                  Document Name:
                </label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Transcript"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleAddDocument}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================
              EDIT DOCUMENT MODAL
      ============================== */}
      {showEditModal && currentDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-96 p-6 rounded-md relative">
            <h2 className="text-xl font-semibold mb-4">Edit Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">
                  Document Name:
                </label>
                <input
                  type="text"
                  value={currentDoc.name}
                  onChange={(e) =>
                    setCurrentDoc({ ...currentDoc, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Transcript"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">
                  URL (optional):
                </label>
                <input
                  type="url"
                  value={currentDoc.url || ""}
                  onChange={(e) =>
                    setCurrentDoc({ ...currentDoc, url: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="e.g., https://example.com/transcript.pdf"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentDoc(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleEditDocument}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePic;
