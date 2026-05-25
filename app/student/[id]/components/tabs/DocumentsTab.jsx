"use client";

import DocumentsToUpload from "../DocumentsToUpload";

export default function DocumentsTab({ applicationId }) {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      <DocumentsToUpload applicationId={applicationId} />
    </div>
  );
}
