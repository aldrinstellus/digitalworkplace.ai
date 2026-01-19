import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      nextjs: true,
      knowledgeBase: false,
      faqData: false,
    },
    uptime: process.uptime(),
  };

  // Check knowledge base
  try {
    const kbPath = path.join(process.cwd(), 'public', 'knowledge-base.json');
    if (fs.existsSync(kbPath)) {
      const stats = fs.statSync(kbPath);
      checks.services.knowledgeBase = stats.size > 0;
    }
  } catch {
    checks.services.knowledgeBase = false;
  }

  // Check FAQ data
  try {
    const faqPath = path.join(process.cwd(), 'data', 'demo-faq.json');
    if (fs.existsSync(faqPath)) {
      const stats = fs.statSync(faqPath);
      checks.services.faqData = stats.size > 0;
    }
  } catch {
    checks.services.faqData = false;
  }

  // Determine overall status
  const allHealthy = Object.values(checks.services).every(v => v === true);
  checks.status = allHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
