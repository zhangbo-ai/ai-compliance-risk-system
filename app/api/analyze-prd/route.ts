import { NextRequest, NextResponse } from "next/server";
import {
  callOpenAIChatCompletion,
  formatOpenAIErrorMessage,
  getOpenAIModel,
} from "../../../lib/openai-client";
import {
  normalizeAiResponse,
  type RawAiPrdAnalysis,
} from "../../../lib/prd-analysis";
import {
  PRD_ANALYSIS_SYSTEM_PROMPT,
  buildPrdAnalysisPrompt,
} from "../../../prompts/prd-analysis";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "请配置 OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  const keyIsAscii = /^[\x20-\x7E]+$/.test(apiKey);
  const looksLikePlaceholder = /(你的|阿里云|key)$/i.test(apiKey);

  if (!keyIsAscii || looksLikePlaceholder) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY 无效，请在 .env.local 中填入真实的 OpenAI/兼容服务 API Key，且不要使用占位符文字。",
      },
      { status: 500 },
    );
  }

  let body: {
    title?: string;
    content?: string;
    prdTitle?: string;
    prdContent?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式无效" }, { status: 400 });
  }

  const prdTitle = (body.title ?? body.prdTitle)?.trim();
  const prdContent = (body.content ?? body.prdContent)?.trim();

  if (!prdTitle || !prdContent) {
    return NextResponse.json(
      { error: "请先填写PRD标题和内容" },
      { status: 400 },
    );
  }

  const userPrompt = buildPrdAnalysisPrompt(prdTitle, prdContent);

  try {
    const completion = await callOpenAIChatCompletion({
      apiKey,
      model: getOpenAIModel(),
      temperature: 0.0,
      maxTokens: 3000,
      messages: [
        { role: "system", content: PRD_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI 未返回有效分析结果" },
        { status: 502 },
      );
    }

    const rawText =
      typeof content === "string"
        ? content.trim()
        : JSON.stringify(content, null, 2);

    function extractJsonObject(text: string): string | null {
      const firstBraceIndex = text.indexOf("{");
      const lastBraceIndex = text.lastIndexOf("}");
      if (firstBraceIndex === -1 || lastBraceIndex === -1) {
        return null;
      }
      return text.slice(firstBraceIndex, lastBraceIndex + 1);
    }

    function sanitizeJson(text: string): string {
      return text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/\r?\n/g, "\n");
    }

    const jsonText = extractJsonObject(rawText) || rawText;

    let parsed: RawAiPrdAnalysis;

    try {
      parsed = JSON.parse(jsonText) as RawAiPrdAnalysis;
    } catch {
      const cleaned = sanitizeJson(jsonText);
      try {
        parsed = JSON.parse(cleaned) as RawAiPrdAnalysis;
      } catch (parseError) {
        console.error("[analyze-prd] JSON parse failed", {
          rawText,
          jsonText,
          cleaned,
          parseError,
        });
        return NextResponse.json(
          { error: "AI 返回结果解析失败，请重试" },
          { status: 502 },
        );
      }
    }

    const data = normalizeAiResponse(parsed);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[analyze-prd]", error);
    return NextResponse.json(
      { error: formatOpenAIErrorMessage(error) },
      { status: 502 },
    );
  }
}
