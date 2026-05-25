const FEISHU_APP_ACCESS_TOKEN_URL = "https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/";
const FEISHU_DOC_CONTENT_URL = "https://open.feishu.cn/open-apis/doc/v2/doc_content";

export async function fetchPublicUrlText(url: string): Promise<{ title?: string; text: string }> {
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) throw new Error(`无法抓取链接（状态 ${resp.status}）`);

  const ct = resp.headers.get("content-type") || "";
  const body = await resp.text();

  if (ct.includes("text/html")) {
    const titleMatch = body.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch?.[1]?.trim();

    const withoutScripts = body
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ");
    const text = withoutScripts
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    return { title, text };
  }

  return { text: body };
}

export function parseFeishuDocIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname || "";
    const segments = path.split("/").filter(Boolean);
    const idx = segments.findIndex((s) => /docx|docs|document/.test(s));
    if (idx !== -1 && segments.length > idx + 1) return segments[idx + 1];

    for (const [k, v] of u.searchParams.entries()) {
      if (/token|doc|file|doc_token|file_token/i.test(k) && v) return v;
    }

    return null;
  } catch {
    return null;
  }
}

async function getFeishuAppAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID?.trim();
  const appSecret = process.env.FEISHU_APP_SECRET?.trim();

  if (!appId || !appSecret) {
    throw new Error("缺少 FEISHU_APP_ID 或 FEISHU_APP_SECRET，请检查环境变量配置。");
  }

  const response = await fetch(FEISHU_APP_ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });

  const payload = await response.json();
  if (!response.ok || payload.code !== 0) {
    throw new Error(`获取飞书 App Access Token 失败：${payload.msg || payload.message || response.statusText}`);
  }

  if (!payload.app_access_token) {
    throw new Error("飞书 App Access Token 未返回，请检查 App ID/Secret 是否正确。");
  }

  return payload.app_access_token;
}

function flattenFeishuDocumentNode(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number" || typeof node === "boolean") return String(node);
  if (Array.isArray(node)) {
    return node.map(flattenFeishuDocumentNode).filter(Boolean).join(" ");
  }
  if (node && typeof node === "object") {
    return Object.values(node)
      .map(flattenFeishuDocumentNode)
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function normalizeFeishuText(text: string): string {
  return text
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function fetchPrivateFeishuDocContent(docId: string): Promise<{ title?: string; text: string }> {
  const appAccessToken = await getFeishuAppAccessToken();
  const url = `${FEISHU_DOC_CONTENT_URL}?doc_token=${encodeURIComponent(docId)}`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      Accept: "application/json",
    },
  });

  const payload = await resp.json();
  if (!resp.ok || payload.code !== 0) {
    throw new Error(`获取飞书文档内容失败：${payload.msg || payload.message || resp.statusText}`);
  }

  const data = payload.data || {};
  const title = String(data.title || data.document?.title || data.doc_title || "").trim();
  const rawText = flattenFeishuDocumentNode(data.content || data.document || data);
  const text = normalizeFeishuText(rawText);

  if (!text) {
    throw new Error("飞书文档内容为空，请确认文档链接或权限是否正确。");
  }

  return { title: title || undefined, text };
}

export async function fetchFeishuDocContentFromUrl(url: string) {
  try {
    return await fetchPublicUrlText(url);
  } catch (err) {
    const docId = parseFeishuDocIdFromUrl(url);
    if (docId && process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET) {
      return await fetchPrivateFeishuDocContent(docId);
    }
    throw err;
  }
}
