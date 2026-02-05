import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/dtq/personas - Get all personas with their metrics
export async function GET() {
  try {
    // Fetch personas with nested metrics in a single query
    const { data: personas, error: personasError } = await supabase
      .from('dtq_personas')
      .select('*, dtq_persona_metrics(*)');

    if (personasError) {
      console.error('Error fetching personas:', personasError);
      return NextResponse.json(
        { error: personasError.message },
        { status: 500 }
      );
    }

    // Transform and combine
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedPersonas = personas?.map((p: any) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      description: p.description,
      icon: p.icon,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metrics: (p.dtq_persona_metrics || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((metric: any) => ({
          key: metric.metric_key,
          label: metric.label,
          value: isNaN(Number(metric.value))
            ? metric.value
            : Number(metric.value),
          unit: metric.unit,
          description: metric.description,
          trend: metric.trend,
          trendValue: metric.trend_value,
        })),
    }));

    return NextResponse.json(transformedPersonas || [], {
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
