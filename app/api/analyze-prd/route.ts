import { NextRequest, NextResponse } from "next/server";
import {
  createOpenAIClient,
  formatOpenAIErrorMessage,
  getOpenAIModel,
} from "../../../lib/openai-client";
import {
  normalizeAiResponse,
  PRD_ANALYSIS_JSON_SCHEMA,
  type RawAiPrdAnalysis,
} from "../../../lib/prd-analysis";

const SYSTEM_PROMPT = `你是企业数据合规与隐私保护专家，熟悉中国《个人信息保护法》（PIPL）及配套规则。

请根据用户提供的 PRD 标题与正文，识别个人信息处理活动的合规风险，并严格按 JSON 格式输出，不要输出 Markdown 或额外说明文字。

输出字段必须完整，数组字段若无内容请返回空数组 []，布尔字段必须为 true/false。`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "请配置 OPENAI_API_KEY" },
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

  const userPrompt = `请分析以下 PRD，并输出以下内容的 JSON：

1. 风险等级（riskLevel：高/中/低）
2. 涉及个人信息（personalInfo）
3. 涉及敏感个人信息（sensitivePersonalInfo）
4. 数据处理目的（dataProcessingPurposes）
5. 是否涉及第三方共享（involvesThirdPartySharing）及说明（thirdPartySharingNote）
6. 是否涉及跨境传输（involvesCrossBorder）及说明（crossBorderNote）
7. 主要合规风险（mainRisks）
8. 整改建议（suggestions）
9. 是否建议人工复核（requiresManualReview）
10. 评估结论（conclusion）

要求：
- 仅返回 JSON 对象
- 输出结构清晰
- 适用于中国个人信息保护法（PIPL）

JSON 结构示例：
${PRD_ANALYSIS_JSON_SCHEMA}

---

PRD 标题：
${prdTitle}

PRD 内容：
${prdContent}`;

  const openai = createOpenAIClient(apiKey);

  try {
    const completion = await openai.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI 未返回有效分析结果" },
        { status: 502 },
      );
    }

    let parsed: RawAiPrdAnalysis;

    try {
      parsed = JSON.parse(content) as RawAiPrdAnalysis;
    } catch {
      return NextResponse.json(
        { error: "AI 返回结果解析失败，请重试" },
        { status: 502 },
      );
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
