"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";

const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

export default function EmojiPickerPopover({ open, onClose, onSelect, anchorRef }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        popoverRef.current?.contains(e.target) ||
        anchorRef?.current?.contains(e.target)
      ) {
        return;
      }
      onClose();
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-appleGray-200 bg-white shadow-lg"
      role="dialog"
      aria-label="Insert emoji"
    >
      <Picker
        data={data}
        onEmojiSelect={(emoji) => {
          onSelect(emoji.native);
          onClose();
        }}
        theme="light"
        previewPosition="none"
        skinTonePosition="search"
        maxFrequentRows={2}
        locale="en"
      />
    </div>
  );
}
