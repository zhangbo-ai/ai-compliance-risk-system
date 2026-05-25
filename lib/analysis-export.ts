import { PDFDocument, StandardFonts } from "pdf-lib";
import type { PrdAnalysisResult } from "./prd-analysis";

function safeFileName(value: string): string {
  return value
    .replace(/[<>:"/\\|?*]+/g, "_")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, "") || "prd-analysis";
}

export function buildMarkdownReport(
  title: string,
  data: PrdAnalysisResult,
): string {
  const lines: string[] = [];

  lines.push(`# ${title || "PRD 合规分析报告"}`);
  lines.push("");
  lines.push(`## 评估结论`);
  lines.push(data.conclusion || "暂无结论。");
  lines.push("");

  lines.push(`- 风险等级：${data.riskLevel || "中"}`);
  lines.push(`- 是否建议人工复核：${data.requiresManualReview ? "是" : "否"}`);
  lines.push(`- 涉及第三方共享：${data.involvesThirdPartySharing ? "是" : "否"}`);
  lines.push(`- 涉及跨境：${data.involvesCrossBorder ? "是" : "否"}`);
  lines.push("");

  const pushArray = (title: string, items: string[]) => {
    lines.push(`### ${title}`);
    if (items.length === 0) {
      lines.push("- 无");
    } else {
      items.forEach((item) => lines.push(`- ${item}`));
    }
    lines.push("");
  };

  pushArray("涉及个人信息", data.personalInfo);
  pushArray("涉及敏感个人信息", data.sensitivePersonalInfo);
  pushArray("数据处理目的", data.dataProcessingPurposes);
  pushArray("主要合规风险", data.mainRisks);
  pushArray("整改建议", data.suggestions);

  if (data.riskItems.length) {
    lines.push("## 风险项清单");
    data.riskItems.forEach((item, index) => {
      lines.push(`### ${index + 1}. ${item.type} (${item.level})`);
      lines.push(`- 风险描述：${item.description}`);
      lines.push(`- 影响：${item.impact}`);
      lines.push(`- 建议：${item.recommendation}`);
      lines.push("");
    });
  }

  if (data.processingActivities.length) {
    lines.push("## 数据处理活动台账");
    data.processingActivities.forEach((activity, index) => {
      lines.push(`### ${index + 1}. ${activity.activityName}`);
      lines.push(`- 数据类型：${activity.dataTypes.join("、")}`);
      lines.push(`- 处理目的：${activity.purpose.join("、")}`);
      lines.push(`- 法律依据：${activity.legalBasis}`);
      lines.push(`- 第三方共享：${activity.thirdPartySharing ? "是" : "否"}`);
      if (activity.thirdPartySharingNote) {
        lines.push(`- 共享说明：${activity.thirdPartySharingNote}`);
      }
      lines.push(`- 跨境：${activity.crossBorder ? "是" : "否"}`);
      if (activity.crossBorderNote) {
        lines.push(`- 跨境说明：${activity.crossBorderNote}`);
      }
      lines.push(`- 合作方：${activity.partners.join("、")}`);
      lines.push(`- 保存期限：${activity.retentionPeriod}`);
      lines.push(`- 安全措施：${activity.securityControls.join("、")}`);
      lines.push(`- 责任部门：${activity.owner}`);
      lines.push("");
    });
  }

  if (data.piaDraft.length) {
    lines.push("## PIA 初稿");
    data.piaDraft.forEach((section) => {
      lines.push(`### ${section.title}`);
      lines.push(section.content);
      lines.push("");
    });
  }

  return lines.join("\n");
}

export function buildWordHtml(title: string, data: PrdAnalysisResult): string {
  const markdown = buildMarkdownReport(title, data);
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br/>\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title || "PRD 合规分析报告"}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; line-height: 1.6; padding: 24px; }
    h1 { color: #0c2340; }
    h2 { color: #1e40af; }
    h3 { color: #0f172a; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <h1>${title || "PRD 合规分析报告"}</h1>
  <div>${escaped}</div>
</body>
</html>`;
}

function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildPdfBytes(
  title: string,
  data: PrdAnalysisResult,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 10;
  const lineHeight = 14;
  const pageMargin = 40;
  let page = pdfDoc.addPage();
  let cursorY = page.getHeight() - pageMargin;
  const width = page.getWidth() - pageMargin * 2;

  const addLine = (text: string, options?: { bold?: boolean }) => {
    const currentFont = options?.bold ? fontBold : font;
    const wrapped = wrapText(text, width, currentFont, fontSize);
    for (const line of wrapped) {
      if (cursorY < pageMargin + lineHeight) {
        page = pdfDoc.addPage();
        cursorY = page.getHeight() - pageMargin;
      }
      page.drawText(line, {
        x: pageMargin,
        y: cursorY,
        size: fontSize,
        font: currentFont,
      });
      cursorY -= lineHeight;
    }
  };

  addLine(title || "PRD 合规分析报告", { bold: true });
  addLine("");

  const markdown = buildMarkdownReport(title, data);
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("# ")) {
      addLine(line.replace(/^#\s*/, ""), { bold: true });
    } else if (line.startsWith("## ")) {
      addLine(line.replace(/^##\s*/, ""), { bold: true });
    } else if (line.startsWith("### ")) {
      addLine(line.replace(/^###\s*/, ""), { bold: true });
    } else {
      addLine(line);
    }
  }

  return pdfDoc.save();
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function buildFileName(title: string, extension: string): string {
  return `${safeFileName(title)}.${extension}`;
}
