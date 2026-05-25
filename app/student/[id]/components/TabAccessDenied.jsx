"use client";

import { FaLock } from "react-icons/fa";

export default function TabAccessDenied({
  title = "Access not available yet",
  message = "You don't have permission to view this section right now. Your counselor will unlock it when you reach the next stage of your application.",
  onContact,
}) {
  return (
    <div className="p-6 sm:p-8 flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaLock className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
          {title}
        </h3>
        <p className="text-appleGray-600 mb-6">{message}</p>
        {onContact && (
          <button
            type="button"
            onClick={onContact}
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            Contact Counselor
          </button>
        )}
      </div>
    </div>
  );
}
