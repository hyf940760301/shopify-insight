import axios from "axios";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

// Store Platform Types
export type StorePlatform = 
  | "shopify"
  | "woocommerce"
  | "magento"
  | "bigcommerce"
  | "squarespace"
  | "wix"
  | "prestashop"
  | "opencart"
  | "unknown";

export interface StoreDetectionResult {
  platform: StorePlatform;
  confidence: "high" | "medium" | "low";
  indicators: string[];
  isShopify: boolean;
  shopifyApiAvailable: boolean;
  errorMessage?: string;
}

// Shopify Product JSON Types
export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  src: string;
  width: number;
  height: number;
  alt: string | null;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  position: number;
  inventory_quantity?: number;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  available: boolean;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  options: { name: string; values: string[] }[];
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

// Enhanced Store Meta with website analysis
export interface StoreMeta {
  title: string;
  description: string;
  domain: string;
  favicon: string | null;
  logo: string | null;
  ogImage: string | null;
  keywords: string[];
}

// Social media links
export interface SocialLinks {
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  tiktok: string | null;
  pinterest: string | null;
  linkedin: string | null;
}

// Website technical analysis
export interface TechAnalysis {
  shopifyTheme: string | null;
  currency: string;
  language: string;
  hasReviews: boolean;
  hasWishlist: boolean;
  hasSearch: boolean;
  hasCart: boolean;
  hasNewsletter: boolean;
  hasChatWidget: boolean;
  paymentMethods: string[];
  thirdPartyApps: string[];
}

// Navigation structure
export interface NavigationItem {
  title: string;
  url: string;
  children?: NavigationItem[];
}

// Website structure analysis
export interface SiteStructure {
  mainNavigation: NavigationItem[];
  footerLinks: string[];
  collectionsCount: number;
  hasAboutPage: boolean;
  hasContactPage: boolean;
  hasFAQPage: boolean;
  hasBlogSection: boolean;
  hasReturnPolicy: boolean;
  hasShippingPolicy: boolean;
}

// SEO Analysis
export interface SEOAnalysis {
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  hasTitleTag: boolean;
  titleLength: number;
  hasOGTags: boolean;
  hasTwitterCards: boolean;
  hasStructuredData: boolean;
  canonicalUrl: string | null;
  robotsTxt: boolean;
  sitemap: boolean;
}

// Complete scraper result
export interface ScraperResult {
  meta: StoreMeta;
  products: ShopifyProduct[];
  socialLinks: SocialLinks;
  techAnalysis: TechAnalysis;
  siteStructure: SiteStructure;
  seoAnalysis: SEOAnalysis;
  rawHtml: string;
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    throw new Error("无效的 URL 格式");
  }
}

