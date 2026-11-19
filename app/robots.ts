import type { MetadataRoute } from "next";
import { site } from "./site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/gestao", "/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
