import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIContext } from "./data-aggregator";

// Structured AI Report Types
export interface ExecutiveSummary {
  headline: string;
  keyMetrics: { label: string; value: string; trend: "up" | "down" | "neutral" }[];
  verdict: string;
  confidenceScore: number;
}

export interface MarketPosition {
  niche: string;
  positioning: "budget" | "mid-range" | "premium" | "luxury";
  targetMarketSize: string;
  competitiveAdvantages: string[];
  marketTrends: string[];
}

export interface UserPersona {
  primaryPersona: {
    name: string;
    age: string;
    gender: string;
    income: string;
    occupation: string;
    location: string;
  };
  psychographics: {
    values: string[];
    interests: string[];
    painPoints: string[];
    buyingMotivations: string[];
  };
  behaviorPatterns: {
    shoppingFrequency: string;
    decisionFactors: string[];
    preferredChannels: string[];
  };
}

export interface ProductStrategy {
  overallScore: number;
  skuDepthRating: number;
  pricingStrategy: {
    type: string;
    analysis: string;
    recommendations: string[];
  };
  productMixInsights: string[];
  gapAnalysis: string[];
}

export interface OperationsAssessment {
  overallScore: number;
  uxScore: number;
  trustScore: number;
  conversionScore: number;
  strengths: string[];
  weaknesses: string[];
  quickWins: string[];
}

export interface MarketingAnalysis {
  overallScore: number;
  channels: { name: string; status: "active" | "inactive" | "potential"; score: number }[];
  contentStrategy: string;
  brandStrength: number;
  recommendations: string[];
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface StrategicRecommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  priority: number;
  category: string;
}

export interface CompetitorBenchmark {
  name: string;
  description: string;
  learningPoints: string[];
}

export interface AIReport {
  executiveSummary: ExecutiveSummary;
  marketPosition: MarketPosition;
  userPersona: UserPersona;
  productStrategy: ProductStrategy;
  operationsAssessment: OperationsAssessment;
  marketingAnalysis: MarketingAnalysis;
  swotAnalysis: SWOTAnalysis;
  strategicRecommendations: StrategicRecommendation[];
  competitorBenchmarks: CompetitorBenchmark[];
  generatedAt: string;
}

// Initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 环境变量未设置");
  }
  return new GoogleGenerativeAI(apiKey);
}

