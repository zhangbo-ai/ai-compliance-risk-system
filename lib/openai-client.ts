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

/** 构建 Chat Completions 请求地址 */
export function getOpenAIChatCompletionUrl(): string {
  return `${getOpenAIBaseUrl().replace(/\/$/, "")}/chat/completions`;
}

export async function callOpenAIChatCompletion(options: {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}) {
  const requestBody = JSON.stringify({
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1200,
  });

  const response = await fetch(getOpenAIChatCompletionUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: new TextEncoder().encode(requestBody),
  });

  const text = await response.text();

  if (!response.ok) {
    const message = text || response.statusText;
    throw new Error(`OpenAI 请求失败（状态 ${response.status}）：${message}`);
  }

  return JSON.parse(text);
}

const QUOTA_ERROR_MESSAGE =
  "当前 API 账户额度不足，请检查余额或充值";

function isQuotaRelatedError(error: any): boolean {
  const message = String(error?.message ?? "").toLowerCase();
  const code = String(error?.code ?? "").toLowerCase();

  return (
    error?.status === 429 ||
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
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    if (isQuotaRelatedError(error)) {
      return QUOTA_ERROR_MESSAGE;
    }
    return error.message || "AI 分析服务暂时不可用，请稍后重试";
  }

  return "AI 分析服务暂时不可用，请稍后重试";
}