// Detect store platform type
export async function detectStoreType(domain: string): Promise<StoreDetectionResult> {
  const indicators: string[] = [];
  let platform: StorePlatform = "unknown";
  let confidence: "high" | "medium" | "low" = "low";
  let shopifyApiAvailable = false;

  try {
    // First, try to access Shopify's products.json API
    try {
      const productsResponse = await axios.get(`https://${domain}/products.json?limit=1`, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      if (productsResponse.status === 200 && productsResponse.data?.products) {
        shopifyApiAvailable = true;
        indicators.push("Shopify products.json API 可访问");
        platform = "shopify";
        confidence = "high";
      } else if (productsResponse.status === 401 || productsResponse.status === 403) {
        indicators.push(`Shopify API 返回 ${productsResponse.status} (可能是 Shopify 但禁用了 API)`);
      }
    } catch (apiError) {
      if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
        indicators.push("products.json 端点不存在");
      }
    }

    // Fetch homepage to analyze platform
    const homepageResponse = await axios.get(`https://${domain}`, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const html = homepageResponse.data;
    const $ = cheerio.load(html);

    // Check for Shopify indicators
    const shopifyIndicators = [
      { check: () => html.includes("Shopify.theme"), desc: "Shopify.theme 对象" },
      { check: () => html.includes("cdn.shopify.com"), desc: "Shopify CDN" },
      { check: () => html.includes("shopify-section"), desc: "Shopify section 标记" },
      { check: () => html.includes("/cart.js"), desc: "Shopify cart.js" },
      { check: () => $('link[href*="cdn.shopify.com"]').length > 0, desc: "Shopify CDN 链接" },
      { check: () => $('script[src*="cdn.shopify.com"]').length > 0, desc: "Shopify 脚本" },
      { check: () => html.includes("myshopify.com"), desc: "myshopify.com 引用" },
      { check: () => $('meta[name="shopify-checkout-api-token"]').length > 0, desc: "Shopify checkout token" },
    ];

    let shopifyScore = 0;
    for (const indicator of shopifyIndicators) {
      if (indicator.check()) {
        shopifyScore++;
        indicators.push(`✓ 检测到 ${indicator.desc}`);
      }
    }

    if (shopifyScore >= 3) {
      platform = "shopify";
      confidence = shopifyScore >= 5 ? "high" : "medium";
      if (!shopifyApiAvailable) {
        indicators.push("⚠️ 确认是 Shopify 店铺，但 products.json API 被禁用");
      }
    }

    // Check for WooCommerce
    const wooIndicators = [
      () => html.includes("woocommerce"),
      () => html.includes("wc-"),
      () => html.includes("/wp-content/"),
      () => html.includes("/wp-includes/"),
      () => $('body.woocommerce').length > 0,
      () => html.includes("add_to_cart"),
    ];
    const wooScore = wooIndicators.filter((check) => check()).length;
    if (wooScore >= 3 && platform === "unknown") {
      platform = "woocommerce";
      confidence = wooScore >= 4 ? "high" : "medium";
      indicators.push(`检测到 WooCommerce 特征 (${wooScore} 个指标)`);
    }

    // Check for Magento
    const magentoIndicators = [
      () => html.includes("Magento"),
      () => html.includes("mage/"),
      () => html.includes("/static/version"),
      () => html.includes("Magento_"),
      () => $('script[src*="requirejs"]').length > 0 && html.includes("mage"),
    ];
    const magentoScore = magentoIndicators.filter((check) => check()).length;
    if (magentoScore >= 2 && platform === "unknown") {
      platform = "magento";
      confidence = magentoScore >= 3 ? "high" : "medium";
      indicators.push(`检测到 Magento 特征 (${magentoScore} 个指标)`);
    }

    // Check for BigCommerce
    const bigcommerceIndicators = [
      () => html.includes("bigcommerce"),
      () => html.includes("BigCommerce"),
      () => html.includes("/stencil/"),
      () => $('script[src*="bigcommerce.com"]').length > 0,
    ];
    const bigcommerceScore = bigcommerceIndicators.filter((check) => check()).length;
    if (bigcommerceScore >= 2 && platform === "unknown") {
      platform = "bigcommerce";
      confidence = bigcommerceScore >= 3 ? "high" : "medium";
      indicators.push(`检测到 BigCommerce 特征 (${bigcommerceScore} 个指标)`);
    }

    // Check for Squarespace
    const squarespaceIndicators = [
      () => html.includes("squarespace"),
      () => html.includes("static.squarespace.com"),
      () => $('script[src*="squarespace"]').length > 0,
    ];
    if (squarespaceIndicators.filter((check) => check()).length >= 2 && platform === "unknown") {
      platform = "squarespace";
      confidence = "medium";
      indicators.push("检测到 Squarespace 特征");
    }

    // Check for Wix
    const wixIndicators = [
      () => html.includes("wix.com"),
      () => html.includes("static.wixstatic.com"),
      () => html.includes("wix-code"),
    ];
    if (wixIndicators.filter((check) => check()).length >= 2 && platform === "unknown") {
      platform = "wix";
      confidence = "medium";
      indicators.push("检测到 Wix 特征");
    }

    // Check for PrestaShop
    if ((html.includes("prestashop") || html.includes("PrestaShop")) && platform === "unknown") {
      platform = "prestashop";
      confidence = "medium";
      indicators.push("检测到 PrestaShop 特征");
    }

    // Check for OpenCart
    if ((html.includes("opencart") || html.includes("route=common/home")) && platform === "unknown") {
      platform = "opencart";
      confidence = "medium";
      indicators.push("检测到 OpenCart 特征");
    }

  } catch (error) {
    indicators.push(`网站访问错误: ${error instanceof Error ? error.message : "未知错误"}`);
  }

  // Generate error message if needed
  let errorMessage: string | undefined;
  if (platform !== "shopify") {
    const platformNames: Record<StorePlatform, string> = {
      shopify: "Shopify",
      woocommerce: "WooCommerce (WordPress)",
      magento: "Magento",
      bigcommerce: "BigCommerce",
      squarespace: "Squarespace",
      wix: "Wix",
      prestashop: "PrestaShop",
      opencart: "OpenCart",
      unknown: "未知平台",
    };
    errorMessage = `该网站使用的是 ${platformNames[platform]} 平台，不是 Shopify 店铺。本工具目前仅支持分析 Shopify 店铺。`;
  } else if (!shopifyApiAvailable) {
    errorMessage = "该店铺是 Shopify 网站，但已禁用 products.json 公开 API，无法获取商品数据。这可能是店铺设置或使用了第三方应用限制了访问。";
  }

  return {
    platform,
    confidence,
    indicators,
    isShopify: platform === "shopify",
    shopifyApiAvailable,
    errorMessage,
  };
}

// Fetch and analyze homepage
async function fetchAndAnalyzeHomepage(domain: string): Promise<{
  meta: StoreMeta;
  socialLinks: SocialLinks;
  techAnalysis: TechAnalysis;
  siteStructure: SiteStructure;
  seoAnalysis: SEOAnalysis;
  rawHtml: string;
}> {
  const response = await axios.get(`https://${domain}`, {
    timeout: 20000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  const $ = cheerio.load(response.data);
  const html = response.data as string;

  // Extract Store Meta
  const meta: StoreMeta = {
    title: $("title").text().trim() || domain,
    description:
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "",
    domain,
    favicon:
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      null,
    logo:
      $(".header__logo img, .site-header__logo img, [class*='logo'] img")
        .first()
        .attr("src") || null,
    ogImage: $('meta[property="og:image"]').attr("content") || null,
    keywords:
      $('meta[name="keywords"]')
        .attr("content")
        ?.split(",")
        .map((k) => k.trim())
        .filter(Boolean) || [],
  };

  // Extract Social Links
  const socialLinks: SocialLinks = {
    facebook: extractSocialLink($, html, "facebook"),
    instagram: extractSocialLink($, html, "instagram"),
    twitter: extractSocialLink($, html, "twitter"),
    youtube: extractSocialLink($, html, "youtube"),
    tiktok: extractSocialLink($, html, "tiktok"),
    pinterest: extractSocialLink($, html, "pinterest"),
    linkedin: extractSocialLink($, html, "linkedin"),
  };

  // Technical Analysis
  const techAnalysis: TechAnalysis = {
    shopifyTheme: extractShopifyTheme(html),
    currency: extractCurrency($, html),
    language: $("html").attr("lang") || "en",
    hasReviews: detectFeature($, html, [
      "review",
      "rating",
      "star",
      "judge.me",
      "loox",
      "stamped",
      "yotpo",
    ]),
    hasWishlist: detectFeature($, html, ["wishlist", "favorite", "save-for-later"]),
    hasSearch: $('input[type="search"], .search-form, [class*="search"]').length > 0,
    hasCart: $('[class*="cart"], .cart-icon, #cart').length > 0,
    hasNewsletter: detectFeature($, html, [
      "newsletter",
      "subscribe",
      "mailchimp",
      "klaviyo",
    ]),
    hasChatWidget: detectFeature($, html, [
      "intercom",
      "zendesk",
      "tidio",
      "crisp",
      "drift",
      "livechat",
      "gorgias",
    ]),
    paymentMethods: extractPaymentMethods($, html),
    thirdPartyApps: extractThirdPartyApps(html),
  };

  // Site Structure
  const siteStructure: SiteStructure = {
    mainNavigation: extractNavigation($),
    footerLinks: extractFooterLinks($),
    collectionsCount: countCollections($),
    hasAboutPage: hasPage($, ["about", "about-us", "our-story"]),
    hasContactPage: hasPage($, ["contact", "contact-us"]),
    hasFAQPage: hasPage($, ["faq", "faqs", "help", "support"]),
    hasBlogSection: hasPage($, ["blog", "blogs", "news", "articles"]),
    hasReturnPolicy: hasPage($, ["return", "refund", "exchange"]),
    hasShippingPolicy: hasPage($, ["shipping", "delivery"]),
  };

  // SEO Analysis
  const seoAnalysis: SEOAnalysis = {
    hasMetaDescription: !!$('meta[name="description"]').attr("content"),
    metaDescriptionLength:
      $('meta[name="description"]').attr("content")?.length || 0,
    hasTitleTag: !!$("title").text(),
    titleLength: $("title").text().length,
    hasOGTags: !!$('meta[property^="og:"]').length,
    hasTwitterCards: !!$('meta[name^="twitter:"]').length,
    hasStructuredData:
      $('script[type="application/ld+json"]').length > 0,
    canonicalUrl: $('link[rel="canonical"]').attr("href") || null,
    robotsTxt: false, // Will be checked separately
    sitemap: false, // Will be checked separately
  };

  // Check robots.txt and sitemap
  try {
    await axios.head(`https://${domain}/robots.txt`, { timeout: 5000 });
    seoAnalysis.robotsTxt = true;
  } catch {
    /* ignore */
  }

  try {
    await axios.head(`https://${domain}/sitemap.xml`, { timeout: 5000 });
    seoAnalysis.sitemap = true;
  } catch {
    /* ignore */
  }

  return {
    meta,
    socialLinks,
    techAnalysis,
    siteStructure,
    seoAnalysis,
    rawHtml: html.substring(0, 50000), // Limit for AI context
  };
}

// Helper functions
function extractSocialLink(
  $: cheerio.CheerioAPI,
  html: string,
  platform: string
): string | null {
  const patterns: Record<string, RegExp> = {
    facebook: /https?:\/\/(www\.)?facebook\.com\/[^\s"'<>]+/i,
    instagram: /https?:\/\/(www\.)?instagram\.com\/[^\s"'<>]+/i,
    twitter: /https?:\/\/(www\.)?(twitter|x)\.com\/[^\s"'<>]+/i,
    youtube: /https?:\/\/(www\.)?youtube\.com\/[^\s"'<>]+/i,
    tiktok: /https?:\/\/(www\.)?tiktok\.com\/@[^\s"'<>]+/i,
    pinterest: /https?:\/\/(www\.)?pinterest\.com\/[^\s"'<>]+/i,
    linkedin: /https?:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/i,
  };

  // Try from links first
  const link = $(`a[href*="${platform}"]`).first().attr("href");
  if (link) return link;

  // Try regex on HTML
  const match = html.match(patterns[platform]);
  return match ? match[0] : null;
}

function extractShopifyTheme(html: string): string | null {
  const themeMatch = html.match(/Shopify\.theme\s*=\s*{[^}]*"name"\s*:\s*"([^"]+)"/);
  if (themeMatch) return themeMatch[1];

  const themeIdMatch = html.match(/theme_store_id['"]\s*:\s*(\d+)/);
  if (themeIdMatch) return `Theme ID: ${themeIdMatch[1]}`;

  return null;
}

function extractCurrency($: cheerio.CheerioAPI, html: string): string {
  const currencyMeta = $('meta[property="og:price:currency"]').attr("content");
  if (currencyMeta) return currencyMeta;

  const currencyMatch = html.match(/currency['"]\s*:\s*['"]([A-Z]{3})['"]/i);
  if (currencyMatch) return currencyMatch[1];

  // Detect from price symbols
  if (html.includes("$")) return "USD";
  if (html.includes("€")) return "EUR";
  if (html.includes("£")) return "GBP";
  if (html.includes("¥")) return "CNY";

  return "USD";
}

function detectFeature(
  $: cheerio.CheerioAPI,
  html: string,
  keywords: string[]
): boolean {
  const lowerHtml = html.toLowerCase();
  return keywords.some(
    (keyword) =>
      lowerHtml.includes(keyword.toLowerCase()) ||
      $(`[class*="${keyword}"], [id*="${keyword}"]`).length > 0
  );
}

function extractPaymentMethods($: cheerio.CheerioAPI, html: string): string[] {
  const methods: string[] = [];
  const lowerHtml = html.toLowerCase();

  const paymentKeywords = [
    { name: "Visa", keywords: ["visa"] },
    { name: "Mastercard", keywords: ["mastercard", "master-card"] },
    { name: "American Express", keywords: ["amex", "american-express"] },
    { name: "PayPal", keywords: ["paypal"] },
    { name: "Apple Pay", keywords: ["apple-pay", "applepay"] },
    { name: "Google Pay", keywords: ["google-pay", "googlepay"] },
    { name: "Shop Pay", keywords: ["shop-pay", "shoppay"] },
    { name: "Klarna", keywords: ["klarna"] },
    { name: "Afterpay", keywords: ["afterpay"] },
    { name: "Affirm", keywords: ["affirm"] },
  ];

  for (const { name, keywords } of paymentKeywords) {
    if (keywords.some((k) => lowerHtml.includes(k))) {
      methods.push(name);
    }
  }

  return methods;
}

function extractThirdPartyApps(html: string): string[] {
  const apps: string[] = [];
  const lowerHtml = html.toLowerCase();

  const appPatterns = [
    { name: "Klaviyo", pattern: "klaviyo" },
    { name: "Judge.me", pattern: "judge.me" },
    { name: "Loox", pattern: "loox" },
    { name: "Yotpo", pattern: "yotpo" },
    { name: "Stamped.io", pattern: "stamped" },
    { name: "Privy", pattern: "privy" },
    { name: "Omnisend", pattern: "omnisend" },
    { name: "Smile.io", pattern: "smile.io" },
    { name: "Bold", pattern: "bold-" },
    { name: "ReCharge", pattern: "recharge" },
    { name: "Gorgias", pattern: "gorgias" },
    { name: "Zendesk", pattern: "zendesk" },
    { name: "Intercom", pattern: "intercom" },
    { name: "Hotjar", pattern: "hotjar" },
    { name: "Lucky Orange", pattern: "luckyorange" },
    { name: "Google Analytics", pattern: "google-analytics" },
    { name: "Facebook Pixel", pattern: "fbevents" },
    { name: "TikTok Pixel", pattern: "tiktok" },
    { name: "Pinterest Tag", pattern: "pintrk" },
    { name: "Shopify Analytics", pattern: "shopify-analytics" },
  ];

  for (const { name, pattern } of appPatterns) {
    if (lowerHtml.includes(pattern)) {
      apps.push(name);
    }
  }

  return apps;
}

function extractNavigation($: cheerio.CheerioAPI): NavigationItem[] {
  const navItems: NavigationItem[] = [];

  $(
    "nav a, .header a, .main-nav a, .site-nav a, [class*='navigation'] a"
  ).each((_, el) => {
    const title = $(el).text().trim();
    const url = $(el).attr("href") || "";

    if (
      title &&
      url &&
      !url.startsWith("#") &&
      !url.includes("javascript:") &&
      title.length < 50
    ) {
      // Avoid duplicates
      if (!navItems.find((item) => item.url === url)) {
        navItems.push({ title, url });
      }
    }
  });

  return navItems.slice(0, 20); // Limit to 20 items
}

function extractFooterLinks($: cheerio.CheerioAPI): string[] {
  const links: string[] = [];

  $("footer a").each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 50) {
      links.push(text);
    }
  });

  return [...new Set(links)].slice(0, 30);
}

function countCollections($: cheerio.CheerioAPI): number {
  return $('a[href*="/collections/"]').length;
}

function hasPage($: cheerio.CheerioAPI, keywords: string[]): boolean {
  for (const keyword of keywords) {
    if ($(`a[href*="${keyword}"]`).length > 0) {
      return true;
    }
  }
  return false;
}

// Fetch products from Shopify JSON API
async function fetchProducts(
  domain: string,
  maxPages: number = 3,
  maxProducts: number = 750
): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let page = 1;

  while (page <= maxPages && allProducts.length < maxProducts) {
    try {
      const url = `https://${domain}/products.json?limit=250&page=${page}`;
      console.log(`Fetching: ${url}`);

      const response = await axios.get<ShopifyProductsResponse>(url, {
        timeout: 20000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      });

      const products = response.data.products;

      if (!products || products.length === 0) {
        console.log(`No more products found at page ${page}`);
        break;
      }

      // Convert body_html to Markdown
      const processedProducts = products.map((product) => ({
        ...product,
        body_html: product.body_html
          ? turndownService.turndown(product.body_html)
          : "",
        tags: Array.isArray(product.tags)
          ? product.tags
          : typeof product.tags === "string"
            ? (product.tags as string)
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
      }));

      allProducts.push(...processedProducts);
      console.log(
        `Page ${page}: Got ${products.length} products, Total: ${allProducts.length}`
      );

      if (products.length < 250) {
        break;
      }

      page++;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(
            "该网站不是 Shopify 店铺，或者未开放 products.json 接口"
          );
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error("该店铺禁止访问商品数据");
        }
      }
      console.error(`Error fetching page ${page}:`, error);
      break;
    }
  }

  if (allProducts.length === 0) {
    throw new Error("未能获取到任何商品数据，请确认这是一个有效的 Shopify 店铺");
  }

  return allProducts.slice(0, maxProducts);
}

// Fetch collections data
async function fetchCollections(
  domain: string
): Promise<{ title: string; handle: string; productsCount: number }[]> {
  try {
    const response = await axios.get(`https://${domain}/collections.json`, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    return (response.data.collections || []).map(
      (c: { title: string; handle: string; products_count?: number }) => ({
        title: c.title,
        handle: c.handle,
        productsCount: c.products_count || 0,
      })
    );
  } catch {
    return [];
  }
}

// Main scraper function
export async function scrapeShopifyStore(url: string): Promise<ScraperResult> {
  const domain = extractDomain(url);

  console.log(`Starting comprehensive scrape for domain: ${domain}`);

  // Step 1: Detect store platform type
  console.log(`Detecting store platform for: ${domain}`);
  const storeDetection = await detectStoreType(domain);
  
  console.log(`Platform detected: ${storeDetection.platform} (confidence: ${storeDetection.confidence})`);
  console.log(`Indicators:`, storeDetection.indicators);

  // If not Shopify or API not available, throw detailed error
  if (!storeDetection.isShopify) {
    const platformNames: Record<StorePlatform, string> = {
      shopify: "Shopify",
      woocommerce: "WooCommerce (WordPress)",
      magento: "Magento",
      bigcommerce: "BigCommerce",
      squarespace: "Squarespace",
      wix: "Wix",
      prestashop: "PrestaShop",
      opencart: "OpenCart",
      unknown: "未知平台",
    };
    
    const errorDetails = {
      type: "PLATFORM_NOT_SUPPORTED",
      platform: storeDetection.platform,
      platformName: platformNames[storeDetection.platform],
      confidence: storeDetection.confidence,
      indicators: storeDetection.indicators,
      message: storeDetection.errorMessage || `检测到该网站使用 ${platformNames[storeDetection.platform]}，不是 Shopify 店铺`,
    };
    
    const error = new Error(JSON.stringify(errorDetails));
    error.name = "PlatformNotSupportedError";
    throw error;
  }

  if (!storeDetection.shopifyApiAvailable) {
    const errorDetails = {
      type: "SHOPIFY_API_DISABLED",
      platform: "shopify",
      platformName: "Shopify",
      confidence: storeDetection.confidence,
      indicators: storeDetection.indicators,
      message: "该店铺是 Shopify 网站，但已禁用 products.json 公开 API，无法获取商品数据。这可能是店铺设置或使用了第三方应用限制了访问。",
    };
    
    const error = new Error(JSON.stringify(errorDetails));
    error.name = "ShopifyApiDisabledError";
    throw error;
  }

  // Step 2: Fetch all data in parallel
  const [homepageData, products] = await Promise.all([
    fetchAndAnalyzeHomepage(domain),
    fetchProducts(domain),
  ]);

  // Fetch collections (non-blocking)
  fetchCollections(domain).then((collections) => {
    console.log(`Found ${collections.length} collections`);
  });

  console.log(`Scraping complete. Found ${products.length} products`);

  return {
    meta: homepageData.meta,
    products,
    socialLinks: homepageData.socialLinks,
    techAnalysis: homepageData.techAnalysis,
    siteStructure: homepageData.siteStructure,
    seoAnalysis: homepageData.seoAnalysis,
    rawHtml: homepageData.rawHtml,
  };
}
