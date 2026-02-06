"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import TurndownService from "turndown";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  Package,
  DollarSign,
  Tag,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Store,
  ExternalLink,
  Users,
  Layers,
  Calendar,
  Percent,
  Activity,
  Globe,
  CheckCircle,
  XCircle,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Target,
  Zap,
  AlertTriangle,
  Lightbulb,
  Award,
  BarChart3,
  PieChartIcon,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Eye,
  Clock,
  ShoppingBag,
  ImageIcon,
  Hash,
  LogOut,
  User,
  Brain,
  SearchCheck,
} from "lucide-react";

// ============ TYPES ============

interface PlatformErrorInfo {
  message: string;
  errorType?: "PLATFORM_NOT_SUPPORTED" | "SHOPIFY_API_DISABLED";
  platformInfo?: {
    platform: string;
    platformName: string;
    confidence: "high" | "medium" | "low";
    indicators: string[];
  };
}

interface ProductVariantDetail {
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

interface ProductOption {
  name: string;
  values: string[];
}

interface ProductDetail {
  id: number;
  title: string;
  handle: string;
  url: string;
  price: number;
  compare_at_price: number | null;
  discount_percent: number | null;
  price_range: { min: number; max: number };
  primary_image: string | null;
  images: { src: string; alt: string | null }[];
  image_count: number;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: ProductVariantDetail[];
  variant_count: number;
  options: ProductOption[];
  has_multiple_variants: boolean;
  description: string;
  description_length: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  days_since_published: number;
  available: boolean;
  insights: {
    price_tier: "budget" | "mid-range" | "premium" | "luxury";
    target_audience: string[];
    product_category: string;
    seasonality: string | null;
    key_features: string[];
    competitive_position: string;
  };
}

interface AIReport {
  executiveSummary: {
    headline: string;
    keyMetrics: { label: string; value: string; trend: "up" | "down" | "neutral" }[];
    verdict: string;
    confidenceScore: number;
  };
  marketPosition: {
    niche: string;
    positioning: string;
    targetMarketSize: string;
    competitiveAdvantages: string[];
    marketTrends: string[];
  };
  userPersona: {
    overview: {
      totalSegments: number;
      primarySegmentShare: string;
      segmentationBasis: string;
      confidenceLevel: number;
    };
    primaryPersona: {
      name: string;
      avatar: string;
      tagline: string;
      demographics: {
        ageRange: string;
        gender: string;
        income: string;
        education: string;
        occupation: string;
        location: string;
        familyStatus: string;
      };
      lifestyle: {
        dailyRoutine: string;
        hobbies: string[];
        socialActivities: string[];
        mediaConsumption: string[];
        technologyUsage: string;
      };
      consumptionProfile: {
        spendingPower: string;
        pricesSensitivity: string;
        brandLoyalty: string;
        purchaseFrequency: string;
        averageOrderValue: string;
        preferredPaymentMethods: string[];
      };
      psychographics: {
        coreValues: string[];
        personality: string[];
        aspirations: string[];
        fears: string[];
      };
      painPointsAndNeeds: {
        primaryPainPoints: { point: string; intensity: string }[];
        unmetNeeds: string[];
        desiredOutcomes: string[];
      };
      purchaseJourney: {
        awarenessChannels: string[];
        researchBehavior: string;
        evaluationCriteria: string[];
        purchaseTriggers: string[];
        postPurchaseBehavior: string;
      };
      digitalBehavior: {
        preferredPlatforms: string[];
        contentPreferences: string[];
        influencerTypes: string[];
        onlineShoppingHabits: string;
        socialMediaUsage: { platform: string; frequency: string; purpose: string }[];
      };
      marketingRecommendations: {
        bestChannels: string[];
        messagingTone: string;
        contentTypes: string[];
        promotionTypes: string[];
        bestTimeToReach: string;
      };
    };
    secondaryPersona: {
      name: string;
      avatar: string;
      tagline: string;
      demographics: {
        ageRange: string;
        gender: string;
        income: string;
        occupation: string;
      };
      consumptionProfile: {
        spendingPower: string;
        pricesSensitivity: string;
      };
      painPointsAndNeeds: {
        primaryPainPoints: { point: string; intensity: string }[];
      };
    };
    segmentComparison: {
      dimension: string;
      primaryValue: string;
      secondaryValue: string;
    }[];
    marketSizing: {
      estimatedTAM: string;
      estimatedSAM: string;
      estimatedSOM: string;
      growthPotential: string;
    };
    acquisitionStrategy: {
      recommendedChannels: { channel: string; priority: string; reason: string }[];
      estimatedCAC: string;
      retentionStrategies: string[];
      ltvOptimization: string[];
    };
  };
  productStrategy: { overallScore: number };
  operationsAssessment: {
    overallScore: number;
    quickWins: string[];
  };
  marketingAnalysis: {
    overallScore: number;
    brandStrength: number;
    channels: { name: string; status: string; score: number }[];
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategicRecommendations: {
    title: string;
    description: string;
    impact: string;
    effort: string;
    priority: number;
    category: string;
  }[];
  competitorAnalysis: {
    overview: {
      totalCompetitorsAnalyzed: number;
      marketConcentration: string;
      competitiveIntensity: string;
      analysisConfidence: number;
      dataSourceSummary: string;
    };
    marketLandscape: {
      leaderBrands: string[];
      emergingBrands: string[];
      nichePlayersCount: number;
      marketTrend: string;
    };
    positioningMap: {
      xAxis: string;
      yAxis: string;
      currentPosition: { x: string; y: string };
      recommendedPosition: { x: string; y: string };
      positioningGap: string;
    };
    competitiveAdvantage: {
      currentAdvantages: string[];
      sustainableAdvantages: string[];
      vulnerabilities: string[];
      recommendedFocus: string[];
    };
    competitors: {
      name: string;
      websiteUrl: string;
      category: string;
      description: string;
      confidenceLevel: number;
      dataSource: string;
      sourceType?: "search_grounded" | "ai_inference";
      positioning: {
        targetMarket: string;
        pricePosition: string;
        brandPosition: string;
      };
      metrics: {
        estimatedProductCount: string;
        estimatedPriceRange: string;
        estimatedMarketShare: string;
        strengthScore: number;
      };
      comparison: {
        advantages: string[];
        disadvantages: string[];
        differentiators: string[];
      };
      strategicInsights: {
        whatToLearn: string[];
        whatToAvoid: string[];
        opportunities: string[];
      };
    }[];
  };
}

interface AggregatedData {
  stats: {
    total_products: number;
    average_price: number;
    median_price: number;
    min_price: number;
    max_price: number;
  };
  tag_cloud: { tag: string; count: number }[];
  price_distribution: { range: string; count: number }[];
  product_type_analysis: { type: string; count: number }[];
  vendor_analysis: { vendor: string; productCount: number }[];
  discount_analysis: { discountPercentage: number; averageDiscountPercent: number };
  variant_analysis: { totalVariants: number; avgVariantsPerProduct: number };
  timeline_analysis: { publishingFrequency: { month: string; count: number }[]; avgProductsPerMonth: number };
  website_health: { overall: number; seo: number; ux: number; trust: number; marketing: number };
  all_products: ProductDetail[];
}

interface SocialLinks {
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
}

interface TechAnalysis {
  shopifyTheme: string | null;
  currency: string;
  hasReviews: boolean;
  hasNewsletter: boolean;
  hasChatWidget: boolean;
  paymentMethods: string[];
  thirdPartyApps: string[];
}

interface AnalysisResult {
  data: AggregatedData;
  report: AIReport;
  meta: { title: string; description: string; domain: string };
  socialLinks: SocialLinks;
  techAnalysis: TechAnalysis;
}

// ============ COMPONENTS ============

const CHART_COLORS = ["#18181b", "#27272a", "#3f3f46", "#52525b", "#71717a", "#a1a1aa"];
const ITEMS_PER_PAGE = 12;

// User Menu Component
function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
          {session.user.name?.charAt(0) || <User className="w-4 h-4" />}
        </div>
        <span className="text-sm font-medium hidden sm:inline">{session.user.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border rounded-xl shadow-lg z-50 py-2">
            <div className="px-4 py-2 border-b">
              <p className="font-medium text-sm">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ScoreRing({ score, size = 60, label }: { score: number; size?: number; label?: string }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={color} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${color}`}>{score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

// 市场定位翻译
function getPositioningLabel(positioning: string): string {
  const labels: Record<string, string> = {
    budget: "性价比定位",
    "mid-range": "中端定位",
    premium: "高端定位",
    luxury: "奢侈品定位",
  };
  return labels[positioning] || positioning;
}

function ImpactBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };
  const labels: Record<string, string> = { high: "高", medium: "中", low: "低" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level] || colors.low}`}>{labels[level] || level}</span>;
}

function PriceTierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    budget: "bg-blue-100 text-blue-800",
    "mid-range": "bg-green-100 text-green-800",
    premium: "bg-purple-100 text-purple-800",
    luxury: "bg-amber-100 text-amber-800",
  };
  const labels: Record<string, string> = {
    budget: "性价比",
    "mid-range": "中端",
    premium: "高端",
    luxury: "奢侈",
  };
  return <Badge className={colors[tier]}>{labels[tier]}</Badge>;
}

