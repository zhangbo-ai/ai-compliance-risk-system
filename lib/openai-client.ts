import OpenAI from "openai";

export const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
export const DEFAULT_OPENAI_MODEL = "qwen-plus";

/** 阿里云百炼 OpenAI 兼容模式默认基址（可通过 OPENAI_BASE_URL 覆盖） */
export const BAILIAN_COMPATIBLE_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";

/** 解析 OpenAI API 基址，未配置时使用官方默认 v1 端点 */
export function getOpenAIBaseUrl(): string {
  const configured = process.env.OPENAI_BASE_URL?.trim();
  return configured || DEFAULT_OPENAI_BASE_URL;
}

/** 解析模型名，默认 qwen-plus（适配百炼等 OpenAI 兼容接口） */
export function getOpenAIModel(): string {
  const configured = process.env.OPENAI_MODEL?.trim();
  return configured || DEFAULT_OPENAI_MODEL;
}

/** 创建 OpenAI 客户端（baseURL 来自环境变量或默认值） */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: getOpenAIBaseUrl(),
  });
}

const QUOTA_ERROR_MESSAGE =
  "当前 API 账户额度不足，请检查余额或充值";

function isQuotaRelatedError(error: OpenAI.APIError): boolean {
  const message = error.message?.toLowerCase() ?? "";
  const code = String(error.code ?? "").toLowerCase();

  return (
    error.status === 429 ||
    code.includes("insufficient_quota") ||
    code.includes("quota") ||
    message.includes("insufficient_quota") ||
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("exceeded your current quota")
  );
}

/** 将 OpenAI 错误转为面向用户的提示文案 */
export function formatOpenAIErrorMessage(error: unknown): string {
  if (!(error instanceof OpenAI.APIError)) {
    return "AI 分析服务暂时不可用，请稍后重试";
  }

  if (isQuotaRelatedError(error)) {
    return QUOTA_ERROR_MESSAGE;
  }

  return error.message || "AI 分析服务暂时不可用，请稍后重试";
}
