/**
 * Admin Health Monitoring API
 * Provides comprehensive system health metrics
 *
 * V2.0 Feature: Admin Health Dashboard - EPIC 7
 *
 * GET /api/admin/health - Get system health metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserContext, ROLES } from '@/lib/rbac';
import { getElasticsearchClient, isElasticsearchAvailable, getIndexStats } from '@/lib/elasticsearch';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// Types
// ============================================================================

interface ElasticsearchHealth {
  available: boolean;
  clusterName?: string;
  status?: 'green' | 'yellow' | 'red';
  nodes?: {
    total: number;
    successful: number;
    failed: number;
  };
  shards?: {
    total: number;
    primary: number;
    relocating: number;
    initializing: number;
    unassigned: number;
  };
  indices?: {
    name: string;
    health: string;
    status: string;
    docsCount: number;
    sizeBytes: number;
  }[];
  latency?: {
    p50: number;
    p90: number;
    p99: number;
    avg: number;
  };
}

interface AIHealth {
  available: boolean;
  provider: string;
  model: string;
  usage: {
    totalRequests: number;
    totalTokens: number;
    estimatedCost: number;
    avgLatencyMs: number;
  };
  performance: {
    resolutionRate: number;
    avgConfidence: number;
    feedbackScore: number;
  };
  errors: {
    total: number;
    rate: number;
    lastError?: string;
  };
}

interface DatabaseHealth {
  available: boolean;
  latencyMs: number;
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  tables: {
    name: string;
    rowCount: number;
    sizeBytes: number;
  }[];
}

interface ContentHealth {
  staleContent: {
    total: number;
    articles: number;
    knowledgeItems: number;
    lastUpdated?: string;
  };
  missingEmbeddings: number;
  orphanedContent: number;
  brokenLinks: number;
}

interface SystemHealth {
  elasticsearch: ElasticsearchHealth;
  ai: AIHealth;
  database: DatabaseHealth;
  content: ContentHealth;
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number; // 0-100
    issues: string[];
    lastCheck: string;
  };
}

// ============================================================================
// Health Check Functions
// ============================================================================

async function checkElasticsearchHealth(): Promise<ElasticsearchHealth> {
  const available = await isElasticsearchAvailable();

  if (!available) {
    return { available: false };
  }

  try {
    const client = getElasticsearchClient();

    // Get cluster health
    const healthResponse = await client.cluster.health();

    // Get node stats
    const nodesResponse = await client.nodes.stats();

    // Get index stats
    const indexStats = await getIndexStats();

    // Get all indices
    const indicesResponse = await client.cat.indices({ format: 'json' });

    // Calculate latency from recent search logs (mock for now)
    const latency = {
      p50: 45,
      p90: 120,
      p99: 350,
      avg: 67,
    };

    return {
      available: true,
      clusterName: healthResponse.cluster_name,
      status: healthResponse.status as 'green' | 'yellow' | 'red',
      nodes: {
        total: healthResponse.number_of_nodes,
        successful: healthResponse.number_of_data_nodes,
        failed: 0,
      },
      shards: {
        total: healthResponse.active_shards,
        primary: healthResponse.active_primary_shards,
        relocating: healthResponse.relocating_shards,
        initializing: healthResponse.initializing_shards,
        unassigned: healthResponse.unassigned_shards,
      },
      indices: (indicesResponse as Array<{
        index: string;
        health: string;
        status: string;
        'docs.count': string;
        'store.size': string;
      }>).map(idx => ({
        name: idx.index,
        health: idx.health,
        status: idx.status,
        docsCount: parseInt(idx['docs.count'] || '0'),
        sizeBytes: parseSize(idx['store.size'] || '0b'),
      })),
      latency,
    };
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
    return { available: false };
  }
}

async function checkAIHealth(): Promise<AIHealth> {
  try {
    // Get AI usage stats from database
    const { data: chatStats } = await supabase
      .schema('diq')
      .from('chat_messages')
      .select('id, tokens_used, confidence, llm_model, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    const totalRequests = chatStats?.length || 0;
    const totalTokens = chatStats?.reduce((sum, m) => sum + (m.tokens_used || 0), 0) || 0;
    const avgConfidence = chatStats?.length
      ? chatStats.reduce((sum, m) => sum + (m.confidence || 0), 0) / chatStats.length
      : 0;

    // Estimate cost (Claude Sonnet pricing)
    const estimatedCost = (totalTokens / 1000) * 0.003;

    // Mock latency (would come from actual metrics)
    const avgLatencyMs = 850;

    return {
      available: !!process.env.ANTHROPIC_API_KEY,
      provider: 'Anthropic',
      model: 'claude-sonnet-4',
      usage: {
        totalRequests,
        totalTokens,
        estimatedCost,
        avgLatencyMs,
      },
      performance: {
        resolutionRate: 87.5, // Would be calculated from feedback
        avgConfidence,
        feedbackScore: 4.2, // Would come from user feedback
      },
      errors: {
        total: 0,
        rate: 0,
        lastError: undefined,
      },
    };
  } catch (error) {
    console.error('AI health check failed:', error);
    return {
      available: false,
      provider: 'Unknown',
      model: 'Unknown',
      usage: { totalRequests: 0, totalTokens: 0, estimatedCost: 0, avgLatencyMs: 0 },
      performance: { resolutionRate: 0, avgConfidence: 0, feedbackScore: 0 },
      errors: { total: 1, rate: 100, lastError: String(error) },
    };
  }
}

async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();

  try {
    // Simple ping query
    const { error } = await supabase.from('users').select('count').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) throw error;

    // Get table stats (mock - would need admin access for real stats)
    const tables = [
      { name: 'users', rowCount: 60, sizeBytes: 1024000 },
      { name: 'articles', rowCount: 212, sizeBytes: 5120000 },
      { name: 'employees', rowCount: 60, sizeBytes: 512000 },
      { name: 'chat_messages', rowCount: 126, sizeBytes: 256000 },
      { name: 'workflows', rowCount: 31, sizeBytes: 128000 },
    ];

    return {
      available: true,
      latencyMs,
      connections: {
        active: 5,
        idle: 10,
        max: 100,
      },
      tables,
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      available: false,
      latencyMs: Date.now() - startTime,
      connections: { active: 0, idle: 0, max: 0 },
      tables: [],
    };
  }
}

async function checkContentHealth(): Promise<ContentHealth> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Check for stale articles
    const { data: staleArticles, count: staleArticleCount } = await supabase
      .schema('diq')
      .from('articles')
      .select('id, updated_at', { count: 'exact' })
      .lt('updated_at', sixMonthsAgo.toISOString());

    // Check for missing embeddings
    const { count: missingEmbeddings } = await supabase
      .schema('diq')
      .from('articles')
      .select('id', { count: 'exact' })
      .is('embedding', null);

    return {
      staleContent: {
        total: staleArticleCount || 0,
        articles: staleArticleCount || 0,
        knowledgeItems: 0,
        lastUpdated: staleArticles?.[0]?.updated_at,
      },
      missingEmbeddings: missingEmbeddings || 0,
      orphanedContent: 0,
      brokenLinks: 0,
    };
  } catch (error) {
    console.error('Content health check failed:', error);
    return {
      staleContent: { total: 0, articles: 0, knowledgeItems: 0 },
      missingEmbeddings: 0,
      orphanedContent: 0,
      brokenLinks: 0,
    };
  }
}

function calculateOverallHealth(
  es: ElasticsearchHealth,
  ai: AIHealth,
  db: DatabaseHealth,
  content: ContentHealth
): SystemHealth['overall'] {
  const issues: string[] = [];
  let score = 100;

  // Elasticsearch checks
  if (!es.available) {
    issues.push('Elasticsearch is unavailable');
    score -= 30;
  } else if (es.status === 'red') {
    issues.push('Elasticsearch cluster is in red state');
    score -= 25;
  } else if (es.status === 'yellow') {
    issues.push('Elasticsearch cluster is in yellow state');
    score -= 10;
  }

  if (es.latency && es.latency.p99 > 500) {
    issues.push('Elasticsearch latency is high (p99 > 500ms)');
    score -= 10;
  }

  // AI checks
  if (!ai.available) {
    issues.push('AI service is unavailable');
    score -= 20;
  }

  if (ai.performance.resolutionRate < 80) {
    issues.push('AI resolution rate is below 80%');
    score -= 10;
  }

  // Database checks
  if (!db.available) {
    issues.push('Database is unavailable');
    score -= 40;
  } else if (db.latencyMs > 100) {
    issues.push('Database latency is high (>100ms)');
    score -= 5;
  }

  // Content checks
  if (content.staleContent.total > 50) {
    issues.push(`${content.staleContent.total} articles need review (>6 months old)`);
    score -= 5;
  }

  if (content.missingEmbeddings > 10) {
    issues.push(`${content.missingEmbeddings} articles missing embeddings`);
    score -= 5;
  }

  // Determine status
  let status: 'healthy' | 'degraded' | 'critical';
  if (score >= 80) {
    status = 'healthy';
  } else if (score >= 50) {
    status = 'degraded';
  } else {
    status = 'critical';
  }

  return {
    status,
    score: Math.max(0, score),
    issues,
    lastCheck: new Date().toISOString(),
  };
}

// Helper to parse size strings like "1.2gb" to bytes
function parseSize(sizeStr: string): number {
  const match = sizeStr.toLowerCase().match(/^([\d.]+)(b|kb|mb|gb|tb)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  const multipliers: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
  };

  return value * (multipliers[unit] || 1);
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userContext = await getUserContext(clerkUserId);
    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins can view health metrics
    if (ROLES[userContext.role] < ROLES.admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const component = searchParams.get('component');

    // Allow requesting specific component health
    if (component) {
      switch (component) {
        case 'elasticsearch':
          return NextResponse.json(await checkElasticsearchHealth());
        case 'ai':
          return NextResponse.json(await checkAIHealth());
        case 'database':
          return NextResponse.json(await checkDatabaseHealth());
        case 'content':
          return NextResponse.json(await checkContentHealth());
        default:
          return NextResponse.json({ error: 'Unknown component' }, { status: 400 });
      }
    }

    // Full health check
    const [elasticsearch, ai, database, content] = await Promise.all([
      checkElasticsearchHealth(),
      checkAIHealth(),
      checkDatabaseHealth(),
      checkContentHealth(),
    ]);

    const overall = calculateOverallHealth(elasticsearch, ai, database, content);

    const health: SystemHealth = {
      elasticsearch,
      ai,
      database,
      content,
      overall,
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Error in GET /api/admin/health:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
