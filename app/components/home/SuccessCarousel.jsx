"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaTimes } from "react-icons/fa";

const SUCCESS_IMAGES = [
  "/success/carousel-image-1.png",
  "/success/carousel-image-2.png",
  "/success/carousel-image-3.png",
  "/success/carousel-image-4.png",
  "/success/carousel-image-5.png",
  "/success/carousel-image-6.png",
];

function carouselImageLabel(src) {
  const match = src.match(/carousel-image-(\d+)/);
  return match ? `Carousel image ${match[1]}` : "Carousel image";
}

const AUTOPLAY_MS = 5000;
const TRANSITION_MS = 600;
const MOBILE_MEDIA = "(max-width: 639px)";

function buildPairSlides(images) {
  const slides = [];
  for (let i = 0; i < images.length; i += 2) {
    slides.push([images[i], images[i + 1] ?? images[0]]);
  }
  return slides;
}

function buildSingleSlides(images) {
  return images.map((src) => [src]);
}

export default function SuccessCarousel() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_MEDIA).matches
  );

  const slides = useMemo(
    () =>
      isMobile
        ? buildSingleSlides(SUCCESS_IMAGES)
        : buildPairSlides(SUCCESS_IMAGES),
    [isMobile]
  );
  const slideCount = slides.length;

  const loopSlides = useMemo(
    () => [slides[slideCount - 1], ...slides, slides[0]],
    [slides, slideCount]
  );
  const totalSlides = loopSlides.length;

  const viewportRef = useRef(null);
  const lastWidthRef = useRef(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const slideWidth = viewportWidth || lastWidthRef.current;

  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const indexRef = useRef(1);
  indexRef.current = index;

  const isAutoplayEnabled = !hoverPaused && !lightboxSrc;
  const activeDot = ((index - 1) % slideCount + slideCount) % slideCount;
  const translateX = slideWidth > 0 ? -(index * slideWidth) : 0;

  const openLightbox = (src) => setLightboxSrc(src);
  const closeLightbox = () => setLightboxSrc(null);

  const goTo = useCallback((dotIndex) => {
    setAnimate(true);
    setIndex(dotIndex + 1);
  }, []);

  const goNext = useCallback(() => {
    setAnimate(true);
    setIndex((prev) => prev + 1);
  }, []);

  const onTrackTransitionEnd = (event) => {
    if (event.propertyName !== "transform") return;
    if (event.target !== event.currentTarget) return;

    const current = indexRef.current;
    if (current === 0) {
      setAnimate(false);
      setIndex(slideCount);
    } else if (current === totalSlides - 1) {
      setAnimate(false);
      setIndex(1);
    }
  };

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA);
    const updateMobile = () => setIsMobile(mq.matches);
    updateMobile();
    mq.addEventListener("change", updateMobile);
    return () => mq.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    setAnimate(false);
    setIndex(1);
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [isMobile]);

  const measureViewport = useCallback(() => {
    const node = viewportRef.current;
    if (!node) return;

    const width = node.getBoundingClientRect().width;
    if (width > 0) {
      lastWidthRef.current = width;
      setViewportWidth(width);
    }
  }, []);

  useLayoutEffect(() => {
    measureViewport();
  }, [measureViewport, isMobile]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const observer = new ResizeObserver(() => measureViewport());
    observer.observe(node);
    window.addEventListener("resize", measureViewport);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestAnimationFrame(() => {
          requestAnimationFrame(measureViewport);
        });
      }
    };

    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", measureViewport);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureViewport);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", measureViewport);
    };
  }, [measureViewport]);

  useEffect(() => {
    if (!isAutoplayEnabled || slideCount <= 1 || document.hidden) return;
    const timer = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [goNext, isAutoplayEnabled, slideCount]);

  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  useEffect(() => {
    if (!lightboxSrc) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxSrc]);

  return (
    <section
      className="py-16 sm:py-20 bg-appleGray-100 overflow-x-hidden w-full"
      aria-label="Student success gallery"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 text-center animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-appleGray-800 mb-5 sm:mb-6 leading-tight">
          Celebrating Our{" "}
          <span className="text-gradient">Student Success</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-sky-600 mx-auto mb-5 sm:mb-6" />
        
      </div>

      <div
        className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
      >
        <div
          ref={viewportRef}
          className="relative w-full min-w-0 overflow-hidden"
        >
          <div
            className="flex motion-reduce:transition-none will-change-transform"
            style={{
              transform: `translate3d(${translateX}px, 0, 0)`,
              transition: animate
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "none",
            }}
            onTransitionEnd={onTrackTransitionEnd}
          >
            {loopSlides.map((pair, slideIndex) => (
              <div
                key={`${isMobile ? "m" : "d"}-slide-${slideIndex}`}
                className="shrink-0 min-w-0"
                style={{
                  width: slideWidth > 0 ? slideWidth : "100%",
                }}
              >
                <div
                  className={`grid w-full min-w-0 gap-2 ${
                    pair.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                  }`}
                >
                  {pair.map((src, imageIndex) => (
                    <button
                      key={`${slideIndex}-${imageIndex}-${src}`}
                      type="button"
                      onClick={() => openLightbox(src)}
                      className="group relative rounded-2xl aspect-[10/6] shadow-soft min-w-0 w-full overflow-hidden bg-appleGray-200 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                      aria-label={`View ${carouselImageLabel(src)} full size`}
                    >
                      {/* Native img avoids Next/Image fill collapsing when tab is hidden */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={carouselImageLabel(src)}
                        loading={slideIndex === 1 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-2.5 py-5">
          {slides.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              aria-label={`Go to slide ${dotIndex + 1}`}
              aria-current={dotIndex === activeDot ? "true" : undefined}
              onClick={() => goTo(dotIndex)}
              className={`rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                dotIndex === activeDot
                  ? "w-8 h-2.5 bg-sky-500"
                  : "w-2.5 h-2.5 bg-appleGray-300 hover:bg-appleGray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close image preview"
          >
            <FaTimes className="h-5 w-5" />
          </button>

          <div
            className="relative w-full max-w-7xl min-w-0 flex items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxSrc}
              alt={carouselImageLabel(lightboxSrc)}
              className="max-h-[85vh] w-full max-w-full h-auto object-contain rounded-sm shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
