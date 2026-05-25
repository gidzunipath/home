"use client";

import { AppModalProvider } from "../../hooks/useAppModal";

export default function AppProviders({ children }) {
  return <AppModalProvider>{children}</AppModalProvider>;
}
