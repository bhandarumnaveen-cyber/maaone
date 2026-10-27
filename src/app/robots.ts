import type { MetadataRoute } from "next";
import { site } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/api/", "/login", "/signup", "/auth/"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
