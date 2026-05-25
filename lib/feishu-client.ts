export async function fetchPublicUrlText(url: string): Promise<{ title?: string; text: string }>{
  const resp = await fetch(url, { method: 'GET' });
  if (!resp.ok) throw new Error(`无法抓取链接（状态 ${resp.status}）`);

  const ct = resp.headers.get('content-type') || '';
  const body = await resp.text();

  // 尝试从 HTML 中抽取 title 与纯文本
  if (ct.includes('text/html')){
    const titleMatch = body.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch?.[1]?.trim();

    // 简单去除 script/style 并剥离标签为纯文本
    const withoutScripts = body.replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ');
    const text = withoutScripts.replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return { title, text };
  }

  // 其它类型直接返回原始文本
  return { text: body };
}

export function parseFeishuDocIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // 支持常见的飞书文档 /docx/ 或 /docs/ 链接，尝试从路径或 query 中抽取 token
    const path = u.pathname || '';
    const segments = path.split('/').filter(Boolean);
    // 常见格式可能包含 docx 或 docs 后的 id
    const idx = segments.findIndex((s) => /docx|docs|document/.test(s));
    if (idx !== -1 && segments.length > idx + 1) return segments[idx + 1];
    // fallback: 某些分享链接把 token 放在 query params 中
    for (const [k, v] of u.searchParams.entries()){
      if (/token|doc|file|doc_token|file_token/i.test(k) && v) return v;
    }
    return null;
  } catch {
    return null;
  }
}

// Note: 私有文档访问需要配置飞书开放平台的 App ID/Secret 并使用飞书开放 API。
// 这里保留一个占位函数用以后续实现私有 API 调用（需要在 .env.local 配置 FEISHU_APP_ID/FEISHU_APP_SECRET）。
export async function fetchPrivateFeishuDocContent(docId: string): Promise<{ title?: string; text: string }>{
  throw new Error('私有飞书文档读取尚未配置。请在 .env.local 配置 FEISHU_APP_ID/FEISHU_APP_SECRET 并实现 fetchPrivateFeishuDocContent。');
}

export async function fetchFeishuDocContentFromUrl(url: string){
  // 首先尝试直接抓取（适用于已公开分享的文档）
  try{
    return await fetchPublicUrlText(url);
  }catch(err){
    const docId = parseFeishuDocIdFromUrl(url);
    if (docId && process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET){
      return await fetchPrivateFeishuDocContent(docId);
    }
    throw err;
  }
}
