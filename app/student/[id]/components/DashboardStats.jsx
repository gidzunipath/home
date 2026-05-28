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
    <div className="max-w-7xl mx-auto mb-3 md:mb-8">
      {/* Progress Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl md:rounded-3xl p-3 md:p-6 lg:p-8 mb-2 md:mb-6 text-white shadow-large">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 flex-1 pr-2">
              <h2 className="text-sm font-bold leading-tight">Your Journey Progress</h2>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold">{progressPercentage}%</div>
              <div className="text-[10px] text-sky-100">Complete</div>
            </div>
          </div>
          <div className="w-full bg-sky-400/30 rounded-full h-1.5 mb-2">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center text-[11px] text-sky-100 leading-snug">
            <FaCheckCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
            <span className="truncate">Next: {nextLabel}</span>
          </div>
        </div>
        {/* Desktop — original */}
        <div className="hidden md:block">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold mb-1">Your Journey Progress</h2>
              <p className="text-sm text-sky-100">{progressPercentage}% Complete</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl lg:text-3xl font-bold">{progressPercentage}%</div>
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
      </div>

      {/* Quick Stats — mobile: one row */}
      <div className="flex gap-1.5 mb-2 md:hidden">
        <div className="flex-1 min-w-0 bg-white p-2 rounded-xl shadow-soft border border-appleGray-100">
          <div className="flex flex-col items-center text-center mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUniversity className="w-3 h-3 text-blue-600" />
            </div>
          </div>
          <div className="text-sm font-bold text-appleGray-800 text-center mb-0.5">
            {universityDocumentsUploaded}/{universityDocumentsTotal}
          </div>
          <div className="text-[9px] text-appleGray-500 text-center truncate">Uni Docs</div>
        </div>

        {showVisaSection && (
          <div className="flex-1 min-w-0 bg-white p-2 rounded-xl shadow-soft border border-appleGray-100">
            <div className="flex flex-col items-center text-center mb-1">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaPassport className="w-3 h-3 text-orange-600" />
              </div>
            </div>
            <div className="text-sm font-bold text-appleGray-800 text-center mb-0.5">
              {visaDocumentsUploaded}/{visaDocumentsTotal}
            </div>
            <div className="text-[9px] text-appleGray-500 text-center truncate">Visa</div>
          </div>
        )}

        <div className="flex-1 min-w-0 bg-white p-2 rounded-xl shadow-soft border border-appleGray-100">
          <div className="flex flex-col items-center text-center mb-1">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="w-3 h-3 text-purple-600" />
            </div>
          </div>
          <div className="text-sm font-bold text-appleGray-800 text-center mb-0.5">
            {universitiesApplied}
          </div>
          <div className="text-[9px] text-appleGray-500 text-center truncate">Unis</div>
        </div>

        <div className="flex-1 min-w-0 bg-white p-2 rounded-xl shadow-soft border border-appleGray-100">
          <div className="flex flex-col items-center text-center mb-1">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCreditCard className="w-3 h-3 text-green-600" />
            </div>
          </div>
          <div className="text-sm font-bold text-appleGray-800 text-center mb-0.5">
            {paymentsDone}/2
          </div>
          <div className="text-[9px] text-appleGray-500 text-center truncate">Pay</div>
        </div>
      </div>

      {/* Quick Stats — desktop: original grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl md:rounded-3xl p-3 md:p-6 animate-fade-in-up">
          <div className="flex items-start gap-2.5 md:gap-4 md:flex-row md:items-start">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-red-500 rounded-lg md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-red-800 mb-1 md:mb-2">
                Action Required
              </h3>
              <div className="space-y-1 md:space-y-1.5">
                {!applicant?.payment1 && (
                  <div className="flex items-center text-xs md:text-sm text-red-700">
                    <FaCreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                    <span>Complete Payment 1</span>
                  </div>
                )}
                {!applicant?.payment2 && (
                  <div className="flex items-center text-xs md:text-sm text-red-700">
                    <FaCreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                    <span>Complete Payment 2</span>
                  </div>
                )}
                {showVisaSection &&
                  visaDocumentsUploaded <
                    Math.floor(visaDocumentsTotal * 0.4) && (
                    <div className="flex items-center text-xs md:text-sm text-red-700">
                      <FaPassport className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                      <span>
                        Upload more visa documents ({visaDocumentsUploaded}/
                        {visaDocumentsTotal})
                      </span>
                    </div>
                  )}
                {universityDocumentsUploaded <
                  Math.floor(universityDocumentsTotal * 0.5) && (
                  <div className="flex items-center text-xs md:text-sm text-red-700">
                    <FaUniversity className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
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
