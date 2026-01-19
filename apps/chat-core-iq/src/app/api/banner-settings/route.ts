import { NextRequest, NextResponse } from "next/server";
import { getBannerSettings, saveBannerSettings, addAuditLog, BannerSettings } from "@/lib/data-store";

// CORS headers for cross-origin requests from static site
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Retrieve banner settings
export async function GET() {
  try {
    const settings = await getBannerSettings();
    return NextResponse.json(settings, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching banner settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT - Update banner settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rotationEnabled,
      rotationInterval,
      pauseOnHover,
      showNavigation,
      showDismiss,
    } = body;

    const currentSettings = await getBannerSettings();

    const updatedSettings: BannerSettings = {
      rotationEnabled: rotationEnabled ?? currentSettings.rotationEnabled,
      rotationInterval: rotationInterval ?? currentSettings.rotationInterval,
      pauseOnHover: pauseOnHover ?? currentSettings.pauseOnHover,
      showNavigation: showNavigation ?? currentSettings.showNavigation,
      showDismiss: showDismiss ?? currentSettings.showDismiss,
      updatedAt: new Date().toISOString(),
    };

    await saveBannerSettings(updatedSettings);

    await addAuditLog("Admin", "UPDATE", "banner-settings", "global", {
      changes: body,
    });

    return NextResponse.json(updatedSettings, { headers: corsHeaders });
  } catch (error) {
    console.error("Error updating banner settings:", error);
    return NextResponse.json(
      { error: "Failed to update banner settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}