// Build comprehensive analysis prompt
function buildPrompt(context: AIContext): string {
  const {
    store_meta,
    stats,
    top_tags,
    vendor_analysis,
    product_type_analysis,
    discount_analysis,
    variant_analysis,
    image_analysis,
    timeline_analysis,
    inventory_analysis,
    social_links,
    tech_analysis,
    site_structure,
    seo_analysis,
    website_health,
    sample_products,
  } = context;

  // Format sample products
  const sampleProductsText = sample_products
    .slice(0, 8)
    .map(
      (p) =>
        `${p.title} | $${p.price}${p.compare_at_price ? ` (原价$${p.compare_at_price})` : ""} | ${p.vendor} | ${p.product_type}`
    )
    .join("\n");

  const vendorText = vendor_analysis
    .slice(0, 5)
    .map((v) => `${v.vendor}: ${v.productCount}个, 均价$${v.avgPrice}`)
    .join("; ");

  const typeText = product_type_analysis
    .slice(0, 5)
    .map((t) => `${t.type}: ${t.count}个`)
    .join("; ");

  const tagsText = top_tags.slice(0, 15).map((t) => t.tag).join(", ");

  const socialPresence = Object.entries(social_links)
    .filter(([, url]) => url)
    .map(([platform]) => platform)
    .join(", ") || "无";

  return `你是一位顶级电商战略顾问。请基于以下店铺数据，生成结构化的商业分析报告。

# 店铺数据

基本信息:
- 名称: ${store_meta.title}
- 域名: ${store_meta.domain}
- 描述: ${store_meta.description || "无"}
- 语言: ${tech_analysis.language}, 货币: ${tech_analysis.currency}

商品数据:
- 总数: ${stats.total_products}个, SKU: ${variant_analysis.totalVariants}
- 均价: $${stats.average_price}, 中位数: $${stats.median_price}
- 价格区间: $${stats.min_price} - $${stats.max_price}
- 打折商品: ${discount_analysis.totalProductsWithDiscount}个 (${discount_analysis.discountPercentage}%), 平均折扣: ${discount_analysis.averageDiscountPercent}%
- 在售: ${inventory_analysis.inStockProducts}个 (${inventory_analysis.inStockPercentage}%)

供应商: ${vendorText}
产品类型: ${typeText}
热门标签: ${tagsText}

网站功能:
- 主题: ${tech_analysis.shopifyTheme || "未知"}
- 评价系统: ${tech_analysis.hasReviews ? "有" : "无"}
- Newsletter: ${tech_analysis.hasNewsletter ? "有" : "无"}
- 在线客服: ${tech_analysis.hasChatWidget ? "有" : "无"}
- 支付方式: ${tech_analysis.paymentMethods.join(", ") || "未知"}
- 社交媒体: ${socialPresence}

网站结构:
- About页: ${site_structure.hasAboutPage ? "有" : "无"}
- 博客: ${site_structure.hasBlogSection ? "有" : "无"}
- FAQ: ${site_structure.hasFAQPage ? "有" : "无"}
- 退换政策: ${site_structure.hasReturnPolicy ? "有" : "无"}

健康评分:
- 综合: ${website_health.overall}/100
- SEO: ${website_health.seo}/100
- UX: ${website_health.ux}/100
- 信任: ${website_health.trust}/100
- 营销: ${website_health.marketing}/100

商品样本:
${sampleProductsText}

---

请严格按照以下 JSON 格式输出分析结果（只输出 JSON，不要有任何其他文字）：

{
  "executiveSummary": {
    "headline": "一句话概括店铺核心特征和市场定位",
    "keyMetrics": [
      {"label": "指标名称", "value": "数值", "trend": "up/down/neutral"},
      {"label": "指标名称", "value": "数值", "trend": "up/down/neutral"},
      {"label": "指标名称", "value": "数值", "trend": "up/down/neutral"},
      {"label": "指标名称", "value": "数值", "trend": "up/down/neutral"}
    ],
    "verdict": "2-3句话的整体评价和核心发现",
    "confidenceScore": 85
  },
  "marketPosition": {
    "niche": "精准的细分市场定义",
    "positioning": "budget/mid-range/premium/luxury",
    "targetMarketSize": "目标市场规模描述",
    "competitiveAdvantages": ["优势1", "优势2", "优势3"],
    "marketTrends": ["趋势1", "趋势2", "趋势3"]
  },
  "userPersona": {
    "primaryPersona": {
      "name": "典型用户昵称",
      "age": "25-35岁",
      "gender": "主要性别",
      "income": "收入水平",
      "occupation": "典型职业",
      "location": "主要地区"
    },
    "psychographics": {
      "values": ["价值观1", "价值观2", "价值观3"],
      "interests": ["兴趣1", "兴趣2", "兴趣3"],
      "painPoints": ["痛点1", "痛点2", "痛点3"],
      "buyingMotivations": ["动机1", "动机2", "动机3"]
    },
    "behaviorPatterns": {
      "shoppingFrequency": "购买频率描述",
      "decisionFactors": ["决策因素1", "决策因素2", "决策因素3"],
      "preferredChannels": ["渠道1", "渠道2"]
    }
  },
  "productStrategy": {
    "overallScore": 75,
    "skuDepthRating": 70,
    "pricingStrategy": {
      "type": "定价策略类型",
      "analysis": "定价策略分析",
      "recommendations": ["建议1", "建议2"]
    },
    "productMixInsights": ["洞察1", "洞察2", "洞察3"],
    "gapAnalysis": ["产品缺口1", "产品缺口2"]
  },
  "operationsAssessment": {
    "overallScore": 70,
    "uxScore": 75,
    "trustScore": 65,
    "conversionScore": 70,
    "strengths": ["优势1", "优势2", "优势3"],
    "weaknesses": ["劣势1", "劣势2", "劣势3"],
    "quickWins": ["快速优化项1", "快速优化项2", "快速优化项3"]
  },
  "marketingAnalysis": {
    "overallScore": 65,
    "channels": [
      {"name": "渠道名", "status": "active/inactive/potential", "score": 70},
      {"name": "渠道名", "status": "active/inactive/potential", "score": 50}
    ],
    "contentStrategy": "内容策略评估",
    "brandStrength": 70,
    "recommendations": ["建议1", "建议2", "建议3"]
  },
  "swotAnalysis": {
    "strengths": ["优势1", "优势2", "优势3", "优势4"],
    "weaknesses": ["劣势1", "劣势2", "劣势3", "劣势4"],
    "opportunities": ["机会1", "机会2", "机会3", "机会4"],
    "threats": ["威胁1", "威胁2", "威胁3", "威胁4"]
  },
  "strategicRecommendations": [
    {
      "title": "建议标题",
      "description": "详细描述",
      "impact": "high/medium/low",
      "effort": "high/medium/low",
      "priority": 1,
      "category": "类别"
    }
  ],
  "competitorBenchmarks": [
    {
      "name": "竞品名称或类型",
      "description": "简要描述",
      "learningPoints": ["学习点1", "学习点2"]
    }
  ]
}

注意：
1. 所有分析必须基于提供的数据，有理有据
2. 评分范围 0-100，要客观准确
3. 建议要具体可执行，避免空泛
4. strategicRecommendations 至少提供 5 条，按优先级排序
5. 只输出 JSON，不要有任何其他文字或解释
6. 【重要】所有输出内容必须使用中文（除了 JSON 字段名和 budget/mid-range/premium/luxury/high/medium/low/up/down/neutral/active/inactive/potential 这些枚举值）
7. 人物画像、洞察、建议、分析等所有描述性文字都必须是中文`;
}

