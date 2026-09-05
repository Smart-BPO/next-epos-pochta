import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl, isIndexableDeployment } from "@/utils/seo/indexing";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalSiteUrl();
  if (!isIndexableDeployment()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/webapp/",
        "/tracking/",
        "/request-price/",
        "/business/connect/",
        "/ru/tracking/",
        "/ru/request-price/",
        "/ru/business/connect/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
