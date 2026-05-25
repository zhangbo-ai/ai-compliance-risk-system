import { NextRequest, NextResponse } from "next/server";
import { fetchFeishuDocContentFromUrl } from "../../../lib/feishu-client";
import {
  callOpenAIChatCompletion,
  formatOpenAIErrorMessage,
  getOpenAIModel,
} from "../../../lib/openai-client";
import { normalizeAiResponse, type RawAiPrdAnalysis } from "../../../lib/prd-analysis";
import { PRD_ANALYSIS_SYSTEM_PROMPT, buildPrdAnalysisPrompt } from "../../../prompts/prd-analysis";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "请配置 OPENAI_API_KEY" }, { status: 500 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式无效" }, { status: 400 });
  }

  const url = (body.url || "").trim();
  if (!url) return NextResponse.json({ error: "请提供飞书文档链接" }, { status: 400 });

  try {
    const fetched = await fetchFeishuDocContentFromUrl(url);
    const prdTitle = fetched.title || fetched.text.split(/\n|\r/)[0]?.slice(0, 80) || "从飞书导入的文档";
    const prdContent = fetched.text;

    const userPrompt = buildPrdAnalysisPrompt(prdTitle, prdContent);

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
    if (!content) return NextResponse.json({ error: "AI 未返回有效分析结果" }, { status: 502 });

    const rawText = typeof content === "string" ? content.trim() : JSON.stringify(content, null, 2);

    function extractJsonObject(text: string): string | null {
      const firstBraceIndex = text.indexOf("{");
      const lastBraceIndex = text.lastIndexOf("}");
      if (firstBraceIndex === -1 || lastBraceIndex === -1) return null;
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
        console.error("[import-feishu] JSON parse failed", { rawText, jsonText, cleaned, parseError });
        return NextResponse.json({ error: "AI 返回结果解析失败，请重试" }, { status: 502 });
      }
    }

    const data = normalizeAiResponse(parsed);

    return NextResponse.json({ data, prdTitle, prdContent });
  } catch (error) {
    console.error("[import-feishu]", error);
    return NextResponse.json({ error: formatOpenAIErrorMessage(error) }, { status: 502 });
  }
}
