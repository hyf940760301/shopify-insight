import {
  ScraperResult,
  ShopifyProduct,
  SocialLinks,
  TechAnalysis,
  SiteStructure,
  SEOAnalysis,
  StoreMeta,
} from "./shopify-scraper";

// Price Statistics
export interface PriceStats {
  total_products: number;
  average_price: number;
  median_price: number;
  min_price: number;
  max_price: number;
  price_currency: string;
  price_std_deviation: number;
}

// Tag Analysis
export interface TagCount {
  tag: string;
  count: number;
  percentage: number;
}

// Price Distribution Bucket
export interface PriceDistributionBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

// Vendor Analysis
export interface VendorAnalysis {
  vendor: string;
  productCount: number;
  percentage: number;
  avgPrice: number;
  priceRange: { min: number; max: number };
}

// Product Type Analysis
export interface ProductTypeAnalysis {
  type: string;
  count: number;
  percentage: number;
  avgPrice: number;
}

// Discount Analysis
export interface DiscountAnalysis {
  totalProductsWithDiscount: number;
  discountPercentage: number;
  averageDiscountPercent: number;
  maxDiscountPercent: number;
  discountDistribution: { range: string; count: number }[];
}

// Variant Analysis
export interface VariantAnalysis {
  totalVariants: number;
  avgVariantsPerProduct: number;
  productsWithMultipleVariants: number;
  optionTypes: { name: string; uniqueValues: number; topValues: string[] }[];
}

// Image Analysis
export interface ImageAnalysis {
  totalImages: number;
  avgImagesPerProduct: number;
  productsWithoutImages: number;
  productsWithAltText: number;
  altTextPercentage: number;
}

// Timeline Analysis
export interface TimelineAnalysis {
  oldestProduct: string | null;
  newestProduct: string | null;
  publishingFrequency: { month: string; count: number }[];
  avgProductsPerMonth: number;
}

// Inventory Status
export interface InventoryAnalysis {
  inStockProducts: number;
  outOfStockProducts: number;
  inStockPercentage: number;
}

// Product Variant Detail
export interface ProductVariantDetail {
  id: number;
  title: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
}

// Product Option
export interface ProductOption {
  name: string;
  values: string[];
}

// Enhanced Product Detail for full listing
export interface ProductDetail {
  id: number;
  title: string;
  handle: string;
  url: string;
  
  // Pricing
  price: number;
  compare_at_price: number | null;
  discount_percent: number | null;
  price_range: { min: number; max: number };
  
  // Images
  primary_image: string | null;
  images: { src: string; alt: string | null }[];
  image_count: number;
  
  // Classification
  vendor: string;
  product_type: string;
  tags: string[];
  
  // Variants & Options
  variants: ProductVariantDetail[];
  variant_count: number;
  options: ProductOption[];
  has_multiple_variants: boolean;
  
  // Description
  description: string;
  description_length: number;
  
  // Dates
  published_at: string;
  created_at: string;
  updated_at: string;
  days_since_published: number;
  
  // Availability
  available: boolean;
  total_inventory: number | null;
  
  // AI-inferred insights
  insights: {
    price_tier: "budget" | "mid-range" | "premium" | "luxury";
    target_audience: string[];
    product_category: string;
    seasonality: string | null;
    key_features: string[];
    competitive_position: string;
  };
}

// Website Health Score
export interface WebsiteHealthScore {
  overall: number;
  seo: number;
  ux: number;
  trust: number;
  marketing: number;
  details: { category: string; item: string; passed: boolean; weight: number }[];
}

// Detailed Score Item - transparent scoring criteria
export interface ScoreItem {
  category: string;
  item: string;
  passed: boolean;
  weight: number;
  detail: string; // human-readable explanation with actual data
  actualValue: string; // the actual measured value
  threshold: string; // the threshold for passing
}

// Detailed Score with breakdown and benchmark
export interface DetailedScore {
  overall: number;
  items: ScoreItem[];
  benchmark: number; // industry average benchmark for Shopify stores
  benchmarkLabel: string;
}

// Store-level scores - all data-driven, no AI black box
export interface StoreScores {
  product: DetailedScore;
  operations: DetailedScore;
  marketing: DetailedScore;
}

// AI Context for comprehensive analysis
export interface AIContext {
  store_meta: StoreMeta;
  stats: PriceStats;
  top_tags: TagCount[];
  vendor_analysis: VendorAnalysis[];
  product_type_analysis: ProductTypeAnalysis[];
  discount_analysis: DiscountAnalysis;
  variant_analysis: VariantAnalysis;
  image_analysis: ImageAnalysis;
  timeline_analysis: TimelineAnalysis;
  inventory_analysis: InventoryAnalysis;
  social_links: SocialLinks;
  tech_analysis: TechAnalysis;
  site_structure: SiteStructure;
  seo_analysis: SEOAnalysis;
  website_health: WebsiteHealthScore;
  sample_products: ProductDetail[];
}

// Complete Aggregated Data
export interface AggregatedData {
  stats: PriceStats;
  tag_cloud: TagCount[];
  price_distribution: PriceDistributionBucket[];
  vendor_analysis: VendorAnalysis[];
  product_type_analysis: ProductTypeAnalysis[];
  discount_analysis: DiscountAnalysis;
  variant_analysis: VariantAnalysis;
  image_analysis: ImageAnalysis;
  timeline_analysis: TimelineAnalysis;
  inventory_analysis: InventoryAnalysis;
  website_health: WebsiteHealthScore;
  store_scores: StoreScores;
  // Full product catalog
  all_products: ProductDetail[];
  ai_context: AIContext;
}

// Helper: Get price from product
function getProductPrice(product: ShopifyProduct): number {
  if (product.variants && product.variants.length > 0) {
    const price = parseFloat(product.variants[0].price);
    return isNaN(price) ? 0 : price;
  }
  return 0;
}

// Helper: Get all variant prices
function getAllPrices(product: ShopifyProduct): number[] {
  if (!product.variants) return [];
  return product.variants
    .map((v) => parseFloat(v.price))
    .filter((p) => !isNaN(p) && p > 0);
}

// Helper: Get compare at price
function getCompareAtPrice(product: ShopifyProduct): number | null {
  if (product.variants && product.variants.length > 0) {
    const price = product.variants[0].compare_at_price;
    if (price) {
      const parsed = parseFloat(price);
      return isNaN(parsed) ? null : parsed;
    }
  }
  return null;
}

