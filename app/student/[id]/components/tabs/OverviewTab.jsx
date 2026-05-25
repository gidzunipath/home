"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FaCheckCircle,
  FaChartLine,
  FaUserEdit,
  FaCalendarAlt,
  FaPassport,
  FaPhone,
  FaEnvelope,
  FaUniversity,
  FaUpload,
  FaBook,
  FaGraduationCap,
  FaQuestionCircle,
} from "react-icons/fa";
import VerticalStepper from "../VerticalStepper";
import {
  canAccessVisaSection,
  getApplicationStepNumber,
  getJourneyFocusLabel,
} from "../../../../../lib/application-status";
import { STUDENT_FAQ_ITEMS } from "@/lib/student-faq";

export default function OverviewTab({
  applicant,
  dashboardStats,
  profilePicUrl,
  onProfileUpload,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const statusStep = getApplicationStepNumber(applicant?.status);
  const showVisaJourney = canAccessVisaSection(applicant?.status);

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Application Progress */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaCheckCircle className="w-5 h-5 text-sky-500 mr-3" />
          Application Progress
        </h3>
        <div className="bg-gradient-to-r from-sky-500/10 to-sky-600/10 p-6 rounded-2xl">
          <VerticalStepper
            currentStep={statusStep}
            maxStep={showVisaJourney ? undefined : 3}
          />
        </div>
      </div>

      {/* Summary */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaChartLine className="w-5 h-5 text-sky-500 mr-3" />
          Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-appleGray-50 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-appleGray-600">
                Progress
              </span>
              <span className="text-lg font-bold text-appleGray-800">
                {dashboardStats.progressPercentage}%
              </span>
            </div>
          </div>
          <div className="bg-appleGray-50 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-appleGray-600">
                Next Step
              </span>
              <span className="text-sm font-bold text-sky-600">
                {getJourneyFocusLabel(applicant?.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaUserEdit className="w-5 h-5 text-sky-500 mr-3" />
          Personal Information
        </h3>
        <div className="bg-appleGray-50 p-6 rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Details */}
            <div className="space-y-4">
              {[
                {
                  icon: FaUserEdit,
                  label: "First Name",
                  value: applicant.first_name,
                },
                {
                  icon: FaUserEdit,
                  label: "Last Name",
                  value: applicant.last_name,
                },
                {
                  icon: FaCalendarAlt,
                  label: "Date of Birth",
                  value: applicant.date_of_birth,
                },
                {
                  icon: FaPassport,
                  label: "Passport Number",
                  value: applicant.passport_number,
                },
                {
                  icon: FaPhone,
                  label: "Telephone",
                  value: applicant.telephone,
                },
                { icon: FaEnvelope, label: "Email", value: applicant.email },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-appleGray-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-appleGray-500 uppercase tracking-wide">
                      {label}
                    </span>
                    <p className="text-sm font-medium text-appleGray-800">
                      {value || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-soft border-4 border-white">
                  <Image
                    width={128}
                    height={128}
                    src={profilePicUrl || "/logo.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 rounded-3xl transition-all duration-200 flex items-center justify-center group cursor-pointer">
                  <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white bg-opacity-90 hover:bg-opacity-100 text-appleGray-800 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center space-x-2 shadow-soft">
                      <FaUpload className="w-4 h-4" />
                      <span>{profilePicUrl ? "Replace" : "Upload"}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onProfileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {!profilePicUrl && (
                <label className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-2xl text-sm font-medium transition-colors duration-200 inline-flex items-center space-x-2 touch-manipulation min-h-[44px] justify-center">
                  <FaUpload className="w-4 h-4" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onProfileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* University Application Guidelines */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-4 flex items-center">
          <FaUniversity className="w-5 h-5 text-sky-500 mr-3" />
          University Application Guidelines
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-4 md:p-6">
          <p className="text-appleGray-700 mb-6 text-sm md:text-base">
            To begin your university application process, please carefully
            follow the steps below. Once complete, send all required documents
            via WhatsApp or Email.
          </p>

          {/* Step 1 */}
          <div className="mb-5">
            <div className="flex items-start space-x-3 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaCheckCircle className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-base font-semibold text-appleGray-800">
                STEP 1: Create a New Email Address
              </h4>
            </div>
            <p className="text-appleGray-600 ml-9 text-sm">
              Specifically for university applications. This will help keep
              tracking all the process.
            </p>
          </div>

          {/* Step 2 */}
          <div className="mb-5">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaCheckCircle className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-base font-semibold text-appleGray-800">
                STEP 2: Submit the Required Documents
              </h4>
            </div>
            <p className="text-appleGray-600 ml-9 mb-4 text-sm">
              Please prepare and submit clear scanned copies (PDF format
              recommended) of the following documents based on the program you
              are applying for:
            </p>

            {/* Bachelor's */}
            <div className="ml-9 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaBook className="w-4 h-4 text-blue-600 hidden md:inline" />
                <h5 className="text-sm font-semibold text-appleGray-800">
                  For Bachelor&apos;s Degree Applicants
                </h5>
              </div>
              <div className="bg-white rounded-2xl p-4 space-y-1.5">
                {[
                  "Proof of Language Proficiency (IELTS – Academic)",
                  "G.C.E. O-Level Certificate (Must be certified by the Ministry of Foreign Affairs)",
                  "G.C.E. A-Level Certificate (Must be certified by the Ministry of Foreign Affairs)",
                  "Curriculum Vitae (CV) - (Updated in tabular format)",
                  "School Leaving Certificate (Must be translated into English)",
                  "Copy of Valid Passport",
                  "Birth Certificate (English translation required)",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-2 text-xs text-appleGray-700 py-0.5"
                  >
                    <span className="text-blue-600 font-medium mt-0.5 min-w-[16px]">
                      {i + 1}.
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Master's */}
            <div className="ml-9 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaGraduationCap className="w-4 h-4 text-purple-600 hidden md:inline" />
                <h5 className="text-sm font-semibold text-appleGray-800">
                  For Master&apos;s Degree Applicants
                </h5>
              </div>
              <p className="text-xs text-appleGray-500 mb-3">
                (Include all Bachelor&apos;s requirements above, plus:)
              </p>
              <div className="bg-white rounded-2xl p-4 space-y-1.5">
                {[
                  "Bachelor's Degree Certificate",
                  "Bachelor's Transcript",
                  "Two Letters of Recommendation",
                  "Medium of Instruction Certificate",
                  "Internship or Work Experience Letters (if applicable)",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-2 text-xs text-appleGray-700 py-0.5"
                  >
                    <span className="text-purple-600 font-medium mt-0.5 min-w-[16px]">
                      {i + 1}.
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="ml-9">
              <div className="flex items-center space-x-2 mb-3">
                <FaEnvelope className="w-4 h-4 text-green-600 hidden md:inline" />
                <h5 className="text-sm font-semibold text-appleGray-800">
                  Submit Documents To: WhatsApp or Email
                </h5>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                  <a
                    href="https://wa.me/94741166235"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[44px] w-full sm:w-auto"
                  >
                    <FaPhone className="w-4 h-4 hidden md:inline" />
                    <span>WhatsApp: +94 74 116 6235</span>
                  </a>
                  <a
                    href="mailto:gidzunipath@gmail.com"
                    className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[44px] w-full sm:w-auto"
                  >
                    <FaEnvelope className="w-4 h-4 hidden md:inline" />
                    <span>Email: gidzunipath@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div>
        <h3 className="text-xl font-bold text-appleGray-800 mb-6 flex items-center">
          <FaQuestionCircle className="w-5 h-5 text-sky-500 mr-3" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {STUDENT_FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-appleGray-50 rounded-2xl overflow-hidden border border-appleGray-100"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-appleGray-800">
                    {item.q}
                  </span>
                </span>
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                  <svg
                    className={`w-3 h-3 text-sky-600 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {openFaq === index && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-appleGray-600 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
