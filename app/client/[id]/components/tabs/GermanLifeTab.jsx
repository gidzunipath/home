"use client";

import { FaGlobe } from "react-icons/fa";

export default function GermanLifeTab() {
  return (
    <div className="p-6 sm:p-8 flex items-center justify-center min-h-[320px] sm:min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaGlobe className="w-8 h-8 text-sky-600" />
        </div>
        <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
          German life
        </h3>
        <p className="text-appleGray-600 text-lg">Coming soon</p>
      </div>
    </div>
  );
}
