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

export interface PersonaProfile {
  name: string;
  avatar: string; // emoji 表示
  tagline: string; // 一句话描述
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
    spendingPower: "高" | "中高" | "中" | "中低" | "低";
    pricesSensitivity: "高" | "中" | "低";
    brandLoyalty: "高" | "中" | "低";
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
    primaryPainPoints: { point: string; intensity: "高" | "中" | "低" }[];
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
}

export interface UserPersona {
  overview: {
    totalSegments: number;
    primarySegmentShare: string;
    segmentationBasis: string;
    confidenceLevel: number;
  };
  primaryPersona: PersonaProfile;
  secondaryPersona: PersonaProfile;
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
    recommendedChannels: { channel: string; priority: "高" | "中" | "低"; reason: string }[];
    estimatedCAC: string;
    retentionStrategies: string[];
    ltvOptimization: string[];
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
  category: string; // 同品类/替代品/潜在竞品
  description: string;
  confidenceLevel: number; // 置信度 0-100
  dataSource: string; // 数据来源说明
  positioning: {
    targetMarket: string;
    pricePosition: "更低" | "相近" | "更高";
    brandPosition: string;
  };
  metrics: {
    estimatedProductCount: string;
    estimatedPriceRange: string;
    estimatedMarketShare: string;
    strengthScore: number; // 综合实力评分 0-100
  };
  comparison: {
    advantages: string[]; // 竞品优势
    disadvantages: string[]; // 竞品劣势
    differentiators: string[]; // 关键差异点
  };
  strategicInsights: {
    whatToLearn: string[]; // 可借鉴之处
    whatToAvoid: string[]; // 需规避之处
    opportunities: string[]; // 竞争机会
  };
}

