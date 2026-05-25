import Link from "next/link";

const stats = [
  {
    label: "今日分析 PRD 数量",
    value: "12",
    unit: "份",
    trend: "+3 较昨日",
    trendUp: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "高风险项目数量",
    value: "3",
    unit: "项",
    trend: "需优先跟进",
    trendUp: false,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: "敏感信息识别数量",
    value: "47",
    unit: "处",
    trend: "覆盖 8 个 PRD",
    trendUp: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    label: "PIA 完成率",
    value: "68",
    unit: "%",
    trend: "本月目标 80%",
    trendUp: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const modules = [
  {
    title: "PRD风险分析",
    href: "/prd-analysis",
    description:
      "从飞书知识库同步 PRD，智能识别个人信息收集、跨境传输、第三方共享等隐私与合规风险点。",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: "风险看板",
    description:
      "可视化展示风险等级分布、整改进度、责任人与 SLA，支撑数据合规与 AI 治理决策。",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "数据处理活动台账",
    description:
      "全生命周期管理数据处理活动，记录目的、数据类别、留存期限、安全措施与法律依据。",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "PIA评估文档生成",
    description:
      "基于 PRD 风险分析结果，一键生成隐私影响评估（PIA）文档草稿，支持导出与协同审阅。",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-4.772 4.772a48.108 48.108 0 00-3.827.327 2.25 2.25 0 00-1.976 2.192v9.75A2.25 2.25 0 007.5 21h2.25m-4.5 0h4.5" />
      </svg>
    ),
  },
];

const navItems = ["工作台", "合规分析", "台账管理", "系统设置"];

export default function Home() {
  return (
    <div className="min-h-full bg-slate-100">
      {/* 顶栏 */}
      <header className="border-b border-blue-900/20 bg-[#0c2340] text-white shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 ring-1 ring-blue-400/30">
              <svg className="h-4 w-4 text-blue-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-100/90">
              数据合规与 AI 治理平台
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-blue-200/70 sm:inline">
              2026年5月22日 星期五
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold">
              管
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* 侧栏 */}
        <aside className="hidden w-52 shrink-0 border-r border-slate-200 bg-white py-6 lg:block">
          <nav className="space-y-1 px-3">
            {navItems.map((item, i) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  i === 0
                    ? "bg-blue-50 text-blue-800"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        {/* 主内容 */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* 标题区 */}
          <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#143a6e] to-[#1e4d8c] px-6 py-8 text-white shadow-lg sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-medium tracking-widest text-blue-200/80 uppercase">
                  Data Compliance · Privacy · AI Governance
                </p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  AI数据合规风险分析系统
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
                  对接飞书知识库，实现 PRD 智能风险分析、PIA 生成与数据处理活动管理。
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/20">
                  飞书已连接
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-emerald-400/30">
                  系统运行中
                </span>
              </div>
            </div>
          </section>

          {/* 统计卡片 */}
          <section className="mt-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              今日概览
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      {stat.icon}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        stat.trendUp && stat.label !== "高风险项目数量"
                          ? "text-emerald-600"
                          : stat.label === "高风险项目数量"
                            ? "text-amber-600"
                            : "text-slate-500"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-[#0c2340]">
                      {stat.value}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      {stat.unit}
                    </span>
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* 功能模块 */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                核心功能模块
              </h2>
              <span className="text-xs text-slate-400">共 4 个模块</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {modules.map((module) => (
                <article
                  key={module.title}
                  className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-[#0c2340] text-white shadow-sm">
                    {module.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#0c2340]">
                    {module.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {module.description}
                  </p>
                  {module.href ? (
                    <Link
                      href={module.href}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e4d8c] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0c2340] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      进入模块
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e4d8c] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0c2340] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      进入模块
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>

          <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            © 2026 AI数据合规风险分析系统 · 数据合规 · 隐私保护 · AI 治理
          </footer>
        </main>
      </div>
    </div>
  );
}
