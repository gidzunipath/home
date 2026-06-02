const DEFAULT_EMAIL_SITE_URL = "https://www.gidzunipath.com";

/** Public site origin for email HTML (never use window.location.origin in emails). */
export function getEmailSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!configured || configured.includes("localhost")) {
    return DEFAULT_EMAIL_SITE_URL;
  }
  return configured;
}

/** Absolute URL for a static asset referenced in outbound email HTML. */
export function emailAssetUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getEmailSiteUrl()}${normalizedPath}`;
}
