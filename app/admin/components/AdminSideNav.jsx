"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { ADMIN_NAV_ITEMS, canManageAdmins } from "./adminNavConfig";
import { useAdminNavCounts } from "../../../hooks/useAdminNavCounts";
import { useAdminAuth } from "../../../hooks/useAdminAuth";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

function NavBadge({ count, collapsed }) {
  if (!count || count < 1) return null;

  if (collapsed) {
    return (
      <span
        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
        aria-label={`${count} notification${count === 1 ? "" : "s"}`}
      />
    );
  }

  return (
    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function navItemClassName(active, collapsed) {
  return `flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
  } ${
    active
      ? "admin-nav-active bg-sky-50 text-sky-700"
      : "text-appleGray-500 hover:bg-appleGray-100 hover:text-appleGray-800"
  }`;
}


export default function AdminSideNav() {
  const pathname = usePathname() ?? "";
  const { admin } = useAdminAuth();
  const { unansweredMessages } = useAdminNavCounts();
  const [collapsed, setCollapsed] = useState(false);

  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.requiresCanManageAdmins || canManageAdmins(admin)
  );

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const getBadgeCount = (item) => {
    if (item.badgeKey === "unansweredMessages") return unansweredMessages;
    return 0;
  };

  const toggleCollapsed = () => setCollapsed((value) => !value);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-appleGray-200 bg-gradient-to-b from-white to-appleGray-100 transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      <div
        className={`flex h-full min-h-0 flex-col pt-0 pb-4 ${collapsed ? "px-2" : "px-3"}`}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-0 flex h-14 shrink-0 items-center border-b border-appleGray-100">
          {collapsed ? (
            /* Collapsed: just the toggle centred */
            <button
              type="button"
              onClick={toggleCollapsed}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-appleGray-400 transition-colors duration-200 hover:bg-appleGray-100 hover:text-appleGray-700"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <Icon icon="lucide:panel-left-open" className="text-[18px]" />
            </button>
          ) : (
            /* Expanded: wordmark + toggle */
            <div className="flex w-full items-center gap-2.5 px-1">
              <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-2.5" title="GIDZ UniPath Admin">
                <Image
                  src="/gidz-transperant.png"
                  alt="GIDZ UniPath"
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 object-contain"
                  priority
                />
                <div className="min-w-0">
                  <p className="montserrat truncate text-[13px] font-bold leading-tight text-appleGray-800">
                    GIDZ <span className="text-sky-500">UniPath</span>
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-appleGray-400">
                    Admin Panel
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-appleGray-300 transition-colors duration-200 hover:bg-appleGray-100 hover:text-appleGray-600"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <Icon icon="lucide:panel-left-close" className="text-[16px]" />
              </button>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 pt-3">
          {visibleNavItems.map((item) => {
            const active = item.match(pathname);
            const badge = getBadgeCount(item);
            const iconClass = `text-xl shrink-0 transition-colors duration-200 ${active ? "text-sky-500" : "text-appleGray-400"}`;
            const tooltip =
              badge > 0 && item.badgeKey === "unansweredMessages"
                ? `${item.label} — ${badge} unanswered`
                : item.label;

            const content = (
              <>
                <span className="relative shrink-0">
                  <Icon icon={item.icon} className={iconClass} />
                  {collapsed && <NavBadge count={badge} collapsed />}
                </span>
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <NavBadge count={badge} collapsed={false} />
                    {item.openInNewTab && (
                      <Icon
                        icon="material-symbols:open-in-new"
                        className="shrink-0 text-base text-appleGray-300"
                        aria-hidden
                      />
                    )}
                  </>
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
                  className={navItemClassName(false, collapsed)}
                  title={
                    badge > 0
                      ? `${badge} unanswered conversation${badge === 1 ? "" : "s"}`
                      : collapsed
                        ? tooltip
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
                className={navItemClassName(active, collapsed)}
                title={collapsed ? tooltip : undefined}
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
