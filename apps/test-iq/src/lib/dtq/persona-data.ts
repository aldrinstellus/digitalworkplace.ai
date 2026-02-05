import { Feature, TestRun, DailyMetric, TestIssue } from './types';
import { PersonaType } from './types';
import { features as managerFeatures, testRuns as managerTestRuns, dailyMetrics as managerDailyMetrics } from './data';

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PERSONA_SEEDS: Record<PersonaType, number> = {
  csuite: 1001,
  manager: 2002,
  techlead: 3003,
};

// Error messages and stack traces for generated test runs
const errorMessages = [
  'Expected element to be visible but timed out after 30000ms',
  'Assertion failed: expected value to match',
  'Network request failed: GET /api returned 500',
  'Element not clickable at point (320, 480)',
  'Timeout waiting for navigation',
  'Session expired during test execution',
  'Database connection timeout',
  'OAuth callback URL mismatch',
  'API rate limit exceeded',
  'Certificate validation failed',
];

const stackTraces = [
  'Error: Timeout waiting for element\n    at waitForSelector (/tests/spec.ts:45:12)\n    at Object.<anonymous> (/tests/spec.ts:52:5)',
  'AssertionError: expected 5 to equal 4\n    at Context.<anonymous> (/tests/assertion.spec.ts:78:14)',
  'NetworkError: Request failed\n    at fetch (/tests/api.spec.ts:33:8)',
  'ElementClickInterceptedError: Element not clickable\n    at click (/tests/interaction.spec.ts:92:10)',
];

// ─── C-Suite Features (~16 features, 5 categories) ─────────────────────────
const csuiteFeatures: Feature[] = [
  // Revenue Platform
  { id: 'cs-f1', name: 'Payment Gateway', category: 'Revenue Platform', coverage: 96, status: 'fully_automated', openDefects: 0, closedDefects: 4, riskScore: 12, passRate: 98, impactScore: 95 },
  { id: 'cs-f2', name: 'Subscription Billing', category: 'Revenue Platform', coverage: 93, status: 'fully_automated', openDefects: 1, closedDefects: 6, riskScore: 18, passRate: 96, impactScore: 92 },
  { id: 'cs-f3', name: 'Revenue Analytics', category: 'Revenue Platform', coverage: 91, status: 'fully_automated', openDefects: 0, closedDefects: 5, riskScore: 15, passRate: 97, impactScore: 90 },
  { id: 'cs-f4', name: 'Pricing Engine', category: 'Revenue Platform', coverage: 88, status: 'partially_automated', openDefects: 1, closedDefects: 3, riskScore: 22, passRate: 94, impactScore: 88 },
  // Customer Experience
  { id: 'cs-f5', name: 'Customer Portal', category: 'Customer Experience', coverage: 94, status: 'fully_automated', openDefects: 0, closedDefects: 7, riskScore: 14, passRate: 97, impactScore: 93 },
  { id: 'cs-f6', name: 'NPS Tracking', category: 'Customer Experience', coverage: 89, status: 'partially_automated', openDefects: 1, closedDefects: 4, riskScore: 20, passRate: 93, impactScore: 86 },
  { id: 'cs-f7', name: 'Support Escalation', category: 'Customer Experience', coverage: 92, status: 'fully_automated', openDefects: 0, closedDefects: 5, riskScore: 16, passRate: 96, impactScore: 89 },
  { id: 'cs-f8', name: 'Onboarding Journey', category: 'Customer Experience', coverage: 90, status: 'fully_automated', openDefects: 1, closedDefects: 6, riskScore: 19, passRate: 95, impactScore: 91 },
  // Market Expansion
  { id: 'cs-f9', name: 'Multi-Region Deployment', category: 'Market Expansion', coverage: 87, status: 'partially_automated', openDefects: 1, closedDefects: 3, riskScore: 24, passRate: 92, impactScore: 94 },
  { id: 'cs-f10', name: 'Localization Engine', category: 'Market Expansion', coverage: 85, status: 'partially_automated', openDefects: 2, closedDefects: 5, riskScore: 28, passRate: 90, impactScore: 82 },
  { id: 'cs-f11', name: 'Partner Integration', category: 'Market Expansion', coverage: 91, status: 'fully_automated', openDefects: 0, closedDefects: 4, riskScore: 17, passRate: 95, impactScore: 87 },
  // Strategic Compliance
  { id: 'cs-f12', name: 'SOC 2 Validation', category: 'Strategic Compliance', coverage: 97, status: 'fully_automated', openDefects: 0, closedDefects: 3, riskScore: 10, passRate: 99, impactScore: 96 },
  { id: 'cs-f13', name: 'GDPR Data Handling', category: 'Strategic Compliance', coverage: 95, status: 'fully_automated', openDefects: 0, closedDefects: 5, riskScore: 13, passRate: 98, impactScore: 94 },
  { id: 'cs-f14', name: 'Audit Trail System', category: 'Strategic Compliance', coverage: 93, status: 'fully_automated', openDefects: 1, closedDefects: 4, riskScore: 16, passRate: 96, impactScore: 91 },
  // Digital Transformation
  { id: 'cs-f15', name: 'AI Feature Pipeline', category: 'Digital Transformation', coverage: 82, status: 'partially_automated', openDefects: 2, closedDefects: 6, riskScore: 30, passRate: 89, impactScore: 97 },
  { id: 'cs-f16', name: 'Legacy Migration', category: 'Digital Transformation', coverage: 84, status: 'partially_automated', openDefects: 1, closedDefects: 5, riskScore: 26, passRate: 91, impactScore: 85 },
];

