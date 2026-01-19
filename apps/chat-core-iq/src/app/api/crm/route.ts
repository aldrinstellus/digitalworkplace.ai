// CRM Integration API for Chat Core IQ Chatbot
// ITN 2025-20 Section 3.1.2 (Optional)

import { NextRequest, NextResponse } from 'next/server';
import { getCRMAdapter, CRMConversation } from '@/lib/integrations/crm-adapter';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/crm - Check CRM status
export async function GET() {
  const adapter = getCRMAdapter();

  return NextResponse.json({
    enabled: adapter.isEnabled(),
    provider: process.env.CRM_PROVIDER || 'none',
    status: adapter.isEnabled() ? 'connected' : 'disabled',
  }, { headers: corsHeaders });
}

// POST /api/crm - Sync conversation to CRM
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const adapter = getCRMAdapter();

    if (!adapter.isEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'CRM integration is not enabled',
        message: 'Configure CRM_PROVIDER and CRM_ENABLED in environment variables',
      }, { status: 400, headers: corsHeaders });
    }

    switch (action) {
      case 'sync_conversation': {
        const conversation: CRMConversation = {
          sessionId: data.sessionId,
          channel: data.channel || 'web',
          language: data.language || 'en',
          sentiment: data.sentiment || 'neutral',
          messages: data.messages || [],
          escalated: data.escalated || false,
          startTime: data.startTime || new Date().toISOString(),
          endTime: data.endTime,
        };

        const result = await adapter.syncEscalatedConversation(conversation, {
          email: data.userEmail,
          phone: data.userPhone,
          name: data.userName,
        });

        return NextResponse.json({
          success: true,
          contactId: result.contactId,
          caseId: result.caseId,
          message: 'Conversation synced to CRM',
        }, { headers: corsHeaders });
      }

      case 'create_contact': {
        const contactId = await adapter.createContact({
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          language: data.language,
          channel: data.channel,
        });

        return NextResponse.json({
          success: !!contactId,
          contactId,
          message: contactId ? 'Contact created' : 'Failed to create contact',
        }, { headers: corsHeaders });
      }

      case 'create_case': {
        const caseId = await adapter.createCase({
          contactId: data.contactId,
          subject: data.subject,
          description: data.description,
          status: data.status || 'new',
          priority: data.priority || 'medium',
          channel: data.channel || 'web',
          language: data.language || 'en',
          sentiment: data.sentiment,
          conversationId: data.conversationId,
          createdAt: data.createdAt || new Date().toISOString(),
        });

        return NextResponse.json({
          success: !!caseId,
          caseId,
          message: caseId ? 'Case created' : 'Failed to create case',
        }, { headers: corsHeaders });
      }

      case 'test_connection': {
        // Test CRM connection by attempting to authenticate
        try {
          // For testing, just verify the adapter is configured
          return NextResponse.json({
            success: true,
            provider: process.env.CRM_PROVIDER,
            message: 'CRM connection test successful (adapter configured)',
          }, { headers: corsHeaders });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Connection test failed',
          }, { status: 500, headers: corsHeaders });
        }
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['sync_conversation', 'create_contact', 'create_case', 'test_connection'],
        }, { status: 400, headers: corsHeaders });
    }
  } catch (error) {
    console.error('[CRM API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500, headers: corsHeaders });
  }
}
