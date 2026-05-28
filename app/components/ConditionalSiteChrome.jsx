"use client";

import { usePathname } from "next/navigation";
import Nav from "./nav-german";
import FloatingButtons from "./floatingButton";

const ADMIN_ROUTE = /^\/admin(\/|$)/;
const STUDENT_ROUTE = /^\/student(\/|$)/;

export default function ConditionalSiteChrome({ children, footer }) {
  const pathname = usePathname() ?? "";
  const isAdminRoute = ADMIN_ROUTE.test(pathname);
  const isStudentRoute = STUDENT_ROUTE.test(pathname);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {isStudentRoute ? (
        <div className="hidden md:block">
          <Nav />
        </div>
      ) : (
        <Nav />
      )}
      <main className="min-h-screen">{children}</main>
      {isStudentRoute ? <div className="hidden md:block">{footer}</div> : footer}
      {isStudentRoute ? (
        <div className="hidden md:block">
          <FloatingButtons />
        </div>
      ) : (
        <FloatingButtons />
      )}
    </>
  );
}
