'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Info, ChevronDown, Copy, Check } from 'lucide-react';
import { TestIssue } from '@/lib/dtq/types';
import { StaggerContainer, StaggerItem } from '@/lib/motion';

interface IssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: TestIssue[];
  featureName: string;
}

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

export default function IssuesModal({ isOpen, onClose, issues, featureName }: IssuesModalProps) {
  const [activeFilter, setActiveFilter] = useState<SeverityFilter>('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredIssues = issues.filter(issue =>
    activeFilter === 'all' ? true : issue.severity === activeFilter
  );

  const getSeverityConfig = (severity: TestIssue['severity']) => {
    switch (severity) {
      case 'high':
        return { icon: AlertTriangle, color: 'var(--risk-high)', bg: 'rgba(248, 113, 113, 0.15)' };
      case 'medium':
        return { icon: AlertCircle, color: 'var(--risk-medium)', bg: 'rgba(251, 191, 36, 0.15)' };
      case 'low':
        return { icon: Info, color: 'var(--risk-low)', bg: 'rgba(52, 211, 153, 0.15)' };
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const severityCounts = {
    all: issues.length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] z-50 rounded-xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Pink accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/50 to-transparent" />

            {/* Header */}
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Test Issues
                </h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {issues.length} issue{issues.length !== 1 ? 's' : ''} for {featureName}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Severity filter tabs */}
            <div className="flex gap-2 p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              {(['all', 'high', 'medium', 'low'] as SeverityFilter[]).map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className="relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: activeFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: activeFilter === filter ? 'var(--bg-elevated)' : 'transparent',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {activeFilter === filter && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'var(--bg-elevated)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">
                    {filter} ({severityCounts[filter]})
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <StaggerContainer staggerDelay={0.05}>
                {filteredIssues.map((issue) => {
                  const config = getSeverityConfig(issue.severity);
                  const SeverityIcon = config.icon;
                  const isExpanded = expandedIssue === issue.id;

                  return (
                    <StaggerItem key={issue.id}>
                      <div
                        className="rounded-lg overflow-hidden mb-3"
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {/* Issue Header */}
                        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {issue.testCaseName}
                            </h3>
                            <motion.div
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: config.bg,
                                color: config.color,
                              }}
                              animate={issue.severity === 'high' ? {
                                boxShadow: [
                                  `0 0 5px ${config.color}30`,
                                  `0 0 10px ${config.color}50`,
                                  `0 0 5px ${config.color}30`,
                                ],
                              } : {}}
                              transition={issue.severity === 'high' ? { duration: 2, repeat: Infinity } : {}}
                            >
                              <SeverityIcon className="w-3 h-3" />
                              <span className="capitalize">{issue.severity}</span>
                            </motion.div>
                          </div>
                        </div>

                        {/* Error Message */}
                        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                            Error
                          </p>
                          <p className="text-sm" style={{ color: 'var(--status-error)' }}>
                            {issue.errorMessage}
                          </p>
                        </div>

                        {/* Stack Trace (collapsible) */}
                        <div className="p-4">
                          <button
                            onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                              Stack Trace
                            </p>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="relative mt-2">
                                  <pre
                                    className="p-3 rounded-lg text-xs overflow-x-auto font-mono"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    {issue.stackTrace}
                                  </pre>

                                  {/* Copy button */}
                                  <motion.button
                                    onClick={() => handleCopy(issue.stackTrace, issue.id)}
                                    className="absolute top-2 right-2 p-1.5 rounded-md transition-colors"
                                    style={{
                                      background: 'var(--bg-tertiary)',
                                      color: copiedId === issue.id ? 'var(--status-success)' : 'var(--text-muted)',
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {copiedId === issue.id ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              {filteredIssues.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p style={{ color: 'var(--text-muted)' }}>
                    No {activeFilter !== 'all' ? activeFilter + ' severity ' : ''}issues found
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
