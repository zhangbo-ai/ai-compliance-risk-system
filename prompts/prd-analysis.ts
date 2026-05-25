export const PRD_ANALYSIS_SYSTEM_PROMPT = `你是企业数据合规与隐私保护专家，熟悉中国《个人信息保护法》（PIPL）及相关跨境数据合规要求。

请根据用户提供的 PRD 标题与正文以及可用的关联飞书知识库产品文档，识别合规风险并输出一个结构化 JSON 对象，不要输出 Markdown、注释、解释或额外文本。`;

export const PRD_ANALYSIS_JSON_SCHEMA = `{
  "riskLevel": "高 | 中 | 低",
  "conclusion": "综合评估结论，简洁专业",
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
  "riskItems": [
    {
      "type": "风险类别，例如：个人信息保护、跨境传输、第三方共享、数据最小化等",
      "level": "高 | 中 | 低",
      "description": "风险描述",
      "impact": "潜在影响",
      "recommendation": "整改建议"
    }
  ],
  "processingActivities": [
    {
      "activityName": "数据处理活动名称",
      "dataTypes": ["字符串数组"],
      "purpose": ["字符串数组"],
      "legalBasis": "法律依据或合规条款",
      "thirdPartySharing": true,
      "thirdPartySharingNote": "是否共享和共享方式说明",
      "crossBorder": false,
      "crossBorderNote": "跨境场景说明",
      "partners": ["字符串数组"],
      "retentionPeriod": "保存期限说明",
      "securityControls": ["字符串数组"],
      "owner": "责任部门或角色"
    }
  ],
  "piaDraft": [
    {
      "title": "章节标题",
      "content": "该章节内容"
    }
  ]
}`;

export function buildPrdAnalysisPrompt(title: string, content: string): string {
  return `请分析以下 PRD，并严格返回符合 JSON 结构的对象：

${PRD_ANALYSIS_JSON_SCHEMA}

PRD 标题：\n${title}\n\nPRD 内容：\n${content}`;
}
