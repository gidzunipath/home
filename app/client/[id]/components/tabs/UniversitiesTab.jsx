"use client";

import Universities from "../Universities";

export default function UniversitiesTab({ applicationId }) {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      <Universities applicationId={applicationId} />
    </div>
  );
}