// Available models to try
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-pro",
];

// Parse AI response to structured data
function parseAIResponse(text: string): AIReport {
  // Try to extract JSON from the response
  let jsonStr = text.trim();
  
  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
    console.error("Raw response:", text.substring(0, 500));
    throw new Error("AI 返回的数据格式无效，请重试");
  }
}

// Generate analysis report using Gemini
export async function generateAnalysisReport(
  context: AIContext
): Promise<AIReport> {
  const genAI = getGeminiClient();
  const prompt = buildPrompt(context);

  let lastError: Error | null = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent JSON output
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("AI 返回了空响应");
      }

      console.log(`Successfully got response from model: ${modelName}`);
      
      // Parse the JSON response
      const report = parseAIResponse(text);
      console.log("Successfully parsed AI report");
      
      return report;
    } catch (error) {
      console.error(`Model ${modelName} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (
        lastError.message.includes("not found") ||
        lastError.message.includes("404")
      ) {
        continue;
      }

      break;
    }
  }

  if (lastError) {
    console.error("Gemini API error:", lastError);

    if (
      lastError.message.includes("API_KEY") ||
      lastError.message.includes("API key")
    ) {
      throw new Error("Gemini API Key 无效或已过期");
    }
    if (
      lastError.message.includes("quota") ||
      lastError.message.includes("RESOURCE_EXHAUSTED")
    ) {
      throw new Error("Gemini API 调用配额已用尽，请稍后再试");
    }
    if (lastError.message.includes("rate")) {
      throw new Error("Gemini API 调用频率超限，请稍后再试");
    }
    if (
      lastError.message.includes("blocked") ||
      lastError.message.includes("safety")
    ) {
      throw new Error("内容被安全策略拦截，请尝试其他店铺");
    }
    if (lastError.message.includes("格式无效")) {
      throw lastError;
    }
  }

  throw new Error("AI 分析生成失败，请稍后重试");
}
