export const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Applications",
    icon: "material-symbols:assignment-ind-outline",
    match: (path) =>
      path === "/admin" || path.startsWith("/admin/application/"),
  },
  {
    href: "/admin/entries",
    label: "Entries",
    icon: "lsicon:view-outline",
    match: (path) => path.startsWith("/admin/entries"),
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: "humbleicons:chats",
    openInNewTab: true,
    badgeKey: "unansweredMessages",
    match: (path) => path.startsWith("/admin/messages"),
  },
  {
    href: "/admin/check-list",
    label: "Checklist",
    icon: "material-symbols:checklist",
    match: (path) => path.startsWith("/admin/check-list"),
  },
  {
    href: "/admin/feedbacks",
    label: "Feedback",
    icon: "material-symbols:rate-review-outline",
    match: (path) => path.startsWith("/admin/feedbacks"),
  },
  {
    href: "/admin/job-seekers",
    label: "Job Seekers",
    icon: "material-symbols:work-outline",
    match: (path) => path.startsWith("/admin/job-seekers"),
  },
  {
    href: "/admin/german-life",
    label: "German life",
    icon: "material-symbols:public",
    match: (path) => path.startsWith("/admin/german-life"),
  },
  {
    href: "/admin/admins",
    label: "Admin management",
    icon: "material-symbols:admin-panel-settings-outline",
    requiresCanManageAdmins: true,
    match: (path) => path.startsWith("/admin/admins"),
  },
];

export function canManageAdmins(admin) {
  if (!admin) return false;
  if (admin.role === "super_admin") return true;
  if (admin.permissions) {
    return (
      admin.permissions.can_manage_admins ||
      (admin.permissions["admin.create"] && admin.permissions["admin.update"])
    );
  }
  return admin.role === "admin";
}

export function getAdminPageTitle(pathname) {
  const item = ADMIN_NAV_ITEMS.find((nav) => nav.match(pathname));
  if (item) return item.label;

  if (pathname.startsWith("/admin/entries")) return "Entries";
  if (pathname.startsWith("/admin/messages")) return "Messages";

  return "Admin";
}

export function getAdminInitials(admin) {
  const first = admin?.first_name?.trim()?.[0] ?? "";
  const last = admin?.last_name?.trim()?.[0] ?? "";
  if (first || last) return `${first}${last}`.toUpperCase();
  return (admin?.email?.[0] ?? "A").toUpperCase();
}

export function getAdminDisplayName(admin) {
  const full = [admin?.first_name, admin?.last_name].filter(Boolean).join(" ");
  return full || admin?.email || "Admin";
}
