'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Activity,
  TestTube2,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import MetricCard from '@/components/dtq/MetricCard';
import LiveIndicator from '@/components/dtq/LiveIndicator';
import { usePersona } from '../layout';
import { useRealTimeSimulation, formatTimeAgo } from '@/hooks/useRealTimeSimulation';
import { exportTestRunsToCSV, exportTestRunsToPDF } from '@/lib/dtq/export';
import { TestRun, Feature } from '@/lib/dtq/types';
import { useNavigation } from '@/contexts/NavigationContext';
import { cn } from '@/lib/utils';

const TestRunDetailModal = dynamic(
  () => import('@/components/dtq/modals/TestRunDetailModal'),
  { ssr: false }
);

const FeatureDetailModal = dynamic(
  () => import('@/components/dtq/modals/FeatureDetailModal'),
  { ssr: false }
);

type StatusFilter = 'all' | 'passed' | 'failed';
type SortKey = 'status' | 'featureName' | 'duration' | 'executedAt' | 'issues';
type SortDir = 'asc' | 'desc';

const ROWS_PER_PAGE = 10;

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== column) {
    return (
      <span className="inline-flex ml-1 opacity-0 group-hover:opacity-40 transition-opacity">
        <ArrowUp className="w-3 h-3" />
      </span>
    );
  }
  return (
    <span className="inline-flex ml-1" style={{ color: 'var(--accent-primary)' }}>
      {sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
    </span>
  );
}

