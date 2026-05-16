"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import {
  getAdminDisplayName,
  getAdminInitials,
  getAdminPageTitle,
} from "./adminNavConfig";

export default function AdminTopNav() {
  const pathname = usePathname() ?? "";
  const { admin, logout } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const pageTitle = getAdminPageTitle(pathname);
  const displayName = getAdminDisplayName(admin);
  const initials = getAdminInitials(admin);
  const roleLabel = admin?.role?.replace(/_/g, " ") ?? "Admin";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-appleGray-200 bg-white/98 px-6 backdrop-blur-md shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col justify-center">
        <h1 className="text-base font-semibold tracking-tight text-appleGray-900">{pageTitle}</h1>
        <p className="text-[11px] font-medium uppercase tracking-widest text-appleGray-400">GIDZ UniPath</p>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-2xl border border-appleGray-200 bg-appleGray-50 py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:bg-white hover:border-appleGray-300 hover:shadow-soft"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <span className="relative">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white shadow-sm">
              {initials}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[130px] truncate text-sm font-semibold text-appleGray-800">
              {displayName}
            </span>
            <span className="block text-[11px] capitalize text-appleGray-400 font-medium">
              {roleLabel}
            </span>
          </span>
          <Icon
            icon="material-symbols:keyboard-arrow-down"
            className={`text-lg text-appleGray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-appleGray-200 bg-white shadow-medium">
            <div className="border-b border-appleGray-100 bg-gradient-to-r from-appleGray-50 to-white px-4 py-3">
              <p className="truncate text-sm font-semibold text-appleGray-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-appleGray-400 mt-0.5">{admin?.email}</p>
            </div>
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              >
                <Icon icon="material-symbols:logout" className="text-xl" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
