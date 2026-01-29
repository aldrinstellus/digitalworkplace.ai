"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DrillDownModal } from "@/components/analytics/DrillDownModal";
import {
  TrendingUp,
  Users,
  Search,
  MessageSquare,
  FileText,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Download,
  FileDown,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: typeof TrendingUp;
}

interface SearchQuery {
  query: string;
  count: number;
  avgResults: number;
  clickThrough: number;
}

interface TopContent {
  title: string;
  views: number;
  type: string;
}

// Mock data
const metrics: MetricCard[] = [
  { title: "Active Users", value: "2,847", change: 12.5, trend: "up", icon: Users },
  { title: "Search Queries", value: "15,432", change: 8.3, trend: "up", icon: Search },
  { title: "AI Conversations", value: "3,291", change: -2.1, trend: "down", icon: MessageSquare },
  { title: "Content Views", value: "45,120", change: 15.7, trend: "up", icon: FileText },
];

const topSearchQueries: SearchQuery[] = [
  { query: "vacation policy", count: 342, avgResults: 12, clickThrough: 78 },
  { query: "expense report", count: 289, avgResults: 8, clickThrough: 85 },
  { query: "onboarding checklist", count: 256, avgResults: 15, clickThrough: 72 },
  { query: "remote work guidelines", count: 234, avgResults: 6, clickThrough: 91 },
  { query: "benefits enrollment", count: 198, avgResults: 10, clickThrough: 68 },
];

const topContent: TopContent[] = [
  { title: "Employee Handbook 2026", views: 1245, type: "document" },
  { title: "Q1 Company Update", views: 987, type: "article" },
  { title: "Remote Work Policy", views: 876, type: "article" },
  { title: "Benefits Guide", views: 765, type: "document" },
  { title: "Tech Stack Overview", views: 654, type: "article" },
];

const dailyActivity = [
  { day: "Mon", searches: 2340, chats: 450, views: 5670 },
  { day: "Tue", searches: 2890, chats: 520, views: 6120 },
  { day: "Wed", searches: 3120, chats: 480, views: 5980 },
  { day: "Thu", searches: 2780, chats: 510, views: 6340 },
  { day: "Fri", searches: 2450, chats: 390, views: 5120 },
  { day: "Sat", searches: 890, chats: 120, views: 1890 },
  { day: "Sun", searches: 670, chats: 95, views: 1450 },
];

type DrillDownType = "users" | "searches" | "conversations" | "views" | "day" | "feature";