export default function ReportsPage() {
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedRunId, setHighlightedRunId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const { persona } = usePersona();
  const { testRuns, features, lastUpdate, isLive, toggleLive, refresh } = useRealTimeSimulation(true, persona);
  const { pendingAction, clearAction } = useNavigation();

  // Handle navigation actions from chat link cards
  useEffect(() => {
    if (!pendingAction || pendingAction.link.page !== 'reports') return;

    const { link } = pendingAction;

    queueMicrotask(() => {
      if (link.target === 'test-run') {
        const run = testRuns.find(r => r.featureId === link.entityId);
        if (run) setSelectedRun(run);
      } else if (link.target === 'feature') {
        const feature = features.find(f => f.id === link.entityId);
        if (feature) setSelectedFeature(feature);
      }
      // 'report' target — already on this page, no-op

      clearAction(pendingAction.id);
    });
  }, [pendingAction, clearAction, testRuns, features]);

  // Memoized computations
  const passedCount = useMemo(() => testRuns.filter(r => r.status === 'passed').length, [testRuns]);
  const failedCount = useMemo(() => testRuns.filter(r => r.status === 'failed').length, [testRuns]);
  const passRate = useMemo(
    () => testRuns.length > 0 ? Math.round((passedCount / testRuns.length) * 100) : 0,
    [passedCount, testRuns.length]
  );
  const avgDuration = useMemo(() => {
    if (testRuns.length === 0) return 0;
    const total = testRuns.reduce((sum, r) => sum + r.duration, 0);
    return Math.round((total / testRuns.length) * 10) / 10;
  }, [testRuns]);

  // Filter → Sort → Paginate pipeline
  const filteredRuns = useMemo(() => {
    let runs = testRuns;
    if (statusFilter !== 'all') {
      runs = runs.filter(r => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      runs = runs.filter(r => r.featureName.toLowerCase().includes(q));
    }
    return runs;
  }, [testRuns, statusFilter, searchQuery]);

  const sortedRuns = useMemo(() => {
    if (!sortKey) return filteredRuns;

    const sorted = [...filteredRuns].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'featureName':
          cmp = a.featureName.localeCompare(b.featureName);
          break;
        case 'duration':
          cmp = a.duration - b.duration;
          break;
        case 'executedAt': {
          const dateA = a.executedAt instanceof Date ? a.executedAt.getTime() : new Date(a.executedAt).getTime();
          const dateB = b.executedAt instanceof Date ? b.executedAt.getTime() : new Date(b.executedAt).getTime();
          cmp = dateA - dateB;
          break;
        }
        case 'issues':
          cmp = (a.issues?.length || 0) - (b.issues?.length || 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [filteredRuns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRuns.length / ROWS_PER_PAGE));

  // Clamp page when data changes
  useEffect(() => {
    if (currentPage > totalPages) {
      queueMicrotask(() => setCurrentPage(totalPages));
    }
  }, [totalPages, currentPage]);

  const paginatedRuns = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedRuns.slice(start, start + ROWS_PER_PAGE);
  }, [sortedRuns, currentPage]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1));
  }, [statusFilter, searchQuery, sortKey, sortDir]);

  // Highlight newest run when it changes
  useEffect(() => {
    if (testRuns.length > 0) {
      queueMicrotask(() => setHighlightedRunId(testRuns[0].id));
      const timer = setTimeout(() => setHighlightedRunId(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [testRuns[0]?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sort handler — toggle direction or set new key
  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        // Third click clears sort
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey, sortDir]);

  // Cross-modal navigation: run modal → feature modal
  const handleViewFeature = useCallback((featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      setSelectedRun(null);
      setSelectedFeature(feature);
    }
  }, [features]);

  const handleExportCSV = useCallback(() => {
    exportTestRunsToCSV(testRuns);
  }, [testRuns]);

  const handleExportPDF = useCallback(() => {
    exportTestRunsToPDF(testRuns);
  }, [testRuns]);

  const startRow = (currentPage - 1) * ROWS_PER_PAGE + 1;
  const endRow = Math.min(currentPage * ROWS_PER_PAGE, sortedRuns.length);

  return (
    <div className="space-y-6">
      {/* A. Header */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">
            Test <span className="text-[#ff3366]">Reports</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Test execution history and issue tracking
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <LiveIndicator lastUpdate={lastUpdate} isLive={isLive} onToggle={toggleLive} />

          <button
            onClick={refresh}
            className="p-2 rounded-lg transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* B. MetricCard summary row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <MetricCard
          label="Total Runs"
          value={testRuns.length}
          icon={TestTube2}
          interactive={false}
          delay={0}
        />
        <MetricCard
          label="Pass Rate"
          value={`${passRate}%`}
          icon={Activity}
          accentColor="var(--status-success)"
          interactive={false}
          delay={0.05}
        />
        <MetricCard
          label="Failed Runs"
          value={failedCount}
          icon={XCircle}
          accentColor={failedCount > 0 ? 'var(--status-error)' : undefined}
          interactive={false}
          delay={0.1}
        />
        <MetricCard
          label="Avg Duration"
          value={`${avgDuration}s`}
          icon={Clock}
          interactive={false}
          delay={0.15}
        />
      </motion.div>

      {/* C. Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        {/* Status filter tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
          {([
            { key: 'all' as StatusFilter, label: 'All', count: testRuns.length },
            { key: 'passed' as StatusFilter, label: 'Passed', count: passedCount },
            { key: 'failed' as StatusFilter, label: 'Failed', count: failedCount },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                statusFilter === tab.key
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
              style={statusFilter === tab.key ? { background: 'var(--bg-elevated)' } : undefined}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search feature name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm transition-all input-glow"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
            }}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </motion.div>

      {/* D. Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <th
                  className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider cursor-pointer select-none group"
                  style={{ color: sortKey === 'status' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  onClick={() => handleSort('status')}
                >
                  Status
                  <SortIcon sortKey={sortKey} sortDir={sortDir} column="status" />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider cursor-pointer select-none group"
                  style={{ color: sortKey === 'featureName' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  onClick={() => handleSort('featureName')}
                >
                  Feature Name
                  <SortIcon sortKey={sortKey} sortDir={sortDir} column="featureName" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Tests
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider hidden sm:table-cell cursor-pointer select-none group"
                  style={{ color: sortKey === 'duration' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  onClick={() => handleSort('duration')}
                >
                  Duration
                  <SortIcon sortKey={sortKey} sortDir={sortDir} column="duration" />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider cursor-pointer select-none group"
                  style={{ color: sortKey === 'executedAt' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  onClick={() => handleSort('executedAt')}
                >
                  Executed
                  <SortIcon sortKey={sortKey} sortDir={sortDir} column="executedAt" />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider hidden sm:table-cell cursor-pointer select-none group"
                  style={{ color: sortKey === 'issues' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  onClick={() => handleSort('issues')}
                >
                  Issues
                  <SortIcon sortKey={sortKey} sortDir={sortDir} column="issues" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRuns.map(run => {
                const executedDate = run.executedAt instanceof Date
                  ? run.executedAt
                  : new Date(run.executedAt);
                const issueCount = run.issues?.length || 0;

                return (
                  <tr
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={cn(
                      'border-b cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]',
                      highlightedRunId === run.id && 'animate-highlight-row'
                    )}
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {/* Status */}
                    <td className="px-4 py-3">
                      {run.status === 'passed' ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--status-success)' }} />
                      ) : (
                        <XCircle className="w-5 h-5" style={{ color: 'var(--status-error)' }} />
                      )}
                    </td>

                    {/* Feature Name */}
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {run.featureName}
                    </td>

                    {/* Tests */}
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--status-success)' }}>{run.passedTests}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/</span>
                      {run.totalTests}
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {run.duration}s
                    </td>

                    {/* Executed */}
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {formatTimeAgo(executedDate)}
                    </td>

                    {/* Issues */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {issueCount > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: 'var(--status-error-bg)',
                            color: 'var(--status-error)',
                          }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {issueCount}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-disabled)' }}>&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {sortedRuns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Search className="w-10 h-10 mb-3" style={{ color: 'var(--text-disabled)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              No test runs match your filters
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>
              Try adjusting the status filter or search query
            </p>
          </div>
        )}

        {/* Pagination */}
        {sortedRuns.length > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {startRow}&ndash;{endRow} of {sortedRuns.length} runs
            </p>

            <div className="flex items-center gap-1">
              {/* First page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  currentPage === 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-tertiary)]'
                )}
                style={{ color: 'var(--text-muted)' }}
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous page */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  currentPage === 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-tertiary)]'
                )}
                style={{ color: 'var(--text-muted)' }}
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first, last, current, and neighbors
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                  if (idx > 0) {
                    const prev = arr[idx - 1];
                    if (page - prev > 1) acc.push('ellipsis');
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-xs"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={cn(
                        'min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors',
                        currentPage === item
                          ? 'text-white'
                          : 'hover:bg-[var(--bg-tertiary)]'
                      )}
                      style={
                        currentPage === item
                          ? { background: 'var(--accent-primary)', color: 'white' }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      {item}
                    </button>
                  )
                )}

              {/* Next page */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  currentPage === totalPages
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-tertiary)]'
                )}
                style={{ color: 'var(--text-muted)' }}
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  currentPage === totalPages
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-tertiary)]'
                )}
                style={{ color: 'var(--text-muted)' }}
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* E. Modals */}
      <TestRunDetailModal
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        testRun={selectedRun}
        onViewFeature={handleViewFeature}
      />

      <FeatureDetailModal
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        feature={selectedFeature}
        testRuns={testRuns}
      />
    </div>
  );
}
