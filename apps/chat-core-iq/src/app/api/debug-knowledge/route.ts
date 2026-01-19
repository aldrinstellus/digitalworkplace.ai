import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Test the master knowledge base (public.knowledge_items) and sync status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('q');

  const results: Record<string, unknown> = {};

  console.log('[DEBUG-KB] Testing master knowledge base...');

  // 1. Check if knowledge_items table exists
  try {
    const { data, error, count } = await supabase
      .from('knowledge_items')
      .select('*', { count: 'exact', head: false })
      .limit(10);

    if (error) {
      results.knowledge_items = {
        exists: false,
        error: error.message,
        hint: error.hint
      };
    } else {
      results.knowledge_items = {
        exists: true,
        total_rows: count || data?.length || 0,
        sample: data?.slice(0, 3).map(row => ({
          id: row.id,
          project_id: row.project_id,
          source_table: row.source_table,
          type: row.type,
          title: row.title?.substring(0, 50)
        }))
      };
    }
  } catch (err) {
    results.knowledge_items = {
      exists: false,
      exception: String(err)
    };
  }

  // 2. Check if projects table exists (for cross-project reference)
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, code, name')
      .limit(10);

    if (error) {
      results.projects = {
        exists: false,
        error: error.message
      };
    } else {
      results.projects = {
        exists: true,
        count: data?.length || 0,
        projects: data
      };
    }
  } catch (err) {
    results.projects = {
      exists: false,
      exception: String(err)
    };
  }

  // 3. Count items in dcq.faqs that should sync
  try {
    const { data, error, count } = await supabase
      .from('dcq_faqs')
      .select('id, question', { count: 'exact', head: false });

    results.dcq_faqs = {
      total: count || data?.length || 0,
      error: error?.message
    };
  } catch (err) {
    results.dcq_faqs = { error: String(err) };
  }

  // 4. Count items in dcq.knowledge_entries that should sync
  try {
    const { data, error, count } = await supabase
      .from('dcq_knowledge_entries')
      .select('id, title', { count: 'exact', head: false });

    results.dcq_knowledge_entries = {
      total: count || data?.length || 0,
      error: error?.message
    };
  } catch (err) {
    results.dcq_knowledge_entries = { error: String(err) };
  }

  // 5. Check knowledge_items by source project
  try {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('source_table')
      .limit(1000);

    if (!error && data) {
      const bySource: Record<string, number> = {};
      data.forEach(row => {
        const source = row.source_table?.split('.')[0] || 'unknown';
        bySource[source] = (bySource[source] || 0) + 1;
      });
      results.items_by_source = bySource;
    }
  } catch (err) {
    results.items_by_source = { error: String(err) };
  }

  // 6. Cross-project search test (if query provided)
  if (searchQuery) {
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('id, source_table, type, title, content')
        .ilike('title', `%${searchQuery}%`)
        .limit(10);

      if (error) {
        results.cross_project_search = {
          query: searchQuery,
          error: error.message,
          hint: error.hint
        };
      } else {
        results.cross_project_search = {
          query: searchQuery,
          results_count: data?.length || 0,
          results: data?.map(row => ({
            source: row.source_table,
            type: row.type,
            title: row.title?.substring(0, 60),
            snippet: row.content?.substring(0, 100)
          }))
        };
      }
    } catch (err) {
      results.cross_project_search = { query: searchQuery, error: String(err) };
    }
  }

  // 7. Summary
  const kiExists = (results.knowledge_items as any)?.exists;
  const kiTotal = (results.knowledge_items as any)?.total_rows || 0;
  const dcqFaqs = (results.dcq_faqs as any)?.total || 0;
  const dcqKb = (results.dcq_knowledge_entries as any)?.total || 0;
  const itemsBySource = results.items_by_source as Record<string, number> || {};
  const dcqInKi = itemsBySource['dcq'] || 0;
  const diqInKi = itemsBySource['diq'] || 0;

  results.summary = {
    master_knowledge_base_exists: kiExists,
    master_knowledge_base_total: kiTotal,
    items_by_project: itemsBySource,
    dcq_source_faqs: dcqFaqs,
    dcq_source_kb_entries: dcqKb,
    dcq_synced_to_master: dcqInKi,
    diq_synced_to_master: diqInKi,
    sync_status: dcqInKi > 0 || diqInKi > 0 ? 'ACTIVE' : 'INACTIVE',
    architecture: {
      flow: 'Project Tables (dcq.faqs, diq.articles) → Sync Triggers → public.knowledge_items (Master KB)',
      search: 'All projects searchable via knowledge_items table',
      status: 'OPERATIONAL'
    }
  };

  return NextResponse.json(results, { status: 200 });
}
