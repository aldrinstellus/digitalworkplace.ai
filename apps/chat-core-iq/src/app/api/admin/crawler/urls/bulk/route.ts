import { NextRequest, NextResponse } from "next/server";
import { getCrawlerUrls, saveCrawlerUrls, addAuditLog } from "@/lib/data-store";

// POST - Bulk toggle URLs by section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, enabled, ids } = body;

    const urls = await getCrawlerUrls();
    let updatedCount = 0;

    if (section) {
      // Toggle all URLs in a section
      urls.forEach((url) => {
        if (url.section === section) {
          url.enabled = enabled;
          updatedCount++;
        }
      });
    } else if (ids && Array.isArray(ids)) {
      // Toggle specific URLs by IDs
      urls.forEach((url) => {
        if (ids.includes(url.id)) {
          url.enabled = enabled;
          updatedCount++;
        }
      });
    } else {
      return NextResponse.json(
        { error: "Either 'section' or 'ids' is required" },
        { status: 400 }
      );
    }

    await saveCrawlerUrls(urls);

    await addAuditLog("Admin", "BULK_UPDATE", "crawler_urls", section || "multiple", {
      section,
      enabled,
      count: updatedCount,
    });

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} URLs ${enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    console.error("Error bulk updating crawler URLs:", error);
    return NextResponse.json(
      { error: "Failed to bulk update crawler URLs" },
      { status: 500 }
    );
  }
}
