import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/dtq/personas - Get all personas with their metrics
export async function GET() {
  try {
    // Fetch personas
    const { data: personas, error: personasError } = await supabase
      .from('dtq_personas')
      .select('*');

    if (personasError) {
      console.error('Error fetching personas:', personasError);
      return NextResponse.json(
        { error: personasError.message },
        { status: 500 }
      );
    }

    // Fetch all persona metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('dtq_persona_metrics')
      .select('*')
      .order('display_order', { ascending: true });

    if (metricsError) {
      console.error('Error fetching persona metrics:', metricsError);
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 }
      );
    }

    // Group metrics by persona
    const metricsByPersona = (metrics || []).reduce(
      (acc, metric) => {
        if (!acc[metric.persona_id]) {
          acc[metric.persona_id] = [];
        }
        acc[metric.persona_id].push({
          key: metric.metric_key,
          label: metric.label,
          value: isNaN(Number(metric.value))
            ? metric.value
            : Number(metric.value),
          unit: metric.unit,
          description: metric.description,
          trend: metric.trend,
          trendValue: metric.trend_value,
        });
        return acc;
      },
      {} as Record<string, unknown[]>
    );

    // Transform and combine
    const transformedPersonas = personas?.map((p) => ({
      id: p.id, // id is the persona type (csuite, manager, techlead)
      name: p.name,
      title: p.title,
      description: p.description,
      icon: p.icon,
      metrics: metricsByPersona[p.id] || [],
    }));

    return NextResponse.json(transformedPersonas || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
