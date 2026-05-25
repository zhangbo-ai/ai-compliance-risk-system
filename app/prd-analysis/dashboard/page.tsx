"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PrdAnalysisResult } from "../../../lib/prd-analysis";

const STORAGE_KEY = "ai-prd-analysis-result";

export default function RiskDashboardPage() {
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
          <h1 className="text-xl font-semibold text-slate-900">风险看板</h1>
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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-[#0c2340] px-6 py-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200/80">风险看板</p>
            <h1 className="mt-2 text-2xl font-bold">PRD 合规风险概览</h1>
            <p className="mt-2 text-sm text-blue-100/80">
              基于最新 AI 分析结果，生成风险等级、跨境/共享状态、风险项与整改建议。
            </p>
          </div>
          <Link
            href="/prd-analysis"
            className="inline-flex rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            返回 PRD 风险分析
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">总体风险等级</p>
            <div className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              {analysis.riskLevel}
            </div>
            <p className="mt-4 text-sm text-slate-600">基于 AI 评估的整体合规风险判断。</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">是否跨境</p>
            <div className="mt-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
              {analysis.involvesCrossBorder ? "是" : "否"}
            </div>
            <p className="mt-4 text-sm text-slate-600">{analysis.crossBorderNote || "未识别跨境说明。"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">是否共享</p>
            <div className="mt-4 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
              {analysis.involvesThirdPartySharing ? "是" : "否"}
            </div>
            <p className="mt-4 text-sm text-slate-600">{analysis.thirdPartySharingNote || "未识别共享说明。"}</p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">风险项清单</h2>
              <p className="mt-1 text-sm text-slate-500">按类别与等级展示核心合规风险。</p>
            </div>
          </div>

          <div className="space-y-4">
            {analysis.riskItems.map((item) => (
              <div key={`${item.type}-${item.level}-${item.description}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.type}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.level === "高" ? "bg-red-100 text-red-700" : item.level === "中" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {item.level}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">风险描述</p>
                    <p className="mt-2 text-sm text-slate-700">{item.description}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">建议</p>
                    <p className="mt-2 text-sm text-slate-700">{item.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">AI 评估结论</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{analysis.conclusion}</p>
        </section>
      </div>
    </main>
  );
}
