'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Bug,
  BarChart3,
} from 'lucide-react';
import { Category, Feature } from '@/lib/dtq/types';
import { cn } from '@/lib/utils';

interface FeatureCoverageProps {
  categories: Category[];
  onFeatureClick?: (feature: Feature) => void;
  onCategoryClick?: (category: Category) => void;
}

export default function FeatureCoverage({
  categories,
  onFeatureClick,
  onCategoryClick,
}: FeatureCoverageProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Memoize total features calculation
  const totalFeatures = useMemo(() =>
    categories.reduce((sum, c) => sum + c.features.length, 0),
  [categories]);

  // Memoize event handlers to prevent creating new functions on each render
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryHover = useCallback((categoryId: string | null) => {
    setHoveredCategory(categoryId);
  }, []);

  const handleFeatureHover = useCallback((featureId: string | null) => {
    setHoveredFeature(featureId);
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.map(category => ({
      ...category,
      features: category.features.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(c => c.features.length > 0);
  }, [categories, searchQuery]);

  const getRiskColor = (score: number) => {
    if (score >= 40) return 'var(--risk-high)';
    if (score >= 20) return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span
              key={i}
              className="px-0.5 rounded"
              style={{
                background: 'var(--accent-primary-soft)',
                color: 'var(--accent-primary)',
              }}
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleCategoryHeaderClick = (category: Category, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.category-analytics-btn')) {
      onCategoryClick?.(category);
    } else {
      setExpandedCategory(expandedCategory === category.id ? null : category.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Feature Coverage
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {totalFeatures} features with test coverage
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--status-success)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Fully Automated</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--chart-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Partial</span>
            </div>
          </div>
        </div>

        {/* Search with glow effect */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all input-glow"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Categories — subtle separators instead of thick dividers */}
      <div>
        {filteredCategories.map((category, idx) => (
          <div key={category.id} className={idx > 0 ? 'border-t' : ''} style={idx > 0 ? { borderColor: 'var(--border-subtle)' } : undefined}>
            {/* Category Header */}
            <motion.div
              className={cn(
                'w-full flex items-center justify-between p-4 transition-colors cursor-pointer',
                hoveredCategory === category.id && 'bg-[var(--bg-tertiary)]'
              )}
              onMouseEnter={() => handleCategoryHover(category.id)}
              onMouseLeave={() => handleCategoryHover(null)}
              onClick={(e) => handleCategoryHeaderClick(category, e)}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: expandedCategory === category.id ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </motion.div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {highlightMatch(category.name, searchQuery)}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {category.features.length}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <span style={{ color: 'var(--text-muted)' }}>Avg Coverage: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{category.avgCoverage}%</span>
                </div>
                {category.highRiskCount > 0 && (
                  <div className="flex items-center gap-1.5 badge-warning px-2 py-1 rounded-full text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{category.highRiskCount} High Risk</span>
                  </div>
                )}
                {category.totalDefects > 0 && (
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <Bug className="w-4 h-4" />
                    <span>{category.totalDefects} Open</span>
                  </div>
                )}

                {/* Category analytics button */}
                <motion.button
                  className="category-analytics-btn p-2 rounded-lg transition-colors"
                  style={{
                    background: hoveredCategory === category.id ? 'var(--accent-primary-soft)' : 'transparent',
                    color: hoveredCategory === category.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryClick?.(category);
                  }}
                  title="View category analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>

            {/* Expanded Features Table */}
            <AnimatePresence>
              {expandedCategory === category.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ color: 'var(--text-muted)' }}>
                          <th className="text-left py-2 px-3 font-medium">Feature</th>
                          <th className="text-left py-2 px-3 font-medium">Coverage</th>
                          <th className="text-left py-2 px-3 font-medium">Status</th>
                          <th className="text-left py-2 px-3 font-medium">Defects</th>
                          <th className="text-left py-2 px-3 font-medium">Risk</th>
                          <th className="text-left py-2 px-3 font-medium">Pass Rate</th>
                          <th className="text-left py-2 px-3 font-medium">Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.features.map((feature) => (
                          <tr
                            key={feature.id}
                            className={cn(
                              'feature-row cursor-pointer relative',
                              hoveredFeature === feature.id && 'bg-[var(--bg-tertiary)]'
                            )}
                            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}
                            onMouseEnter={() => handleFeatureHover(feature.id)}
                            onMouseLeave={() => handleFeatureHover(null)}
                            onClick={() => onFeatureClick?.(feature)}
                          >
                            {/* Left border indicator via CSS ::before */}
                            <td
                              className="py-3 px-3 relative"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <div className="flex items-center gap-2">
                                {highlightMatch(feature.name, searchQuery)}
                                {hoveredFeature === feature.id && (
                                  <span
                                    className="text-xs"
                                    style={{ color: 'var(--accent-primary)' }}
                                  >
                                    View details
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="progress-bar w-20 h-2">
                                  <div
                                    className="progress-bar-fill"
                                    style={{ width: `${feature.coverage}%`, transition: 'width 0.3s ease' }}
                                  />
                                </div>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {feature.coverage}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                {feature.status === 'fully_automated' ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                                    <span style={{ color: 'var(--status-success)' }}>Fully Automated</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--chart-secondary)' }} />
                                    <span style={{ color: 'var(--chart-secondary)' }}>Partial</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                              <span style={{ color: feature.openDefects > 0 ? 'var(--status-error)' : 'inherit' }}>
                                {feature.openDefects}
                              </span>
                              {' / '}
                              {feature.closedDefects} closed
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className="font-medium"
                                style={{ color: getRiskColor(feature.riskScore) }}
                              >
                                {feature.riskScore}
                              </span>
                            </td>
                            <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                              {feature.passRate}%
                            </td>
                            <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                              {feature.impactScore}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredCategories.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center"
        >
          <Search className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>
            No features found matching &quot;{searchQuery}&quot;
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
