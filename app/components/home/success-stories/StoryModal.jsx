"use client";

import { useEffect } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import { StarRating } from "./StoryCardParts";
import { TESTIMONIAL_LOGO_PLACEHOLDER } from "./useTestimonialsData";

function ModalAvatar({ story }) {
  if (story.isPlaceholder) {
    return (
      <div className="relative mx-auto w-fit">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-large ring-4 ring-sky-50">
          <FaUser className="h-10 w-10 text-white/95" />
        </div>
        <div className="absolute -bottom-1 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white shadow-medium">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TESTIMONIAL_LOGO_PLACEHOLDER}
            alt="Gidz UniPath"
            className="h-7 w-7 object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-appleGray-200 shadow-large ring-4 ring-sky-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={story.image}
        alt={story.name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default function StoryModal({ story, onClose }) {
  useEffect(() => {
    if (!story) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-appleGray-200 bg-white shadow-large sm:max-w-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-appleGray-100 text-appleGray-600 transition-colors duration-200 hover:bg-appleGray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label="Close testimonial"
        >
          <FaTimes className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6 pt-2">
            <ModalAvatar story={story} />
          </div>

          <div className="text-center">
            <StarRating
              rating={story.rating}
              className="mb-4 justify-center"
            />
            <h3
              id="story-modal-title"
              className="text-xl font-bold text-appleGray-800"
            >
              {story.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-sky-600">
              {story.university}
            </p>
            {story.location && (
              <p className="mt-0.5 text-xs text-appleGray-500">
                {story.location}
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-appleGray-100 pt-6">
            <blockquote className="text-base italic leading-relaxed text-appleGray-700 sm:text-lg sm:leading-relaxed">
              &ldquo;{story.text}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
