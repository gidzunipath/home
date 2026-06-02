"use client";

import Universities from "../Universities";
import VisaDocumentChecklist from "../VisaDocumentChecklist";
import { shouldShowVisaDocumentChecklist } from "../../../../../lib/application-status";

export default function UniversitiesTab({ applicationId, applicant }) {
  const showChecklist = shouldShowVisaDocumentChecklist(applicant?.status);

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <Universities applicationId={applicationId} />
      {showChecklist && (
        <div className="border-t border-appleGray-200 pt-8">
          <VisaDocumentChecklist />
        </div>
      )}
    </div>
  );
}
