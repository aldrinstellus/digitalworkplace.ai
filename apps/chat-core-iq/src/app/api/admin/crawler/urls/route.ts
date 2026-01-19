import { NextRequest, NextResponse } from "next/server";
import { getCrawlerUrls, saveCrawlerUrls, addAuditLog, CrawlerURL } from "@/lib/data-store";

// GET - Retrieve all crawler URLs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = (searchParams.get("lang") as 'en' | 'es') || 'en';
    const urls = await getCrawlerUrls(lang);
    return NextResponse.json({
      urls,
      total: urls.length,
      enabled: urls.filter((u) => u.enabled).length,
      disabled: urls.filter((u) => !u.enabled).length,
      language: lang,
    });
  } catch (error) {
    console.error("Error fetching crawler URLs:", error);
    return NextResponse.json(
      { error: "Failed to fetch crawler URLs" },
      { status: 500 }
    );
  }
}

// POST - Create a new custom crawler URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, fullUrl, title, section } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const urls = await getCrawlerUrls();

    // Check for duplicate
    if (urls.some((u) => u.url === url || u.fullUrl === fullUrl)) {
      return NextResponse.json(
        { error: "URL already exists" },
        { status: 400 }
      );
    }

    const newUrl: CrawlerURL = {
      id: `custom-${Date.now()}`,
      url,
      fullUrl: fullUrl || `https://www.cityofdoral.com${url}`,
      title: title || url.split("/").pop()?.replace(/\.html?$/, "").replace(/-/g, " ") || "Custom Page",
      section: section || "Other",
      enabled: true,
      isCustom: true,
      lastCrawled: null,
      lastStatus: "never",
    };

    urls.push(newUrl);
    await saveCrawlerUrls(urls);

    await addAuditLog("Admin", "CREATE", "crawler_url", newUrl.id, {
      url: newUrl.url,
      section: newUrl.section,
    });

    return NextResponse.json(newUrl, { status: 201 });
  } catch (error) {
    console.error("Error creating crawler URL:", error);
    return NextResponse.json(
      { error: "Failed to create crawler URL" },
      { status: 500 }
    );
  }
}

// PUT - Update a crawler URL (typically toggle enabled state)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled, title, section } = body;

    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 }
      );
    }

    const urls = await getCrawlerUrls();
    const index = urls.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    const updatedUrl: CrawlerURL = {
      ...urls[index],
      enabled: enabled ?? urls[index].enabled,
      title: title ?? urls[index].title,
      section: section ?? urls[index].section,
    };

    urls[index] = updatedUrl;
    await saveCrawlerUrls(urls);

    await addAuditLog("Admin", "UPDATE", "crawler_url", id, {
      url: updatedUrl.url,
      enabled: updatedUrl.enabled,
    });

    return NextResponse.json(updatedUrl);
  } catch (error) {
    console.error("Error updating crawler URL:", error);
    return NextResponse.json(
      { error: "Failed to update crawler URL" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a crawler URL (only custom ones)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "URL ID is required" },
        { status: 400 }
      );
    }

    const urls = await getCrawlerUrls();
    const index = urls.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    const deletedUrl = urls[index];

    // Only allow deleting custom URLs
    if (!deletedUrl.isCustom) {
      return NextResponse.json(
        { error: "Cannot delete non-custom URLs" },
        { status: 400 }
      );
    }

    urls.splice(index, 1);
    await saveCrawlerUrls(urls);

    await addAuditLog("Admin", "DELETE", "crawler_url", id, {
      url: deletedUrl.url,
    });

    return NextResponse.json({ success: true, deleted: deletedUrl });
  } catch (error) {
    console.error("Error deleting crawler URL:", error);
    return NextResponse.json(
      { error: "Failed to delete crawler URL" },
      { status: 500 }
    );
  }
}
