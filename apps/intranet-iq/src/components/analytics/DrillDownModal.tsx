"use client";

import { useState } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Users,
  Search,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  Globe,
  Building2,
  ChevronRight,
  Download,
  ArrowUpRight,
  Filter,
} from "lucide-react";

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

interface DrillDownModalProps {
  data: DrillDownData;
  onClose: () => void;
}

// Mock drill-down detail data
const userBreakdown = {
  byDepartment: [
    { name: "Engineering", users: 892, change: 15.2 },
    { name: "Marketing", users: 456, change: 8.7 },
    { name: "Sales", users: 543, change: 12.1 },
    { name: "HR", users: 234, change: 5.4 },
    { name: "Finance", users: 321, change: -2.1 },
    { name: "Operations", users: 401, change: 9.8 },
  ],
  byTime: [
    { hour: "9 AM", users: 1234 },
    { hour: "10 AM", users: 1876 },
    { hour: "11 AM", users: 2134 },
    { hour: "12 PM", users: 1543 },
    { hour: "1 PM", users: 987 },
    { hour: "2 PM", users: 2456 },
    { hour: "3 PM", users: 2312 },
    { hour: "4 PM", users: 1987 },
    { hour: "5 PM", users: 1234 },
  ],
  byDevice: [
    { device: "Desktop", percentage: 68 },
    { device: "Mobile", percentage: 24 },
    { device: "Tablet", percentage: 8 },
  ],
};

const searchBreakdown = {
  byCategory: [
    { category: "HR Policies", searches: 4521, successRate: 87 },
    { category: "IT Support", searches: 3876, successRate: 92 },
    { category: "Benefits", searches: 2934, successRate: 78 },
    { category: "Onboarding", searches: 2145, successRate: 95 },
    { category: "Company News", searches: 1956, successRate: 89 },
  ],
  noResults: [
    { query: "holiday calendar 2027", count: 89 },
    { query: "parking permit", count: 67 },
    { query: "vpn setup mac", count: 54 },
    { query: "salary advance", count: 43 },
  ],
  topRefinements: [
    { from: "benefits", to: "health benefits", count: 234 },
    { from: "policy", to: "remote work policy", count: 189 },
    { from: "time off", to: "pto policy", count: 156 },
  ],
};

const conversationBreakdown = {
  byTopic: [
    { topic: "IT Support", conversations: 876, satisfaction: 94 },
    { topic: "HR Questions", conversations: 654, satisfaction: 89 },
    { topic: "Policy Clarification", conversations: 543, satisfaction: 91 },
    { topic: "Benefits Help", conversations: 432, satisfaction: 87 },
    { topic: "Onboarding", conversations: 321, satisfaction: 96 },
  ],
  byOutcome: [
    { outcome: "Resolved", count: 2456, percentage: 75 },
    { outcome: "Escalated", count: 489, percentage: 15 },
    { outcome: "Abandoned", count: 346, percentage: 10 },
  ],
  avgMetrics: {
    messagesPerConvo: 4.7,
    resolutionTime: "2m 34s",
    firstResponseTime: "1.2s",
  },
};

const viewBreakdown = {
  byContentType: [
    { type: "Articles", views: 18234, avgTime: "3m 24s" },
    { type: "Documents", views: 12456, avgTime: "4m 12s" },
    { type: "Videos", views: 8976, avgTime: "5m 48s" },
    { type: "FAQs", views: 5454, avgTime: "1m 36s" },
  ],
  byDepartment: [
    { department: "Engineering", views: 15432, topContent: "API Documentation" },
    { department: "Marketing", views: 9876, topContent: "Brand Guidelines" },
    { department: "HR", views: 8765, topContent: "Employee Handbook" },
    { department: "Sales", views: 7654, topContent: "Product Sheets" },
  ],
  engagement: {
    bounceRate: 23,
    avgTimeOnPage: "3m 45s",
    pagesPerSession: 4.2,
  },
};

const featureBreakdown = {
  search: {
    totalQueries: 15432,
    uniqueUsers: 1876,
    avgQueriesPerUser: 8.2,
    peakHour: "10 AM",
    topDepartment: "Engineering",
  },
  chat: {
    totalConversations: 3291,
    uniqueUsers: 987,
    avgConvosPerUser: 3.3,
    peakHour: "2 PM",
    topDepartment: "HR",
  },
  content: {
    totalViews: 45120,
    uniqueViewers: 2134,
    avgViewsPerUser: 21.1,
    peakHour: "11 AM",
    topDepartment: "Marketing",
  },
  people: {
    totalSearches: 4532,
    uniqueUsers: 876,
    avgSearchesPerUser: 5.2,
    peakHour: "9 AM",
    topDepartment: "Sales",
  },
};

