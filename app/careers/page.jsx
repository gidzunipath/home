"use client";

import React, { useState, useRef } from "react";
import {
  FaBriefcase,
  FaCheckCircle,
  FaPaperPlane,
  FaUsers,
  FaRocket,
  FaHeart,
  FaUpload,
} from "react-icons/fa";
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
        <h3 className="mb-2 text-2xl font-bold text-appleGray-900">Success!</h3>
        <p className="mb-6 text-appleGray-600">
          Thank you for your interest, our team will review your appliaction and reach you out
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
    <div className="min-h-screen bg-appleGray-50 relative overflow-hidden">
      <div className="absolute top-32 left-10 w-20 h-20 bg-sky-400/10 rounded-full animate-float" />
      <section className="relative overflow-hidden bg-gradient-to-br from-appleGray-50 via-white to-appleGray-100 pt-24 pb-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="space-y-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-soft">
              <FaBriefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-appleGray-900">
              Join Our
              <span className="block text-gradient bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
                Team
              </span>
            </h1>
            <p className="text-xl text-appleGray-600 max-w-2xl mx-auto">
              Build your career with GIDZ UniPath. We are looking for passionate people who want to help students achieve their dreams abroad.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="w-8 h-8 text-sky-500" />
                </div>
                <h3 className="text-2xl font-bold text-appleGray-900">Collaborative</h3>
                <p className="text-appleGray-600">Supportive team culture</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaRocket className="w-8 h-8 text-sky-500" />
                </div>
                <h3 className="text-2xl font-bold text-appleGray-900">Growth</h3>
                <p className="text-appleGray-600">Learn and advance with us</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaHeart className="w-8 h-8 text-sky-500" />
                </div>
                <h3 className="text-2xl font-bold text-appleGray-900">Purpose</h3>
                <p className="text-appleGray-600">Meaningful impact every day</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-br from-sky-500/5 to-sky-600/5 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-large relative overflow-hidden">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaPaperPlane className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-appleGray-900 mb-2">Apply Now</h2>
              <p className="text-appleGray-600">Submit your application and our team will be in touch.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" className={inputClass("fullName")} />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass("email")} />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" className={inputClass("phone")} />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">Applying Position *</label>
                <select name="position" value={formData.position} onChange={handleChange} className={inputClass("position")}>
                  <option value="">Select a position</option>
                  {CAREER_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-appleGray-700 mb-2">Resume Upload *</label>
                <div className="relative">
                  <input ref={fileInputRef} type="file" accept={ACCEPT_ATTR} onChange={handleResumeChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 transition-colors ${
                    errors.resume ? "border-red-300 bg-red-50" : "border-appleGray-200 bg-appleGray-50 hover:border-sky-400"
                  }`}>
                    <FaUpload className="w-6 h-6 text-sky-500" />
                    <div className="text-center">
                      <p className="font-medium text-appleGray-800">{resume ? resume.name : "Click to upload resume"}</p>
                      <p className="text-sm text-appleGray-500">PDF, DOC, or DOCX (max 5MB)</p>
                    </div>
                  </div>
                </div>
                {errors.resume && <p className="mt-1 text-sm text-red-600">{errors.resume}</p>}
              </div>
              {errors.submit && <p className="text-sm text-red-600 text-center">{errors.submit}</p>}
              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-4 rounded-2xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all duration-300 btn-apple-hover shadow-soft flex items-center justify-center disabled:opacity-60">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaPaperPlane className="w-5 h-5 mr-3" />
                    <span>Submit Application</span>
                  </div>
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
