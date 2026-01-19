import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Comprehensive test of ALL dcq schema views
export async function GET() {
  const results: Record<string, { success: boolean; count: number; error?: string; sample?: unknown }> = {};

  // List of all 16 dcq tables (as public schema views)
  const tables = [
    'dcq_faqs',
    'dcq_announcements',
    'dcq_settings',
    'dcq_escalations',
    'dcq_audit_logs',
    'dcq_notifications',
    'dcq_knowledge_entries',
    'dcq_documents',
    'dcq_crawler_urls',
    'dcq_languages',
    'dcq_banner_settings',
    'dcq_workflow_types',
    'dcq_workflow_categories',
    'dcq_feedback',
    'dcq_conversations',
    'dcq_cross_channel_tokens',
  ];

  console.log('[DEBUG] Testing all 16 dcq schema tables...');

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        results[table] = {
          success: false,
          count: 0,
          error: error.message
        };
        console.error(`[DEBUG] ${table}: ERROR - ${error.message}`);
      } else {
        results[table] = {
          success: true,
          count: count || data?.length || 0,
          sample: data?.[0] ? Object.keys(data[0]) : []
        };
        console.log(`[DEBUG] ${table}: OK - ${count || data?.length || 0} rows`);
      }
    } catch (err) {
      results[table] = {
        success: false,
        count: 0,
        error: String(err)
      };
      console.error(`[DEBUG] ${table}: EXCEPTION - ${err}`);
    }
  }

  // Summary
  const successful = Object.values(results).filter(r => r.success).length;
  const failed = Object.values(results).filter(r => !r.success).length;

  return NextResponse.json({
    summary: {
      total: tables.length,
      successful,
      failed,
      allConnected: failed === 0
    },
    tables: results,
    timestamp: new Date().toISOString()
  });
}
