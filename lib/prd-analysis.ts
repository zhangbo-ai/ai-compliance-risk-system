export type PrdAnalysisResult = {
  riskLevel: string;
  conclusion: string;
  personalInfo: string[];
  sensitivePersonalInfo: string[];
  dataProcessingPurposes: string[];
  involvesThirdPartySharing: boolean;
  thirdPartySharingNote: string;
  involvesCrossBorder: boolean;
  crossBorderNote: string;
  mainRisks: string[];
  suggestions: string[];
  requiresManualReview: boolean;
};

export type RawAiPrdAnalysis = {
  riskLevel?: string;
  personalInfo?: string[] | string;
  sensitivePersonalInfo?: string[] | string;
  dataProcessingPurposes?: string[] | string;
  involvesThirdPartySharing?: boolean | string;
  thirdPartySharingNote?: string;
  involvesCrossBorder?: boolean | string;
  crossBorderNote?: string;
  mainRisks?: string[] | string;
  suggestions?: string[] | string;
  requiresManualReview?: boolean | string;
  conclusion?: string;
};

function toStringArray(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,，、;；\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function toBoolean(value: boolean | string | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "yes", "是", "涉及", "有"].includes(normalized);
  }
  return false;
}

function buildConclusion(
  raw: RawAiPrdAnalysis,
  requiresManualReview: boolean,
): string {
  if (raw.conclusion?.trim()) return raw.conclusion.trim();
  if (requiresManualReview) {
    return "基于 PRD 内容的 AI 评估结果，建议进入人工复核流程，并由数据合规部门进一步确认。";
  }
  return "基于 PRD 内容的 AI 评估结果，当前风险可控，建议按整改建议完善后推进。";
}

export function normalizeAiResponse(raw: RawAiPrdAnalysis): PrdAnalysisResult {
  const requiresManualReview = toBoolean(raw.requiresManualReview);
  const involvesThirdPartySharing = toBoolean(raw.involvesThirdPartySharing);
  const involvesCrossBorder = toBoolean(raw.involvesCrossBorder);

  return {
    riskLevel: raw.riskLevel?.trim() || "中",
    conclusion: buildConclusion(raw, requiresManualReview),
    personalInfo: toStringArray(raw.personalInfo),
    sensitivePersonalInfo: toStringArray(raw.sensitivePersonalInfo),
    dataProcessingPurposes: toStringArray(raw.dataProcessingPurposes),
    involvesThirdPartySharing,
    thirdPartySharingNote: raw.thirdPartySharingNote?.trim() || "",
    involvesCrossBorder,
    crossBorderNote: raw.crossBorderNote?.trim() || "",
    mainRisks: toStringArray(raw.mainRisks),
    suggestions: toStringArray(raw.suggestions),
    requiresManualReview,
  };
}

export const PRD_ANALYSIS_JSON_SCHEMA = `{
  "riskLevel": "高 | 中 | 低",
  "personalInfo": ["字符串数组"],
  "sensitivePersonalInfo": ["字符串数组"],
  "dataProcessingPurposes": ["字符串数组"],
  "involvesThirdPartySharing": true,
  "thirdPartySharingNote": "如涉及请说明第三方类型与共享范围，否则为空字符串",
  "involvesCrossBorder": false,
  "crossBorderNote": "如涉及请说明跨境场景，否则为空字符串",
  "mainRisks": ["字符串数组"],
  "suggestions": ["字符串数组"],
  "requiresManualReview": true,
  "conclusion": "综合评估结论，简洁专业"
}` as const;
