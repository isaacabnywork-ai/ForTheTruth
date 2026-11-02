import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  compress: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "admin.forthetruth.in" },
      { protocol: "https", hostname: "forthetruth.in" },
      { protocol: "https", hostname: "demos.abnyweb.in" },
      { protocol: "https", hostname: "**.wp.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
      ],
    },
    {
      source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff2|woff)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
  redirects: async () => [
    // 1. Shop pagination (Legacy WooCommerce URLs indexed by Google)
    {
      source: "/shop/page/1",
      destination: "/shop",
      permanent: true,
    },
    {
      source: "/shop/page/:page",
      destination: "/shop?page=:page",
      permanent: true,
    },
    // 2. Products alias pagination & catalog
    {
      source: "/products/page/1",
      destination: "/shop",
      permanent: true,
    },
    {
      source: "/products/page/:page",
      destination: "/shop?page=:page",
      permanent: true,
    },
    {
      source: "/products",
      destination: "/shop",
      permanent: true,
    },
    // 3. Category pagination (Legacy WooCommerce URLs)
    {
      source: "/categories/:slug/page/1",
      destination: "/categories/:slug",
      permanent: true,
    },
    {
      source: "/categories/:slug/page/:page",
      destination: "/categories/:slug?page=:page",
      permanent: true,
    },
    // 4. WooCommerce default category prefixes: /product-category/ and /category/
    {
      source: "/product-category/:slug/page/1",
      destination: "/categories/:slug",
      permanent: true,
    },
    {
      source: "/product-category/:slug/page/:page",
      destination: "/categories/:slug?page=:page",
      permanent: true,
    },
    {
      source: "/product-category/:slug",
      destination: "/categories/:slug",
      permanent: true,
    },
    {
      source: "/category/:slug/page/1",
      destination: "/categories/:slug",
      permanent: true,
    },
    {
      source: "/category/:slug/page/:page",
      destination: "/categories/:slug?page=:page",
      permanent: true,
    },
    {
      source: "/category/:slug",
      destination: "/categories/:slug",
      permanent: true,
    },
    // 5. WooCommerce default single product: /product/:slug (singular)
    {
      source: "/product/:slug",
      destination: "/products/:slug",
      permanent: true,
    },
    // 6. WooCommerce product tags: /product-tag/:slug
    {
      source: "/product-tag/:slug/page/:page",
      destination: "/shop?tag=:slug&page=:page",
      permanent: true,
    },
    {
      source: "/product-tag/:slug",
      destination: "/shop?tag=:slug",
      permanent: true,
    },
    // 7. General legacy redirects
    {
      source: "/church-resources",
      destination: "/contact",
      permanent: true,
    },
  ],
  rewrites: async () => [
    {
      source: "/wp-content/uploads/:path*",
      destination: "https://admin.forthetruth.in/wp-content/uploads/:path*",
    },
  ],
};

export default nextConfig;
