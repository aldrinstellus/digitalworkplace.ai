"use client";

import { useState } from "react";
import { Globe, Building2, Hash, ChevronDown } from "lucide-react";

export type SearchScope = "company" | "web" | "space";

interface SearchScopeToggleProps {
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  activeSpaceName?: string;
}

const scopeConfig: Record<
  SearchScope,
  { icon: typeof Globe; label: string; description: string }
> = {
  company: {
    icon: Building2,
    label: "Company sources",
    description: "Search internal knowledge base",
  },
  web: {
    icon: Globe,
    label: "Search the web",
    description: "Include external web results",
  },
  space: {
    icon: Hash,
    label: "Use a space",
    description: "Search within a specific space",
  },
};

export function SearchScopeToggle({
  scope,
  onScopeChange,
  activeSpaceName,
}: SearchScopeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentScope = scopeConfig[scope];
  const Icon = currentScope.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors"
      >
        <Icon className="w-4 h-4 text-white/60" />
        <span className="text-white/70">
          {scope === "space" && activeSpaceName
            ? activeSpaceName
            : currentScope.label}
        </span>
        <ChevronDown className="w-3 h-3 text-white/40" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0f0f14] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              {(Object.keys(scopeConfig) as SearchScope[]).map((key) => {
                const config = scopeConfig[key];
                const ScopeIcon = config.icon;
                const isActive = scope === key;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      onScopeChange(key);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-500/20 text-blue-400"
                        : "hover:bg-white/5 text-white/70"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-blue-500/30" : "bg-white/10"
                      }`}
                    >
                      <ScopeIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-white/40">
                        {config.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 p-2">
              <p className="text-xs text-white/40 px-3 py-1">
                Tip: Use @mentions to reference specific documents or people
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
