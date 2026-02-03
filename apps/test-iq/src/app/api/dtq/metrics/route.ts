import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/dtq/metrics - Get daily metrics and summary
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'daily';
    const days = parseInt(searchParams.get('days') || '30');

    if (type === 'summary') {
      // Get summary metrics from features
      const { data: features, error } = await supabase
        .from('features')
        .select('*');

      if (error) {
        console.error('Error fetching features for summary:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const totalFeatures = features?.length || 0;
      const avgCoverage =
        totalFeatures > 0
          ? Math.round(
              (features?.reduce((sum, f) => sum + f.coverage, 0) || 0) /
                totalFeatures
            )
          : 0;
      const fullyAutomated =
        features?.filter((f) => f.status === 'fully_automated').length || 0;
      const automationRate =
        totalFeatures > 0
          ? Math.round((fullyAutomated / totalFeatures) * 100)
          : 0;

      const highRisk =
        features?.filter((f) => f.risk_score >= 40).length || 0;
      const mediumRisk =
        features?.filter((f) => f.risk_score >= 20 && f.risk_score < 40)
          .length || 0;
      const lowRisk = features?.filter((f) => f.risk_score < 20).length || 0;

      const openDefects =
        features?.reduce((sum, f) => sum + f.open_defects, 0) || 0;

      return NextResponse.json({
        totalFeatures,
        avgCoverage,
        automationRate,
        fullyAutomated,
        riskDistribution: {
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk,
        },
        openDefects,
      });
    }

    // Default: daily metrics
    const { data: metrics, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .order('date', { ascending: true })
      .limit(days);

    if (error) {
      console.error('Error fetching daily metrics:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to camelCase
    const transformedMetrics = metrics?.map((m) => ({
      date: m.date,
      passRate: Number(m.pass_rate),
      firstRunPassRate: Number(m.first_run_pass_rate),
      defectDetection: Number(m.defect_detection),
      effectiveness: Number(m.effectiveness),
      automationCoverage: Number(m.automation_coverage),
    }));

    return NextResponse.json(transformedMetrics || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
