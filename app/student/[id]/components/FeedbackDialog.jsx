"use client";
import React, { useState } from "react";
import { FaStar, FaTimes, FaComments, FaCheck } from "react-icons/fa";
import { Icon } from "@iconify/react";
import { useAppModal } from "../../../../hooks/useAppModal";

const FeedbackDialog = ({ isOpen, onClose, applicationId, clientData }) => {
  const { showError } = useAppModal();
  const [formData, setFormData] = useState({
    client_name:
      clientData?.first_name && clientData?.last_name
        ? `${clientData.first_name} ${clientData.last_name}`
        : "",
    rating: 0,
    title: "",
    message: "",
    program_type: "",
    university: "",
    allow_display_name: true,
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rating || !formData.title || !formData.message) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting feedback with data:", {
        application_id: applicationId,
        ...formData,
      });

      const response = await fetch("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: applicationId,
          ...formData,
        }),
      });

      console.log("Response status:", response.status);

      const result = await response.json();
      console.log("Response data:", result);

      if (result.success) {
        setSubmitStatus("success");
        // Reset form after success
        setTimeout(() => {
          onClose();
          setFormData({
            client_name:
              clientData?.first_name && clientData?.last_name
                ? `${clientData.first_name} ${clientData.last_name}`
                : "",
            rating: 0,
            title: "",
            message: "",
            program_type: "",
            university: "",
            allow_display_name: true,
          });
          setSubmitStatus(null);
        }, 2000);
      } else {
        console.error("API Error:", result.error);
        setSubmitStatus("error");
        // You could set a more specific error message here
        showError(result.error);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");
      showError(`Network error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitStatus === "success") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-large border border-appleGray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-appleGray-800 mb-4">
              Thank You!
            </h3>
            <p className="text-appleGray-600 mb-6">
              Your feedback has been submitted successfully! Our team will
              review it and it may appear in our testimonials section once
              approved.
            </p>
            <div className="w-full bg-green-100 rounded-full h-1">
              <div className="bg-green-500 h-1 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-large border border-appleGray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center">
              <FaComments className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-appleGray-800">
                Share Your Experience
              </h2>
              <p className="text-appleGray-600 text-sm">
                Help others with your journey feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-appleGray-100 hover:bg-appleGray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5 text-appleGray-600" />
          </button>
        </div>

        {submitStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm">
              Please fill in all required fields and make sure to provide a
              rating.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <FaStar
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || formData.rating)
                        ? "text-yellow-400"
                        : "text-appleGray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-appleGray-600">
                {formData.rating > 0 && (
                  <>
                    {formData.rating} of 5 stars
                    {formData.rating === 5 && " - Excellent!"}
                    {formData.rating === 4 && " - Very Good!"}
                    {formData.rating === 3 && " - Good"}
                    {formData.rating === 2 && " - Fair"}
                    {formData.rating === 1 && " - Needs Improvement"}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Feedback Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
              placeholder="e.g., Great support throughout my journey"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-appleGray-700 mb-2">
              Your Experience *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-3 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200 resize-none"
              placeholder="Tell us about your experience with our services. What went well? How did we help you achieve your goals?"
              required
            />
            <div className="text-right text-xs text-appleGray-500 mt-1">
              {formData.message.length}/500 characters
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                Program Type
              </label>
              <input
                type="text"
                name="program_type"
                value={formData.program_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                placeholder="e.g., Computer Science, Business"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                University
              </label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-appleGray-50 border border-appleGray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                placeholder="e.g., Technical University of Munich"
              />
            </div>
          </div>

          {/* Privacy Option */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="allow_display_name"
              name="allow_display_name"
              checked={formData.allow_display_name}
              onChange={handleInputChange}
              className="w-5 h-5 text-sky-500 border-appleGray-300 rounded focus:ring-sky-500 mt-0.5"
            />
            <label
              htmlFor="allow_display_name"
              className="text-sm text-appleGray-700 leading-relaxed"
            >
              I allow my name to be displayed if this feedback is featured in
              testimonials.
              <span className="text-appleGray-500 block mt-1">
                Your feedback will still be reviewed even if you uncheck this
                option.
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-appleGray-100 hover:bg-appleGray-200 text-appleGray-700 py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.rating ||
                !formData.title ||
                !formData.message
              }
              className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-appleGray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaComments className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackDialog;
