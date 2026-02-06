import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-pro",
];

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "缺少待翻译文本" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置 Gemini API Key" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: Error | null = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `你是一个专业的电商产品翻译专家。请将以下英文产品描述翻译成中文。

要求：
1. 保持原文的 Markdown 格式不变（标题、列表、加粗、链接等）
2. 翻译要自然流畅，符合中文电商表达习惯
3. 专业术语保持准确
4. 只输出翻译后的中文内容，不要添加任何解释或前缀

原文：
${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translated = response.text();

        if (!translated) {
          throw new Error("翻译返回空结果");
        }

        return NextResponse.json({ translated: translated.trim() });
      } catch (error) {
        console.error(`Translation model ${modelName} failed:`, error);
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

    console.error("Translation failed:", lastError);
    return NextResponse.json(
      { error: "翻译服务暂不可用，请稍后再试" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "翻译请求处理失败" },
      { status: 500 }
    );
  }
}
