"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PrdAnalysisResult } from "../../../lib/prd-analysis";

const STORAGE_KEY = "ai-prd-analysis-result";

export default function ActivitiesPage() {
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
          <h1 className="text-xl font-semibold text-slate-900">数据处理活动台账</h1>
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
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200/80">活动台账</p>
            <h1 className="mt-2 text-2xl font-bold">数据处理活动台账</h1>
            <p className="mt-2 text-sm text-blue-100/80">
              自动生成数据处理活动清单，便于合规复核与台账归档。
            </p>
          </div>
          <Link
            href="/prd-analysis"
            className="inline-flex rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            返回 PRD 风险分析
          </Link>
        </div>

        <div className="space-y-6">
          {analysis.processingActivities.map((activity) => (
            <section key={activity.activityName} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{activity.activityName}</h2>
                  <p className="mt-1 text-sm text-slate-500">责任部门：{activity.owner || "未说明"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activity.crossBorder ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}`}>
                  {activity.crossBorder ? "跨境活动" : "非跨境活动"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Detail label="数据类型" value={activity.dataTypes.join("、")} />
                <Detail label="处理目的" value={activity.purpose.join("、")} />
                <Detail label="法律依据" value={activity.legalBasis} />
                <Detail label="保存期限" value={activity.retentionPeriod} />
                <Detail label="第三方共享" value={activity.thirdPartySharing ? "是" : "否"} />
                {activity.thirdPartySharingNote && <Detail label="共享说明" value={activity.thirdPartySharingNote} />}
                <Detail label="跨境说明" value={activity.crossBorderNote || "无"} />
                <Detail label="合作方" value={activity.partners.join("、") || "未说明"} />
                <Detail label="安全措施" value={activity.securityControls.join("、") || "未说明"} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
