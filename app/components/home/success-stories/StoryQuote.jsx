"use client";

import { useEffect, useRef, useState } from "react";

export default function StoryQuote({ text, onReadMore }) {
  const quoteRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const element = quoteRef.current;
    if (!element) return;

    const checkClamp = () => {
      setIsClamped(element.scrollHeight > element.clientHeight + 1);
    };

    checkClamp();

    const observer = new ResizeObserver(checkClamp);
    observer.observe(element);
    window.addEventListener("resize", checkClamp);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkClamp);
    };
  }, [text]);

  return (
    <div>
      <blockquote
        ref={quoteRef}
        className="text-sm italic leading-relaxed text-appleGray-700 line-clamp-6 sm:text-base sm:leading-relaxed"
      >
        &ldquo;{text}&rdquo;
      </blockquote>
      {isClamped && (
        <button
          type="button"
          onClick={onReadMore}
          className="mt-3 text-sm font-semibold text-sky-600 transition-colors duration-200 hover:text-sky-500 focus:outline-none focus-visible:underline"
        >
          Read more
        </button>
      )}
    </div>
  );
}
