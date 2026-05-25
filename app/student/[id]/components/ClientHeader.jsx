"use client";

import { FaUserGraduate } from "react-icons/fa";

export default function ClientHeader({ applicant }) {
  return (
    <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
      <div className="text-center space-y-4 sm:space-y-6 animate-fade-in-up">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-soft">
          <FaUserGraduate className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-appleGray-800 mb-2">
            Student Portal
          </h1>
          <p className="text-lg sm:text-xl text-appleGray-500">
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