// Product Detail Modal
function ProductDetailModal({ product, onClose, domain }: { product: ProductDetail; onClose: () => void; domain: string }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [descLang, setDescLang] = useState<"en" | "zh">("en");
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  // Convert HTML description to markdown
  const descriptionMarkdown = useMemo(() => {
    if (!product.description) return "";
    try {
      const turndownService = new TurndownService({
        headingStyle: "atx",
        bulletListMarker: "-",
        codeBlockStyle: "fenced",
      });
      return turndownService.turndown(product.description);
    } catch {
      // Fallback: if turndown fails, return raw text
      return product.description.replace(/<[^>]+>/g, "");
    }
  }, [product.description]);

  // Translate description on demand
  const handleTranslate = useCallback(async () => {
    if (translatedDesc) {
      setDescLang("zh");
      return;
    }
    setIsTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: descriptionMarkdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "翻译失败");
      setTranslatedDesc(data.translated);
      setDescLang("zh");
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : "翻译失败");
    } finally {
      setIsTranslating(false);
    }
  }, [descriptionMarkdown, translatedDesc]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-5xl my-4 flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold truncate flex-1 mr-4">{product.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Images */}
              <div>
                <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4">
                  {product.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[selectedImage]?.src || product.primary_image || ""} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-20 h-20 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.slice(0, 6).map((img, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${selectedImage === i ? "border-foreground" : "border-transparent"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <ImageIcon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{product.image_count}</p>
                    <p className="text-xs text-muted-foreground">图片</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Layers className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{product.variant_count}</p>
                    <p className="text-xs text-muted-foreground">SKU</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{product.days_since_published}</p>
                    <p className="text-xs text-muted-foreground">天前上架</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Hash className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{product.tags.length}</p>
                    <p className="text-xs text-muted-foreground">标签</p>
                  </div>
                </div>
              </div>

              {/* Right: Info */}
              <div className="space-y-6">
                {/* Price & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold">${product.price}</span>
                      {product.compare_at_price && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">${product.compare_at_price}</span>
                          <Badge className="bg-red-600">-{product.discount_percent}%</Badge>
                        </>
                      )}
                    </div>
                    {product.price_range.min !== product.price_range.max && (
                      <p className="text-sm text-muted-foreground">价格区间: ${product.price_range.min} - ${product.price_range.max}</p>
                    )}
                  </div>
                  <Badge variant={product.available ? "default" : "secondary"}>{product.available ? "在售" : "缺货"}</Badge>
                </div>

                {/* AI Insights Card */}
                <Card className="bg-gradient-to-br from-muted/50 to-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI 产品洞察
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriceTierBadge tier={product.insights.price_tier} />
                      <Badge variant="outline">{product.insights.competitive_position}</Badge>
                      {product.insights.seasonality && <Badge variant="outline">{product.insights.seasonality}</Badge>}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">目标人群</p>
                      <div className="flex flex-wrap gap-1">
                        {product.insights.target_audience.map((aud, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {aud}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {product.insights.key_features.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">产品特点</p>
                        <div className="flex flex-wrap gap-1">
                          {product.insights.key_features.map((feat, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{feat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Classification */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">品牌/供应商</p>
                    <p className="font-medium">{product.vendor || "未知"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">产品类型</p>
                    <p className="font-medium">{product.product_type || "未分类"}</p>
                  </div>
                </div>

                {/* Options/Variants */}
                {product.options.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">产品选项</p>
                    <div className="space-y-2">
                      {product.options.map((opt) => (
                        <div key={opt.name}>
                          <p className="text-sm font-medium mb-1">{opt.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {opt.values.slice(0, 10).map((val) => (
                              <Badge key={val} variant="outline" className="text-xs">{val}</Badge>
                            ))}
                            {opt.values.length > 10 && <Badge variant="outline" className="text-xs">+{opt.values.length - 10}</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">标签</p>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 12).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                      {product.tags.length > 12 && <Badge variant="secondary" className="text-xs">+{product.tags.length - 12}</Badge>}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">发布时间</p>
                    <p>{new Date(product.published_at).toLocaleDateString("zh-CN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">最后更新</p>
                    <p>{new Date(product.updated_at).toLocaleDateString("zh-CN")}</p>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">产品描述</p>
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                        <button
                          onClick={() => setDescLang("en")}
                          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                            descLang === "en"
                              ? "bg-background text-foreground shadow-sm font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => {
                            if (translatedDesc) {
                              setDescLang("zh");
                            } else {
                              handleTranslate();
                            }
                          }}
                          disabled={isTranslating}
                          className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${
                            descLang === "zh"
                              ? "bg-background text-foreground shadow-sm font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          } ${isTranslating ? "opacity-60 cursor-wait" : ""}`}
                        >
                          {isTranslating && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          中文
                        </button>
                      </div>
                    </div>
                    <div className="text-sm bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                      {descLang === "en" ? (
                        <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{descriptionMarkdown}</ReactMarkdown>
                        </div>
                      ) : translatedDesc ? (
                        <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{translatedDesc}</ReactMarkdown>
                        </div>
                      ) : null}
                      {translateError && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {translateError}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1">
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      查看商品页面
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Product List with filters
function ProductList({ products, domain }: { products: ProductDetail[]; domain: string }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "discount">("newest");
  const [filterType, setFilterType] = useState<string>("");
  const [filterVendor, setFilterVendor] = useState<string>("");
  const [filterTier, setFilterTier] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);

  // Get unique types and vendors for filters
  const uniqueTypes = useMemo(() => [...new Set(products.map((p) => p.product_type).filter(Boolean))], [products]);
  const uniqueVendors = useMemo(() => [...new Set(products.map((p) => p.vendor).filter(Boolean))], [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(s) || p.vendor.toLowerCase().includes(s) || p.tags.some((t) => t.toLowerCase().includes(s)));
    }

    // Filters
    if (filterType) result = result.filter((p) => p.product_type === filterType);
    if (filterVendor) result = result.filter((p) => p.vendor === filterVendor);
    if (filterTier) result = result.filter((p) => p.insights.price_tier === filterTier);

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        result.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
        break;
    }

    return result;
  }, [products, search, filterType, filterVendor, filterTier, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterVendor, filterTier, sortBy]);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜索商品名称、品牌、标签..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="h-10 px-3 rounded-md border bg-background text-sm">
          <option value="newest">最新上架</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
          <option value="discount">折扣力度</option>
        </select>

        {uniqueTypes.length > 1 && (
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
            <option value="">所有类型</option>
            {uniqueTypes.slice(0, 20).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        {uniqueVendors.length > 1 && (
          <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
            <option value="">所有品牌</option>
            {uniqueVendors.slice(0, 20).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}

        <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
          <option value="">所有价位</option>
          <option value="budget">性价比</option>
          <option value="mid-range">中端</option>
          <option value="premium">高端</option>
          <option value="luxury">奢侈</option>
        </select>

        <div className="flex border rounded-md">
          <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-muted" : ""}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        共 {filteredProducts.length} 个商品
        {(search || filterType || filterVendor || filterTier) && ` (已筛选)`}
      </p>

      {/* Product Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {paginatedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted relative overflow-hidden">
                {product.primary_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.primary_image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                {product.discount_percent && <Badge className="absolute top-2 right-2 bg-red-600">-{product.discount_percent}%</Badge>}
                {!product.available && <Badge className="absolute top-2 left-2 bg-gray-600">缺货</Badge>}
                <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                  <PriceTierBadge tier={product.insights.price_tier} />
                </div>
                {/* Detail Button - shows on hover */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <div className="bg-white rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Eye className="w-5 h-5 text-gray-800" />
                  </div>
                </button>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">${product.price}</span>
                  {product.compare_at_price && <span className="text-xs text-muted-foreground line-through">${product.compare_at_price}</span>}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{product.variant_count} SKU</span>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors text-foreground"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>详情</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 p-4">
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  {product.primary_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.primary_image} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">{product.vendor} · {product.product_type}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PriceTierBadge tier={product.insights.price_tier} />
                    {product.insights.target_audience.slice(0, 2).map((aud, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{aud}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${product.price}</span>
                    {product.discount_percent && <Badge className="bg-red-600">-{product.discount_percent}%</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{product.variant_count} SKU · {product.image_count} 图</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(product)}
                  className="shrink-0 gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  详情
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            第 {currentPage} / {totalPages} 页
          </span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && <ProductDetailModal product={selectedProduct} domain={domain} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ============ MAIN PAGE ============

const loadingMessages = ["正在连接店铺服务器...", "正在抓取商品数据库...", "正在分析网站技术栈...", "正在计算价格分布模型...", "正在解析产品矩阵...", "正在评估网站健康度...", "AI 分析师正在生成洞察...", "即将完成..."];

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PlatformErrorInfo | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"insights" | "products">("insights");

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError({ message: "请输入店铺 URL" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingMessageIndex(0);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        // Check if it's a platform detection error with extra info
        if (responseData.errorType && responseData.platformInfo) {
          setError({
            message: responseData.error,
            errorType: responseData.errorType,
            platformInfo: responseData.platformInfo,
          });
        } else {
          setError({ message: responseData.error || "分析失败" });
        }
        return;
      }
      setResult(responseData);
      setActiveTab("insights"); // 分析完成后默认显示 AI 洞察 tab
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : "分析过程中发生错误" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!result) {
    return (
      <main className="min-h-screen geo-pattern flex items-center justify-center px-4 relative">
        {/* User Menu - Fixed Position */}
        <div className="absolute top-4 right-4">
          <UserMenu />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-foreground text-background mb-6">
            <Store className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Shopify Insight <Sparkles className="w-8 h-8 inline-block text-muted-foreground" />
          </h1>
          <p className="text-lg text-muted-foreground mb-12">AI 驱动的独立站商业智能分析平台</p>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-foreground/5 via-foreground/10 to-foreground/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex gap-3 p-2 bg-card rounded-2xl border shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="text" placeholder="输入 Shopify 店铺域名..." value={url} onChange={(e) => setUrl(e.target.value)} onKeyPress={(e) => e.key === "Enter" && !isLoading && handleAnalyze()} disabled={isLoading} className="pl-12 h-14 text-lg border-0 bg-transparent focus-visible:ring-0" />
              </div>
              <Button onClick={handleAnalyze} disabled={isLoading} size="lg" className="h-14 px-8 rounded-xl">
                {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />分析中</> : <>开始分析<ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </div>
          </div>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                <motion.div className="h-full bg-foreground" initial={{ width: "0%" }} animate={{ width: "90%" }} transition={{ duration: 60 }} />
              </div>
              <p className="text-muted-foreground">{loadingMessages[loadingMessageIndex]}</p>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-left">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">{error.message}</p>
                    
                    {error.platformInfo && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-background">
                            检测平台: {error.platformInfo.platformName}
                          </Badge>
                          <Badge variant="outline" className="bg-background">
                            置信度: {error.platformInfo.confidence === "high" ? "高" : error.platformInfo.confidence === "medium" ? "中" : "低"}
                          </Badge>
                        </div>
                        
                        {error.platformInfo.indicators.length > 0 && (
                          <div className="p-3 bg-background/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">检测指标:</p>
                            <ul className="text-xs space-y-1">
                              {error.platformInfo.indicators.slice(0, 6).map((indicator, i) => (
                                <li key={i} className="text-muted-foreground flex items-start gap-1.5">
                                  <span className="shrink-0">{indicator.startsWith("✓") ? "✓" : indicator.startsWith("⚠️") ? "⚠️" : "•"}</span>
                                  <span>{indicator.replace(/^[✓⚠️]\s*/, "")}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {error.errorType === "PLATFORM_NOT_SUPPORTED" && (
                          <p className="text-xs text-muted-foreground">
                            提示: 本工具目前仅支持分析开放 products.json API 的 Shopify 店铺。
                          </p>
                        )}
                        
                        {error.errorType === "SHOPIFY_API_DISABLED" && (
                          <p className="text-xs text-muted-foreground">
                            提示: 该店铺可能通过 Shopify 设置或第三方应用禁用了公开 API 访问。
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-12 text-sm text-muted-foreground">
            <p className="mb-3">示例店铺:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["gymshark.com", "allbirds.com", "bombas.com"].map((ex) => (
                <button key={ex} onClick={() => setUrl(ex)} className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors">{ex}</button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // Dashboard
  return (
    <main className="min-h-screen geo-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold">{result.meta.title}</h1>
              <a href={`https://${result.meta.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                {result.meta.domain} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button onClick={() => setActiveTab("insights")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "insights" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}>
              <Sparkles className="w-4 h-4 inline mr-2" />AI 洞察
            </button>
            <button onClick={() => setActiveTab("products")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "products" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}>
              <ShoppingBag className="w-4 h-4 inline mr-2" />商品库 ({result.data.all_products.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setResult(null); setUrl(""); }}>分析新店铺</Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "insights" ? (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Executive Summary */}
              <Card className="mb-6 bg-gradient-to-br from-card to-muted/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium text-muted-foreground">AI 执行摘要</span>
                        <Badge variant="secondary">置信度 {result.report.executiveSummary.confidenceScore}%</Badge>
                      </div>
                      <h2 className="text-2xl font-bold mb-3">{result.report.executiveSummary.headline}</h2>
                      <p className="text-muted-foreground">{result.report.executiveSummary.verdict}</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {result.report.executiveSummary.keyMetrics.map((m, i) => (
                        <div key={i} className="min-w-[100px] p-3 bg-background rounded-xl border">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-muted-foreground">{m.label}</span>
                            <TrendIcon trend={m.trend} />
                          </div>
                          <span className="text-xl font-bold">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Market & Persona Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2"><Target className="w-4 h-4" />市场定位</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge>{getPositioningLabel(result.report.marketPosition.positioning)}</Badge>
                          <span className="text-sm text-muted-foreground">{result.report.marketPosition.targetMarketSize}</span>
                        </div>
                        <p className="font-medium">{result.report.marketPosition.niche}</p>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">竞争优势</p>
                          <div className="flex flex-wrap gap-1">
                            {result.report.marketPosition.competitiveAdvantages.map((a, i) => <Badge key={i} variant="outline">{a}</Badge>)}
                          </div>
                        </div>
                        {result.report.marketPosition.marketTrends && result.report.marketPosition.marketTrends.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">市场趋势</p>
                            <ul className="text-xs space-y-1">
                              {result.report.marketPosition.marketTrends.slice(0, 3).map((t, i) => <li key={i}>• {t}</li>)}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* 用户画像概览卡片 */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium flex items-center gap-2"><Users className="w-4 h-4" />目标用户</CardTitle>
                          <Badge variant="outline" className="text-xs">置信度 {result.report.userPersona.overview.confidenceLevel}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* 主要用户 */}
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{result.report.userPersona.primaryPersona.avatar}</span>
                            <div className="flex-1">
                              <p className="font-semibold">{result.report.userPersona.primaryPersona.name}</p>
                              <p className="text-xs text-muted-foreground">{result.report.userPersona.primaryPersona.tagline}</p>
                            </div>
                            <Badge>{result.report.userPersona.overview.primarySegmentShare}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-muted-foreground">年龄:</span> {result.report.userPersona.primaryPersona.demographics.ageRange}</div>
                            <div><span className="text-muted-foreground">收入:</span> {result.report.userPersona.primaryPersona.demographics.income}</div>
                            <div><span className="text-muted-foreground">职业:</span> {result.report.userPersona.primaryPersona.demographics.occupation}</div>
                            <div><span className="text-muted-foreground">地区:</span> {result.report.userPersona.primaryPersona.demographics.location}</div>
                          </div>
                        </div>
                        
                        {/* 次要用户 */}
                        <div className="p-3 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{result.report.userPersona.secondaryPersona.avatar}</span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{result.report.userPersona.secondaryPersona.name}</p>
                              <p className="text-xs text-muted-foreground">{result.report.userPersona.secondaryPersona.tagline}</p>
                            </div>
                          </div>
                        </div>

                        {/* 市场规模 */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-muted/30 rounded-lg text-center">
                            <p className="text-muted-foreground">可触达市场</p>
                            <p className="font-bold">{result.report.userPersona.marketSizing.estimatedTAM}</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded-lg text-center">
                            <p className="text-muted-foreground">可获取市场</p>
                            <p className="font-bold">{result.report.userPersona.marketSizing.estimatedSOM}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* 用户画像详情 - 独立大卡片 */}
                  <Card className="lg:col-span-12">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        用户画像深度分析
                        <span className="text-xs font-normal text-muted-foreground ml-2">{result.report.userPersona.overview.segmentationBasis}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 主要用户详情 */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                            <span className="text-4xl">{result.report.userPersona.primaryPersona.avatar}</span>
                            <div>
                              <h4 className="font-bold text-lg">{result.report.userPersona.primaryPersona.name}</h4>
                              <p className="text-sm text-muted-foreground">{result.report.userPersona.primaryPersona.tagline}</p>
                            </div>
                          </div>

                          {/* 人口统计 */}
                          <div className="p-3 border rounded-xl">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><Users className="w-3 h-3" />人口特征</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">年龄:</span> {result.report.userPersona.primaryPersona.demographics.ageRange}</div>
                              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">性别:</span> {result.report.userPersona.primaryPersona.demographics.gender}</div>
                              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">收入:</span> {result.report.userPersona.primaryPersona.demographics.income}</div>
                              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">学历:</span> {result.report.userPersona.primaryPersona.demographics.education}</div>
                              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">职业:</span> {result.report.userPersona.primaryPersona.demographics.occupation}</div>
                              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">地区:</span> {result.report.userPersona.primaryPersona.demographics.location}</div>
                              <div className="p-2 bg-muted/30 rounded col-span-2"><span className="text-muted-foreground">家庭:</span> {result.report.userPersona.primaryPersona.demographics.familyStatus}</div>
                            </div>
                          </div>

                          {/* 消费画像 */}
                          <div className="p-3 border rounded-xl">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3" />消费画像</h5>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>消费能力</span>
                                <Badge variant={result.report.userPersona.primaryPersona.consumptionProfile.spendingPower === "高" ? "default" : "secondary"}>{result.report.userPersona.primaryPersona.consumptionProfile.spendingPower}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span>价格敏感度</span>
                                <Badge variant="outline">{result.report.userPersona.primaryPersona.consumptionProfile.pricesSensitivity}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span>品牌忠诚度</span>
                                <Badge variant="outline">{result.report.userPersona.primaryPersona.consumptionProfile.brandLoyalty}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span>购买频率</span>
                                <span className="text-muted-foreground">{result.report.userPersona.primaryPersona.consumptionProfile.purchaseFrequency}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span>预估客单价</span>
                                <span className="font-medium">{result.report.userPersona.primaryPersona.consumptionProfile.averageOrderValue}</span>
                              </div>
                            </div>
                          </div>

                          {/* 痛点与需求 */}
                          <div className="p-3 border rounded-xl">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />痛点与需求</h5>
                            <div className="space-y-2">
                              {result.report.userPersona.primaryPersona.painPointsAndNeeds.primaryPainPoints.map((p, i) => (
                                <div key={i} className="flex items-center justify-between text-xs p-2 bg-red-50 dark:bg-red-950/30 rounded">
                                  <span>{p.point}</span>
                                  <Badge variant={p.intensity === "高" ? "destructive" : "outline"} className="text-xs">{p.intensity}</Badge>
                                </div>
                              ))}
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1">期望结果:</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.report.userPersona.primaryPersona.painPointsAndNeeds.desiredOutcomes.map((o, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{o}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 右侧：行为和营销 */}
                        <div className="space-y-4">
                          {/* 生活方式 */}
                          <div className="p-3 border rounded-xl">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><Activity className="w-3 h-3" />生活方式</h5>
                            <p className="text-xs text-muted-foreground mb-2">{result.report.userPersona.primaryPersona.lifestyle.dailyRoutine}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {result.report.userPersona.primaryPersona.lifestyle.hobbies.map((h, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                              ))}
                            </div>
                            <p className="text-xs"><span className="text-muted-foreground">技术使用:</span> {result.report.userPersona.primaryPersona.lifestyle.technologyUsage}</p>
                          </div>

                          {/* 心理特征 */}
                          <div className="p-3 border rounded-xl">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" />心理特征</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">核心价值观</p>
                                {result.report.userPersona.primaryPersona.psychographics.coreValues.map((v, i) => (
                                  <p key={i} className="text-xs">• {v}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">追求目标</p>
                                {result.report.userPersona.primaryPersona.psychographics.aspirations.map((a, i) => (
                                  <p key={i} className="text-xs">• {a}</p>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 购买旅程 */}
                          <div className="p-3 border rounded-xl">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><Target className="w-3 h-3" />购买决策</h5>
                            <div className="space-y-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">认知渠道:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.report.userPersona.primaryPersona.purchaseJourney.awarenessChannels.map((c, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">评估标准:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.report.userPersona.primaryPersona.purchaseJourney.evaluationCriteria.map((c, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">购买触发:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.report.userPersona.primaryPersona.purchaseJourney.purchaseTriggers.map((t, i) => (
                                    <Badge key={i} className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 营销建议 */}
                          <div className="p-3 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-xl">
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><Zap className="w-3 h-3" />营销建议</h5>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">最佳触达时间</span>
                                <span className="font-medium">{result.report.userPersona.primaryPersona.marketingRecommendations.bestTimeToReach}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">沟通语调</span>
                                <span>{result.report.userPersona.primaryPersona.marketingRecommendations.messagingTone}</span>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">推荐渠道:</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.report.userPersona.primaryPersona.marketingRecommendations.bestChannels.map((c, i) => (
                                    <Badge key={i} variant="default" className="text-xs">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">推荐内容:</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.report.userPersona.primaryPersona.marketingRecommendations.contentTypes.map((c, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 获客策略 */}
                      <div className="mt-6 p-4 border rounded-xl bg-muted/20">
                        <h5 className="text-sm font-medium mb-3 flex items-center gap-1"><Target className="w-4 h-4" />用户获取策略</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">推荐获客渠道</p>
                            <div className="space-y-1">
                              {result.report.userPersona.acquisitionStrategy.recommendedChannels.map((ch, i) => (
                                <div key={i} className="flex items-center justify-between text-xs p-2 bg-background rounded">
                                  <span>{ch.channel}</span>
                                  <Badge variant={ch.priority === "高" ? "default" : "secondary"} className="text-xs">{ch.priority}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">留存策略</p>
                            <ul className="space-y-1">
                              {result.report.userPersona.acquisitionStrategy.retentionStrategies.map((s, i) => (
                                <li key={i} className="text-xs flex items-start gap-1"><CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">LTV 优化建议</p>
                            <ul className="space-y-1">
                              {result.report.userPersona.acquisitionStrategy.ltvOptimization.map((l, i) => (
                                <li key={i} className="text-xs flex items-start gap-1"><Lightbulb className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />{l}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs">
                          <span><span className="text-muted-foreground">预估获客成本:</span> <span className="font-bold">{result.report.userPersona.acquisitionStrategy.estimatedCAC}</span></span>
                          <span><span className="text-muted-foreground">市场增长潜力:</span> <span className="font-medium">{result.report.userPersona.marketSizing.growthPotential}</span></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SWOT */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2"><PieChartIcon className="w-4 h-4" />SWOT 分析</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl">
                          <h4 className="font-medium text-green-700 dark:text-green-400 text-sm mb-2"><CheckCircle className="w-4 h-4 inline mr-1" />优势</h4>
                          <ul className="space-y-1 text-xs">{result.report.swotAnalysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
                          <h4 className="font-medium text-red-700 dark:text-red-400 text-sm mb-2"><XCircle className="w-4 h-4 inline mr-1" />劣势</h4>
                          <ul className="space-y-1 text-xs">{result.report.swotAnalysis.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}</ul>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                          <h4 className="font-medium text-blue-700 dark:text-blue-400 text-sm mb-2"><Lightbulb className="w-4 h-4 inline mr-1" />机会</h4>
                          <ul className="space-y-1 text-xs">{result.report.swotAnalysis.opportunities.map((o, i) => <li key={i}>• {o}</li>)}</ul>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                          <h4 className="font-medium text-orange-700 dark:text-orange-400 text-sm mb-2"><AlertTriangle className="w-4 h-4 inline mr-1" />威胁</h4>
                          <ul className="space-y-1 text-xs">{result.report.swotAnalysis.threats.map((t, i) => <li key={i}>• {t}</li>)}</ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2"><Lightbulb className="w-4 h-4" />战略建议</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.report.strategicRecommendations.slice(0, 5).map((rec, i) => (
                          <div key={i} className="p-3 bg-muted/50 rounded-xl">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">{rec.priority}</span>
                                  <h4 className="font-medium">{rec.title}</h4>
                                  <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                              </div>
                              <div className="flex gap-2 text-xs shrink-0">
                                <div className="text-center"><p className="text-muted-foreground mb-0.5">影响</p><ImpactBadge level={rec.impact} /></div>
                                <div className="text-center"><p className="text-muted-foreground mb-0.5">难度</p><ImpactBadge level={rec.effort} /></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><DollarSign className="w-4 h-4" />价格分布</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.data.price_distribution} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                              <Bar dataKey="count" radius={[4, 4, 0, 0]}>{result.data.price_distribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Tag className="w-4 h-4" />产品类型</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={result.data.product_type_analysis.slice(0, 5)} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="count" nameKey="type">
                                {result.data.product_type_analysis.slice(0, 5).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                              <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Calendar className="w-4 h-4" />发布时间线 <span className="text-xs text-muted-foreground font-normal ml-2">月均 {result.data.timeline_analysis.avgProductsPerMonth} 个</span></CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={result.data.timeline_analysis.publishingFrequency} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                            <Line type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ fill: CHART_COLORS[0], r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Activity className="w-4 h-4" />综合评分</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={[
                            { subject: "产品", score: result.report.productStrategy.overallScore },
                            { subject: "运营", score: result.report.operationsAssessment.overallScore },
                            { subject: "营销", score: result.report.marketingAnalysis.overallScore },
                            { subject: "品牌", score: result.report.marketingAnalysis.brandStrength },
                            { subject: "SEO", score: result.data.website_health.seo },
                          ]}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <Radar dataKey="score" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <ScoreRing score={result.report.productStrategy.overallScore} size={50} label="产品" />
                        <ScoreRing score={result.report.operationsAssessment.overallScore} size={50} label="运营" />
                        <ScoreRing score={result.report.marketingAnalysis.overallScore} size={50} label="营销" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Zap className="w-4 h-4" />快速优化项</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.report.operationsAssessment.quickWins.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span>{w}</span></li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4" />营销渠道</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.report.marketingAnalysis.channels.map((ch, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-16 text-sm truncate">{ch.name}</div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${ch.status === "active" ? "bg-green-500" : ch.status === "potential" ? "bg-yellow-500" : "bg-gray-400"}`} style={{ width: `${ch.score}%` }} />
                            </div>
                            <Badge variant={ch.status === "active" ? "default" : "secondary"} className="text-xs">{ch.status === "active" ? "活跃" : ch.status === "potential" ? "潜力" : "未启用"}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 竞品分析概览 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium flex items-center gap-2"><Award className="w-4 h-4" />竞品分析</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">置信度 {result.report.competitorAnalysis.overview.analysisConfidence}%</Badge>
                          <Badge variant={result.report.competitorAnalysis.overview.competitiveIntensity === "激烈" ? "destructive" : "secondary"} className="text-xs">
                            竞争{result.report.competitorAnalysis.overview.competitiveIntensity}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 市场格局 */}
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">市场格局</p>
                        <p className="text-sm mb-2">{result.report.competitorAnalysis.marketLandscape.marketTrend}</p>
                        <div className="flex flex-wrap gap-1">
                          {result.report.competitorAnalysis.marketLandscape.leaderBrands.map((b, i) => (
                            <Badge key={i} variant="default" className="text-xs">{b}</Badge>
                          ))}
                          {result.report.competitorAnalysis.marketLandscape.emergingBrands.map((b, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{b}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* 定位地图 */}
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">市场定位</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <span className="text-muted-foreground">当前:</span>
                            <span className="ml-1">{result.report.competitorAnalysis.positioningMap.xAxis} {result.report.competitorAnalysis.positioningMap.currentPosition.x}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">建议:</span>
                            <span className="ml-1 text-green-600">{result.report.competitorAnalysis.positioningMap.recommendedPosition.x}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.report.competitorAnalysis.positioningMap.positioningGap}</p>
                      </div>

                      {/* 竞争优势 */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                          <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">核心优势</p>
                          <ul className="text-xs space-y-0.5">
                            {result.report.competitorAnalysis.competitiveAdvantage.currentAdvantages.slice(0, 2).map((a, i) => (
                              <li key={i}>• {a}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                          <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">薄弱环节</p>
                          <ul className="text-xs space-y-0.5">
                            {result.report.competitorAnalysis.competitiveAdvantage.vulnerabilities.slice(0, 2).map((v, i) => (
                              <li key={i}>• {v}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground italic">{result.report.competitorAnalysis.overview.dataSourceSummary}</p>
                    </CardContent>
                  </Card>

                  {/* 竞品详细对比 */}
                  <Card className="lg:col-span-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        竞品详细对比
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                          分析 {result.report.competitorAnalysis.overview.totalCompetitorsAnalyzed} 个竞品
                        </span>
                      </CardTitle>
                      {/* 数据来源图例 */}
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <SearchCheck className="w-3 h-3" />搜索验证
                          </span>
                          <span className="text-[10px] text-muted-foreground">通过 Google 搜索确认的真实竞品</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Brain className="w-3 h-3" />AI 推理
                          </span>
                          <span className="text-[10px] text-muted-foreground">基于 AI 行业知识推理的竞品</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.report.competitorAnalysis.competitors.map((comp, i) => (
                          <div key={i} className={`p-4 border rounded-xl bg-card ${comp.sourceType === "search_grounded" ? "border-emerald-200 dark:border-emerald-800/50" : comp.sourceType === "ai_inference" ? "border-amber-200 dark:border-amber-800/50" : ""}`}>
                            {/* 竞品头部 */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold">{comp.name}</h4>
                                  {comp.websiteUrl && (
                                    <a 
                                      href={comp.websiteUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-600 transition-colors"
                                      title="访问官网"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  <Badge variant="outline" className="text-xs">{comp.category}</Badge>
                                  {comp.sourceType === "search_grounded" ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                      <SearchCheck className="w-3 h-3" />搜索验证
                                    </span>
                                  ) : comp.sourceType === "ai_inference" ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                      <Brain className="w-3 h-3" />AI 推理
                                    </span>
                                  ) : null}
                                </div>
                                {comp.websiteUrl && (
                                  <a 
                                    href={comp.websiteUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline mb-1 inline-block"
                                  >
                                    {comp.websiteUrl}
                                  </a>
                                )}
                                <p className="text-sm text-muted-foreground">{comp.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs text-muted-foreground">置信度</span>
                                  <Badge variant={comp.confidenceLevel >= 85 ? "default" : comp.confidenceLevel >= 70 ? "secondary" : "outline"} className="text-xs">
                                    {comp.confidenceLevel}%
                                  </Badge>
                                </div>
                                <ScoreRing score={comp.metrics.strengthScore} size={40} />
                              </div>
                            </div>

                            {/* 定位对比 */}
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="p-2 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-0.5">价格定位</p>
                                <p className="text-sm font-medium">{comp.positioning.pricePosition}</p>
                              </div>
                              <div className="p-2 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-0.5">目标市场</p>
                                <p className="text-sm font-medium truncate">{comp.positioning.targetMarket}</p>
                              </div>
                              <div className="p-2 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-0.5">品牌定位</p>
                                <p className="text-sm font-medium truncate">{comp.positioning.brandPosition}</p>
                              </div>
                            </div>

                            {/* 数据指标 */}
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="text-center p-2 border rounded-lg">
                                <p className="text-xs text-muted-foreground">预估产品数</p>
                                <p className="text-sm font-bold">{comp.metrics.estimatedProductCount}</p>
                              </div>
                              <div className="text-center p-2 border rounded-lg">
                                <p className="text-xs text-muted-foreground">预估价格区间</p>
                                <p className="text-sm font-bold">{comp.metrics.estimatedPriceRange}</p>
                              </div>
                              <div className="text-center p-2 border rounded-lg">
                                <p className="text-xs text-muted-foreground">预估市场份额</p>
                                <p className="text-sm font-bold">{comp.metrics.estimatedMarketShare}</p>
                              </div>
                            </div>

                            {/* 优劣势对比 */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />竞品优势</p>
                                <ul className="text-xs space-y-0.5 text-muted-foreground">
                                  {comp.comparison.advantages.map((a, j) => <li key={j}>• {a}</li>)}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1"><XCircle className="w-3 h-3" />竞品劣势</p>
                                <ul className="text-xs space-y-0.5 text-muted-foreground">
                                  {comp.comparison.disadvantages.map((d, j) => <li key={j}>• {d}</li>)}
                                </ul>
                              </div>
                            </div>

                            {/* 战略洞察 */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3" />战略洞察</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground mb-1">可借鉴:</p>
                                  {comp.strategicInsights.whatToLearn.map((w, j) => <p key={j} className="text-green-600">✓ {w}</p>)}
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">竞争机会:</p>
                                  {comp.strategicInsights.opportunities.map((o, j) => <p key={j} className="text-blue-600">→ {o}</p>)}
                                </div>
                              </div>
                            </div>

                            {/* 数据来源 */}
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-muted-foreground italic">数据来源: {comp.dataSource}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Package className="w-4 h-4" />核心数据</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">商品总数</p><p className="text-xl font-bold">{result.data.stats.total_products}</p></div>
                        <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">SKU 总数</p><p className="text-xl font-bold">{result.data.variant_analysis.totalVariants}</p></div>
                        <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">平均价格</p><p className="text-xl font-bold">${result.data.stats.average_price}</p></div>
                        <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">打折比例</p><p className="text-xl font-bold">{result.data.discount_analysis.discountPercentage}%</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProductList products={result.data.all_products} domain={result.meta.domain} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t mt-8 py-6 text-center text-sm text-muted-foreground">
        Powered by <span className="font-medium text-foreground">Shopify Insight AI</span>
      </footer>
    </main>
  );
}
