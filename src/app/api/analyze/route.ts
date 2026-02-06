import { NextRequest, NextResponse } from "next/server";
import { scrapeShopifyStore } from "@/lib/shopify-scraper";
import { aggregateData, AggregatedData } from "@/lib/data-aggregator";
import { generateAnalysisReport, AIReport } from "@/lib/gemini-client";

// Request body type
interface AnalyzeRequest {
  url: string;
}

// Response type
interface AnalyzeResponse {
  data: AggregatedData;
  report: AIReport;
  meta: {
    title: string;
    description: string;
    domain: string;
    favicon: string | null;
    logo: string | null;
    ogImage: string | null;
    keywords: string[];
  };
  socialLinks: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    tiktok: string | null;
    pinterest: string | null;
    linkedin: string | null;
  };
  techAnalysis: {
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
  };
}

// Validate URL
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return !!urlObj.hostname;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "请提供有效的店铺 URL" },
        { status: 400 }
      );
    }

    const url = body.url.trim();

    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "URL 格式无效" }, { status: 400 });
    }

    console.log(`[Analyze] Starting comprehensive analysis for: ${url}`);

    // Step 1: Scrape the store
    console.log("[Analyze] Step 1: Scraping store data...");
    const scraperResult = await scrapeShopifyStore(url);
    console.log(`[Analyze] Scraped ${scraperResult.products.length} products`);

    // Step 2: Aggregate data
    console.log("[Analyze] Step 2: Aggregating multi-dimensional data...");
    const aggregatedData = aggregateData(scraperResult);
    console.log("[Analyze] Data aggregated successfully");

    // Step 3: Generate AI report (now returns structured data)
    console.log("[Analyze] Step 3: Generating structured AI report...");
    const report = await generateAnalysisReport(aggregatedData.ai_context);
    console.log("[Analyze] AI report generated successfully");

    // Build response
    const response: AnalyzeResponse = {
      data: aggregatedData,
      report,
      meta: scraperResult.meta,
      socialLinks: scraperResult.socialLinks,
      techAnalysis: scraperResult.techAnalysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Analyze] Error:", error);

    if (error instanceof Error) {
      const message = error.message;

      // Handle platform detection errors (JSON formatted)
      if (error.name === "PlatformNotSupportedError" || error.name === "ShopifyApiDisabledError") {
        try {
          const errorDetails = JSON.parse(message);
          return NextResponse.json({
            error: errorDetails.message,
            errorType: errorDetails.type,
            platformInfo: {
              platform: errorDetails.platform,
              platformName: errorDetails.platformName,
              confidence: errorDetails.confidence,
              indicators: errorDetails.indicators,
            },
          }, { status: 400 });
        } catch {
          // If JSON parsing fails, return the raw message
          return NextResponse.json({ error: message }, { status: 400 });
        }
      }

      if (message.includes("无效") || message.includes("URL")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      if (message.includes("Shopify") || message.includes("products.json")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      if (message.includes("禁止") || message.includes("forbidden")) {
        return NextResponse.json({ error: message }, { status: 403 });
      }

      if (message.includes("Gemini") || message.includes("API")) {
        return NextResponse.json({ error: message }, { status: 502 });
      }

      if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
        return NextResponse.json(
          { error: "请求超时，请稍后重试" },
          { status: 504 }
        );
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "分析过程中发生未知错误" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "请使用 POST 方法" }, { status: 405 });
}
