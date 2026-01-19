import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

// CORS headers for admin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Check scraper status and last run info
export async function GET() {
  const logFile = join(process.cwd(), 'data', 'scraper-log.json');

  if (!existsSync(logFile)) {
    return NextResponse.json({
      status: 'never_run',
      message: 'Scraper has not been run yet',
      lastRun: null,
    }, { headers: corsHeaders });
  }

  try {
    const logData = JSON.parse(readFileSync(logFile, 'utf-8'));
    return NextResponse.json({
      status: logData.success ? 'success' : 'failed',
      lastRun: logData.lastRun,
      duration: logData.duration,
      pagesProcessed: logData.pagesProcessed,
      totalPages: logData.totalPages,
      error: logData.error || null,
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Could not read scraper log',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { headers: corsHeaders, status: 500 });
  }
}

// POST - Trigger manual scrape
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { dryRun = false, notifyEmail } = body;

    // Build command arguments
    const args = [];
    if (dryRun) args.push('--dry-run');
    if (notifyEmail) args.push('--notify', notifyEmail);

    const scriptPath = join(process.cwd(), 'scripts', 'cron-scraper.mjs');

    if (!existsSync(scriptPath)) {
      return NextResponse.json({
        success: false,
        error: 'Scraper script not found',
      }, { headers: corsHeaders, status: 404 });
    }

    // Run scraper in background (don't block response)
    const child = spawn('node', [scriptPath, ...args], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore',
    });

    // Unref to allow parent to exit independently
    child.unref();

    return NextResponse.json({
      success: true,
      message: 'Scraper started in background',
      pid: child.pid,
      dryRun,
      checkStatusAt: '/api/admin/scrape',
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Scrape trigger error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { headers: corsHeaders, status: 500 });
  }
}