// ─── Tech Lead Features (~18 features, 5 categories) ───────────────────────
const techLeadFeatures: Feature[] = [
  // CI/CD Pipeline
  { id: 'tl-f1', name: 'Build Orchestration', category: 'CI/CD Pipeline', coverage: 88, status: 'fully_automated', openDefects: 2, closedDefects: 8, riskScore: 25, passRate: 91, impactScore: 90 },
  { id: 'tl-f2', name: 'Deploy Pipeline', category: 'CI/CD Pipeline', coverage: 85, status: 'partially_automated', openDefects: 3, closedDefects: 7, riskScore: 32, passRate: 88, impactScore: 92 },
  { id: 'tl-f3', name: 'Rollback Automation', category: 'CI/CD Pipeline', coverage: 82, status: 'partially_automated', openDefects: 2, closedDefects: 5, riskScore: 35, passRate: 86, impactScore: 88 },
  { id: 'tl-f4', name: 'Feature Flags', category: 'CI/CD Pipeline', coverage: 90, status: 'fully_automated', openDefects: 1, closedDefects: 6, riskScore: 20, passRate: 93, impactScore: 78 },
  // API Infrastructure
  { id: 'tl-f5', name: 'REST API Gateway', category: 'API Infrastructure', coverage: 92, status: 'fully_automated', openDefects: 1, closedDefects: 9, riskScore: 18, passRate: 94, impactScore: 95 },
  { id: 'tl-f6', name: 'GraphQL Layer', category: 'API Infrastructure', coverage: 79, status: 'partially_automated', openDefects: 3, closedDefects: 6, riskScore: 38, passRate: 85, impactScore: 88 },
  { id: 'tl-f7', name: 'Rate Limiting', category: 'API Infrastructure', coverage: 86, status: 'fully_automated', openDefects: 1, closedDefects: 4, riskScore: 22, passRate: 92, impactScore: 82 },
  { id: 'tl-f8', name: 'API Versioning', category: 'API Infrastructure', coverage: 83, status: 'partially_automated', openDefects: 2, closedDefects: 5, riskScore: 28, passRate: 89, impactScore: 76 },
  // Performance Engineering
  { id: 'tl-f9', name: 'Load Testing Framework', category: 'Performance Engineering', coverage: 78, status: 'partially_automated', openDefects: 3, closedDefects: 7, riskScore: 40, passRate: 84, impactScore: 90 },
  { id: 'tl-f10', name: 'Memory Profiler', category: 'Performance Engineering', coverage: 75, status: 'partially_automated', openDefects: 2, closedDefects: 4, riskScore: 36, passRate: 82, impactScore: 85 },
  { id: 'tl-f11', name: 'CDN Optimization', category: 'Performance Engineering', coverage: 91, status: 'fully_automated', openDefects: 0, closedDefects: 5, riskScore: 15, passRate: 95, impactScore: 80 },
  // Security Testing
  { id: 'tl-f12', name: 'Penetration Test Suite', category: 'Security Testing', coverage: 70, status: 'partially_automated', openDefects: 4, closedDefects: 8, riskScore: 45, passRate: 80, impactScore: 96 },
  { id: 'tl-f13', name: 'Dependency Scanner', category: 'Security Testing', coverage: 93, status: 'fully_automated', openDefects: 1, closedDefects: 6, riskScore: 16, passRate: 94, impactScore: 88 },
  { id: 'tl-f14', name: 'Auth Token Validation', category: 'Security Testing', coverage: 89, status: 'fully_automated', openDefects: 1, closedDefects: 5, riskScore: 20, passRate: 92, impactScore: 94 },
  // DevOps Automation
  { id: 'tl-f15', name: 'Container Orchestration', category: 'DevOps Automation', coverage: 84, status: 'partially_automated', openDefects: 2, closedDefects: 7, riskScore: 30, passRate: 88, impactScore: 92 },
  { id: 'tl-f16', name: 'Log Aggregation', category: 'DevOps Automation', coverage: 87, status: 'fully_automated', openDefects: 1, closedDefects: 4, riskScore: 19, passRate: 91, impactScore: 78 },
  { id: 'tl-f17', name: 'Infra-as-Code', category: 'DevOps Automation', coverage: 81, status: 'partially_automated', openDefects: 2, closedDefects: 6, riskScore: 33, passRate: 86, impactScore: 90 },
  { id: 'tl-f18', name: 'Secrets Management', category: 'DevOps Automation', coverage: 96, status: 'fully_automated', openDefects: 0, closedDefects: 3, riskScore: 10, passRate: 98, impactScore: 95 },
];

