"use client";

import { useEffect, useCallback } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

const VARIANTS = {
  success: {
    icon: FaCheckCircle,
    iconBg: "bg-green-50 border-green-100",
    iconColor: "text-green-600",
    confirmBtn: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  error: {
    icon: FaExclamationTriangle,
    iconBg: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  warning: {
    icon: FaExclamationTriangle,
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    confirmBtn: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  info: {
    icon: FaInfoCircle,
    iconBg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
    confirmBtn: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  danger: {
    icon: FaExclamationTriangle,
    iconBg: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-red-500 hover:bg-red-600 text-white",
  },
};

const DEFAULT_TITLES = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Notice",
  danger: "Confirm",
};

export default function AppModal({
  isOpen,
  isClosing,
  variant = "info",
  mode = "alert",
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  const styles = VARIANTS[variant] || VARIANTS.info;
  const Icon = styles.icon;
  const displayTitle = title || DEFAULT_TITLES[variant] || DEFAULT_TITLES.info;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen && !isClosing) return null;

  const backdropClass = isClosing ? "animate-fade-out" : "animate-fade-in";
  const panelClass = isClosing ? "animate-scale-out" : "animate-scale-in";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${backdropClass}`}
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        aria-describedby="app-modal-message"
        className={`relative z-10 w-full max-w-md rounded-2xl sm:rounded-3xl border border-appleGray-200 bg-white shadow-large ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-appleGray-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="app-modal-title"
            className="text-base sm:text-lg font-bold text-appleGray-900 pr-4"
          >
            {displayTitle}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-appleGray-100 text-appleGray-500 transition-colors duration-200 hover:bg-appleGray-200 hover:text-appleGray-700"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-5 sm:mb-6 text-center">
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${styles.iconBg}`}
            >
              <Icon className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
            <p
              id="app-modal-message"
              className="text-sm sm:text-base text-appleGray-600 whitespace-pre-line"
            >
              {message}
            </p>
          </div>

          {mode === "confirm" ? (
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl bg-appleGray-100 px-5 py-2.5 text-sm font-medium text-appleGray-700 transition-colors duration-200 hover:bg-appleGray-200"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${styles.confirmBtn}`}
              >
                {confirmLabel || "Confirm"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${styles.confirmBtn}`}
            >
              {confirmLabel || "OK"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
