'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';
import BaseModal, { ModalSection } from './BaseModal';
import { TestRun, TestIssue } from '@/lib/dtq/types';
import { AnimatedCounter, StaggerContainer, StaggerItem } from '@/lib/motion';

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

interface TestRunDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  testRun: TestRun | null;
  onViewFeature?: (featureId: string) => void;
}

export default function TestRunDetailModal({
  isOpen,
  onClose,
  testRun,
  onViewFeature,
}: TestRunDetailModalProps) {
  const [activeFilter, setActiveFilter] = useState<SeverityFilter>('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !testRun) return null;

  const issues = testRun.issues || [];
  const passRate = testRun.totalTests > 0
    ? Math.round((testRun.passedTests / testRun.totalTests) * 100)
    : 0;

  const filteredIssues = issues.filter(issue =>
    activeFilter === 'all' ? true : issue.severity === activeFilter
  );

  const severityCounts = {
    all: issues.length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

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

  const executedDate = testRun.executedAt instanceof Date
    ? testRun.executedAt
    : new Date(testRun.executedAt);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={testRun.featureName}
      description={`${testRun.status === 'passed' ? 'Passed' : 'Failed'} \u00b7 ${executedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}`}
      size="lg"
    >
      <StaggerContainer>
        {/* Status Badge */}
        <StaggerItem>
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                testRun.status === 'passed' ? 'badge-success' : 'badge-error'
              }`}
            >
              {testRun.status === 'passed' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Passed</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Failed</span>
                </>
              )}
            </div>
          </div>
        </StaggerItem>

        {/* Overview Stat Cards */}
        <StaggerItem>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Total Tests */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Total Tests
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={testRun.totalTests} />
              </p>
            </div>

            {/* Passed */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Passed
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
                <AnimatedCounter value={testRun.passedTests} />
              </p>
            </div>

            {/* Failed */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4" style={{ color: testRun.failedTests > 0 ? 'var(--status-error)' : 'var(--text-muted)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Failed
                </span>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: testRun.failedTests > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}
              >
                <AnimatedCounter value={testRun.failedTests} />
              </p>
            </div>

            {/* Pass Rate */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--chart-secondary)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Pass Rate
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={passRate} suffix="%" />
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Duration */}
        <StaggerItem>
          <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-4 h-4" />
            <span>Execution duration: <strong style={{ color: 'var(--text-primary)' }}>{testRun.duration}s</strong></span>
          </div>
        </StaggerItem>

        {/* Issues Section */}
        {issues.length > 0 && (
          <StaggerItem>
            <ModalSection title="Issues">
              {/* Severity filter tabs */}
              <div className="flex gap-2 mb-4">
                {(['all', 'high', 'medium', 'low'] as SeverityFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className="relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: activeFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: activeFilter === filter ? 'var(--bg-elevated)' : 'transparent',
                    }}
                  >
                    <span className="capitalize">
                      {filter} ({severityCounts[filter]})
                    </span>
                  </button>
                ))}
              </div>

              {/* Issue cards */}
              <div className="space-y-3">
                {filteredIssues.map((issue) => {
                  const config = getSeverityConfig(issue.severity);
                  const SeverityIcon = config.icon;
                  const isExpanded = expandedIssue === issue.id;

                  return (
                    <div
                      key={issue.id}
                      className="rounded-lg overflow-hidden"
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
                          <div
                            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: config.bg,
                              color: config.color,
                            }}
                          >
                            <SeverityIcon className="w-3 h-3" />
                            <span className="capitalize">{issue.severity}</span>
                          </div>
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
                                <button
                                  onClick={() => handleCopy(issue.stackTrace, issue.id)}
                                  className="absolute top-2 right-2 p-1.5 rounded-md transition-colors hover:opacity-80"
                                  style={{
                                    background: 'var(--bg-tertiary)',
                                    color: copiedId === issue.id ? 'var(--status-success)' : 'var(--text-muted)',
                                  }}
                                >
                                  {copiedId === issue.id ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <div className="text-center py-6">
                    <p style={{ color: 'var(--text-muted)' }}>
                      No {activeFilter !== 'all' ? activeFilter + ' severity ' : ''}issues found
                    </p>
                  </div>
                )}
              </div>
            </ModalSection>
          </StaggerItem>
        )}

        {/* View Feature Details button */}
        {onViewFeature && (
          <StaggerItem>
            <div className="pt-2">
              <button
                onClick={() => onViewFeature(testRun.featureId)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                }}
              >
                <ExternalLink className="w-4 h-4" />
                View Feature Details
              </button>
            </div>
          </StaggerItem>
        )}
      </StaggerContainer>
    </BaseModal>
  );
}