// Helper: Calculate discount percentage
function getDiscountPercent(product: ShopifyProduct): number | null {
  const price = getProductPrice(product);
  const compareAt = getCompareAtPrice(product);
  if (compareAt && compareAt > price && price > 0) {
    return Math.round(((compareAt - price) / compareAt) * 100);
  }
  return null;
}

// Helper: Get primary image
function getPrimaryImage(product: ShopifyProduct): string | null {
  if (product.images && product.images.length > 0) {
    return product.images[0].src;
  }
  return null;
}

// Helper: Calculate median
function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Helper: Calculate standard deviation
function calculateStdDev(numbers: number[], mean: number): number {
  if (numbers.length === 0) return 0;
  const squareDiffs = numbers.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff =
    squareDiffs.reduce((sum, value) => sum + value, 0) / numbers.length;
  return Math.sqrt(avgSquareDiff);
}

// Helper: Days since date
function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper: Infer price tier
function inferPriceTier(
  price: number,
  avgPrice: number
): "budget" | "mid-range" | "premium" | "luxury" {
  if (price < avgPrice * 0.5) return "budget";
  if (price < avgPrice * 1.2) return "mid-range";
  if (price < avgPrice * 2.5) return "premium";
  return "luxury";
}

// Helper: Infer target audience from tags and price
function inferTargetAudience(
  tags: string[],
  price: number,
  avgPrice: number,
  productType: string
): string[] {
  const audiences: string[] = [];
  const lowerTags = tags.map((t) => t.toLowerCase());

  // Price-based inference
  if (price < avgPrice * 0.6) {
    audiences.push("价格敏感型消费者");
    audiences.push("学生群体");
  } else if (price > avgPrice * 2) {
    audiences.push("高收入人群");
    audiences.push("品质追求者");
  } else {
    audiences.push("中产阶级");
  }

  // Tag-based inference
  if (lowerTags.some((t) => t.includes("women") || t.includes("女"))) {
    audiences.push("女性消费者");
  }
  if (lowerTags.some((t) => t.includes("men") || t.includes("男"))) {
    audiences.push("男性消费者");
  }
  if (lowerTags.some((t) => t.includes("kid") || t.includes("child") || t.includes("儿童"))) {
    audiences.push("家长/儿童市场");
  }
  if (lowerTags.some((t) => t.includes("gift") || t.includes("礼"))) {
    audiences.push("礼品购买者");
  }
  if (lowerTags.some((t) => t.includes("sport") || t.includes("fitness") || t.includes("运动"))) {
    audiences.push("运动爱好者");
  }
  if (lowerTags.some((t) => t.includes("eco") || t.includes("sustainable") || t.includes("环保"))) {
    audiences.push("环保意识消费者");
  }
  if (lowerTags.some((t) => t.includes("premium") || t.includes("luxury"))) {
    audiences.push("奢侈品爱好者");
  }
  if (lowerTags.some((t) => t.includes("office") || t.includes("work") || t.includes("办公"))) {
    audiences.push("职场人士");
  }

  // Product type based
  if (productType) {
    const lowerType = productType.toLowerCase();
    if (lowerType.includes("shirt") || lowerType.includes("dress")) {
      audiences.push("时尚追求者");
    }
    if (lowerType.includes("accessory") || lowerType.includes("accessories")) {
      audiences.push("配饰爱好者");
    }
  }

  return [...new Set(audiences)].slice(0, 4);
}

// Helper: Infer key features from description
function inferKeyFeatures(description: string, tags: string[]): string[] {
  const features: string[] = [];

  if (!description) return tags.slice(0, 3);

  const lowerDesc = description.toLowerCase();

  // Material keywords
  const materials = ["cotton", "棉", "silk", "丝", "leather", "皮", "wool", "羊毛", "organic", "有机"];
  materials.forEach((m) => {
    if (lowerDesc.includes(m)) features.push(`材质: ${m}`);
  });

  // Quality keywords
  if (lowerDesc.includes("premium") || lowerDesc.includes("高品质")) features.push("高品质");
  if (lowerDesc.includes("handmade") || lowerDesc.includes("手工")) features.push("手工制作");
  if (lowerDesc.includes("durable") || lowerDesc.includes("耐用")) features.push("耐用");

  // Feature keywords
  if (lowerDesc.includes("waterproof") || lowerDesc.includes("防水")) features.push("防水");
  if (lowerDesc.includes("lightweight") || lowerDesc.includes("轻便")) features.push("轻便");
  if (lowerDesc.includes("breathable") || lowerDesc.includes("透气")) features.push("透气");

  if (features.length === 0) {
    return tags.slice(0, 3);
  }

  return [...new Set(features)].slice(0, 5);
}

// Helper: Infer seasonality
function inferSeasonality(tags: string[], title: string): string | null {
  const text = (tags.join(" ") + " " + title).toLowerCase();

  if (text.includes("summer") || text.includes("夏")) return "夏季热销";
  if (text.includes("winter") || text.includes("冬")) return "冬季热销";
  if (text.includes("spring") || text.includes("春")) return "春季新品";
  if (text.includes("fall") || text.includes("autumn") || text.includes("秋")) return "秋季新品";
  if (text.includes("christmas") || text.includes("holiday") || text.includes("圣诞")) return "节日特供";
  if (text.includes("valentine") || text.includes("情人节")) return "情人节";

  return null;
}

// Helper: Infer competitive position
function inferCompetitivePosition(
  price: number,
  avgPrice: number,
  discount: number | null,
  variantCount: number
): string {
  if (discount && discount > 30) {
    return "促销引流款";
  }
  if (price > avgPrice * 2 && variantCount > 3) {
    return "旗舰产品";
  }
  if (price < avgPrice * 0.6) {
    return "入门级产品";
  }
  if (variantCount > 5) {
    return "多选择主力款";
  }
  return "常规在售款";
}

