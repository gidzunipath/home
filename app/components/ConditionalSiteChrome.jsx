"use client";

import { usePathname } from "next/navigation";
import Nav from "./nav-german";
import FloatingButtons from "./floatingButton";

const ADMIN_MESSAGES_FULLSCREEN =
  /^\/admin\/messages\/?$/;

export default function ConditionalSiteChrome({ children, footer }) {
  const pathname = usePathname() ?? "";
  const fullscreenChat = ADMIN_MESSAGES_FULLSCREEN.test(pathname);

  if (fullscreenChat) {
    return (
      <div className="h-dvh min-h-0 w-full flex flex-col overflow-hidden bg-appleGray-100">
        {children}
      </div>
    );
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      {footer}
      <FloatingButtons />
    </>
  );
}
