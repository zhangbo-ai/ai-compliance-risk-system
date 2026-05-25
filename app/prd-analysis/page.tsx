"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { PrdAnalysisResult } from "../../lib/prd-analysis";
import {
  buildMarkdownReport,
  buildWordHtml,
  buildPdfBytes,
  downloadBlob,
  buildFileName,
} from "../../lib/analysis-export";

const STORAGE_KEY = "ai-prd-analysis-result";

type StoredAnalysis = {
  title: string;
  content: string;
  data: PrdAnalysisResult;
};

export default function PrdAnalysisPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PrdAnalysisResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as StoredAnalysis;
      setTitle(parsed.title || "");
      setContent(parsed.content || "");
      setResult(parsed.data ?? null);
    } catch {
      // ignore invalid cache
    }
  }, []);

  async function handleAnalyze() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("请先填写PRD标题和内容");
      setResult(null);
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/analyze-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
        }),
      });

      const payload = (await response.json()) as {
        data?: PrdAnalysisResult;
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error || "分析失败，请稍后重试");
        return;
      }

      if (!payload.data) {
        setError("AI 未返回有效分析结果");
        return;
      }

      setResult(payload.data);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ title: trimmedTitle, content: trimmedContent, data: payload.data }),
      );
    } catch {
      setError("网络异常，请检查连接后重试");
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadMarkdown = () => {
    if (!result) return;
    const markdown = buildMarkdownReport(title, result);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    downloadBlob(buildFileName(title, "md"), blob);
  };

  const handleDownloadWord = () => {
    if (!result) return;
    const html = buildWordHtml(title, result);
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    downloadBlob(buildFileName(title, "doc"), blob);
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    const bytes = await buildPdfBytes(title, result);
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    downloadBlob(buildFileName(title, "pdf"), blob);
  };

  return (
    <div className="min-h-full bg-slate-100">
      <header className="border-b border-blue-900/20 bg-[#0c2340] text-white shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <span className="text-sm font-medium text-blue-100/90">
            数据合规与 AI 治理平台
          </span>
          <Link
            href="/"
            className="text-xs text-blue-200/80 transition-colors hover:text-white"
          >
            返回工作台
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#143a6e] to-[#1e4d8c] px-6 py-6 text-white shadow-lg">
          <h1 className="text-xl font-bold sm:text-2xl">PRD风险分析</h1>
          <p className="mt-2 text-sm text-blue-100/90">
            对接 AI 进行隐私与数据合规风险识别（PIPL），并生成合规看板与输出文档。
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0c2340]">PRD 输入</h2>

            <label className="mt-5 block">
              <span className="text-xs font-medium text-slate-600">PRD 标题</span>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                placeholder="例如：会员积分与门店推荐功能 PRD"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-medium text-slate-600">PRD 内容</span>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError("");
                }}
                rows={14}
                placeholder="请粘贴 PRD 全文…"
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-relaxed text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800 ring-1 ring-red-200"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e4d8c] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0c2340] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {loading ? "分析中…" : "开始AI风险分析"}
            </button>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0c2340]">合规分析报告</h2>

            {!loading && !result && !error && (
              <p className="mt-8 text-center text-sm text-slate-500">
                填写 PRD 后点击「开始AI风险分析」查看报告
              </p>
            )}

            {loading && (
              <div className="mt-12 flex flex-col items-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-100 border-t-[#1e4d8c]" />
                <p className="mt-4 text-sm text-slate-500">AI 正在生成报告…</p>
              </div>
            )}

            {result && !loading && (
              <>
                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link
                      href="/prd-analysis/dashboard"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      查看风险看板
                    </Link>
                    <Link
                      href="/prd-analysis/activities"
                      className="rounded-lg bg-slate-800 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-900"
                    >
                      查看数据台账
                    </Link>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link
                      href="/prd-analysis/pia"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      查看 PIA 草稿
                    </Link>
                    <button
                      type="button"
                      onClick={handleDownloadMarkdown}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      导出 Markdown
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleDownloadWord}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      导出 Word
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      导出 PDF
                    </button>
                  </div>
                </div>

                <article className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                  <div className="bg-[#0c2340] px-4 py-3 text-white">
                    <p className="text-xs text-blue-200/80">Privacy Compliance Report</p>
                    <h3 className="mt-0.5 text-sm font-bold">隐私合规风险评估报告</h3>
                    <p className="mt-1 text-xs text-blue-100/90">评估对象：{title.trim()}</p>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white text-sm">
                    <ReportRow label="风险等级">
                      <RiskBadge level={result.riskLevel} />
                    </ReportRow>
                    <ReportRow label="评估结论" highlight>
                      <p className="leading-relaxed text-slate-700">{result.conclusion}</p>
                    </ReportRow>
                    <ReportRow label="涉及个人信息">
                      <TagList items={result.personalInfo} />
                    </ReportRow>
                    <ReportRow label="涉及敏感个人信息">
                      <TagList items={result.sensitivePersonalInfo} variant="amber" />
                    </ReportRow>
                    <ReportRow label="数据处理目的">
                      <TagList items={result.dataProcessingPurposes} variant="slate" />
                    </ReportRow>
                    <ReportRow label="第三方共享">
                      <YesNo value={result.involvesThirdPartySharing} note={result.thirdPartySharingNote} />
                    </ReportRow>
                    <ReportRow label="跨境传输">
                      <YesNo value={result.involvesCrossBorder} note={result.crossBorderNote} />
                    </ReportRow>
                    <ReportRow label="主要风险">
                      <TagList items={result.mainRisks} variant="red" />
                    </ReportRow>
                    <ReportRow label="整改建议">
                      <ol className="list-decimal space-y-1 pl-5 text-slate-700">
                        {result.suggestions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </ReportRow>
                    <ReportRow label="人工复核" last>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                          result.requiresManualReview
                            ? "bg-amber-50 text-amber-800 ring-amber-200"
                            : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                        }`}
                      >
                        {result.requiresManualReview ? "建议人工复核" : "暂无需人工复核"}
                      </span>
                    </ReportRow>
                  </div>
                </article>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function ReportRow({
  label,
  children,
  highlight = false,
  last = false,
}: {
  label: string;
  children: ReactNode;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-2 px-4 py-3 sm:grid-cols-[6.5rem_1fr] ${
        highlight ? "bg-amber-50/50" : ""
      } ${last ? "" : ""}`}
    >
      <div className="text-xs font-semibold text-[#0c2340]">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    高: "bg-red-600 text-white",
    中: "bg-amber-500 text-white",
    低: "bg-emerald-600 text-white",
  };
  return (
    <span
      className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${styles[level] ?? "bg-slate-600 text-white"}`}
    >
      {level}
    </span>
  );
}

function YesNo({ value, note }: { value: boolean; note: string }) {
  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          value ? "bg-red-50 text-red-800" : "bg-slate-100 text-slate-600"
        }`}
      >
        {value ? "涉及" : "不涉及"}
      </span>
      {note ? <p className="mt-1 text-slate-600">{note}</p> : null}
    </div>
  );
}

function TagList({
  items,
  variant = "blue",
}: {
  items: string[];
  variant?: "blue" | "amber" | "red" | "slate";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-800 ring-blue-100",
    amber: "bg-amber-50 text-amber-900 ring-amber-100",
    red: "bg-red-50 text-red-800 ring-red-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  if (items.length === 0) {
    return <span className="text-slate-400">未识别</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${styles[variant]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
