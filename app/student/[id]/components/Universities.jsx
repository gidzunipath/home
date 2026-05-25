"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import {
  normalizeUniversityStatus,
  getUniversityStatusLabel,
  getUniversityApplicationProgress,
} from "../../../../lib/university-status";
import {
  FaUniversity,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaLanguage,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

const Universities = ({ applicationId }) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } else {
      setUniversities(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const v = normalizeUniversityStatus(status);
    switch (v) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "submitted":
        return "bg-amber-100 text-amber-700";
      case "verification":
        return "bg-indigo-100 text-indigo-700";
      case "started":
        return "bg-sky-100 text-sky-700";
      default:
        return "bg-appleGray-100 text-appleGray-700";
    }
  };

  const getStatusIcon = (status) => {
    const v = normalizeUniversityStatus(status);
    switch (v) {
      case "accepted":
        return <FaCheckCircle className="w-4 h-4" />;
      case "rejected":
        return <FaTimes className="w-4 h-4" />;
      case "submitted":
      case "verification":
      case "started":
        return <FaClock className="w-4 h-4" />;
      default:
        return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  const progressBarFillClass = (tone) => {
    switch (tone) {
      case "green":
        return "bg-green-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-appleGray-300";
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-appleGray-800 mb-2 flex items-center">
          <FaUniversity className="w-5 h-5 text-sky-500 mr-2" />
          University Applications
        </h3>
        <p className="text-sm text-appleGray-600">
          Track your university application progress.
        </p>
        <p className="text-sm text-appleGray-600">
          It takes 2-3 months for universities to process applications. If you
          receive any emails from universities, please forward them to your
          counselor.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <FaClock className="w-6 h-6 text-sky-500" />
            </div>
            <p className="text-appleGray-600">Loading universities...</p>
          </div>
        </div>
      ) : universities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaUniversity className="w-6 h-6 text-appleGray-400" />
          </div>
          <p className="text-appleGray-500 font-medium">
            No universities added yet
          </p>
          <p className="text-sm text-appleGray-400 mt-1">
            Your counselor will add universities here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {universities.map((uni) => {
            const { percent, tone } = getUniversityApplicationProgress(
              uni.status
            );
            return (
              <div
                key={uni.id}
                className="group bg-white border border-appleGray-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-soft"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* University Header */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <FaUniversity className="w-6 h-6 text-sky-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-appleGray-800 mb-1">
                          {uni.uni_name}
                        </h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <FaGraduationCap className="w-4 h-4 text-appleGray-400" />
                          <span className="text-sm font-medium text-appleGray-700">
                            {uni.course}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* University Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 flex-1">
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-appleGray-400" />
                      <div>
                        <span className="text-xs font-medium text-appleGray-500 block">
                          Location
                        </span>
                        <span className="text-sm text-appleGray-800">
                          {uni.place}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaLanguage className="w-4 h-4 text-appleGray-400" />
                      <div>
                        <span className="text-xs font-medium text-appleGray-500 block">
                          Language
                        </span>
                        <span className="text-sm text-appleGray-800">
                          {uni.language}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="w-4 h-4 text-appleGray-400" />
                      <div>
                        <span className="text-xs font-medium text-appleGray-500 block">
                          Applied
                        </span>
                        <span className="text-sm text-appleGray-800">
                          {uni.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center lg:justify-end lg:min-w-[9rem]">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${getStatusColor(
                        uni.status
                      )}`}
                    >
                      {getStatusIcon(uni.status)}
                      <span>{getUniversityStatusLabel(uni.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-appleGray-50 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-appleGray-500">Progress</span>
                    <span
                      className={`text-sm font-medium tabular-nums ${
                        tone === "red"
                          ? "text-red-600"
                          : tone === "neutral"
                            ? "text-appleGray-400"
                            : "text-appleGray-800"
                      }`}
                    >
                      {tone === "neutral" ? "—" : `${percent}%`}
                    </span>
                  </div>
                  <div
                    className={`h-1.5 w-full overflow-hidden rounded-full ${
                      tone === "red" ? "bg-red-100" : "bg-white shadow-inner"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${progressBarFillClass(
                        tone
                      )}`}
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Application progress: ${getUniversityStatusLabel(uni.status)}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Universities;
