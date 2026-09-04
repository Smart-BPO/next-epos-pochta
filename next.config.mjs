// @ts-check
// Plain JS so Hostinger (glibc < 2.29) can load config without native SWC.

const PROD_SITE = "https://epospochta.uz";
const siteUrl = PROD_SITE;

/**
 * @param {string} url
 */
function siteOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return PROD_SITE;
  }
}

/** Mirror of `isIndexableDeployment` — keep inline; next.config cannot use `@/` imports. */
function isIndexableDeployment() {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }
  if (process.env.NODE_ENV === "development") return false;
  return true;
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const denyFramingHeader = { key: "X-Frame-Options", value: "DENY" };
const denyFramingCspHeader = {
  key: "Content-Security-Policy",
  value: "frame-ancestors 'none'",
};

const publicFramingHeader = {
  key: "Content-Security-Policy",
  value: "frame-ancestors 'self'",
};

const noindexRobotsHeader = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow, noarchive",
};

const indexable = isIndexableDeployment();

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
      allowedOrigins: [
        siteOrigin(siteUrl),
        "epospochta.uz",
        "www.epospochta.uz",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 75, 85, 90],
    imageSizes: [32, 48, 64, 96, 128, 256, 320, 384, 640],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return [
      {
        source: "/uz",
        destination: "/",
        permanent: true,
      },
      {
        source: "/uz/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          denyFramingHeader,
          denyFramingCspHeader,
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          publicFramingHeader,
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=0, must-revalidate",
          },
          ...(indexable ? [] : [noindexRobotsHeader]),
        ],
      },
    ];
  },
};

export default nextConfig;
