"use client";

import { useState } from "react";
import Image from "next/image";
import { FaGlobe } from "react-icons/fa";
import { normalizeBlogImageSrc } from "../../../lib/blogUtils";

/**
 * Blog card thumbnail — uses next/image with unoptimized Supabase URLs
 * (avoids optimizer failures) and falls back if the image fails to load.
 */
export default function BlogPostThumbnail({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = normalizeBlogImageSrc(src);

  if (!imageSrc || failed) {
    return (
      <div className="flex h-full min-h-[120px] w-full items-center justify-center">
        <FaGlobe className="h-12 w-12 text-appleGray-300" />
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt || "German Life article"}
      fill
      unoptimized
      className={`object-cover ${className}`.trim()}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => setFailed(true)}
    />
  );
}
