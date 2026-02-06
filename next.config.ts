import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 部署需要 standalone 输出
  output: "standalone",
  
  // 图片优化：允许 Shopify CDN 图片
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "*.myshopify.com",
      },
    ],
  },
  
  // 生产环境优化
  compress: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
