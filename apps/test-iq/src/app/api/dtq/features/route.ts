import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/dtq/features - List all features
export async function GET() {
  try {
    const { data: features, error } = await supabase
      .from('features')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching features:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend compatibility
    const transformedFeatures = features?.map((f) => ({
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
    }));

    return NextResponse.json(transformedFeatures || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
