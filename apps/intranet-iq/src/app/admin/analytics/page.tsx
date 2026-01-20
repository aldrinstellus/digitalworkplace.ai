"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const maxActivity = Math.max(...dailyActivity.map(d => Math.max(d.searches, d.views)));

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
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-white flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-400" />
                Analytics Dashboard
              </h1>
              <p className="text-white/50 mt-1">Monitor usage patterns and content performance</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500/50"
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
                  className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
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
                    <div className="absolute right-0 top-12 w-48 bg-[#0f0f14] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                      <button
                        onClick={exportToCSV}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                      >
                        <FileDown className="w-4 h-4 text-green-400" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Export CSV</p>
                          <p className="text-xs text-white/40">Spreadsheet format</p>
                        </div>
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white transition-colors border-t border-white/10"
                      >
                        <FileText className="w-4 h-4 text-red-400" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Export PDF</p>
                          <p className="text-xs text-white/40">Printable report</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {metrics.map((metric) => (
              <div key={metric.title} className="bg-[#0f0f14] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/50 text-sm">{metric.title}</span>
                  <metric.icon className="w-4 h-4 text-white/40" />
                </div>
                <div className="text-2xl font-medium text-white mb-1">{metric.value}</div>
                <div className={`flex items-center gap-1 text-sm ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                  {metric.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(metric.change)}%
                  <span className="text-white/40 ml-1">vs last period</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Activity Chart */}
            <div className="col-span-2 bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Weekly Activity</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-white/50">Searches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-white/50">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-white/50">Chats</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between h-48 gap-2">
                {dailyActivity.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 h-40">
                      <div
                        className="flex-1 bg-blue-500 rounded-t"
                        style={{ height: `${(day.searches / maxActivity) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-purple-500 rounded-t"
                        style={{ height: `${(day.views / maxActivity) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-green-500 rounded-t"
                        style={{ height: `${(day.chats / maxActivity) * 20}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Distribution */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-6">Usage by Feature</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/70">Search</span>
                    <span className="text-sm text-white/50">45%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/70">AI Chat</span>
                    <span className="text-sm text-white/50">28%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "28%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/70">Content Browse</span>
                    <span className="text-sm text-white/50">18%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "18%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/70">People Directory</span>
                    <span className="text-sm text-white/50">9%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "9%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top Search Queries */}
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Top Search Queries</h3>
                <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-white/50 border-b border-white/10">
                      <th className="pb-3 font-medium">Query</th>
                      <th className="pb-3 font-medium text-right">Count</th>
                      <th className="pb-3 font-medium text-right">Avg Results</th>
                      <th className="pb-3 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSearchQueries.map((query, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-3 text-white text-sm">{query.query}</td>
                        <td className="py-3 text-white/70 text-sm text-right">{query.count}</td>
                        <td className="py-3 text-white/70 text-sm text-right">{query.avgResults}</td>
                        <td className="py-3 text-right">
                          <span className={`text-sm ${query.clickThrough >= 80 ? "text-green-400" : query.clickThrough >= 60 ? "text-yellow-400" : "text-red-400"}`}>
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
            <div className="bg-[#0f0f14] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Top Content</h3>
                <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
              </div>
              <div className="space-y-3">
                {topContent.map((content, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-white/40 w-6">{idx + 1}</span>
                      <div>
                        <h4 className="text-white text-sm">{content.title}</h4>
                        <span className="text-xs text-white/40 capitalize">{content.type}</span>
                      </div>
                    </div>
                    <span className="text-sm text-white/50">{content.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Performance */}
          <div className="mt-6 bg-[#0f0f14] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">AI Assistant Performance</h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-medium text-white mb-1">87%</div>
                <div className="text-sm text-white/50">Answer Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium text-white mb-1">1.2s</div>
                <div className="text-sm text-white/50">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium text-white mb-1">92%</div>
                <div className="text-sm text-white/50">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium text-white mb-1">78%</div>
                <div className="text-sm text-white/50">Source Citation Rate</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