// Convert ShopifyProduct to ProductDetail
function toProductDetail(
  product: ShopifyProduct,
  domain: string,
  avgPrice: number
): ProductDetail {
  const price = getProductPrice(product);
  const prices = getAllPrices(product);
  const discount = getDiscountPercent(product);

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    url: `https://${domain}/products/${product.handle}`,

    // Pricing
    price,
    compare_at_price: getCompareAtPrice(product),
    discount_percent: discount,
    price_range: {
      min: prices.length > 0 ? Math.min(...prices) : price,
      max: prices.length > 0 ? Math.max(...prices) : price,
    },

    // Images
    primary_image: getPrimaryImage(product),
    images: (product.images || []).map((img) => ({
      src: img.src,
      alt: img.alt,
    })),
    image_count: product.images?.length || 0,

    // Classification
    vendor: product.vendor || "",
    product_type: product.product_type || "",
    tags: Array.isArray(product.tags) ? product.tags : [],

    // Variants & Options
    variants: (product.variants || []).map((v) => ({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price) || 0,
      compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
      sku: v.sku || "",
      available: v.available,
      option1: v.option1,
      option2: v.option2,
      option3: v.option3,
    })),
    variant_count: product.variants?.length || 0,
    options: (product.options || []).map((o) => ({
      name: o.name,
      values: o.values,
    })),
    has_multiple_variants: (product.variants?.length || 0) > 1,

    // Description
    description: product.body_html || "",
    description_length: (product.body_html || "").length,

    // Dates
    published_at: product.published_at || product.created_at,
    created_at: product.created_at,
    updated_at: product.updated_at,
    days_since_published: daysSince(product.published_at || product.created_at),

    // Availability
    available: product.variants?.some((v) => v.available) || false,
    total_inventory: null, // Shopify doesn't expose this in public API

    // AI-inferred insights
    insights: {
      price_tier: inferPriceTier(price, avgPrice),
      target_audience: inferTargetAudience(
        Array.isArray(product.tags) ? product.tags : [],
        price,
        avgPrice,
        product.product_type || ""
      ),
      product_category: product.product_type || "未分类",
      seasonality: inferSeasonality(
        Array.isArray(product.tags) ? product.tags : [],
        product.title
      ),
      key_features: inferKeyFeatures(
        product.body_html || "",
        Array.isArray(product.tags) ? product.tags : []
      ),
      competitive_position: inferCompetitivePosition(
        price,
        avgPrice,
        discount,
        product.variants?.length || 0
      ),
    },
  };
}

// Calculate price statistics
function calculatePriceStats(products: ShopifyProduct[]): PriceStats {
  const prices = products.map(getProductPrice).filter((p) => p > 0);

  if (prices.length === 0) {
    return {
      total_products: products.length,
      average_price: 0,
      median_price: 0,
      min_price: 0,
      max_price: 0,
      price_currency: "USD",
      price_std_deviation: 0,
    };
  }

  const sum = prices.reduce((a, b) => a + b, 0);
  const average = sum / prices.length;

  return {
    total_products: products.length,
    average_price: Math.round(average * 100) / 100,
    median_price: Math.round(calculateMedian(prices) * 100) / 100,
    min_price: Math.min(...prices),
    max_price: Math.max(...prices),
    price_currency: "USD",
    price_std_deviation:
      Math.round(calculateStdDev(prices, average) * 100) / 100,
  };
}

// Calculate tag cloud
function calculateTagCloud(
  products: ShopifyProduct[],
  topN: number = 25
): TagCount[] {
  const tagCounts = new Map<string, number>();

  for (const product of products) {
    if (Array.isArray(product.tags)) {
      for (const tag of product.tags) {
        const normalizedTag = tag.toLowerCase().trim();
        if (normalizedTag) {
          tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
        }
      }
    }
  }

  const total = products.length;
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

// Calculate price distribution
function calculatePriceDistribution(
  products: ShopifyProduct[]
): PriceDistributionBucket[] {
  const prices = products.map(getProductPrice).filter((p) => p > 0);
  if (prices.length === 0) return [];

  const maxPrice = Math.max(...prices);
  const total = prices.length;

  let buckets: { min: number; max: number; label: string }[];

  if (maxPrice <= 50) {
    buckets = [
      { min: 0, max: 10, label: "$0-10" },
      { min: 10, max: 20, label: "$10-20" },
      { min: 20, max: 30, label: "$20-30" },
      { min: 30, max: 40, label: "$30-40" },
      { min: 40, max: Infinity, label: "$40+" },
    ];
  } else if (maxPrice <= 200) {
    buckets = [
      { min: 0, max: 25, label: "$0-25" },
      { min: 25, max: 50, label: "$25-50" },
      { min: 50, max: 100, label: "$50-100" },
      { min: 100, max: 150, label: "$100-150" },
      { min: 150, max: Infinity, label: "$150+" },
    ];
  } else if (maxPrice <= 500) {
    buckets = [
      { min: 0, max: 50, label: "$0-50" },
      { min: 50, max: 100, label: "$50-100" },
      { min: 100, max: 200, label: "$100-200" },
      { min: 200, max: 350, label: "$200-350" },
      { min: 350, max: Infinity, label: "$350+" },
    ];
  } else {
    buckets = [
      { min: 0, max: 100, label: "$0-100" },
      { min: 100, max: 250, label: "$100-250" },
      { min: 250, max: 500, label: "$250-500" },
      { min: 500, max: 1000, label: "$500-1K" },
      { min: 1000, max: Infinity, label: "$1K+" },
    ];
  }

  return buckets.map((bucket) => {
    const count = prices.filter(
      (p) => p >= bucket.min && p < bucket.max
    ).length;
    return {
      range: bucket.label,
      min: bucket.min,
      max: bucket.max === Infinity ? maxPrice + 1 : bucket.max,
      count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
    };
  });
}

// Vendor analysis
function analyzeVendors(products: ShopifyProduct[]): VendorAnalysis[] {
  const vendorMap = new Map<
    string,
    { products: ShopifyProduct[]; prices: number[] }
  >();

  for (const product of products) {
    const vendor = product.vendor || "Unknown";
    if (!vendorMap.has(vendor)) {
      vendorMap.set(vendor, { products: [], prices: [] });
    }
    const entry = vendorMap.get(vendor)!;
    entry.products.push(product);
    const price = getProductPrice(product);
    if (price > 0) entry.prices.push(price);
  }

  const total = products.length;

  return Array.from(vendorMap.entries())
    .map(([vendor, data]) => ({
      vendor,
      productCount: data.products.length,
      percentage: Math.round((data.products.length / total) * 100 * 10) / 10,
      avgPrice:
        data.prices.length > 0
          ? Math.round(
              (data.prices.reduce((a, b) => a + b, 0) / data.prices.length) *
                100
            ) / 100
          : 0,
      priceRange: {
        min: data.prices.length > 0 ? Math.min(...data.prices) : 0,
        max: data.prices.length > 0 ? Math.max(...data.prices) : 0,
      },
    }))
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 15);
}

