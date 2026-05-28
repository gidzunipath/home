"use client";

import { FaUserGraduate, FaSignOutAlt } from "react-icons/fa";
import { useAuthSystem } from "../../../../hooks/useAuthSystem";

export default function ClientHeader({ applicant }) {
  const { logout } = useAuthSystem();

  return (
    <div className="max-w-7xl mx-auto mb-3 md:mb-8">
      <div className="text-center space-y-2 md:space-y-6 animate-fade-in-up">
        <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto shadow-soft">
          <FaUserGraduate className="w-6 h-6 md:w-10 md:h-10 text-white" />
        </div>
        <div>
          {/* Mobile: title + logout */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-1 px-1">
            <h1 className="text-lg font-bold text-appleGray-800">Student Portal</h1>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 flex-shrink-0 bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 hover:bg-red-100 transition-colors duration-200 touch-manipulation"
              aria-label="Logout"
            >
              <FaSignOutAlt className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
          {/* Desktop: original title */}
          <h1 className="hidden md:block text-3xl lg:text-4xl xl:text-5xl font-bold text-appleGray-800 mb-2">
            Student Portal
          </h1>
          <p className="text-sm md:text-xl text-appleGray-500">
            Welcome back,{" "}
            <span className="font-semibold text-appleGray-700">
              {applicant.first_name} {applicant.last_name}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
