"use client";

import { useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { StarRating, StoryImage } from "./StoryCardParts";
import StoryQuote from "./StoryQuote";
import StoryModal from "./StoryModal";

const REVIEWS_PER_SLIDE = 2;

function chunkStories(stories, size) {
  const slides = [];
  for (let i = 0; i < stories.length; i += size) {
    slides.push(stories.slice(i, i + size));
  }
  return slides;
}

function StoryCard({ story, index, onReadMore, soloOnSlide }) {
  return (
    <article
      className={`group grid min-h-[260px] grid-cols-[2fr_3fr] overflow-hidden rounded-3xl border border-appleGray-200 bg-white shadow-soft sm:min-h-[280px] ${
        soloOnSlide ? "lg:col-span-2 lg:mx-auto w-full lg:max-w-2xl" : ""
      }`}
    >
      <StoryImage
        src={story.image}
        alt={story.name}
        className="h-full min-h-[260px] w-full sm:min-h-[280px]"
        priority={index < 3}
        gradient
        overlayName={story.name}
        overlaySubtitle={story.university}
        isPlaceholder={story.isPlaceholder}
      />
      <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6 lg:p-7">
        <StarRating rating={story.rating} className="mb-3 sm:mb-4" />
        <StoryQuote text={story.text} onReadMore={() => onReadMore(story)} />
      </div>
    </article>
  );
}

export default function EditorialVariant({ stories }) {
  const [activeStory, setActiveStory] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = useMemo(
    () => chunkStories(stories, REVIEWS_PER_SLIDE),
    [stories]
  );
  const slideCount = slides.length;
  const currentStories = slides[slideIndex] ?? [];
  const soloOnSlide = currentStories.length === 1;

  useEffect(() => {
    setSlideIndex(0);
  }, [stories]);

  useEffect(() => {
    if (slideIndex >= slideCount && slideCount > 0) {
      setSlideIndex(0);
    }
  }, [slideIndex, slideCount]);

  useEffect(() => {
    if (!isAutoPlaying || slideCount <= 1) return;

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slideCount]);

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  const handlePrev = () => {
    setSlideIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setSlideIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative">
        <div
          key={slideIndex}
          className="grid grid-cols-1 gap-6 animate-fade-in-up lg:grid-cols-2 lg:gap-8"
          aria-live="polite"
          aria-atomic="true"
        >
          {currentStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={slideIndex * REVIEWS_PER_SLIDE + index}
              onReadMore={setActiveStory}
              soloOnSlide={soloOnSlide}
            />
          ))}
        </div>

        {slideCount > 1 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-appleGray-100 transition-all duration-300 btn-apple-hover hover:bg-sky-500"
              aria-label="Previous reviews"
              onMouseEnter={pauseAutoPlay}
              onMouseLeave={resumeAutoPlay}
              onFocus={pauseAutoPlay}
              onBlur={resumeAutoPlay}
            >
              <FaChevronLeft className="h-5 w-5 text-appleGray-600 transition-colors duration-300 group-hover:text-white" />
            </button>

            <div className="flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === slideIndex
                      ? "bg-sky-500 shadow-soft"
                      : "bg-appleGray-300 hover:bg-appleGray-400"
                  }`}
                  aria-label={`Go to review slide ${index + 1}`}
                  aria-current={index === slideIndex ? "true" : undefined}
                  onMouseEnter={pauseAutoPlay}
                  onMouseLeave={resumeAutoPlay}
                  onFocus={pauseAutoPlay}
                  onBlur={resumeAutoPlay}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-appleGray-100 transition-all duration-300 btn-apple-hover hover:bg-sky-500"
              aria-label="Next reviews"
              onMouseEnter={pauseAutoPlay}
              onMouseLeave={resumeAutoPlay}
              onFocus={pauseAutoPlay}
              onBlur={resumeAutoPlay}
            >
              <FaChevronRight className="h-5 w-5 text-appleGray-600 transition-colors duration-300 group-hover:text-white" />
            </button>
          </div>
        )}
      </div>

      <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />
    </>
  );
}
