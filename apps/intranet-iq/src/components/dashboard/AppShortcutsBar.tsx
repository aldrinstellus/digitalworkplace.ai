"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Settings } from "lucide-react";

interface AppShortcut {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
}

// Default app shortcuts - in production, these would be user-configurable
const defaultApps: AppShortcut[] = [
  { id: "drive", name: "Google Drive", icon: "📁", url: "#", color: "bg-yellow-500/20" },
  { id: "slack", name: "Slack", icon: "💬", url: "#", color: "bg-purple-500/20" },
  { id: "zoom", name: "Zoom", icon: "🎥", url: "#", color: "bg-blue-500/20" },
  { id: "confluence", name: "Confluence", icon: "📝", url: "#", color: "bg-blue-600/20" },
  { id: "jira", name: "Jira", icon: "🎯", url: "#", color: "bg-blue-400/20" },
  { id: "salesforce", name: "Salesforce", icon: "☁️", url: "#", color: "bg-cyan-500/20" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", url: "#", color: "bg-blue-700/20" },
  { id: "github", name: "GitHub", icon: "🐙", url: "#", color: "bg-gray-500/20" },
  { id: "notion", name: "Notion", icon: "📓", url: "#", color: "bg-white/10" },
  { id: "figma", name: "Figma", icon: "🎨", url: "#", color: "bg-pink-500/20" },
];

export function AppShortcutsBar() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [apps] = useState<AppShortcut[]>(defaultApps);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < apps.length - 6; // Show ~6 apps at a time

  const scroll = (direction: "left" | "right") => {
    if (direction === "left" && canScrollLeft) {
      setScrollPosition((prev) => Math.max(0, prev - 3));
    } else if (direction === "right" && canScrollRight) {
      setScrollPosition((prev) => Math.min(apps.length - 6, prev + 3));
    }
  };

  return (
    <div className="fixed bottom-0 left-16 right-0 bg-[#0a0a0f]/95 backdrop-blur border-t border-white/10 py-3 px-4 z-40">
      <div className="max-w-5xl mx-auto flex items-center gap-2">
        {/* Scroll Left */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`p-1.5 rounded-lg transition-colors ${
            canScrollLeft
              ? "hover:bg-white/10 text-white/60 hover:text-white"
              : "text-white/20 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Apps Container */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex gap-2 transition-transform duration-300"
            style={{ transform: `translateX(-${scrollPosition * 80}px)` }}
          >
            {apps.map((app) => (
              <a
                key={app.id}
                href={app.url}
                className="flex flex-col items-center gap-1 min-w-[72px] p-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${app.color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}
                >
                  {app.icon}
                </div>
                <span className="text-xs text-white/50 group-hover:text-white/70 truncate max-w-full">
                  {app.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`p-1.5 rounded-lg transition-colors ${
            canScrollRight
              ? "hover:bg-white/10 text-white/60 hover:text-white"
              : "text-white/20 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* "Scroll to see more" indicator */}
        {canScrollRight && (
          <span className="text-xs text-white/30 animate-pulse">
            Scroll to see {apps.length - scrollPosition - 6} more →
          </span>
        )}
      </div>
    </div>
  );
}
