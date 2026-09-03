const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

export const SITE_URL = rawSiteUrl.replace(/\/$/, "");
export const SITE_NAME = "Devcom Digital Marketing Services";
export const SITE_SHORT_NAME = "Devcom Digital";
export const SITE_DESCRIPTION =
  "One subscription, one license key: SEO, social scheduling, campaign analytics, and ad creative tools for marketing agencies and freelancers.";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
