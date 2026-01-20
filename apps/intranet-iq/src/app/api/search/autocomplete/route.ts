/**
 * Search Autocomplete API Route
 * Provides real-time search suggestions from the knowledge base
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Suggestion {
  id: string;
  type: 'article' | 'person' | 'event' | 'trending';
  text: string;
  subtitle?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const suggestions: Suggestion[] = [];

    if (!query.trim()) {
      // Return trending/popular items when no query
      const { data: popularArticles } = await supabase
        .schema('diq')
        .from('articles')
        .select('id, title, view_count')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(5);

      if (popularArticles) {
        popularArticles.forEach((article) => {
          suggestions.push({
            id: article.id,
            type: 'trending',
            text: article.title,
            subtitle: `${article.view_count || 0} views`,
          });
        });
      }

      return NextResponse.json({ suggestions });
    }

    // Search articles
    const { data: articles } = await supabase
      .schema('diq')
      .from('articles')
      .select('id, title, summary')
      .eq('status', 'published')
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (articles) {
      articles.forEach((article) => {
        suggestions.push({
          id: article.id,
          type: 'article',
          text: article.title,
          subtitle: article.summary?.slice(0, 50) || 'Knowledge Base',
        });
      });
    }

    // Search employees/people
    const { data: employees } = await supabase
      .schema('diq')
      .from('employees')
      .select('id, first_name, last_name, job_title, department:departments(name)')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,job_title.ilike.%${query}%`)
      .limit(5);

    if (employees) {
      employees.forEach((emp: any) => {
        suggestions.push({
          id: emp.id,
          type: 'person',
          text: `${emp.first_name} ${emp.last_name}`,
          subtitle: `${emp.job_title || 'Employee'}${emp.department?.name ? ` • ${emp.department.name}` : ''}`,
        });
      });
    }

    // Search events
    const { data: events } = await supabase
      .schema('diq')
      .from('events')
      .select('id, title, start_time')
      .ilike('title', `%${query}%`)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(3);

    if (events) {
      events.forEach((event) => {
        const eventDate = new Date(event.start_time);
        const dateStr = eventDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
        suggestions.push({
          id: event.id,
          type: 'event',
          text: event.title,
          subtitle: dateStr,
        });
      });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
