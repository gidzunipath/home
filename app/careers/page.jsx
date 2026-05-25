"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { FaCheckCircle, FaPaperPlane, FaUpload } from "react-icons/fa";
import {
  CAREER_POSITIONS,
  RESUME_ALLOWED_EXTENSIONS,
  RESUME_MAX_BYTES,
} from "../../lib/careersConstants";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCEPT_ATTR = RESUME_ALLOWED_EXTENSIONS.join(",");

function SuccessDialog({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="mx-4 max-w-md rounded-3xl bg-white p-8 text-center shadow-large">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
          <FaCheckCircle className="h-8 w-8 text-sky-500" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-appleGray-900">Application received</h3>
        <p className="mb-6 text-appleGray-600">
          Thank you for your interest. Our team will review your application and get back to you soon.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-3 font-semibold text-white shadow-soft transition-all duration-300 hover:from-sky-600 hover:to-sky-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function CareersPage() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
  });
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateClient = () => {
    const next = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      next.fullName = "Full name is required (at least 2 characters).";
    }
    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      next.email = "A valid email address is required.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      next.phone = "A valid phone number is required.";
    }
    if (!formData.position || !CAREER_POSITIONS.includes(formData.position)) {
      next.position = "Please select a position.";
    }
    if (!resume) {
      next.resume = "Resume upload is required.";
    } else {
      const name = resume.name.toLowerCase();
      const validExt = RESUME_ALLOWED_EXTENSIONS.some((ext) =>
        name.endsWith(ext)
      );
      if (!validExt) {
        next.resume = "Resume must be PDF, DOC, or DOCX.";
      } else if (resume.size > RESUME_MAX_BYTES) {
        next.resume = "Resume must be no larger than 5MB.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null;
    setResume(file);
    if (errors.resume) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.resume;
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateClient()) return;

    setIsLoading(true);
    try {
      const body = new FormData();
      body.append("fullName", formData.fullName.trim());
      body.append("email", formData.email.trim());
      body.append("phone", formData.phone.trim());
      body.append("position", formData.position);
      body.append("resume", resume);

      const response = await fetch("/api/job-seekers", {
        method: "POST",
        body,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({
            submit: result.error || "Submission failed. Please try again.",
          });
        }
        return;
      }

      setShowSuccess(true);
      setFormData({ fullName: "", email: "", phone: "", position: "" });
      setResume(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-2xl transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
      errors[field] ? "border-red-300 bg-red-50" : "border-appleGray-200"
    }`;

  return (
    <div className="min-h-screen bg-appleGray-50">
      <section className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center overflow-hidden">
        <Image
          src="/carrerPage.png"
          alt="GIDZ UniPath team at work"
          fill
          priority
          className="object-cover object-[75%_center] sm:object-[70%_center] lg:object-[center_30%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 via-50% to-black/20 lg:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden"
          aria-hidden
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pb-16">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Build careers that
              <span className="block mt-1 bg-gradient-to-r from-sky-300 to-sky-400 bg-clip-text text-transparent">
                change lives
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-md">
              Join GIDZ UniPath and help Sri Lankan students reach their goals in
              Germany.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-large">
            <h2 className="text-2xl font-bold text-appleGray-900 mb-1">
              Submit your application
            </h2>
            <p className="text-appleGray-600 mb-8">
              All fields marked with * are required. We typically respond within a
              few business days.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                  Full name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 7X XXX XXXX"
                    className={inputClass("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                  Position *
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={inputClass("position")}
                >
                  <option value="">Choose a role</option>
                  {CAREER_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                  Resume *
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    onChange={handleResumeChange}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />
                  <div
                    className={`flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 transition-colors ${
                      errors.resume
                        ? "border-red-300 bg-red-50"
                        : "border-appleGray-200 bg-appleGray-50 hover:border-sky-400"
                    }`}
                  >
                    <FaUpload className="h-6 w-6 shrink-0 text-sky-500" />
                    <div className="text-center min-w-0">
                      <p className="font-medium text-appleGray-800 truncate">
                        {resume ? resume.name : "Drop your resume or click to browse"}
                      </p>
                      <p className="text-sm text-appleGray-500">
                        PDF, DOC, or DOCX · max 5MB
                      </p>
                    </div>
                  </div>
                </div>
                {errors.resume && (
                  <p className="mt-1 text-sm text-red-600">{errors.resume}</p>
                )}
              </div>

              {errors.submit && (
                <p className="text-center text-sm text-red-600">{errors.submit}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-4 font-semibold text-white shadow-soft transition-all duration-300 hover:from-sky-600 hover:to-sky-700 disabled:opacity-60 btn-apple-hover"
              >
                {isLoading ? (
                  <>
                    <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-3 h-5 w-5" />
                    Submit application
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {showSuccess && <SuccessDialog onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
