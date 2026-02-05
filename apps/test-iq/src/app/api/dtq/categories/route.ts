import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/dtq/categories - Get categories with aggregated stats
export async function GET() {
  try {
    const { data: features, error } = await supabase
      .from('dtq_features')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching features:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group features by category
    const categoryMap = new Map<
      string,
      {
        name: string;
        features: {
          id: string;
          name: string;
          category: string;
          coverage: number;
          status: string;
          openDefects: number;
          closedDefects: number;
          riskScore: number;
          passRate: number;
          impactScore: number;
        }[];
      }
    >();

    features?.forEach((f) => {
      if (!categoryMap.has(f.category)) {
        categoryMap.set(f.category, {
          name: f.category,
          features: [],
        });
      }
      categoryMap.get(f.category)!.features.push({
        id: f.id,
        name: f.name,
        category: f.category,
        coverage: f.coverage,
        status: f.status,
        openDefects: f.open_defects,
        closedDefects: f.closed_defects,
        riskScore: f.risk_score,
        passRate: f.pass_rate,
        impactScore: f.impact_score,
      });
    });

    // Calculate aggregates
    const categories = Array.from(categoryMap.values()).map((cat, index) => {
      const avgCoverage = Math.round(
        cat.features.reduce((sum, f) => sum + f.coverage, 0) /
          cat.features.length
      );
      const highRiskCount = cat.features.filter(
        (f) => f.riskScore >= 40
      ).length;
      const totalDefects = cat.features.reduce(
        (sum, f) => sum + f.openDefects,
        0
      );

      return {
        id: `category-${index + 1}`,
        name: cat.name,
        features: cat.features,
        avgCoverage,
        highRiskCount,
        totalDefects,
      };
    });

    return NextResponse.json(categories, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
