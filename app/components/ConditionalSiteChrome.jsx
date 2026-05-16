"use client";

import { usePathname } from "next/navigation";
import Nav from "./nav-german";
import FloatingButtons from "./floatingButton";

const ADMIN_ROUTE = /^\/admin(\/|$)/;

export default function ConditionalSiteChrome({ children, footer }) {
  const pathname = usePathname() ?? "";
  const isAdminRoute = ADMIN_ROUTE.test(pathname);

  if (isAdminRoute) {
    return <>{children}</>;
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