interface DrillDownData {
  type: DrillDownType;
  title: string;
  value: string | number;
  change?: number;
  period?: string;
  dayData?: {
    day: string;
    searches: number;
    chats: number;
    views: number;
  };
  featureData?: {
    name: string;
    percentage: number;
  };
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);

  const maxActivity = Math.max(...dailyActivity.map(d => Math.max(d.searches, d.views)));

  // Handle metric card click
  const handleMetricClick = (metric: MetricCard) => {
    const typeMap: Record<string, DrillDownType> = {
      "Active Users": "users",
      "Search Queries": "searches",
      "AI Conversations": "conversations",
      "Content Views": "views",
    };
    setDrillDownData({
      type: typeMap[metric.title] || "users",
      title: metric.title,
      value: metric.value,
      change: metric.change,
      period: dateRange === "24h" ? "Last 24 hours" : dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : "Last 90 days",
    });
  };

  // Handle day bar click
  const handleDayClick = (day: typeof dailyActivity[0]) => {
    setDrillDownData({
      type: "day",
      title: `${day.day} Activity`,
      value: (day.searches + day.chats + day.views).toLocaleString(),
      period: "Total interactions",
      dayData: day,
    });
  };

  // Handle feature usage click
  const handleFeatureClick = (name: string, percentage: number) => {
    setDrillDownData({
      type: "feature",
      title: `${name} Usage`,
      value: `${percentage}%`,
      period: "of total platform usage",
      featureData: { name, percentage },
    });
  };

  // Export to CSV
  const exportToCSV = useCallback(() => {
    setExporting(true);

    // Build CSV content
    const csvContent = [
      // Metrics section
      "Analytics Report",
      `Date Range: ${dateRange}`,
      "",
      "Key Metrics",
      "Metric,Value,Change,Trend",
      ...metrics.map(m => `${m.title},${m.value},${m.change}%,${m.trend}`),
      "",
      "Top Search Queries",
      "Query,Count,Avg Results,Click-Through Rate",
      ...topSearchQueries.map(q => `"${q.query}",${q.count},${q.avgResults},${q.clickThrough}%`),
      "",
      "Top Content",
      "Title,Views,Type",
      ...topContent.map(c => `"${c.title}",${c.views},${c.type}`),
      "",
      "Daily Activity",
      "Day,Searches,Chats,Views",
      ...dailyActivity.map(d => `${d.day},${d.searches},${d.chats},${d.views}`),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `diq-analytics-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExporting(false);
    setShowExportMenu(false);
  }, [dateRange]);

  // Export to PDF (uses browser print)
  const exportToPDF = useCallback(() => {
    setExporting(true);

    // Create a printable version of the report
    const printContent = `
      <html>
        <head>
          <title>dIQ Analytics Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; }
            h1 { color: #1a1a2e; margin-bottom: 10px; }
            h2 { color: #3b82f6; margin-top: 30px; }
            p { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: 600; }
            .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; }
            .metric-value { font-size: 28px; font-weight: 700; }
            .metric-change { color: green; font-size: 14px; }
            .metric-change.down { color: red; }
          </style>
        </head>
        <body>
          <h1>dIQ Analytics Report</h1>
          <p>Date Range: Last ${dateRange === "24h" ? "24 hours" : dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : "90 days"}</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>

          <h2>Key Metrics</h2>
          <div class="metric-grid">
            ${metrics.map(m => `
              <div class="metric-card">
                <p>${m.title}</p>
                <div class="metric-value">${m.value}</div>
                <div class="metric-change ${m.trend === "down" ? "down" : ""}">${m.trend === "up" ? "↑" : "↓"} ${Math.abs(m.change)}%</div>
              </div>
            `).join("")}
          </div>

          <h2>Top Search Queries</h2>
          <table>
            <tr><th>Query</th><th>Count</th><th>Avg Results</th><th>CTR</th></tr>
            ${topSearchQueries.map(q => `<tr><td>${q.query}</td><td>${q.count}</td><td>${q.avgResults}</td><td>${q.clickThrough}%</td></tr>`).join("")}
          </table>

          <h2>Top Content</h2>
          <table>
            <tr><th>Title</th><th>Views</th><th>Type</th></tr>
            ${topContent.map(c => `<tr><td>${c.title}</td><td>${c.views.toLocaleString()}</td><td>${c.type}</td></tr>`).join("")}
          </table>

          <h2>AI Performance</h2>
          <table>
            <tr><td>Answer Accuracy</td><td>87%</td></tr>
            <tr><td>Avg Response Time</td><td>1.2s</td></tr>
            <tr><td>User Satisfaction</td><td>92%</td></tr>
            <tr><td>Source Citation Rate</td><td>78%</td></tr>
          </table>
        </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }

    setExporting(false);
    setShowExportMenu(false);
  }, [dateRange]);

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-primary)] flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-[var(--accent-ember)]" />
                Analytics Dashboard
              </h1>
              <p className="text-[var(--text-muted)] mt-1">Monitor usage patterns and content performance</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent-ember)]/50"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-white/5 text-[var(--text-primary)] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 top-12 w-48 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl shadow-xl z-50 overflow-hidden">
                      <button
                        onClick={exportToCSV}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <FileDown className="w-4 h-4 text-[var(--success)]" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Export CSV</p>
                          <p className="text-xs text-[var(--text-muted)]">Spreadsheet format</p>
                        </div>
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-t border-[var(--border-subtle)]"
                      >
                        <FileText className="w-4 h-4 text-[var(--error)]" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Export PDF</p>
                          <p className="text-xs text-[var(--text-muted)]">Printable report</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Metric Cards - Clickable for Drill-Down */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {metrics.map((metric) => (
              <div
                key={metric.title}
                onClick={() => handleMetricClick(metric)}
                className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[var(--text-muted)] text-sm">{metric.title}</span>
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-4 h-4 text-[var(--text-muted)]" />
                    <ExternalLink className="w-3 h-3 text-transparent group-hover:text-[var(--text-muted)] transition-colors" />
                  </div>
                </div>
                <div className="text-2xl font-medium text-[var(--text-primary)] mb-1">{metric.value}</div>
                <div className={`flex items-center gap-1 text-sm ${metric.trend === "up" ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                  {metric.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(metric.change)}%
                  <span className="text-[var(--text-muted)] ml-1">vs last period</span>
                </div>
                <p className="text-xs text-transparent group-hover:text-[var(--text-muted)]/70 mt-2 transition-colors">
                  Click for detailed breakdown
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Activity Chart */}
            <div className="col-span-2 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Weekly Activity</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--accent-ember)]" />
                    <span className="text-[var(--text-muted)]">Searches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--accent-copper)]" />
                    <span className="text-[var(--text-muted)]">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                    <span className="text-[var(--text-muted)]">Chats</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between h-48 gap-2">
                {dailyActivity.map((day) => (
                  <div
                    key={day.day}
                    onClick={() => handleDayClick(day)}
                    className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <div className="w-full flex items-end gap-0.5 h-40 group-hover:opacity-80 transition-opacity">
                      <div
                        className="flex-1 bg-[var(--accent-ember)] rounded-t group-hover:bg-blue-400 transition-colors"
                        style={{ height: `${(day.searches / maxActivity) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-[var(--accent-copper)] rounded-t group-hover:bg-purple-400 transition-colors"
                        style={{ height: `${(day.views / maxActivity) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-[var(--success)] rounded-t group-hover:bg-green-400 transition-colors"
                        style={{ height: `${(day.chats / maxActivity) * 20}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{day.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)]/70 mt-3 text-center">Click on any day to see detailed breakdown</p>
            </div>

            {/* Usage Distribution - Clickable for Drill-Down */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-6">Usage by Feature</h3>
              <div className="space-y-4">
                {[
                  { name: "Search", percentage: 45, color: "blue" },
                  { name: "AI Chat", percentage: 28, color: "purple" },
                  { name: "Content Browse", percentage: 18, color: "green" },
                  { name: "People Directory", percentage: 9, color: "orange" },
                ].map((feature) => (
                  <div
                    key={feature.name}
                    onClick={() => handleFeatureClick(feature.name, feature.percentage)}
                    className="cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-muted)]">{feature.percentage}%</span>
                        <ExternalLink className="w-3 h-3 text-transparent group-hover:text-[var(--text-muted)] transition-colors" />
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${feature.color}-500 rounded-full group-hover:bg-${feature.color}-400 transition-colors`}
                        style={{ width: `${feature.percentage}%`, backgroundColor: feature.color === "blue" ? "#3b82f6" : feature.color === "purple" ? "#a855f7" : feature.color === "green" ? "#22c55e" : "#10b981" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)]/70 mt-4 text-center">Click on any feature for details</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top Search Queries */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Top Search Queries</h3>
                <button className="text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)]">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      <th className="pb-3 font-medium">Query</th>
                      <th className="pb-3 font-medium text-right">Count</th>
                      <th className="pb-3 font-medium text-right">Avg Results</th>
                      <th className="pb-3 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSearchQueries.map((query, idx) => (
                      <tr key={idx} className="border-b border-[var(--border-subtle)]/50">
                        <td className="py-3 text-[var(--text-primary)] text-sm">{query.query}</td>
                        <td className="py-3 text-[var(--text-secondary)] text-sm text-right">{query.count}</td>
                        <td className="py-3 text-[var(--text-secondary)] text-sm text-right">{query.avgResults}</td>
                        <td className="py-3 text-right">
                          <span className={`text-sm ${query.clickThrough >= 80 ? "text-[var(--success)]" : query.clickThrough >= 60 ? "text-[var(--warning)]" : "text-[var(--error)]"}`}>
                            {query.clickThrough}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Content */}
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Top Content</h3>
                <button className="text-sm text-[var(--accent-ember)] hover:text-[var(--accent-ember-soft)]">View all</button>
              </div>
              <div className="space-y-3">
                {topContent.map((content, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-[var(--text-muted)] w-6">{idx + 1}</span>
                      <div>
                        <h4 className="text-[var(--text-primary)] text-sm">{content.title}</h4>
                        <span className="text-xs text-[var(--text-muted)] capitalize">{content.type}</span>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">{content.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Performance */}
          <div className="mt-6 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">AI Assistant Performance</h3>
            <div className="grid grid-cols-4 gap-6">
              <div
                onClick={() => setDrillDownData({
                  type: "conversations",
                  title: "Answer Accuracy",
                  value: "87%",
                  change: 3.2,
                  period: "AI accuracy metrics",
                })}
                className="text-center cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="text-3xl font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-ember)] transition-colors">87%</div>
                <div className="text-sm text-[var(--text-muted)]">Answer Accuracy</div>
              </div>
              <div
                onClick={() => setDrillDownData({
                  type: "conversations",
                  title: "Response Time",
                  value: "1.2s",
                  change: -8.5,
                  period: "Average response latency",
                })}
                className="text-center cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="text-3xl font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--success)] transition-colors">1.2s</div>
                <div className="text-sm text-[var(--text-muted)]">Avg Response Time</div>
              </div>
              <div
                onClick={() => setDrillDownData({
                  type: "conversations",
                  title: "User Satisfaction",
                  value: "92%",
                  change: 5.1,
                  period: "Based on user feedback",
                })}
                className="text-center cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="text-3xl font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-gold)] transition-colors">92%</div>
                <div className="text-sm text-[var(--text-muted)]">User Satisfaction</div>
              </div>
              <div
                onClick={() => setDrillDownData({
                  type: "conversations",
                  title: "Source Citations",
                  value: "78%",
                  change: 12.3,
                  period: "Responses with citations",
                })}
                className="text-center cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="text-3xl font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-ember)] transition-colors">78%</div>
                <div className="text-sm text-[var(--text-muted)]">Source Citation Rate</div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]/70 mt-4 text-center">Click on any metric for detailed breakdown</p>
          </div>
        </div>
      </main>

      {/* Drill-Down Modal */}
      {drillDownData && (
        <DrillDownModal
          data={drillDownData}
          onClose={() => setDrillDownData(null)}
        />
      )}
    </div>
  );
}