export function DrillDownModal({ data, onClose }: DrillDownModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  const getIcon = () => {
    switch (data.type) {
      case "users":
        return <Users className="w-6 h-6 text-blue-400" />;
      case "searches":
        return <Search className="w-6 h-6 text-blue-400" />;
      case "conversations":
        return <MessageSquare className="w-6 h-6 text-purple-400" />;
      case "views":
        return <FileText className="w-6 h-6 text-green-400" />;
      case "day":
        return <Calendar className="w-6 h-6 text-orange-400" />;
      case "feature":
        return <TrendingUp className="w-6 h-6 text-cyan-400" />;
      default:
        return <TrendingUp className="w-6 h-6 text-blue-400" />;
    }
  };

  const renderUsersDrillDown = () => (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {["By Department", "By Time", "By Device"].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-t-lg text-sm transition-colors ${
              activeTab === idx
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-3">
          {userBreakdown.byDepartment.map((dept) => (
            <div
              key={dept.name}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white/40" />
                <span className="text-white">{dept.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{dept.users.toLocaleString()}</span>
                <span className={`text-sm flex items-center gap-1 ${dept.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {dept.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(dept.change)}%
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-2">
          <div className="flex items-end justify-between h-48 gap-1">
            {userBreakdown.byTime.map((hour) => {
              const max = Math.max(...userBreakdown.byTime.map((h) => h.users));
              return (
                <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-colors cursor-pointer"
                    style={{ height: `${(hour.users / max) * 100}%` }}
                    title={`${hour.users.toLocaleString()} users`}
                  />
                  <span className="text-xs text-white/40">{hour.hour.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-lg font-medium text-white">2,456</p>
              <p className="text-xs text-white/50">Peak Users</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white">2 PM</p>
              <p className="text-xs text-white/50">Peak Hour</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white">1,543</p>
              <p className="text-xs text-white/50">Avg/Hour</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-4">
          {userBreakdown.byDevice.map((device) => (
            <div key={device.device}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">{device.device}</span>
                <span className="text-white/70">{device.percentage}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${device.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSearchesDrillDown = () => (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {["By Category", "No Results", "Refinements"].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-t-lg text-sm transition-colors ${
              activeTab === idx
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-3">
          {searchBreakdown.byCategory.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-white/40" />
                <span className="text-white">{cat.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{cat.searches.toLocaleString()}</span>
                <span className={`text-sm px-2 py-0.5 rounded ${
                  cat.successRate >= 90 ? "bg-green-500/20 text-green-400" :
                  cat.successRate >= 75 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {cat.successRate}% success
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-white/50 mb-4">
            Searches that returned no results - consider adding content for these topics
          </p>
          {searchBreakdown.noResults.map((item) => (
            <div
              key={item.query}
              className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-red-400" />
                <span className="text-white">"{item.query}"</span>
              </div>
              <span className="text-white/70">{item.count} searches</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-white/50 mb-4">
            Common search refinements - users are narrowing their searches
          </p>
          {searchBreakdown.topRefinements.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
            >
              <span className="text-white/50">"{item.from}"</span>
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
              <span className="text-white">"{item.to}"</span>
              <span className="text-white/40 ml-auto">{item.count}x</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConversationsDrillDown = () => (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {["By Topic", "By Outcome", "Metrics"].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-t-lg text-sm transition-colors ${
              activeTab === idx
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-3">
          {conversationBreakdown.byTopic.map((topic) => (
            <div
              key={topic.topic}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-white/40" />
                <span className="text-white">{topic.topic}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{topic.conversations.toLocaleString()}</span>
                <span className="text-sm px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                  {topic.satisfaction}% satisfied
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          {conversationBreakdown.byOutcome.map((item) => (
            <div key={item.outcome}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">{item.outcome}</span>
                <span className="text-white/70">{item.count.toLocaleString()} ({item.percentage}%)</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.outcome === "Resolved" ? "bg-green-500" :
                    item.outcome === "Escalated" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 2 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-medium text-white mb-1">
              {conversationBreakdown.avgMetrics.messagesPerConvo}
            </p>
            <p className="text-xs text-white/50">Avg Messages/Conversation</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-medium text-white mb-1">
              {conversationBreakdown.avgMetrics.resolutionTime}
            </p>
            <p className="text-xs text-white/50">Avg Resolution Time</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-medium text-white mb-1">
              {conversationBreakdown.avgMetrics.firstResponseTime}
            </p>
            <p className="text-xs text-white/50">First Response Time</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderViewsDrillDown = () => (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {["By Type", "By Department", "Engagement"].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-t-lg text-sm transition-colors ${
              activeTab === idx
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-3">
          {viewBreakdown.byContentType.map((type) => (
            <div
              key={type.type}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white/40" />
                <span className="text-white">{type.type}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{type.views.toLocaleString()} views</span>
                <span className="text-sm text-white/50 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {type.avgTime}
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-3">
          {viewBreakdown.byDepartment.map((dept) => (
            <div
              key={dept.department}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white/40" />
                <div>
                  <span className="text-white block">{dept.department}</span>
                  <span className="text-xs text-white/40">Top: {dept.topContent}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{dept.views.toLocaleString()}</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 2 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-medium text-white mb-1">
              {viewBreakdown.engagement.bounceRate}%
            </p>
            <p className="text-xs text-white/50">Bounce Rate</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-medium text-white mb-1">
              {viewBreakdown.engagement.avgTimeOnPage}
            </p>
            <p className="text-xs text-white/50">Avg Time on Page</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-medium text-white mb-1">
              {viewBreakdown.engagement.pagesPerSession}
            </p>
            <p className="text-xs text-white/50">Pages per Session</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderDayDrillDown = () => {
    if (!data.dayData) return null;
    const { day, searches, chats, views } = data.dayData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-2xl font-medium text-blue-400 mb-1">
              {searches.toLocaleString()}
            </p>
            <p className="text-xs text-white/50">Searches</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
            <p className="text-2xl font-medium text-purple-400 mb-1">
              {views.toLocaleString()}
            </p>
            <p className="text-xs text-white/50">Views</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-2xl font-medium text-green-400 mb-1">
              {chats.toLocaleString()}
            </p>
            <p className="text-xs text-white/50">Chats</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/5">
          <h4 className="text-sm font-medium text-white mb-3">Hourly Breakdown</h4>
          <div className="space-y-2">
            {["9 AM", "12 PM", "3 PM", "6 PM"].map((hour, idx) => {
              const multiplier = [0.7, 1, 0.9, 0.5][idx];
              return (
                <div key={hour} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-12">{hour}</span>
                  <div className="flex-1 flex gap-1">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${(searches * multiplier / searches) * 30}%` }}
                    />
                    <div
                      className="h-2 bg-purple-500 rounded"
                      style={{ width: `${(views * multiplier / views) * 30}%` }}
                    />
                    <div
                      className="h-2 bg-green-500 rounded"
                      style={{ width: `${(chats * multiplier / chats) * 10}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-sm text-white/50">
          Click on any metric above to see more detailed breakdowns for {day}.
        </div>
      </div>
    );
  };

  const renderFeatureDrillDown = () => {
    if (!data.featureData) return null;
    const featureName = data.featureData.name.toLowerCase().replace(" ", "");
    const featureKey = featureName === "aichat" ? "chat" :
                       featureName === "contentbrowse" ? "content" :
                       featureName === "peopledirectory" ? "people" : "search";
    const featureStats = featureBreakdown[featureKey as keyof typeof featureBreakdown];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-xs text-white/50 mb-1">Total Activity</p>
            <p className="text-xl font-medium text-white">
              {featureKey === "search" ? featureStats.totalQueries.toLocaleString() :
               featureKey === "chat" ? featureStats.totalConversations.toLocaleString() :
               featureKey === "content" ? featureStats.totalViews.toLocaleString() :
               featureStats.totalSearches.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-xs text-white/50 mb-1">Unique Users</p>
            <p className="text-xl font-medium text-white">
              {featureStats.uniqueUsers.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-xs text-white/50 mb-1">Avg Per User</p>
            <p className="text-xl font-medium text-white">
              {featureKey === "search" ? featureStats.avgQueriesPerUser :
               featureKey === "chat" ? featureStats.avgConvosPerUser :
               featureKey === "content" ? featureStats.avgViewsPerUser :
               featureStats.avgSearchesPerUser}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-xs text-white/50 mb-1">Peak Hour</p>
            <p className="text-xl font-medium text-white">{featureStats.peakHour}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Top Department</h4>
            <span className="text-blue-400">{featureStats.topDepartment}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${data.featureData.percentage}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2">
            {data.featureData.percentage}% of total platform usage
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (data.type) {
      case "users":
        return renderUsersDrillDown();
      case "searches":
        return renderSearchesDrillDown();
      case "conversations":
        return renderConversationsDrillDown();
      case "views":
        return renderViewsDrillDown();
      case "day":
        return renderDayDrillDown();
      case "feature":
        return renderFeatureDrillDown();
      default:
        return <p className="text-white/50">No detailed data available</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">{data.title}</h2>
              <p className="text-white/50 text-sm flex items-center gap-2">
                <span className="text-2xl font-medium text-white">{data.value}</span>
                {data.change !== undefined && (
                  <span className={`text-sm flex items-center gap-1 ${data.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {data.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(data.change)}%
                  </span>
                )}
                {data.period && <span className="text-white/40">• {data.period}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
