import type { MetadataRoute } from "next";

const siteUrl = "https://support-ai-web-eosin.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/login",
        "/signup",
        "/chat/",
        "/widget-demo",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