// ─── Test Run Generation ────────────────────────────────────────────────────

function generateTestRuns(features: Feature[], rand: () => number): TestRun[] {
  const runs: TestRun[] = [];
  const now = new Date();

  for (let i = 0; i < 40; i++) {
    const feature = features[Math.floor(rand() * features.length)];
    const passed = rand() > 0.15; // ~85% pass rate
    const totalTests = Math.floor(rand() * 23) + 8; // 8-30
    const failedTests = passed ? 0 : Math.floor(rand() * 4) + 1; // 1-4
    const passedTests = totalTests - failedTests;
    const daysAgo = Math.floor(rand() * 30); // spread across 30 days
    const executedAt = new Date(now.getTime() - daysAgo * 86400000 - Math.floor(rand() * 86400000));

    const issues: TestIssue[] = passed
      ? []
      : Array.from({ length: failedTests }, (_, j) => ({
          id: `pi-${i}-${j}`,
          testCaseName: `Test Case ${j + 1} - ${feature.name}`,
          severity: (rand() > 0.7 ? 'high' : rand() > 0.4 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          errorMessage: errorMessages[Math.floor(rand() * errorMessages.length)],
          stackTrace: stackTraces[Math.floor(rand() * stackTraces.length)],
        }));

    runs.push({
      id: `pr-${i + 1}`,
      featureId: feature.id,
      featureName: feature.name,
      executedAt,
      status: passed ? 'passed' : 'failed',
      totalTests,
      passedTests,
      failedTests,
      duration: Math.floor(rand() * 11) + 4, // 4-14s
      issues: issues.length > 0 ? issues : undefined,
    });
  }

  // Sort by date descending (most recent first)
  runs.sort((a, b) => {
    const dateA = a.executedAt instanceof Date ? a.executedAt.getTime() : new Date(a.executedAt).getTime();
    const dateB = b.executedAt instanceof Date ? b.executedAt.getTime() : new Date(b.executedAt).getTime();
    return dateB - dateA;
  });

  return runs;
}

// ─── Daily Metrics Generation ───────────────────────────────────────────────

interface MetricRange {
  passRate: [number, number];
  firstRunPassRate: [number, number];
  defectDetection: [number, number];
  effectiveness: [number, number];
  automationCoverage: [number, number];
}

const METRIC_RANGES: Record<PersonaType, MetricRange> = {
  csuite: {
    passRate: [93, 98],
    firstRunPassRate: [89, 95],
    defectDetection: [86, 93],
    effectiveness: [90, 96],
    automationCoverage: [91, 96],
  },
  manager: {
    passRate: [91, 97],
    firstRunPassRate: [85, 93],
    defectDetection: [82, 90],
    effectiveness: [88, 96],
    automationCoverage: [89, 95],
  },
  techlead: {
    passRate: [88, 95],
    firstRunPassRate: [82, 91],
    defectDetection: [80, 88],
    effectiveness: [85, 93],
    automationCoverage: [86, 93],
  },
};

function rangeValue(rand: () => number, min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) * 10) / 10;
}

