"use client";

import React from "react";
import { useParams } from "next/navigation";
import FeedbackDetailView from "../../components/feedback/FeedbackDetailView";

export default function FeedbackDetailPage() {
  const { id } = useParams();

  return <FeedbackDetailView feedbackId={id} />;
}
