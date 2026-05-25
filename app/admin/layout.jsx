"use client";

import { usePathname } from "next/navigation";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import AdminSideNav from "./components/AdminSideNav";
import AdminTopNav from "./components/AdminTopNav";

const MESSAGES_FULLSCREEN =
  /^\/admin\/messages(\/|$)/;

const GERMAN_LIFE_EDITOR =
  /^\/admin\/german-life\/(new|[^/]+\/edit)(\/|$)/;

export default function AdminLayout({ children }) {
  const pathname = usePathname() ?? "";
  const fullscreenMessages = MESSAGES_FULLSCREEN.test(pathname);
  const germanLifeEditor = GERMAN_LIFE_EDITOR.test(pathname);
  const { loading, isAuthenticated } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-appleGray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-appleGray-800">
              Loading Admin Panel
            </h3>
            <p className="text-appleGray-600">Authenticating your access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-appleGray-50">
        <div className="animate-pulse text-xl font-semibold text-appleGray-800">
          Redirecting to login...
        </div>
      </div>
    );
  }

  if (fullscreenMessages) {
    return (
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-appleGray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-appleGray-100">
      <AdminSideNav />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopNav />
        <main
          className={
            germanLifeEditor
              ? "min-h-0 flex-1 overflow-hidden"
              : "min-h-0 flex-1 overflow-y-auto admin-main-scroll"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
