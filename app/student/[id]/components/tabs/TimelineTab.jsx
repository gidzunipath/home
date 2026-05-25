"use client";

import TimelineView from "../TimelineView";

export default function TimelineTab({ applicant, applicationId }) {
  return (
    <div className="p-6 sm:p-8">
      <TimelineView applicantData={applicant} applicationId={applicationId} />
    </div>
  );
}