// Product type analysis
function analyzeProductTypes(products: ShopifyProduct[]): ProductTypeAnalysis[] {
  const typeMap = new Map<string, { count: number; prices: number[] }>();

  for (const product of products) {
    const type = product.product_type || "Uncategorized";
    if (!typeMap.has(type)) {
      typeMap.set(type, { count: 0, prices: [] });
    }
    const entry = typeMap.get(type)!;
    entry.count++;
    const price = getProductPrice(product);
    if (price > 0) entry.prices.push(price);
  }

  const total = products.length;

  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      percentage: Math.round((data.count / total) * 100 * 10) / 10,
      avgPrice:
        data.prices.length > 0
          ? Math.round(
              (data.prices.reduce((a, b) => a + b, 0) / data.prices.length) *
                100
            ) / 100
          : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

// Discount analysis
function analyzeDiscounts(products: ShopifyProduct[]): DiscountAnalysis {
  const discounts: number[] = [];

  for (const product of products) {
    const discount = getDiscountPercent(product);
    if (discount !== null && discount > 0) {
      discounts.push(discount);
    }
  }

  const distribution = [
    { range: "1-10%", min: 1, max: 10 },
    { range: "11-20%", min: 11, max: 20 },
    { range: "21-30%", min: 21, max: 30 },
    { range: "31-50%", min: 31, max: 50 },
    { range: "50%+", min: 51, max: 100 },
  ].map((bucket) => ({
    range: bucket.range,
    count: discounts.filter((d) => d >= bucket.min && d <= bucket.max).length,
  }));

  return {
    totalProductsWithDiscount: discounts.length,
    discountPercentage:
      Math.round((discounts.length / products.length) * 100 * 10) / 10,
    averageDiscountPercent:
      discounts.length > 0
        ? Math.round(
            (discounts.reduce((a, b) => a + b, 0) / discounts.length) * 10
          ) / 10
        : 0,
    maxDiscountPercent: discounts.length > 0 ? Math.max(...discounts) : 0,
    discountDistribution: distribution,
  };
}

// Variant analysis
function analyzeVariants(products: ShopifyProduct[]): VariantAnalysis {
  let totalVariants = 0;
  let productsWithMultiple = 0;
  const optionTypesMap = new Map<string, Set<string>>();

  for (const product of products) {
    const variantCount = product.variants?.length || 0;
    totalVariants += variantCount;

    if (variantCount > 1) {
      productsWithMultiple++;
    }

    if (product.options) {
      for (const option of product.options) {
        if (!optionTypesMap.has(option.name)) {
          optionTypesMap.set(option.name, new Set());
        }
        const set = optionTypesMap.get(option.name)!;
        for (const value of option.values) {
          set.add(value);
        }
      }
    }
  }

  const optionTypes = Array.from(optionTypesMap.entries())
    .map(([name, values]) => ({
      name,
      uniqueValues: values.size,
      topValues: Array.from(values).slice(0, 10),
    }))
    .sort((a, b) => b.uniqueValues - a.uniqueValues);

  return {
    totalVariants,
    avgVariantsPerProduct:
      products.length > 0
        ? Math.round((totalVariants / products.length) * 10) / 10
        : 0,
    productsWithMultipleVariants: productsWithMultiple,
    optionTypes,
  };
}

// Image analysis
function analyzeImages(products: ShopifyProduct[]): ImageAnalysis {
  let totalImages = 0;
  let productsWithoutImages = 0;
  let productsWithAltText = 0;

  for (const product of products) {
    const imageCount = product.images?.length || 0;
    totalImages += imageCount;

    if (imageCount === 0) {
      productsWithoutImages++;
    }

    if (product.images?.some((img) => img.alt && img.alt.trim() !== "")) {
      productsWithAltText++;
    }
  }

  return {
    totalImages,
    avgImagesPerProduct:
      products.length > 0
        ? Math.round((totalImages / products.length) * 10) / 10
        : 0,
    productsWithoutImages,
    productsWithAltText,
    altTextPercentage:
      products.length > 0
        ? Math.round((productsWithAltText / products.length) * 100 * 10) / 10
        : 0,
  };
}

// Timeline analysis
function analyzeTimeline(products: ShopifyProduct[]): TimelineAnalysis {
  const dates = products
    .map((p) => p.published_at || p.created_at)
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return {
      oldestProduct: null,
      newestProduct: null,
      publishingFrequency: [],
      avgProductsPerMonth: 0,
    };
  }

  const monthCounts = new Map<string, number>();
  for (const date of dates) {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  }

  const frequency = Array.from(monthCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  const totalMonths = monthCounts.size;

  return {
    oldestProduct: dates[0].toISOString().split("T")[0],
    newestProduct: dates[dates.length - 1].toISOString().split("T")[0],
    publishingFrequency: frequency,
    avgProductsPerMonth:
      totalMonths > 0
        ? Math.round((products.length / totalMonths) * 10) / 10
        : 0,
  };
}

// Inventory analysis
function analyzeInventory(products: ShopifyProduct[]): InventoryAnalysis {
  let inStock = 0;
  let outOfStock = 0;

  for (const product of products) {
    const hasAvailableVariant = product.variants?.some((v) => v.available);
    if (hasAvailableVariant) {
      inStock++;
    } else {
      outOfStock++;
    }
  }

  return {
    inStockProducts: inStock,
    outOfStockProducts: outOfStock,
    inStockPercentage:
      products.length > 0
        ? Math.round((inStock / products.length) * 100 * 10) / 10
        : 0,
  };
}

// ============ DATA-DRIVEN SCORING SYSTEM ============
// Each score is calculated from concrete, measurable data points.
// Every item has: a clear threshold, the actual measured value, and a weight.
// No AI "black box" — users can see exactly how each score is derived.

function calculateProductScore(
  stats: PriceStats,
  products: ProductDetail[],
  discountAnalysis: DiscountAnalysis,
  variantAnalysis: VariantAnalysis,
  imageAnalysis: ImageAnalysis,
  timelineAnalysis: TimelineAnalysis,
  inventoryAnalysis: InventoryAnalysis,
  productTypeAnalysis: ProductTypeAnalysis[]
): DetailedScore {
  const items: ScoreItem[] = [];

  // 1. SKU richness (15pts)
  const productCount = stats.total_products;
  items.push({
    category: "商品丰富度",
    item: "商品数量",
    passed: productCount >= 30,
    weight: 15,
    detail: productCount >= 30 ? "商品线较丰富，能满足多样化需求" : "商品较少，建议扩充产品线以覆盖更多客群",
    actualValue: `${productCount} 个`,
    threshold: "≥ 30 个",
  });

  // 2. Price tier diversity (10pts)
  const priceTiers = new Set(products.map(p => p.insights.price_tier));
  items.push({
    category: "定价策略",
    item: "价格分层覆盖",
    passed: priceTiers.size >= 2,
    weight: 10,
    detail: priceTiers.size >= 2
      ? `覆盖${Array.from(priceTiers).join("、")}等层级，定价策略有梯度`
      : "价格集中在单一层级，缺乏价格梯度",
    actualValue: `${priceTiers.size} 个层级`,
    threshold: "≥ 2 个层级",
  });

  // 3. Description quality (10pts)
  const avgDescLen = products.length > 0
    ? Math.round(products.reduce((s, p) => s + p.description_length, 0) / products.length)
    : 0;
  items.push({
    category: "内容质量",
    item: "商品描述完整度",
    passed: avgDescLen >= 100,
    weight: 10,
    detail: avgDescLen >= 100 ? "商品描述充分，有助于转化" : "描述过短，建议增加卖点、使用场景等内容",
    actualValue: `平均 ${avgDescLen} 字符`,
    threshold: "≥ 100 字符",
  });

  // 4. Image coverage (10pts)
  items.push({
    category: "视觉呈现",
    item: "商品图片丰富度",
    passed: imageAnalysis.avgImagesPerProduct >= 3,
    weight: 10,
    detail: imageAnalysis.avgImagesPerProduct >= 3
      ? "图片展示充分，有利于购买决策"
      : "图片偏少，建议增加多角度、场景化图片",
    actualValue: `平均 ${imageAnalysis.avgImagesPerProduct.toFixed(1)} 张/商品`,
    threshold: "≥ 3 张/商品",
  });

  // 5. Image alt text (5pts)
  items.push({
    category: "视觉呈现",
    item: "图片 Alt 文本覆盖",
    passed: imageAnalysis.altTextPercentage >= 50,
    weight: 5,
    detail: imageAnalysis.altTextPercentage >= 50
      ? "Alt 文本覆盖率良好，有利于 SEO"
      : "Alt 文本缺失较多，不利于搜索引擎优化和无障碍访问",
    actualValue: `${imageAnalysis.altTextPercentage.toFixed(0)}%`,
    threshold: "≥ 50%",
  });

  // 6. Variant depth (10pts)
  items.push({
    category: "SKU 深度",
    item: "变体丰富度",
    passed: variantAnalysis.avgVariantsPerProduct >= 2,
    weight: 10,
    detail: variantAnalysis.avgVariantsPerProduct >= 2
      ? "变体选择丰富，满足不同偏好"
      : "变体偏少，可考虑增加颜色、尺码等选项",
    actualValue: `平均 ${variantAnalysis.avgVariantsPerProduct.toFixed(1)} 个/商品`,
    threshold: "≥ 2 个/商品",
  });

  // 7. Inventory health (10pts)
  items.push({
    category: "库存管理",
    item: "库存健康度",
    passed: inventoryAnalysis.inStockPercentage >= 80,
    weight: 10,
    detail: inventoryAnalysis.inStockPercentage >= 80
      ? "库存充足，在售率高"
      : "缺货率较高，可能导致客户流失",
    actualValue: `${inventoryAnalysis.inStockPercentage}% 在售`,
    threshold: "≥ 80%",
  });

  // 8. Update frequency (10pts)
  items.push({
    category: "更新频率",
    item: "产品上新节奏",
    passed: timelineAnalysis.avgProductsPerMonth >= 2,
    weight: 10,
    detail: timelineAnalysis.avgProductsPerMonth >= 2
      ? "上新频率健康，保持店铺活跃度"
      : "上新较慢，建议提高产品更新频率",
    actualValue: `月均 ${timelineAnalysis.avgProductsPerMonth.toFixed(1)} 个`,
    threshold: "≥ 2 个/月",
  });

  // 9. Discount strategy (10pts)
  const discountPct = discountAnalysis.discountPercentage;
  const hasReasonableDiscounts = discountPct > 5 && discountPct < 80;
  items.push({
    category: "促销策略",
    item: "折扣策略合理性",
    passed: hasReasonableDiscounts,
    weight: 10,
    detail: hasReasonableDiscounts
      ? "促销比例适中，兼顾销量与利润"
      : discountPct <= 5 ? "几乎无折扣，可考虑适度促销提升转化" : "折扣面过大，可能损伤品牌价值",
    actualValue: `${discountPct}% 打折`,
    threshold: "5% ~ 80%",
  });

  // 10. Category coverage (10pts)
  items.push({
    category: "品类布局",
    item: "产品分类覆盖",
    passed: productTypeAnalysis.length >= 3,
    weight: 10,
    detail: productTypeAnalysis.length >= 3
      ? "品类结构较完整，产品线层次分明"
      : "品类单一，建议拓展相关品类增加交叉销售",
    actualValue: `${productTypeAnalysis.length} 个分类`,
    threshold: "≥ 3 个",
  });

  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.reduce((s, i) => s + (i.passed ? i.weight : 0), 0);

  return {
    overall: Math.round((earned / totalWeight) * 100),
    items,
    benchmark: 58,
    benchmarkLabel: "Shopify 店铺均值",
  };
}

function calculateOperationsScore(
  techAnalysis: TechAnalysis,
  siteStructure: SiteStructure,
  imageAnalysis: ImageAnalysis,
  inventoryAnalysis: InventoryAnalysis
): DetailedScore {
  const items: ScoreItem[] = [];

  // 1. Search function (10pts)
  items.push({
    category: "用户体验",
    item: "站内搜索功能",
    passed: techAnalysis.hasSearch,
    weight: 10,
    detail: techAnalysis.hasSearch ? "支持站内搜索，方便用户找到商品" : "缺少搜索功能，影响商品发现效率",
    actualValue: techAnalysis.hasSearch ? "已启用" : "未启用",
    threshold: "已启用",
  });

  // 2. Shopping cart (10pts)
  items.push({
    category: "用户体验",
    item: "购物车功能",
    passed: techAnalysis.hasCart,
    weight: 10,
    detail: techAnalysis.hasCart ? "购物车功能正常" : "缺少购物车，严重影响转化",
    actualValue: techAnalysis.hasCart ? "已启用" : "未启用",
    threshold: "已启用",
  });

  // 3. Reviews (15pts)
  items.push({
    category: "信任建设",
    item: "评价系统",
    passed: techAnalysis.hasReviews,
    weight: 15,
    detail: techAnalysis.hasReviews ? "有客户评价系统，增强购买信心" : "缺少评价系统，用户无法参考其他买家反馈",
    actualValue: techAnalysis.hasReviews ? "已启用" : "未启用",
    threshold: "已启用",
  });

  // 4. About page (5pts)
  items.push({
    category: "信任建设",
    item: "品牌故事页 (About)",
    passed: siteStructure.hasAboutPage,
    weight: 5,
    detail: siteStructure.hasAboutPage ? "有品牌故事页，有助于建立品牌认知" : "缺少 About 页面，品牌故事缺失",
    actualValue: siteStructure.hasAboutPage ? "已创建" : "未创建",
    threshold: "已创建",
  });

  // 5. Contact page (5pts)
  items.push({
    category: "信任建设",
    item: "联系方式页面",
    passed: siteStructure.hasContactPage,
    weight: 5,
    detail: siteStructure.hasContactPage ? "有联系页面，增强用户信任" : "缺少联系方式，用户可能担心售后",
    actualValue: siteStructure.hasContactPage ? "已创建" : "未创建",
    threshold: "已创建",
  });

  // 6. FAQ (10pts)
  items.push({
    category: "用户体验",
    item: "常见问题 (FAQ)",
    passed: siteStructure.hasFAQPage,
    weight: 10,
    detail: siteStructure.hasFAQPage ? "FAQ 减少客服压力，提升用户体验" : "缺少 FAQ，用户常见疑问无法自助解决",
    actualValue: siteStructure.hasFAQPage ? "已创建" : "未创建",
    threshold: "已创建",
  });

  // 7. Return policy (10pts)
  items.push({
    category: "信任建设",
    item: "退换货政策",
    passed: siteStructure.hasReturnPolicy,
    weight: 10,
    detail: siteStructure.hasReturnPolicy ? "有明确退换政策，降低购买顾虑" : "缺少退换政策，用户下单顾虑大",
    actualValue: siteStructure.hasReturnPolicy ? "已发布" : "未发布",
    threshold: "已发布",
  });

  // 8. Shipping policy (10pts)
  items.push({
    category: "信任建设",
    item: "运费政策",
    passed: siteStructure.hasShippingPolicy,
    weight: 10,
    detail: siteStructure.hasShippingPolicy ? "运费规则透明，减少弃单率" : "缺少运费说明，可能导致结账弃单",
    actualValue: siteStructure.hasShippingPolicy ? "已发布" : "未发布",
    threshold: "已发布",
  });

  // 9. Live chat (10pts)
  items.push({
    category: "用户体验",
    item: "在线客服",
    passed: techAnalysis.hasChatWidget,
    weight: 10,
    detail: techAnalysis.hasChatWidget ? "有即时客服，提升用户满意度" : "无在线客服，用户问题无法即时解答",
    actualValue: techAnalysis.hasChatWidget ? "已启用" : "未启用",
    threshold: "已启用",
  });

  // 10. Payment methods (15pts)
  const paymentCount = techAnalysis.paymentMethods.length;
  items.push({
    category: "转化优化",
    item: "多支付方式",
    passed: paymentCount >= 3,
    weight: 15,
    detail: paymentCount >= 3
      ? `支持 ${paymentCount} 种支付方式，覆盖面广`
      : `仅 ${paymentCount} 种支付方式，建议接入更多支付渠道`,
    actualValue: `${paymentCount} 种`,
    threshold: "≥ 3 种",
  });

  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.reduce((s, i) => s + (i.passed ? i.weight : 0), 0);

  return {
    overall: Math.round((earned / totalWeight) * 100),
    items,
    benchmark: 52,
    benchmarkLabel: "Shopify 店铺均值",
  };
}

function calculateMarketingScore(
  seoAnalysis: SEOAnalysis,
  techAnalysis: TechAnalysis,
  siteStructure: SiteStructure,
  socialLinks: SocialLinks
): DetailedScore {
  const items: ScoreItem[] = [];

  // 1. Meta Description (10pts)
  items.push({
    category: "SEO 基础",
    item: "Meta Description",
    passed: seoAnalysis.hasMetaDescription,
    weight: 10,
    detail: seoAnalysis.hasMetaDescription
      ? `描述长度 ${seoAnalysis.metaDescriptionLength} 字符，有助于搜索结果展示`
      : "缺少 Meta Description，搜索结果展示效果差",
    actualValue: seoAnalysis.hasMetaDescription ? `${seoAnalysis.metaDescriptionLength} 字符` : "缺失",
    threshold: "已设置",
  });

  // 2. Title Tag (5pts)
  items.push({
    category: "SEO 基础",
    item: "Title Tag",
    passed: seoAnalysis.hasTitleTag,
    weight: 5,
    detail: seoAnalysis.hasTitleTag
      ? `标题长度 ${seoAnalysis.titleLength} 字符`
      : "缺少 Title Tag，严重影响搜索排名",
    actualValue: seoAnalysis.hasTitleTag ? `${seoAnalysis.titleLength} 字符` : "缺失",
    threshold: "已设置",
  });

  // 3. Open Graph Tags (10pts)
  items.push({
    category: "SEO 基础",
    item: "Open Graph 标签",
    passed: seoAnalysis.hasOGTags,
    weight: 10,
    detail: seoAnalysis.hasOGTags
      ? "OG 标签完整，社交分享展示效果好"
      : "缺少 OG 标签，社交媒体分享时无法正确展示",
    actualValue: seoAnalysis.hasOGTags ? "已设置" : "缺失",
    threshold: "已设置",
  });

  // 4. Structured Data (10pts)
  items.push({
    category: "SEO 进阶",
    item: "结构化数据 (Schema)",
    passed: seoAnalysis.hasStructuredData,
    weight: 10,
    detail: seoAnalysis.hasStructuredData
      ? "结构化数据有助于搜索引擎理解页面内容，提升富文本展示"
      : "缺少结构化数据，错失搜索引擎富文本展示机会",
    actualValue: seoAnalysis.hasStructuredData ? "已实现" : "缺失",
    threshold: "已实现",
  });

  // 5. Sitemap (5pts)
  items.push({
    category: "SEO 基础",
    item: "Sitemap",
    passed: seoAnalysis.sitemap,
    weight: 5,
    detail: seoAnalysis.sitemap
      ? "Sitemap 有助于搜索引擎爬取"
      : "缺少 Sitemap，不利于搜索引擎索引",
    actualValue: seoAnalysis.sitemap ? "已配置" : "缺失",
    threshold: "已配置",
  });

  // 6. Newsletter (10pts)
  items.push({
    category: "用户留存",
    item: "邮件订阅 (Newsletter)",
    passed: techAnalysis.hasNewsletter,
    weight: 10,
    detail: techAnalysis.hasNewsletter
      ? "支持邮件订阅，有利于用户召回和复购"
      : "未开启邮件订阅，缺少重要的用户留存渠道",
    actualValue: techAnalysis.hasNewsletter ? "已启用" : "未启用",
    threshold: "已启用",
  });

  // 7. Social media presence (15pts)
  const activeSocials = Object.entries(socialLinks).filter(([, url]) => url).map(([platform]) => platform);
  const socialCount = activeSocials.length;
  items.push({
    category: "社交媒体",
    item: "社交媒体覆盖",
    passed: socialCount >= 2,
    weight: 15,
    detail: socialCount >= 2
      ? `已布局 ${activeSocials.join("、")} 等平台`
      : socialCount === 0 ? "未发现任何社交媒体链接" : `仅布局 ${activeSocials.join("、")}，覆盖面不足`,
    actualValue: `${socialCount} 个平台`,
    threshold: "≥ 2 个",
  });

  // 8. Blog content (15pts)
  items.push({
    category: "内容营销",
    item: "博客/内容版块",
    passed: siteStructure.hasBlogSection,
    weight: 15,
    detail: siteStructure.hasBlogSection
      ? "有博客版块，有利于 SEO 流量和品牌内容建设"
      : "缺少内容版块，错失 SEO 内容营销机会",
    actualValue: siteStructure.hasBlogSection ? "已开设" : "未开设",
    threshold: "已开设",
  });

  // 9. Social media diversity (10pts) - deeper presence
  items.push({
    category: "社交媒体",
    item: "多渠道深度布局",
    passed: socialCount >= 4,
    weight: 10,
    detail: socialCount >= 4
      ? "社交媒体矩阵完善，全渠道触达用户"
      : `当前 ${socialCount} 个渠道，建议扩展更多社交平台`,
    actualValue: `${socialCount} 个平台`,
    threshold: "≥ 4 个",
  });

  // 10. Twitter Cards (5pts)
  items.push({
    category: "SEO 进阶",
    item: "Twitter Cards",
    passed: seoAnalysis.hasTwitterCards,
    weight: 5,
    detail: seoAnalysis.hasTwitterCards
      ? "Twitter Cards 提升社交分享质量"
      : "缺少 Twitter Cards 标签",
    actualValue: seoAnalysis.hasTwitterCards ? "已设置" : "缺失",
    threshold: "已设置",
  });

  // 11. Canonical URL (5pts)
  items.push({
    category: "SEO 进阶",
    item: "Canonical URL",
    passed: !!seoAnalysis.canonicalUrl,
    weight: 5,
    detail: seoAnalysis.canonicalUrl
      ? "Canonical URL 避免重复内容问题"
      : "缺少 Canonical URL，可能导致重复内容问题",
    actualValue: seoAnalysis.canonicalUrl ? "已设置" : "缺失",
    threshold: "已设置",
  });

  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.reduce((s, i) => s + (i.passed ? i.weight : 0), 0);

  return {
    overall: Math.round((earned / totalWeight) * 100),
    items,
    benchmark: 48,
    benchmarkLabel: "Shopify 店铺均值",
  };
}

function calculateStoreScores(
  stats: PriceStats,
  products: ProductDetail[],
  discountAnalysis: DiscountAnalysis,
  variantAnalysis: VariantAnalysis,
  imageAnalysis: ImageAnalysis,
  timelineAnalysis: TimelineAnalysis,
  inventoryAnalysis: InventoryAnalysis,
  productTypeAnalysis: ProductTypeAnalysis[],
  techAnalysis: TechAnalysis,
  siteStructure: SiteStructure,
  seoAnalysis: SEOAnalysis,
  socialLinks: SocialLinks
): StoreScores {
  return {
    product: calculateProductScore(
      stats, products, discountAnalysis, variantAnalysis,
      imageAnalysis, timelineAnalysis, inventoryAnalysis, productTypeAnalysis
    ),
    operations: calculateOperationsScore(
      techAnalysis, siteStructure, imageAnalysis, inventoryAnalysis
    ),
    marketing: calculateMarketingScore(
      seoAnalysis, techAnalysis, siteStructure, socialLinks
    ),
  };
}

// Calculate website health score
function calculateWebsiteHealth(
  seoAnalysis: SEOAnalysis,
  techAnalysis: TechAnalysis,
  siteStructure: SiteStructure,
  socialLinks: SocialLinks,
  imageAnalysis: ImageAnalysis
): WebsiteHealthScore {
  const details: {
    category: string;
    item: string;
    passed: boolean;
    weight: number;
  }[] = [];

  // SEO Checks (25 points)
  details.push({
    category: "SEO",
    item: "Meta Description",
    passed: seoAnalysis.hasMetaDescription,
    weight: 5,
  });
  details.push({
    category: "SEO",
    item: "Title Tag",
    passed: seoAnalysis.hasTitleTag,
    weight: 5,
  });
  details.push({
    category: "SEO",
    item: "Open Graph Tags",
    passed: seoAnalysis.hasOGTags,
    weight: 5,
  });
  details.push({
    category: "SEO",
    item: "Structured Data",
    passed: seoAnalysis.hasStructuredData,
    weight: 5,
  });
  details.push({
    category: "SEO",
    item: "Sitemap",
    passed: seoAnalysis.sitemap,
    weight: 5,
  });

  // UX Checks (25 points)
  details.push({
    category: "UX",
    item: "Search Function",
    passed: techAnalysis.hasSearch,
    weight: 5,
  });
  details.push({
    category: "UX",
    item: "Shopping Cart",
    passed: techAnalysis.hasCart,
    weight: 5,
  });
  details.push({
    category: "UX",
    item: "About Page",
    passed: siteStructure.hasAboutPage,
    weight: 5,
  });
  details.push({
    category: "UX",
    item: "Contact Page",
    passed: siteStructure.hasContactPage,
    weight: 5,
  });
  details.push({
    category: "UX",
    item: "FAQ Section",
    passed: siteStructure.hasFAQPage,
    weight: 5,
  });

  // Trust Checks (25 points)
  details.push({
    category: "Trust",
    item: "Customer Reviews",
    passed: techAnalysis.hasReviews,
    weight: 8,
  });
  details.push({
    category: "Trust",
    item: "Return Policy",
    passed: siteStructure.hasReturnPolicy,
    weight: 6,
  });
  details.push({
    category: "Trust",
    item: "Shipping Policy",
    passed: siteStructure.hasShippingPolicy,
    weight: 6,
  });
  details.push({
    category: "Trust",
    item: "Image Alt Text",
    passed: imageAnalysis.altTextPercentage > 50,
    weight: 5,
  });

  // Marketing Checks (25 points)
  details.push({
    category: "Marketing",
    item: "Newsletter Signup",
    passed: techAnalysis.hasNewsletter,
    weight: 5,
  });
  details.push({
    category: "Marketing",
    item: "Social Media Presence",
    passed: Object.values(socialLinks).filter(Boolean).length >= 2,
    weight: 5,
  });
  details.push({
    category: "Marketing",
    item: "Blog Section",
    passed: siteStructure.hasBlogSection,
    weight: 5,
  });
  details.push({
    category: "Marketing",
    item: "Chat Support",
    passed: techAnalysis.hasChatWidget,
    weight: 5,
  });
  details.push({
    category: "Marketing",
    item: "Multiple Payment Options",
    passed: techAnalysis.paymentMethods.length >= 3,
    weight: 5,
  });

  const categoryScores: Record<string, { earned: number; total: number }> = {};
  for (const check of details) {
    if (!categoryScores[check.category]) {
      categoryScores[check.category] = { earned: 0, total: 0 };
    }
    categoryScores[check.category].total += check.weight;
    if (check.passed) {
      categoryScores[check.category].earned += check.weight;
    }
  }

  const overall =
    details.reduce((sum, d) => sum + (d.passed ? d.weight : 0), 0);
  const totalWeight = details.reduce((sum, d) => sum + d.weight, 0);

  return {
    overall: Math.round((overall / totalWeight) * 100),
    seo: Math.round(
      (categoryScores["SEO"].earned / categoryScores["SEO"].total) * 100
    ),
    ux: Math.round(
      (categoryScores["UX"].earned / categoryScores["UX"].total) * 100
    ),
    trust: Math.round(
      (categoryScores["Trust"].earned / categoryScores["Trust"].total) * 100
    ),
    marketing: Math.round(
      (categoryScores["Marketing"].earned / categoryScores["Marketing"].total) *
        100
    ),
    details,
  };
}

// Main aggregation function
export function aggregateData(scraperResult: ScraperResult): AggregatedData {
  const { meta, products, socialLinks, techAnalysis, siteStructure, seoAnalysis } =
    scraperResult;

  // Calculate stats first for average price
  const stats = calculatePriceStats(products);
  
  // Calculate all analyses
  const tag_cloud = calculateTagCloud(products);
  const price_distribution = calculatePriceDistribution(products);
  const vendor_analysis = analyzeVendors(products);
  const product_type_analysis = analyzeProductTypes(products);
  const discount_analysis = analyzeDiscounts(products);
  const variant_analysis = analyzeVariants(products);
  const image_analysis = analyzeImages(products);
  const timeline_analysis = analyzeTimeline(products);
  const inventory_analysis = analyzeInventory(products);

  const website_health = calculateWebsiteHealth(
    seoAnalysis,
    techAnalysis,
    siteStructure,
    socialLinks,
    image_analysis
  );

  // Convert all products to ProductDetail
  const all_products = products
    .map((p) => toProductDetail(p, meta.domain, stats.average_price))
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  // Calculate data-driven store scores
  const store_scores = calculateStoreScores(
    stats, all_products, discount_analysis, variant_analysis,
    image_analysis, timeline_analysis, inventory_analysis,
    product_type_analysis, techAnalysis, siteStructure, seoAnalysis, socialLinks
  );

  // Get sample for AI context (representative products)
  const sampleProducts = all_products.filter((_, i) => {
    const step = Math.floor(all_products.length / 12);
    return step === 0 || i % step === 0;
  }).slice(0, 12);

  const ai_context: AIContext = {
    store_meta: meta,
    stats,
    top_tags: tag_cloud.slice(0, 15),
    vendor_analysis: vendor_analysis.slice(0, 10),
    product_type_analysis: product_type_analysis.slice(0, 10),
    discount_analysis,
    variant_analysis,
    image_analysis,
    timeline_analysis,
    inventory_analysis,
    social_links: socialLinks,
    tech_analysis: techAnalysis,
    site_structure: siteStructure,
    seo_analysis: seoAnalysis,
    website_health,
    sample_products: sampleProducts,
  };

  return {
    stats,
    tag_cloud,
    price_distribution,
    vendor_analysis,
    product_type_analysis,
    discount_analysis,
    variant_analysis,
    image_analysis,
    timeline_analysis,
    inventory_analysis,
    website_health,
    store_scores,
    all_products,
    ai_context,
  };
}
