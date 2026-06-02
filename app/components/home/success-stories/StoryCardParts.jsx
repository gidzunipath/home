"use client";

import Image from "next/image";
import { FaStar, FaUser } from "react-icons/fa";

export function StarRating({ rating = 5, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(rating)].map((_, i) => (
        <FaStar key={i} className="h-4 w-4 text-sky-400" />
      ))}
    </div>
  );
}

function StoryPlaceholder({ logoSrc, priority = false }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-appleGray-100 to-sky-100">
      <div
        className="absolute -right-6 top-6 h-24 w-24 rounded-full bg-sky-400/10"
        aria-hidden="true"
      />
      <div
        className="absolute -left-4 bottom-16 h-16 w-16 rounded-full bg-sky-500/10"
        aria-hidden="true"
      />

      <div className="relative flex h-full items-center justify-center p-6">
        <div className="relative transition-transform duration-700 group-hover:scale-105">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-large ring-4 ring-white/90 sm:h-28 sm:w-28">
            <FaUser className="h-10 w-10 text-white/95 sm:h-12 sm:w-12" />
          </div>

          <div className="absolute -bottom-1 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white shadow-medium sm:-bottom-2 sm:-right-3 sm:h-14 sm:w-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Gidz UniPath"
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoryImage({
  src,
  alt,
  className = "",
  priority = false,
  gradient = false,
  overlayName,
  overlaySubtitle,
  isPlaceholder = false,
}) {
  return (
    <div
      className={`relative overflow-hidden ${
        isPlaceholder ? "bg-appleGray-100" : "bg-appleGray-200"
      } ${className}`}
    >
      {isPlaceholder ? (
        <StoryPlaceholder logoSrc={src} priority={priority} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      {gradient && (
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent ${
            isPlaceholder
              ? "from-black/70 via-black/20"
              : "from-black/80 via-black/30"
          }`}
          aria-hidden="true"
        />
      )}
      {overlayName && (
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
          <p className="text-sm font-bold leading-tight text-white sm:text-base">
            {overlayName}
          </p>
          {overlaySubtitle && (
            <p className="mt-1 truncate text-xs text-white/80 sm:text-sm">
              {overlaySubtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AuthorAvatar({ story, size = "md" }) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-soft`}
    >
      {story.avatar ? (
        <Image
          src={story.avatar}
          alt={story.name}
          width={64}
          height={64}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FaUser className="h-1/2 w-1/2 text-white" />
        </div>
      )}
    </div>
  );
}

export function StoryMeta({ story, light = false, compact = false }) {
  const nameClass = light ? "text-white" : "text-appleGray-800";
  const uniClass = light ? "text-sky-200" : "text-sky-600";
  const locClass = light ? "text-white/80" : "text-appleGray-500";

  return (
    <div className="min-w-0">
      <p
        className={`font-bold ${nameClass} ${
          compact ? "truncate text-sm" : "text-lg"
        }`}
      >
        {story.name}
      </p>
      <p
        className={`mt-0.5 font-semibold ${uniClass} ${
          compact ? "truncate text-xs" : "text-sm"
        }`}
      >
        {story.university}
      </p>
      {!compact && (
        <p className={`mt-0.5 text-xs ${locClass}`}>{story.location}</p>
      )}
    </div>
  );
}
