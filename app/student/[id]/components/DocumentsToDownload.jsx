"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import {
  FaDownload,
  FaFilePdf,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

const DocumentsToDownload = ({ applicationId, documentType }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents when component mounts or applicationId changes
  useEffect(() => {
    if (applicationId) {
      fetchDocuments(applicationId);
    }
  }, [applicationId, documentType]);

  const fetchDocuments = async (appId) => {
    setLoading(true);
    let query = supabase
      .from("documents")
      .select("*")
      .eq("application_id", appId)
      .eq("upload_by", "Us")
      .order("created_at", { ascending: false });

    if (documentType) {
      query = query.eq("type", documentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error.message);
    } else {
      setDocuments(data);
    }
    setLoading(false);
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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-appleGray-800 mb-2 flex items-center">
          <FaDownload className="w-5 h-5 text-sky-500 mr-2" />
          Visa Documents for Embassy
        </h3>
        <p className="text-sm text-appleGray-600">
          Files shared by GIDZ Uni Path for your visa application.
        </p>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <FaClock className="w-6 h-6 text-sky-500" />
            </div>
            <p className="text-appleGray-600">Loading documents...</p>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="w-6 h-6 text-appleGray-400" />
          </div>
          <p className="text-appleGray-500 font-medium">
            No documents available yet
          </p>
          <p className="text-sm text-appleGray-400 mt-1">
            Your counselor will upload documents here
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {documents.map((doc) => (
              <div
                key={`mobile-${doc.id}`}
                className="bg-white border border-appleGray-200 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaFilePdf className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-appleGray-800 break-words">
                      {doc.name}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-appleGray-600">
                      <p>
                        <span className="font-medium text-appleGray-700">Type:</span>{" "}
                        {doc.category || doc.type || "-"}
                      </p>
                      <p>
                        <span className="font-medium text-appleGray-700">Received:</span>{" "}
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors duration-200"
                    >
                      <FaDownload className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  ) : (
                    <span className="text-sm text-appleGray-400">Not available</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-appleGray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-appleGray-50 border-b border-appleGray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-appleGray-700">
                      Name of document
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-appleGray-700">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-appleGray-700">
                      Received on
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-appleGray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-appleGray-100">
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-appleGray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaFilePdf className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-appleGray-800 truncate max-w-[200px]">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-appleGray-600">
                        {doc.category || doc.type || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-appleGray-600">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                            >
                              <FaDownload className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <span className="text-sm text-appleGray-400">
                              Not available
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsToDownload;
