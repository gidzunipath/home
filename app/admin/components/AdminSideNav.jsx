"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { ADMIN_NAV_ITEMS } from "./adminNavConfig";
import { useAdminNavCounts } from "../../../hooks/useAdminNavCounts";

function NavBadge({ count }) {
  if (!count || count < 1) return null;

  return (
    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function navItemClassName(active) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    active
      ? "admin-nav-active bg-sky-50 text-sky-700"
      : "text-appleGray-500 hover:bg-appleGray-100 hover:text-appleGray-800"
  }`;
}

export default function AdminSideNav() {
  const pathname = usePathname() ?? "";
  const { unansweredMessages } = useAdminNavCounts();

  const getBadgeCount = (item) => {
    if (item.badgeKey === "unansweredMessages") return unansweredMessages;
    return 0;
  };

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col overflow-hidden border-r border-appleGray-200 bg-gradient-to-b from-white to-appleGray-100">
      <div className="flex h-full min-h-0 flex-col px-4 py-5">
        <div className="mb-0 px-1 pb-5 border-b border-appleGray-100">
          <Link href="/admin" className="flex flex-col items-center gap-2">
            <Image
              src="/gidz-transperant.png"
              alt="GIDZ UniPath"
              width={72}
              height={72}
              className="h-14 w-14 object-contain drop-shadow-sm"
              priority
            />
            <div className="text-center">
              <p className="montserrat text-sm font-bold leading-tight text-appleGray-800">
                GIDZ <span className="text-sky-500">UniPath</span>
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-appleGray-400">
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 pt-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            const badge = getBadgeCount(item);
            const iconClass = `text-xl shrink-0 transition-colors duration-200 ${active ? "text-sky-500" : "text-appleGray-400"}`;

            const content = (
              <>
                <Icon icon={item.icon} className={iconClass} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <NavBadge count={badge} />
                {item.openInNewTab && (
                  <Icon
                    icon="material-symbols:open-in-new"
                    className="shrink-0 text-base text-appleGray-300"
                    aria-hidden
                  />
                )}
              </>
            );

            if (item.openInNewTab) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navItemClassName(false)}
                  title={
                    badge > 0
                      ? `${badge} unanswered conversation${badge === 1 ? "" : "s"}`
                      : "Open messages in a new tab"
                  }
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={navItemClassName(active)}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
