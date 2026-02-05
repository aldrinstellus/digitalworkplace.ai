'use client';

import { memo, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface FeatureItem {
  id: string;
  name: string;
  category: string;
}

const TECH_LEAD_FEATURES: FeatureItem[] = [
  // CI/CD Pipeline
  { id: 'tl-f1', name: 'Build Orchestration', category: 'CI/CD Pipeline' },
  { id: 'tl-f2', name: 'Deploy Pipeline', category: 'CI/CD Pipeline' },
  { id: 'tl-f3', name: 'Rollback Automation', category: 'CI/CD Pipeline' },
  { id: 'tl-f4', name: 'Feature Flags', category: 'CI/CD Pipeline' },
  // API Infrastructure
  { id: 'tl-f5', name: 'REST API Gateway', category: 'API Infrastructure' },
  { id: 'tl-f6', name: 'GraphQL Layer', category: 'API Infrastructure' },
  { id: 'tl-f7', name: 'Rate Limiting', category: 'API Infrastructure' },
  { id: 'tl-f8', name: 'API Versioning', category: 'API Infrastructure' },
  // Performance Engineering
  { id: 'tl-f9', name: 'Load Testing Framework', category: 'Performance Engineering' },
  { id: 'tl-f10', name: 'Memory Profiler', category: 'Performance Engineering' },
  { id: 'tl-f11', name: 'CDN Optimization', category: 'Performance Engineering' },
  // Security Testing
  { id: 'tl-f12', name: 'Penetration Test Suite', category: 'Security Testing' },
  { id: 'tl-f13', name: 'Dependency Scanner', category: 'Security Testing' },
  { id: 'tl-f14', name: 'Auth Token Validation', category: 'Security Testing' },
  // DevOps Automation
  { id: 'tl-f15', name: 'Container Orchestration', category: 'DevOps Automation' },
  { id: 'tl-f16', name: 'Log Aggregation', category: 'DevOps Automation' },
  { id: 'tl-f17', name: 'Infra-as-Code', category: 'DevOps Automation' },
  { id: 'tl-f18', name: 'Secrets Management', category: 'DevOps Automation' },
];

const CATEGORIES = [...new Set(TECH_LEAD_FEATURES.map((f) => f.category))];

interface FeatureSelectionPanelProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export { TECH_LEAD_FEATURES };

export default memo(function FeatureSelectionPanel({
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  disabled,
}: FeatureSelectionPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const categorizedFeatures = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      name: cat,
      features: TECH_LEAD_FEATURES.filter((f) => f.category === cat),
    }));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Feature Selection ({selectedIds.size}/{TECH_LEAD_FEATURES.length})
        </p>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={disabled}
            className="text-[11px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors disabled:opacity-50"
            style={{ color: 'var(--chart-secondary)' }}
          >
            Select All
          </button>
          <button
            onClick={onClearAll}
            disabled={disabled}
            className="text-[11px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors disabled:opacity-50"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
        {categorizedFeatures.map((group) => {
          const expanded = expandedCategories.has(group.name);
          const selectedInGroup = group.features.filter((f) => selectedIds.has(f.id)).length;

          return (
            <div key={group.name}>
              <button
                onClick={() => toggleCategory(group.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left cursor-pointer transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <motion.div
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
                <span className="text-xs font-semibold flex-1">{group.name}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: selectedInGroup > 0 ? 'rgba(34, 211, 238, 0.15)' : 'var(--bg-tertiary)',
                    color: selectedInGroup > 0 ? 'var(--chart-secondary)' : 'var(--text-muted)',
                  }}
                >
                  {selectedInGroup}/{group.features.length}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-5 space-y-0.5 pb-1">
                      {group.features.map((feature) => {
                        const selected = selectedIds.has(feature.id);
                        return (
                          <button
                            key={feature.id}
                            onClick={() => onToggle(feature.id)}
                            disabled={disabled}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left cursor-pointer transition-colors disabled:opacity-50"
                            style={{
                              background: selected ? 'rgba(34, 211, 238, 0.08)' : 'transparent',
                            }}
                          >
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                              style={{
                                background: selected ? 'var(--chart-secondary)' : 'transparent',
                                border: selected ? 'none' : '1.5px solid var(--border-default)',
                              }}
                            >
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span
                              className="text-xs"
                              style={{
                                color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
                              }}
                            >
                              {feature.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
});