function generateDailyMetrics(persona: PersonaType, rand: () => number): DailyMetric[] {
  const ranges = METRIC_RANGES[persona];
  const metrics: DailyMetric[] = [];
  const startDate = new Date('2025-02-05'); // 1 year back

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate.getTime() + i * 86400000);
    const dateStr = date.toISOString().split('T')[0];

    // 5% upward trend over the year
    const trendFactor = 1 + (i / 365) * 0.05;

    const clamp = (v: number) => Math.min(99.9, Math.max(0, v));

    metrics.push({
      date: dateStr,
      passRate: clamp(rangeValue(rand, ranges.passRate[0], ranges.passRate[1]) * trendFactor),
      firstRunPassRate: clamp(rangeValue(rand, ranges.firstRunPassRate[0], ranges.firstRunPassRate[1]) * trendFactor),
      defectDetection: clamp(rangeValue(rand, ranges.defectDetection[0], ranges.defectDetection[1]) * trendFactor),
      effectiveness: clamp(rangeValue(rand, ranges.effectiveness[0], ranges.effectiveness[1]) * trendFactor),
      automationCoverage: clamp(rangeValue(rand, ranges.automationCoverage[0], ranges.automationCoverage[1]) * trendFactor),
    });
  }

  return metrics;
}

// ─── Persona Data Generator ─────────────────────────────────────────────────

interface PersonaData {
  features: Feature[];
  testRuns: TestRun[];
  dailyMetrics: DailyMetric[];
}

function generatePersonaData(persona: PersonaType): PersonaData {
  if (persona === 'manager') {
    return {
      features: managerFeatures,
      testRuns: managerTestRuns,
      dailyMetrics: managerDailyMetrics,
    };
  }

  const rand = mulberry32(PERSONA_SEEDS[persona]);
  const features = persona === 'csuite' ? csuiteFeatures : techLeadFeatures;

  return {
    features,
    testRuns: generateTestRuns(features, rand),
    dailyMetrics: generateDailyMetrics(persona, rand),
  };
}

// ─── Cache ──────────────────────────────────────────────────────────────────

const cache = new Map<PersonaType, PersonaData>();

export function getPersonaData(persona: PersonaType): PersonaData {
  if (cache.has(persona)) return cache.get(persona)!;
  const data = generatePersonaData(persona);
  cache.set(persona, data);
  return data;
}
