"use client";

import {
  FaCheckCircle,
  FaUniversity,
  FaPassport,
  FaGraduationCap,
  FaCreditCard,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  canAccessVisaSection,
  getJourneyFocusLabel,
} from "../../../../lib/application-status";

export default function DashboardStats({ applicant, dashboardStats }) {
  const {
    progressPercentage,
    universityDocumentsUploaded,
    universityDocumentsTotal,
    visaDocumentsUploaded,
    visaDocumentsTotal,
    universitiesApplied,
  } = dashboardStats;

  const uniDocStatus =
    universityDocumentsUploaded >= Math.floor(universityDocumentsTotal * 0.8)
      ? { label: "On Track", cls: "bg-green-100 text-green-700" }
      : universityDocumentsUploaded >= Math.floor(universityDocumentsTotal * 0.5)
      ? { label: "In Progress", cls: "bg-yellow-100 text-yellow-700" }
      : { label: "Action Needed", cls: "bg-red-100 text-red-700" };

  const visaDocStatus =
    visaDocumentsUploaded >= Math.floor(visaDocumentsTotal * 0.75)
      ? { label: "On Track", cls: "bg-green-100 text-green-700" }
      : visaDocumentsUploaded >= Math.floor(visaDocumentsTotal * 0.4)
      ? { label: "In Progress", cls: "bg-yellow-100 text-yellow-700" }
      : { label: "Action Needed", cls: "bg-red-100 text-red-700" };

  const paymentsDone =
    (applicant?.payment1 ? 1 : 0) + (applicant?.payment2 ? 1 : 0);
  const paymentsComplete = applicant?.payment1 && applicant?.payment2;

  const showVisaSection = canAccessVisaSection(applicant?.status);

  const nextLabelByFocus = {
    "University Documents": "Upload university documents",
    Universities: "Apply to universities",
    "Blocked Account": "Open your blocked account",
    "Visa Documents": "Upload visa documents",
    "Visa Appointment": "Schedule visa appointment",
    Complete: "Journey complete!",
  };
  const nextLabel =
    nextLabelByFocus[getJourneyFocusLabel(applicant?.status)] ??
    "Upload university documents";

  const showAlerts =
    universityDocumentsUploaded < Math.floor(universityDocumentsTotal * 0.5) ||
    !applicant?.payment1 ||
    !applicant?.payment2 ||
    (showVisaSection &&
      visaDocumentsUploaded < Math.floor(visaDocumentsTotal * 0.4));

  return (
    <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
      {/* Progress Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 text-white shadow-large">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
              Your Journey Progress
            </h2>
            <p className="text-sm text-sky-100">{progressPercentage}% Complete</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl lg:text-3xl font-bold">
              {progressPercentage}%
            </div>
            <div className="text-xs text-sky-100">Complete</div>
          </div>
        </div>
        <div className="w-full bg-sky-400/30 rounded-full h-2.5 mb-4">
          <div
            className="bg-white h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center text-sm text-sky-100">
          <FaCheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Next: {nextLabel}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* University Docs */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <FaUniversity className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${uniDocStatus.cls}`}>
              {uniDocStatus.label}
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-appleGray-800 mb-1">
            {universityDocumentsUploaded}/{universityDocumentsTotal}
          </div>
          <div className="text-xs text-appleGray-500">University Documents</div>
        </div>

        {showVisaSection && (
          <div className="bg-white p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <FaPassport className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${visaDocStatus.cls}`}>
                {visaDocStatus.label}
              </span>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-appleGray-800 mb-1">
              {visaDocumentsUploaded}/{visaDocumentsTotal}
            </div>
            <div className="text-xs text-appleGray-500">Visa Documents</div>
          </div>
        )}

        {/* Universities Applied */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <FaGraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                universitiesApplied > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {universitiesApplied > 0 ? "Applied" : "Pending"}
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-appleGray-800 mb-1">
            {universitiesApplied}
          </div>
          <div className="text-xs text-appleGray-500">Universities Applied</div>
        </div>

        {/* Payments */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-soft border border-appleGray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <FaCreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                paymentsComplete
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {paymentsComplete ? "Complete" : "Pending"}
            </span>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-appleGray-800 mb-1">
            {paymentsDone}/2
          </div>
          <div className="text-xs text-appleGray-500">Payments Complete</div>
        </div>
      </div>

      {/* Critical Alerts */}
      {showAlerts && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
                Action Required
              </h3>
              <div className="space-y-1.5">
                {!applicant?.payment1 && (
                  <div className="flex items-center text-sm text-red-700">
                    <FaCreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Complete Payment 1</span>
                  </div>
                )}
                {!applicant?.payment2 && (
                  <div className="flex items-center text-sm text-red-700">
                    <FaCreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Complete Payment 2</span>
                  </div>
                )}
                {showVisaSection &&
                  visaDocumentsUploaded <
                    Math.floor(visaDocumentsTotal * 0.4) && (
                    <div className="flex items-center text-sm text-red-700">
                      <FaPassport className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        Upload more visa documents ({visaDocumentsUploaded}/
                        {visaDocumentsTotal})
                      </span>
                    </div>
                  )}
                {universityDocumentsUploaded <
                  Math.floor(universityDocumentsTotal * 0.5) && (
                  <div className="flex items-center text-sm text-red-700">
                    <FaUniversity className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      Upload more university documents (
                      {universityDocumentsUploaded}/{universityDocumentsTotal})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
