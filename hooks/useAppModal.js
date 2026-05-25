"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import AppModal from "../app/components/modals/AppModal";

const CLOSE_DURATION_MS = 200;

const AppModalContext = createContext(null);

export function AppModalProvider({ children }) {
  const [modalState, setModalState] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const resolveRef = useRef(null);

  const closeModal = useCallback((result) => {
    setIsClosing(true);
    setTimeout(() => {
      setModalState(null);
      setIsClosing(false);
      resolveRef.current?.(result);
      resolveRef.current = null;
    }, CLOSE_DURATION_MS);
  }, []);

  const showAlert = useCallback(
    ({
      type = "info",
      title,
      message,
      confirmLabel,
    }) =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setIsClosing(false);
        setModalState({
          mode: "alert",
          variant: type,
          title,
          message,
          confirmLabel,
        });
      }),
    []
  );

  const showConfirm = useCallback(
    ({
      type = "warning",
      title,
      message,
      confirmLabel,
      cancelLabel,
    }) =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setIsClosing(false);
        setModalState({
          mode: "confirm",
          variant: type === "danger" ? "danger" : type,
          title,
          message,
          confirmLabel,
          cancelLabel,
        });
      }),
    []
  );

  const showSuccess = useCallback(
    (message, title) => showAlert({ type: "success", message, title }),
    [showAlert]
  );

  const showError = useCallback(
    (message, title) => showAlert({ type: "error", message, title }),
    [showAlert]
  );

  const showWarning = useCallback(
    (message, title) => showAlert({ type: "warning", message, title }),
    [showAlert]
  );

  const showInfo = useCallback(
    (message, title) => showAlert({ type: "info", message, title }),
    [showAlert]
  );

  const handleConfirm = useCallback(() => {
    if (modalState?.mode === "confirm") {
      closeModal(true);
    } else {
      closeModal(undefined);
    }
  }, [closeModal, modalState?.mode]);

  const handleCancel = useCallback(() => {
    if (modalState?.mode === "confirm") {
      closeModal(false);
    } else {
      closeModal(undefined);
    }
  }, [closeModal, modalState?.mode]);

  const value = {
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <AppModalContext.Provider value={value}>
      {children}
      {modalState && (
        <AppModal
          isOpen={!!modalState}
          isClosing={isClosing}
          mode={modalState.mode}
          variant={modalState.variant}
          title={modalState.title}
          message={modalState.message}
          confirmLabel={modalState.confirmLabel}
          cancelLabel={modalState.cancelLabel}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </AppModalContext.Provider>
  );
}

export function useAppModal() {
  const context = useContext(AppModalContext);
  if (!context) {
    throw new Error("useAppModal must be used within an AppModalProvider");
  }
  return context;
}
