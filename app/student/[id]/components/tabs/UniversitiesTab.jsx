"use client";

import Universities from "../Universities";
import DocumentsToDownload from "../DocumentsToDownload";

export default function UniversitiesTab({ applicationId }) {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      <Universities applicationId={applicationId} />
      <div className="border-t border-appleGray-200 pt-8">
        <DocumentsToDownload applicationId={applicationId} />
      </div>
    </div>
  );
}
