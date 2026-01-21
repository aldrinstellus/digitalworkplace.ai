import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings, addAuditLog, Settings } from "@/lib/data-store";

// CORS headers for cross-origin widget access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET - Retrieve current settings
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const currentSettings = await getSettings();

    // Deep merge the settings
    const updatedSettings: Settings = {
      general: {
        ...currentSettings.general,
        ...(body.general || {}),
        officeHours: {
          ...currentSettings.general.officeHours,
          ...(body.general?.officeHours || {}),
        },
      },
      chatbot: {
        ...currentSettings.chatbot,
        ...(body.chatbot || {}),
      },
      appearance: {
        ...currentSettings.appearance,
        ...(body.appearance || {}),
      },
      llm: {
        ...currentSettings.llm,
        ...(body.llm || {}),
      },
      notifications: {
        ...currentSettings.notifications,
        ...(body.notifications || {}),
      },
      integration: {
        ...currentSettings.integration,
        ...(body.integration || {}),
      },
      integrations: {
        ...currentSettings.integrations,
        ...(body.integrations || {}),
      },
    };

    await saveSettings(updatedSettings);

    // Track what changed for audit
    const changes: Record<string, unknown> = {};
    if (body.general) changes.general = body.general;
    if (body.chatbot) changes.chatbot = body.chatbot;
    if (body.appearance) changes.appearance = body.appearance;
    if (body.llm) changes.llm = body.llm;
    if (body.notifications) changes.notifications = body.notifications;
    if (body.integration) changes.integration = body.integration;
    if (body.integrations) changes.integrations = body.integrations;

    await addAuditLog("Admin", "UPDATE", "settings", "global", changes);

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update for a specific section
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: "Section and data are required" },
        { status: 400 }
      );
    }

    const validSections = ["general", "chatbot", "appearance", "llm", "notifications", "integration", "integrations"];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${validSections.join(", ")}` },
        { status: 400 }
      );
    }

    const currentSettings = await getSettings();

    // Type-safe section update
    const updatedSettings: Settings = {
      ...currentSettings,
      [section]: {
        ...currentSettings[section as keyof Settings],
        ...data,
      },
    };

    await saveSettings(updatedSettings);

    await addAuditLog("Admin", "UPDATE", "settings", section, data);

    return NextResponse.json({
      success: true,
      section,
      data: updatedSettings[section as keyof Settings],
    });
  } catch (error) {
    console.error("Error patching settings:", error);
    return NextResponse.json(
      { error: "Failed to patch settings" },
      { status: 500 }
    );
  }
}

// POST - Reset settings to defaults (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action !== "reset") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Reset to default settings
    const defaultSettings: Settings = {
      general: {
        botName: "Chat Core IQ Assistant",
        welcomeMessage: "Hello! I'm the Chat Core IQ Assistant. How can I help you today?",
        welcomeMessageEs: "¡Hola! Soy el Asistente de Chat Core IQ. ¿Cómo puedo ayudarle hoy?",
        welcomeMessageHt: "Bonjou! Mwen se Asistan Chat Core IQ. Kijan mwen ka ede ou jodi a?",
        defaultLanguage: "en",
        enableBilingual: true,
        officeHours: {
          start: "08:00",
          end: "17:00",
          timezone: "America/New_York",
        },
      },
      chatbot: {
        maxMessagesPerSession: 50,
        sessionTimeout: 30,
        enableSentimentAnalysis: true,
        autoEscalateNegative: true,
        escalationThreshold: 5,
        responseDelay: 500,
      },
      appearance: {
        primaryColor: "#a855f7",
        position: "bottom-right",
        showSources: true,
        showFeedback: true,
      },
      llm: {
        primaryLLM: "claude-3-sonnet",
        backupLLM: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 1024,
      },
      notifications: {
        emailAlerts: true,
        escalationEmail: "admin@chatcoreiq.com",
        dailyDigest: true,
        digestTime: "09:00",
        alertOnEscalation: true,
        alertOnNegativeFeedback: true,
      },
      integration: {
        enableIVR: true,
        enableSMS: true,
        enableSocial: true,
        twilioPhone: "+13055930000",
      },
      integrations: {
        crmEnabled: false,
        crmProvider: "none",
        sharePointEnabled: false,
      },
    };

    await saveSettings(defaultSettings);

    await addAuditLog("Admin", "RESET", "settings", "global", {
      action: "reset_to_defaults",
    });

    return NextResponse.json({
      success: true,
      message: "Settings reset to defaults",
      settings: defaultSettings,
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 }
    );
  }
}
