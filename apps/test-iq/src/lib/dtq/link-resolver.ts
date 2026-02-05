import { ChatLink, ChatLinkTarget, PersonaType, PersonaMetric, Feature } from './types';
import { getPersonaData } from './persona-data';
import { personas } from './data';

const MAX_LINKS = 5;
const MIN_ENTITY_NAME_LENGTH = 4;

// ─── Global Entity Index (built once, cached at module level) ────────────────

interface EntityEntry {
  name: string;
  nameLower: string;
  id: string;
  persona: PersonaType;
  type: 'feature' | 'category';
  feature?: Feature;
  categoryFeatures?: Feature[];
}

interface MetricEntry {
  key: string;
  label: string;
  labelLower: string;
  persona: PersonaType;
}

let globalIndex: {
  features: EntityEntry[];
  categories: EntityEntry[];
  metrics: MetricEntry[];
  featuresByNameLower: Map<string, EntityEntry>;
  categoryByNameLower: Map<string, EntityEntry>;
  metricByLabelLower: Map<string, MetricEntry>;
  metricByKeyLower: Map<string, MetricEntry>;
} | null = null;

function getGlobalIndex() {
  if (globalIndex) return globalIndex;

  const allPersonas: PersonaType[] = ['csuite', 'manager', 'techlead'];
  const features: EntityEntry[] = [];
  const categories: EntityEntry[] = [];
  const metrics: MetricEntry[] = [];
  const featuresByNameLower = new Map<string, EntityEntry>();
  const categoryByNameLower = new Map<string, EntityEntry>();
  const metricByLabelLower = new Map<string, MetricEntry>();
  const metricByKeyLower = new Map<string, MetricEntry>();

  for (const p of allPersonas) {
    const data = getPersonaData(p);

    // Index features
    for (const f of data.features) {
      const entry: EntityEntry = {
        name: f.name,
        nameLower: f.name.toLowerCase(),
        id: f.id,
        persona: p,
        type: 'feature',
        feature: f,
      };
      features.push(entry);
      if (!featuresByNameLower.has(entry.nameLower)) {
        featuresByNameLower.set(entry.nameLower, entry);
      }
    }

    // Index categories
    const categoryNames = new Set(data.features.map(f => f.category));
    for (const catName of categoryNames) {
      if (categoryByNameLower.has(catName.toLowerCase())) continue;
      const catFeatures = data.features.filter(f => f.category === catName);
      const entry: EntityEntry = {
        name: catName,
        nameLower: catName.toLowerCase(),
        id: catName,
        persona: p,
        type: 'category',
        categoryFeatures: catFeatures,
      };
      categories.push(entry);
      categoryByNameLower.set(entry.nameLower, entry);
    }

    // Index persona metrics from the personas array
    const personaDef = personas.find(pd => pd.id === p);
    if (personaDef) {
      for (const m of personaDef.metrics) {
        const entry: MetricEntry = { key: m.key, label: m.label, labelLower: m.label.toLowerCase(), persona: p };
        metrics.push(entry);
        if (!metricByLabelLower.has(entry.labelLower)) {
          metricByLabelLower.set(entry.labelLower, entry);
        }
        if (!metricByKeyLower.has(m.key.toLowerCase())) {
          metricByKeyLower.set(m.key.toLowerCase(), entry);
        }
      }
    }
  }

  // Sort features by name length descending (longest first to avoid partial matches)
  features.sort((a, b) => b.name.length - a.name.length);

  globalIndex = { features, categories, metrics, featuresByNameLower, categoryByNameLower, metricByLabelLower, metricByKeyLower };
  return globalIndex;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ResolveLinksParams {
  responseText: string;
  sources: { title: string; type: string; similarity: number }[];
  persona: PersonaType;
  userMessage?: string;
  personaMetrics?: PersonaMetric[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addLink(links: Map<string, ChatLink>, key: string, link: ChatLink): void {
  if (links.size >= MAX_LINKS) return;
  if (links.has(key)) return;
  links.set(key, link);
}

function makeFeatureLink(entry: EntityEntry): ChatLink {
  const f = entry.feature!;
  return {
    id: `feature:${f.id}`,
    target: 'feature',
    entityId: f.id,
    label: f.name,
    description: `Coverage: ${f.coverage}%, Risk: ${f.riskScore}`,
    page: 'dashboard',
    persona: entry.persona,
  };
}

function makeCategoryLink(entry: EntityEntry): ChatLink {
  const catFeatures = entry.categoryFeatures || [];
  const avgCoverage = catFeatures.length
    ? Math.round(catFeatures.reduce((s, f) => s + f.coverage, 0) / catFeatures.length)
    : 0;
  return {
    id: `category:${entry.name}`,
    target: 'category',
    entityId: entry.name,
    label: entry.name,
    description: `${catFeatures.length} features, ${avgCoverage}% avg coverage`,
    page: 'dashboard',
    persona: entry.persona,
  };
}

function makeMetricLink(entry: MetricEntry, target: ChatLinkTarget = 'metric', page: 'dashboard' | 'history' = 'dashboard'): ChatLink {
  return {
    id: `metric:${entry.key}`,
    target,
    entityId: entry.key,
    label: entry.label,
    description: 'View metric details',
    page,
    persona: entry.persona,
  };
}

// ─── Main Resolver ───────────────────────────────────────────────────────────

export function resolveLinks({ responseText, sources, persona, userMessage, personaMetrics }: ResolveLinksParams): ChatLink[] {
  const index = getGlobalIndex();
  const links = new Map<string, ChatLink>();
  const lower = responseText.toLowerCase();
  const combinedLower = ((userMessage || '') + ' ' + responseText).toLowerCase();

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: Source-based resolution (RAG sources → links)
  // ═══════════════════════════════════════════════════════════════════════════

  for (const source of sources) {
    if (links.size >= MAX_LINKS) break;
    const titleLower = source.title.toLowerCase();

    if (source.type === 'feature') {
      // Substring match against global feature index (not persona-scoped)
      let matched: EntityEntry | undefined;
      for (const entry of index.features) {
        if (titleLower.includes(entry.nameLower) || entry.nameLower.includes(titleLower)) {
          matched = entry;
          break;
        }
      }
      if (matched) {
        addLink(links, `feature:${matched.id}`, makeFeatureLink(matched));
      }
    } else if (source.type === 'category_summary') {
      // Strip common suffixes and match global category index
      const catName = source.title
        .replace(/ Summary$/i, '')
        .replace(/ Category$/i, '')
        .replace(/ Overview$/i, '')
        .trim();
      const catEntry = index.categoryByNameLower.get(catName.toLowerCase());
      if (catEntry) {
        addLink(links, `category:${catEntry.name}`, makeCategoryLink(catEntry));
      }
    } else if (source.type === 'persona_kpi') {
      // Match against persona metric labels/keys
      const metricEntry = index.metricByLabelLower.get(titleLower) ||
        index.metricByKeyLower.get(titleLower);
      if (metricEntry) {
        addLink(links, `metric:${metricEntry.key}`, makeMetricLink(metricEntry));
      } else {
        // Fallback: use source title as-is
        addLink(links, `metric:${source.title}`, {
          id: `metric:${source.title}`,
          target: 'metric',
          entityId: source.title,
          label: source.title,
          description: 'View metric details',
          page: 'dashboard',
          persona,
        });
      }
    } else if (source.type === 'test_run_summary') {
      addLink(links, 'report:test-reports', {
        id: 'report:test-reports',
        target: 'report',
        entityId: 'test-reports',
        label: 'Test Reports',
        description: 'View test execution history',
        page: 'reports',
        persona,
      });
    } else if (source.type === 'daily_metrics_summary') {
      addLink(links, 'history:performance', {
        id: 'history:performance',
        target: 'history',
        entityId: 'performance',
        label: 'Performance History',
        description: 'View 30-day metric trends',
        page: 'history',
        persona,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: Entity name text scanning (substring match in responseText)
  // ═══════════════════════════════════════════════════════════════════════════

  if (links.size < MAX_LINKS) {
    // 2a: Check bold **Name** text first (backward compatibility)
    const boldMatches = responseText.matchAll(/\*\*(.*?)\*\*/g);
    for (const match of boldMatches) {
      if (links.size >= MAX_LINKS) break;
      const text = match[1].trim();
      const textLower = text.toLowerCase();

      // Feature match
      const featureEntry = index.featuresByNameLower.get(textLower);
      if (featureEntry) {
        addLink(links, `feature:${featureEntry.id}`, makeFeatureLink(featureEntry));
        continue;
      }

      // Category match
      const catEntry = index.categoryByNameLower.get(textLower);
      if (catEntry) {
        addLink(links, `category:${catEntry.name}`, makeCategoryLink(catEntry));
        continue;
      }

      // Metric label match
      const metricEntry = index.metricByLabelLower.get(textLower);
      if (metricEntry) {
        addLink(links, `metric:${metricEntry.key}`, makeMetricLink(metricEntry));
        continue;
      }
    }

    // 2b: Substring scan — scan responseText for ALL entity names (not just bold)
    // Current-persona features first, then cross-persona, then categories, then metrics

    const personaData = getPersonaData(persona);
    const currentPersonaFeatureIds = new Set(personaData.features.map(f => f.id));

    // Sort: current-persona features first, then cross-persona
    const sortedFeatures = [...index.features].sort((a, b) => {
      const aLocal = currentPersonaFeatureIds.has(a.id) ? 0 : 1;
      const bLocal = currentPersonaFeatureIds.has(b.id) ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      return b.name.length - a.name.length; // longer names first
    });

    for (const entry of sortedFeatures) {
      if (links.size >= MAX_LINKS) break;
      if (entry.name.length < MIN_ENTITY_NAME_LENGTH) continue;
      if (lower.includes(entry.nameLower)) {
        addLink(links, `feature:${entry.id}`, makeFeatureLink(entry));
      }
    }

    // Categories
    for (const entry of index.categories) {
      if (links.size >= MAX_LINKS) break;
      if (entry.name.length < MIN_ENTITY_NAME_LENGTH) continue;
      if (lower.includes(entry.nameLower)) {
        addLink(links, `category:${entry.name}`, makeCategoryLink(entry));
      }
    }

    // Metrics (from personaMetrics param and global index)
    const metricSources = personaMetrics || [];
    for (const m of metricSources) {
      if (links.size >= MAX_LINKS) break;
      if (m.label.length < MIN_ENTITY_NAME_LENGTH) continue;
      if (lower.includes(m.label.toLowerCase())) {
        const globalEntry = index.metricByKeyLower.get(m.key.toLowerCase());
        addLink(links, `metric:${m.key}`, {
          id: `metric:${m.key}`,
          target: 'metric',
          entityId: m.key,
          label: m.label,
          description: 'View metric details',
          page: 'dashboard',
          persona: globalEntry?.persona || persona,
        });
      }
    }

    // Also scan for global metric labels in text
    for (const entry of index.metrics) {
      if (links.size >= MAX_LINKS) break;
      if (entry.label.length < MIN_ENTITY_NAME_LENGTH) continue;
      if (lower.includes(entry.labelLower)) {
        addLink(links, `metric:${entry.key}`, makeMetricLink(entry));
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: Expanded keyword/concept detection (~20 pattern groups)
  // ═══════════════════════════════════════════════════════════════════════════

  if (links.size < MAX_LINKS) {
    const keywordGroups: { keywords: string[]; target: ChatLinkTarget; entityId: string; label: string; description: string; page: 'dashboard' | 'reports' | 'history' }[] = [
      // Test execution
      { keywords: ['test run', 'test report', 'regression', 'test cycle', 'test execution', 'test suite'], target: 'report', entityId: 'test-reports', label: 'Test Reports', description: 'View test execution history', page: 'reports' },
      // Trends
      { keywords: ['trend', 'history', '30-day', '30 day', 'over time', 'trajectory', 'historical'], target: 'history', entityId: 'performance', label: 'Performance History', description: 'View 30-day metric trends', page: 'history' },
      // Pass rate
      { keywords: ['pass rate', 'success rate', 'passing rate', 'pass/fail'], target: 'history', entityId: 'passRate', label: 'Pass Rate Trends', description: 'View pass rate over time', page: 'history' },
      // Defects
      { keywords: ['defect', 'bug', 'failure', 'blocker', 'open defect', 'defect detection', 'defect escape'], target: 'history', entityId: 'defectDetection', label: 'Defect Detection', description: 'View defect detection trends', page: 'history' },
      // Automation
      { keywords: ['automation', 'coverage gap', 'automated vs manual', 'automation coverage'], target: 'history', entityId: 'automationCoverage', label: 'Automation Coverage', description: 'View automation coverage trends', page: 'history' },
      // Risk
      { keywords: ['risk', 'high risk', 'risk score', 'critical risk', 'risk assessment'], target: 'report', entityId: 'test-reports', label: 'Risk Assessment', description: 'View risk details in reports', page: 'reports' },
      // Effectiveness
      { keywords: ['effectiveness', 'efficiency', 'quality score', 'test effectiveness'], target: 'history', entityId: 'effectiveness', label: 'Test Effectiveness', description: 'View effectiveness trends', page: 'history' },
      // First-run
      { keywords: ['first run', 'first pass', 'first attempt', 'first-run'], target: 'history', entityId: 'firstRunPassRate', label: 'First-Run Pass Rate', description: 'View first-run pass rate trends', page: 'history' },
      // Compliance
      { keywords: ['compliance', 'soc 2', 'gdpr', 'audit', 'regulatory'], target: 'category', entityId: 'Strategic Compliance', label: 'Strategic Compliance', description: 'View compliance features', page: 'dashboard' },
      // Security
      { keywords: ['security', 'penetration', 'vulnerability', 'security testing'], target: 'category', entityId: 'Security Testing', label: 'Security Testing', description: 'View security test features', page: 'dashboard' },
      // CI/CD
      { keywords: ['ci/cd', 'pipeline', 'deploy', 'rollback', 'build orchestration'], target: 'category', entityId: 'CI/CD Pipeline', label: 'CI/CD Pipeline', description: 'View CI/CD features', page: 'dashboard' },
      // Performance
      { keywords: ['performance', 'load test', 'memory', 'performance engineering'], target: 'category', entityId: 'Performance Engineering', label: 'Performance Engineering', description: 'View performance features', page: 'dashboard' },
      // API
      { keywords: ['api', 'rest', 'graphql', 'rate limit', 'api infrastructure'], target: 'category', entityId: 'API Infrastructure', label: 'API Infrastructure', description: 'View API features', page: 'dashboard' },
      // Revenue
      { keywords: ['revenue', 'payment', 'subscription', 'billing', 'pricing'], target: 'category', entityId: 'Revenue Platform', label: 'Revenue Platform', description: 'View revenue features', page: 'dashboard' },
      // Learning
      { keywords: ['learning', 'course', 'adaptive', 'skill gap', 'learning path'], target: 'category', entityId: 'Learning Experience', label: 'Learning Experience', description: 'View learning features', page: 'dashboard' },
      // Assessment
      { keywords: ['quiz', 'certification', 'proctoring', 'assessment'], target: 'category', entityId: 'Assessments & Certification', label: 'Assessments & Certification', description: 'View assessment features', page: 'dashboard' },
      // Customer experience
      { keywords: ['customer portal', 'nps', 'onboarding', 'customer experience', 'support escalation'], target: 'category', entityId: 'Customer Experience', label: 'Customer Experience', description: 'View customer experience features', page: 'dashboard' },
      // DevOps
      { keywords: ['devops', 'container', 'log aggregation', 'infrastructure as code', 'secrets management'], target: 'category', entityId: 'DevOps Automation', label: 'DevOps Automation', description: 'View DevOps features', page: 'dashboard' },
      // Admin
      { keywords: ['user management', 'role-based', 'rbac', 'admin', 'notification settings'], target: 'category', entityId: 'Admin & Configuration', label: 'Admin & Configuration', description: 'View admin features', page: 'dashboard' },
      // Reporting
      { keywords: ['reporting', 'analytics', 'dashboard', 'report builder', 'executive dashboard'], target: 'category', entityId: 'Reporting & Analytics', label: 'Reporting & Analytics', description: 'View reporting features', page: 'dashboard' },
    ];

    for (const group of keywordGroups) {
      if (links.size >= MAX_LINKS) break;
      const key = group.target === 'category' ? `category:${group.entityId}` :
        group.target === 'report' ? `report:${group.entityId}` :
          `history:${group.entityId}`;
      if (links.has(key)) continue;

      const matched = group.keywords.some(kw => lower.includes(kw));
      if (matched) {
        addLink(links, key, {
          id: key,
          target: group.target,
          entityId: group.entityId,
          label: group.label,
          description: group.description,
          page: group.page,
          persona,
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4: Context-aware fallback (guaranteed ≥1 link)
  // ═══════════════════════════════════════════════════════════════════════════

  if (links.size === 0) {
    // Try combined userMessage + responseText for keyword patterns
    const fallbackKeywords: { test: string[]; link: ChatLink }[] = [
      {
        test: ['test', 'run', 'report', 'regression', 'execution', 'suite'],
        link: { id: 'report:test-reports', target: 'report', entityId: 'test-reports', label: 'Test Reports', description: 'View test execution history', page: 'reports', persona },
      },
      {
        test: ['trend', 'metric', 'history', 'performance', 'rate', 'coverage'],
        link: { id: 'history:performance', target: 'history', entityId: 'performance', label: 'Performance History', description: 'View 30-day metric trends', page: 'history', persona },
      },
      {
        test: ['feature', 'category', 'risk', 'defect', 'quality', 'automation'],
        link: { id: 'fallback:dashboard', target: 'category', entityId: getTopCategory(persona), label: getTopCategory(persona), description: 'View category details', page: 'dashboard', persona },
      },
    ];

    for (const fb of fallbackKeywords) {
      if (links.size >= MAX_LINKS) break;
      if (fb.test.some(kw => combinedLower.includes(kw))) {
        addLink(links, fb.link.id, fb.link);
      }
    }

    // Absolute fallback: persona-appropriate default link
    if (links.size === 0) {
      const topCat = getTopCategory(persona);
      addLink(links, 'fallback:default', {
        id: 'fallback:default',
        target: 'category',
        entityId: topCat,
        label: topCat,
        description: 'View top category for your persona',
        page: 'dashboard',
        persona,
      });
    }
  }

  return Array.from(links.values()).slice(0, MAX_LINKS);
}

// ─── Persona-specific top category for fallback ──────────────────────────────

function getTopCategory(persona: PersonaType): string {
  const defaults: Record<PersonaType, string> = {
    csuite: 'Revenue Platform',
    manager: 'Advanced / Enterprise',
    techlead: 'CI/CD Pipeline',
  };
  return defaults[persona] || 'Advanced / Enterprise';
}
