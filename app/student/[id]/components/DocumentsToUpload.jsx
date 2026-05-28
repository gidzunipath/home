"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import {
  FaCheck,
  FaUpload,
  FaFilePdf,
  FaTimes,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaClock,
  FaDownload,
  FaTrash,
  FaInfoCircle,
} from "react-icons/fa";
import { useAppModal } from "../../../../hooks/useAppModal";

const DOCUMENT_CATEGORIES = [
  "Proof of Language Proficiency",
  "G.C.E. O-Level Certificate (Certified by the Ministry of Foreign Affairs)",
  "G.C.E. A-Level Certificate (Certified by the Ministry of Foreign Affairs)",
  "Updated Curriculum Vitae (CV) - Europass CV",
  "School Leaving Certificate (Translated into English)",
  "Copy of Valid Passport",
  "Birth Certificate (English translation required)",
  "Bachelor's Degree Certificate",
  "Bachelor's Transcript",
  "Letters of Recommendation",
  "Medium of Instruction Certificate",
  "Internship",
  "Work Experience Letters",
  "Thesis",
  "Handbook",
  "Gidz Paid Receipt 1",
  "Gidz Paid Receipt 2",
  "Enrollment Fees Payment",
  "Others",
];

const DocumentsToUpload = ({ applicationId }) => {
  const { showWarning, showError, showConfirm } = useAppModal();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setFileToUpload(null);
    setSelectedCategory("");
    const fileInput = document.getElementById("file-upload-input");
    if (fileInput) fileInput.value = "";
  };

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
      // .eq("upload_by", "Client")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error.message);
    } else {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    // Basic validation
    if (!fileToUpload) {
      showWarning("Please select a file to upload.");
      return;
    }

    if (!selectedCategory) {
      showWarning("Please choose a category for your document.");
      return;
    }

    // Validate file type
    if (fileToUpload.type !== "application/pdf") {
      showWarning("Only PDF files are allowed.");
      return;
    }

    // Validate file size (<= 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileToUpload.size > maxSize) {
      showWarning("File size should be 5MB or less.");
      return;
    }

    setUploading(true);

    const sanitizedFileName = fileToUpload.name.replace(/\s+/g, "_");
    const fileName = `${Date.now()}_${sanitizedFileName}`;

    const { data: storageData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, fileToUpload, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError.message);
      showError("Failed to upload file. Please try again.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(storageData.path);

    const fileURL = publicUrlData.publicUrl;

    // Insert file information into the database with category
    const { data: insertedData, error: insertError } = await supabase
      .from("documents")
      .insert([
        {
          application_id: applicationId,
          name: fileToUpload.name,
          upload_by: "Client",
          url: fileURL,
          category: selectedCategory,
        },
      ])
      .select();

    if (insertError) {
      console.error("Error saving document information:", insertError.message);
      showError("Failed to save document information. Please try again.");
      setUploading(false);
      return;
    }

    // Update the documents state
    setDocuments([insertedData[0], ...documents]);
    setUploading(false);
    closeUploadModal();
  };

  const handleDelete = async (doc) => {
    const confirmed = await showConfirm({
      type: "danger",
      title: "Delete Document",
      message: `Are you sure you want to delete "${doc.name}"?`,
      confirmLabel: "Delete",
    });
    if (!confirmed) {
      return;
    }

    setDeleting(doc.id);

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) {
        console.error("Error deleting document:", dbError.message);
        showError("Failed to delete document. Please try again.");
        setDeleting(null);
        return;
      }

      // Update local state
      setDocuments(documents.filter((d) => d.id !== doc.id));
    } catch (error) {
      console.error("Error deleting document:", error);
      showError("Failed to delete document. Please try again.");
    }

    setDeleting(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Separate documents by upload source
  const clientDocuments = documents.filter(
    (doc) => doc.url && doc.upload_by === "Client"
  );

  const DocumentsCards = ({ docs, showActions = false }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="bg-white border border-appleGray-200 rounded-2xl p-4 flex flex-col"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaFilePdf className="w-5 h-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-appleGray-800 break-words">
                {doc.name}
              </p>
              <div className="mt-2 space-y-1 text-xs text-appleGray-600">
                <p>
                  <span className="font-medium text-appleGray-700">Uploaded:</span>{" "}
                  {formatDate(doc.created_at)}
                </p>
                <p>
                  <span className="font-medium text-appleGray-700">Category:</span>{" "}
                  {doc.category || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            {doc.url && (
              <a
                href={doc.url}
                download
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors duration-200"
              >
                <FaDownload className="w-4 h-4" />
                <span>Download</span>
              </a>
            )}
            {showActions && (
              <button
                onClick={() => handleDelete(doc)}
                disabled={deleting === doc.id}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors duration-200 disabled:opacity-50"
              >
                {deleting === doc.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaTrash className="w-4 h-4" />
                )}
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaCloudUploadAlt className="w-5 h-5 text-sky-500 mr-2" />
          MY DOCUMENTS
        </h3>


      </div>

      {/* Client Documents Section */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h4 className="text-lg font-semibold text-appleGray-800 flex items-center">
            <FaCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            Your Uploaded Documents
          </h4>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors duration-200 shadow-soft"
          >
            <FaUpload className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                <FaClock className="w-6 h-6 text-sky-500" />
              </div>
              <p className="text-appleGray-600">Loading documents...</p>
            </div>
          </div>
        ) : (
          <>
            {clientDocuments.length === 0 ? (
              <div className="text-center py-12 bg-appleGray-50 rounded-2xl">
                <div className="w-16 h-16 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaFilePdf className="w-6 h-6 text-appleGray-400" />
                </div>
                <p className="text-appleGray-500 font-medium">
                  No documents uploaded yet
                </p>
                <p className="text-sm text-appleGray-400 mt-1">
                  Click Upload Document to add your first file
                </p>
              </div>
            ) : (
              <DocumentsCards docs={clientDocuments} showActions={true} />
            )}
          </>
        )}
      </div>

      {/* Upload Your Documents — modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !uploading) {
              closeUploadModal();
            }
          }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-appleGray-200 bg-white p-6 shadow-large"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !uploading && closeUploadModal()}
              disabled={uploading}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-appleGray-400 transition-colors hover:bg-appleGray-100 hover:text-appleGray-600 disabled:opacity-50"
              aria-label="Close"
            >
              <FaTimes className="h-4 w-4" />
            </button>

            <h4 className="mb-3 pr-10 text-lg font-semibold text-appleGray-800 flex items-center">
              <FaUpload className="mr-2 h-4 w-4 text-sky-500" />
              Upload Your Documents
            </h4>

  {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 my-3">
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Please only upload PDF files
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Please upload different documents in different files (e.g. school
              certificate)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Please upload each file only once and choose a suitable file name
              (e.g. Diploma bachelor)
            </p>
          </div>
        </div>

            <div className="rounded-2xl border border-appleGray-200 bg-appleGray-50/50 p-4 sm:p-5">
              <div className="flex flex-col gap-5">
                {/* Row 1 — file */}
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-appleGray-700">
                    1. Select your file
                  </label>
                  <input
                    type="file"
                    id="file-upload-input"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="w-full rounded-xl border border-appleGray-300 bg-white px-4 py-3 text-sm transition-all duration-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                  />
                </div>

                {/* Row 2 — category */}
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-appleGray-700">
                    2. Choose category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={uploading}
                    className="w-full rounded-xl border border-appleGray-300 bg-white px-4 py-3 text-sm transition-all duration-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                  >
                    <option value="">Select a category...</option>
                    {DOCUMENT_CATEGORIES.map((category, index) => (
                      <option key={index} value={category}>
                        {index + 1}. {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 3 — upload */}
                <div className="w-full border-t border-appleGray-200 pt-5">
                  <label className="mb-2 block text-sm font-medium text-appleGray-700">
                    3. Upload
                  </label>
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={uploading || !fileToUpload || !selectedCategory}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:shadow-medium sm:py-4 ${
                      uploading || !fileToUpload || !selectedCategory
                        ? "cursor-not-allowed bg-sky-400 opacity-50"
                        : "bg-sky-500 hover:bg-sky-600"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FaUpload className="h-4 w-4" />
                        <span>UPLOAD FILE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsToUpload;
