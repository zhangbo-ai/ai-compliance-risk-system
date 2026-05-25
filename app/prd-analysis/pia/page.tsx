"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PrdAnalysisResult } from "../../../lib/prd-analysis";
import {
  buildMarkdownReport,
  buildWordHtml,
  buildPdfBytes,
  downloadBlob,
  buildFileName,
} from "../../../lib/analysis-export";

const STORAGE_KEY = "ai-prd-analysis-result";

export default function PIAReportPage() {
  const [analysis, setAnalysis] = useState<PrdAnalysisResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { data?: PrdAnalysisResult };
      setAnalysis(parsed.data ?? null);
    } catch {
      setAnalysis(null);
    }
  }, []);

  if (!analysis) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">PIA 文档草稿</h1>
          <p className="mt-3 text-sm text-slate-600">
            当前没有可用的分析结果。请先在 PRD 风险分析页面完成一次 AI 分析。
          </p>
          <Link
            href="/prd-analysis"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            返回 PRD 风险分析
          </Link>
        </div>
      </main>
    );
  }

  const handleDownloadMarkdown = () => {
    const markdown = buildMarkdownReport("PIA 文档草稿", analysis);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    downloadBlob(buildFileName("PIA 文档草稿", "md"), blob);
  };

  const handleDownloadWord = () => {
    const html = buildWordHtml("PIA 文档草稿", analysis);
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    downloadBlob(buildFileName("PIA 文档草稿", "doc"), blob);
  };

  const handleDownloadPdf = async () => {
    const bytes = await buildPdfBytes("PIA 文档草稿", analysis);
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    downloadBlob(buildFileName("PIA 文档草稿", "pdf"), blob);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-[#0c2340] px-6 py-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200/80">PIA 草稿</p>
            <h1 className="mt-2 text-2xl font-bold">自动生成 PIA 文档草稿</h1>
            <p className="mt-2 text-sm text-blue-100/80">
              基于 AI 分析结果生成 PIA 章节式文档，支持 Markdown/Word/PDF 导出。
            </p>
          </div>
          <Link
            href="/prd-analysis"
            className="inline-flex rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            返回 PRD 风险分析
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            下载 Markdown
          </button>
          <button
            type="button"
            onClick={handleDownloadWord}
            className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            下载 Word
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            下载 PDF
          </button>
        </div>

        <div className="space-y-6">
          {analysis.piaDraft.map((section) => (
            <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