export interface CompetitorAnalysis {
  overview: {
    totalCompetitorsAnalyzed: number;
    marketConcentration: "高" | "中" | "低";
    competitiveIntensity: "激烈" | "中等" | "温和";
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
    xAxis: string; // 如：价格
    yAxis: string; // 如：品质/品牌
    currentPosition: { x: "低" | "中" | "高"; y: "低" | "中" | "高" };
    recommendedPosition: { x: "低" | "中" | "高"; y: "低" | "中" | "高" };
    positioningGap: string;
  };
  competitiveAdvantage: {
    currentAdvantages: string[];
    sustainableAdvantages: string[];
    vulnerabilities: string[];
    recommendedFocus: string[];
  };
  competitors: CompetitorBenchmark[];
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
  competitorAnalysis: CompetitorAnalysis;
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
    "overview": {
      "totalSegments": 2,
      "primarySegmentShare": "预估主要用户群占比如60%",
      "segmentationBasis": "细分依据说明",
      "confidenceLevel": 85
    },
    "primaryPersona": {
      "name": "典型用户昵称如'都市白领小美'",
      "avatar": "👩‍💼",
      "tagline": "一句话用户画像",
      "demographics": {
        "ageRange": "25-35岁",
        "gender": "女性为主",
        "income": "月收入1-2万",
        "education": "本科及以上",
        "occupation": "企业白领/自由职业",
        "location": "一二线城市",
        "familyStatus": "单身/已婚无孩"
      },
      "lifestyle": {
        "dailyRoutine": "典型日常作息描述",
        "hobbies": ["爱好1", "爱好2", "爱好3"],
        "socialActivities": ["社交活动1", "社交活动2"],
        "mediaConsumption": ["媒体类型1", "媒体类型2"],
        "technologyUsage": "技术使用习惯描述"
      },
      "consumptionProfile": {
        "spendingPower": "高/中高/中/中低/低",
        "pricesSensitivity": "高/中/低",
        "brandLoyalty": "高/中/低",
        "purchaseFrequency": "购买频率描述",
        "averageOrderValue": "预估客单价区间",
        "preferredPaymentMethods": ["支付方式1", "支付方式2"]
      },
      "psychographics": {
        "coreValues": ["核心价值观1", "核心价值观2"],
        "personality": ["性格特征1", "性格特征2"],
        "aspirations": ["追求目标1", "追求目标2"],
        "fears": ["担忧顾虑1", "担忧顾虑2"]
      },
      "painPointsAndNeeds": {
        "primaryPainPoints": [
          {"point": "痛点描述1", "intensity": "高/中/低"},
          {"point": "痛点描述2", "intensity": "高/中/低"}
        ],
        "unmetNeeds": ["未满足需求1", "未满足需求2"],
        "desiredOutcomes": ["期望结果1", "期望结果2"]
      },
      "purchaseJourney": {
        "awarenessChannels": ["认知渠道1", "认知渠道2"],
        "researchBehavior": "研究行为描述",
        "evaluationCriteria": ["评估标准1", "评估标准2"],
        "purchaseTriggers": ["购买触发因素1", "购买触发因素2"],
        "postPurchaseBehavior": "购后行为描述"
      },
      "digitalBehavior": {
        "preferredPlatforms": ["平台1", "平台2"],
        "contentPreferences": ["内容偏好1", "内容偏好2"],
        "influencerTypes": ["影响者类型1", "影响者类型2"],
        "onlineShoppingHabits": "网购习惯描述",
        "socialMediaUsage": [
          {"platform": "平台名", "frequency": "使用频率", "purpose": "使用目的"}
        ]
      },
      "marketingRecommendations": {
        "bestChannels": ["推荐渠道1", "推荐渠道2"],
        "messagingTone": "沟通语调建议",
        "contentTypes": ["内容类型1", "内容类型2"],
        "promotionTypes": ["促销类型1", "促销类型2"],
        "bestTimeToReach": "最佳触达时间"
      }
    },
    "secondaryPersona": {
      "name": "次要用户昵称",
      "avatar": "👨‍💻",
      "tagline": "一句话用户画像",
      "demographics": {
        "ageRange": "年龄范围",
        "gender": "性别",
        "income": "收入水平",
        "education": "学历",
        "occupation": "职业",
        "location": "地区",
        "familyStatus": "家庭状况"
      },
      "lifestyle": {
        "dailyRoutine": "日常描述",
        "hobbies": ["爱好1", "爱好2"],
        "socialActivities": ["社交1"],
        "mediaConsumption": ["媒体1"],
        "technologyUsage": "技术使用"
      },
      "consumptionProfile": {
        "spendingPower": "高/中高/中/中低/低",
        "pricesSensitivity": "高/中/低",
        "brandLoyalty": "高/中/低",
        "purchaseFrequency": "频率",
        "averageOrderValue": "客单价",
        "preferredPaymentMethods": ["支付方式"]
      },
      "psychographics": {
        "coreValues": ["价值观1"],
        "personality": ["性格1"],
        "aspirations": ["追求1"],
        "fears": ["顾虑1"]
      },
      "painPointsAndNeeds": {
        "primaryPainPoints": [{"point": "痛点", "intensity": "高/中/低"}],
        "unmetNeeds": ["需求1"],
        "desiredOutcomes": ["期望1"]
      },
      "purchaseJourney": {
        "awarenessChannels": ["渠道1"],
        "researchBehavior": "研究行为",
        "evaluationCriteria": ["标准1"],
        "purchaseTriggers": ["触发因素1"],
        "postPurchaseBehavior": "购后行为"
      },
      "digitalBehavior": {
        "preferredPlatforms": ["平台1"],
        "contentPreferences": ["偏好1"],
        "influencerTypes": ["类型1"],
        "onlineShoppingHabits": "习惯",
        "socialMediaUsage": [{"platform": "平台", "frequency": "频率", "purpose": "目的"}]
      },
      "marketingRecommendations": {
        "bestChannels": ["渠道1"],
        "messagingTone": "语调",
        "contentTypes": ["类型1"],
        "promotionTypes": ["促销1"],
        "bestTimeToReach": "时间"
      }
    },
    "segmentComparison": [
      {"dimension": "对比维度1", "primaryValue": "主要用户值", "secondaryValue": "次要用户值"},
      {"dimension": "对比维度2", "primaryValue": "主要用户值", "secondaryValue": "次要用户值"}
    ],
    "marketSizing": {
      "estimatedTAM": "预估总可触达市场规模",
      "estimatedSAM": "预估可服务市场规模",
      "estimatedSOM": "预估可获取市场规模",
      "growthPotential": "增长潜力描述"
    },
    "acquisitionStrategy": {
      "recommendedChannels": [
        {"channel": "渠道名", "priority": "高/中/低", "reason": "推荐理由"}
      ],
      "estimatedCAC": "预估获客成本",
      "retentionStrategies": ["留存策略1", "留存策略2"],
      "ltvOptimization": ["LTV优化建议1", "LTV优化建议2"]
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
  "competitorAnalysis": {
    "overview": {
      "totalCompetitorsAnalyzed": 3,
      "marketConcentration": "高/中/低",
      "competitiveIntensity": "激烈/中等/温和",
      "analysisConfidence": 85,
      "dataSourceSummary": "基于目标店铺产品数据、定价策略、市场定位等实际指标，结合行业公开数据进行推断分析"
    },
    "marketLandscape": {
      "leaderBrands": ["头部品牌1", "头部品牌2"],
      "emergingBrands": ["新兴品牌1"],
      "nichePlayersCount": 5,
      "marketTrend": "市场整体趋势描述"
    },
    "positioningMap": {
      "xAxis": "价格定位",
      "yAxis": "品牌/品质定位",
      "currentPosition": { "x": "低/中/高", "y": "低/中/高" },
      "recommendedPosition": { "x": "低/中/高", "y": "低/中/高" },
      "positioningGap": "当前定位与推荐定位的差距分析"
    },
    "competitiveAdvantage": {
      "currentAdvantages": ["当前优势1", "当前优势2"],
      "sustainableAdvantages": ["可持续优势1"],
      "vulnerabilities": ["薄弱环节1", "薄弱环节2"],
      "recommendedFocus": ["建议聚焦方向1", "建议聚焦方向2"]
    },
    "competitors": [
      {
        "name": "竞品品牌名称（基于品类推断的典型竞品）",
        "category": "同品类/替代品/潜在竞品",
        "description": "竞品简要描述",
        "confidenceLevel": 85,
        "dataSource": "基于产品品类、价格区间、目标市场等实际数据推断",
        "positioning": {
          "targetMarket": "目标市场描述",
          "pricePosition": "更低/相近/更高",
          "brandPosition": "品牌定位描述"
        },
        "metrics": {
          "estimatedProductCount": "预估产品数量范围",
          "estimatedPriceRange": "预估价格区间",
          "estimatedMarketShare": "预估市场份额",
          "strengthScore": 75
        },
        "comparison": {
          "advantages": ["竞品优势1", "竞品优势2"],
          "disadvantages": ["竞品劣势1", "竞品劣势2"],
          "differentiators": ["关键差异点1", "关键差异点2"]
        },
        "strategicInsights": {
          "whatToLearn": ["可借鉴1", "可借鉴2"],
          "whatToAvoid": ["需规避1"],
          "opportunities": ["竞争机会1", "竞争机会2"]
        }
      }
    ]
  }
}

注意：
1. 所有分析必须基于提供的数据，有理有据
2. 评分范围 0-100，要客观准确
3. 建议要具体可执行，避免空泛
4. strategicRecommendations 至少提供 5 条，按优先级排序
5. 只输出 JSON，不要有任何其他文字或解释
6. 【重要】所有输出内容必须使用中文（除了 JSON 字段名和枚举值）

【竞品分析重要准则 - 避免幻觉】：
7. 竞品分析必须基于以下真实依据进行推断：
   - 产品品类和类型（从 product_type 推断同品类竞品）
   - 价格区间和定价策略（推断市场定位）
   - 目标客户画像（推断竞争对手类型）
   - 产品标签和关键词（识别细分市场）
8. 竞品名称应使用"品类描述"而非虚构具体品牌名，如"同品类DTC品牌"、"传统零售巨头"、"垂直电商平台"
9. 所有数据指标必须标注为"预估"或"推断"，如"预估产品数量：100-500款"
10. confidenceLevel 置信度必须诚实标注：
    - 85-100: 基于明确数据可直接推断
    - 70-84: 基于行业经验合理推断
    - 60-69: 存在较大不确定性的推测
    - 低于60的数据不应输出
11. dataSource 必须明确说明数据来源依据
12. competitors 数组至少包含 3 个竞品分析，按相关性排序`;
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
