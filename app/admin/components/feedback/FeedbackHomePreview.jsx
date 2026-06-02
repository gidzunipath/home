"use client";

import { FaStar, FaUser } from "react-icons/fa";

function PreviewStars({ rating }) {
  return (
    <div className="mb-2 flex items-center gap-0.5">
      {[...Array(rating)].map((_, i) => (
        <FaStar key={i} className="h-3 w-3 text-sky-400" />
      ))}
    </div>
  );
}

export default function FeedbackHomePreview({ feedback, imageUrl }) {
  const hasPhoto = Boolean(imageUrl);
  const displayName = feedback.allow_display_name
    ? feedback.client_name
    : "Anonymous Student";
  const previewText =
    feedback.message.length > 160
      ? `${feedback.message.slice(0, 160)}…`
      : feedback.message;

  return (
    <div className="rounded-xl border border-appleGray-200 bg-appleGray-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-appleGray-400">
        Homepage preview
      </p>
      <article className="mt-3 grid min-h-[180px] grid-cols-[2fr_3fr] overflow-hidden rounded-xl border border-appleGray-200 bg-white">
        <div className="relative min-h-[180px] overflow-hidden bg-appleGray-100">
          {hasPhoto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={displayName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-appleGray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-sky-600">
                <FaUser className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-2.5">
            <p className="text-[11px] font-bold text-white">{displayName}</p>
            <p className="truncate text-[10px] text-white/80">
              {feedback.university || "Germany"}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center p-3">
          <PreviewStars rating={feedback.rating} />
          <p className="text-xs leading-relaxed text-appleGray-700">
            &ldquo;{previewText}&rdquo;
          </p>
        </div>
      </article>
    </div>
  );
}
