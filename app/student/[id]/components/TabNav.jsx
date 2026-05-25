"use client";

import {
  FaChartLine,
  FaLifeRing,
  FaFileAlt,
  FaUniversity,
  FaPassport,
  FaComments,
  FaGlobe,
} from "react-icons/fa";
import { canAccessVisaSection } from "../../../../lib/application-status";

const TABS = [
  { id: "overview", label: "Overview", icon: FaChartLine },
  { id: "support", label: "Support", icon: FaLifeRing },
  { id: "documents", label: "Documents", icon: FaFileAlt },
  { id: "universities", label: "Universities", icon: FaUniversity },
  { id: "tasks", label: "Visa", icon: FaPassport },
  { id: "german-life", label: "German life", icon: FaGlobe },
  { id: "feedback", label: "Feedback", icon: FaComments },
];

export default function TabNav({
  activeTab,
  applicant,
  dashboardStats,
  onTabChange,
}) {
  const { universityDocumentsUploaded, universityDocumentsTotal,
    visaDocumentsUploaded, visaDocumentsTotal } = dashboardStats;

  const showVisaTab = canAccessVisaSection(applicant?.status);

  const visaUrgent =
    showVisaTab &&
    (visaDocumentsUploaded < Math.floor(visaDocumentsTotal * 0.4) ||
      !applicant?.payment1 ||
      !applicant?.payment2);

  const docsWarning =
    universityDocumentsUploaded < Math.floor(universityDocumentsTotal * 0.5) ||
    (showVisaTab &&
      visaDocumentsUploaded < Math.floor(visaDocumentsTotal * 0.4));

  return (
    <div className="border-b border-appleGray-200">
      {/* Mobile — 2/3 column grid */}
      <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2 md:hidden">
        {TABS.map((tab) => {
          const isLocked =
            tab.id === "tasks" && applicant?.lock_1 && showVisaTab;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={`mobile-${tab.id}`}
              onClick={() => !isLocked && onTabChange(tab.id)}
              disabled={isLocked}
              className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl text-xs font-medium transition-all duration-200 touch-manipulation ${
                isLocked
                  ? "text-appleGray-400 cursor-not-allowed opacity-50 bg-appleGray-50"
                  : isActive
                  ? "text-sky-600 bg-sky-100 border border-sky-200"
                  : "text-appleGray-600 hover:text-appleGray-800 hover:bg-appleGray-50"
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
              <span className="text-center leading-tight">{tab.label}</span>
              {tab.id === "tasks" && visaUrgent && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  !
                </span>
              )}
              {tab.id === "documents" && docsWarning && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop — horizontal scroll */}
      <nav className="hidden md:flex overflow-x-auto">
        {TABS.map((tab) => {
          const isLocked =
            tab.id === "tasks" && applicant?.lock_1 && showVisaTab;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => !isLocked && onTabChange(tab.id)}
              disabled={isLocked}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap touch-manipulation ${
                isLocked
                  ? "border-transparent text-appleGray-400 cursor-not-allowed opacity-50"
                  : isActive
                  ? "border-sky-500 text-sky-600 bg-sky-50/50"
                  : "border-transparent text-appleGray-600 hover:text-appleGray-800 hover:border-appleGray-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "tasks" && visaUrgent && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
              {tab.id === "documents" && docsWarning && (
                <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
