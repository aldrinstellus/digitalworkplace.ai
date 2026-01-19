import { NextRequest, NextResponse } from "next/server";
import { getAnnouncements, saveAnnouncements, addAuditLog, Announcement } from "@/lib/data-store";

// CORS headers for cross-origin requests from static site
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Retrieve all announcements with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const targetAudience = searchParams.get("audience");
    const activeOnly = searchParams.get("active") === "true";
    const search = searchParams.get("search");

    let announcements = await getAnnouncements();

    // Filter by type
    if (type && type !== "all") {
      announcements = announcements.filter((ann) => ann.type === type);
    }

    // Filter by target audience
    if (targetAudience && targetAudience !== "all") {
      announcements = announcements.filter((ann) => ann.targetAudience === targetAudience);
    }

    // Filter active only
    if (activeOnly) {
      const now = new Date();
      announcements = announcements.filter((ann) => {
        const start = new Date(ann.startDate);
        const end = new Date(ann.endDate);
        return ann.isActive && start <= now && end >= now;
      });
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      announcements = announcements.filter(
        (ann) =>
          ann.title.toLowerCase().includes(query) ||
          ann.content.toLowerCase().includes(query)
      );
    }

    // Sort by start date (newest first), urgent first
    announcements.sort((a, b) => {
      if (a.type === "urgent" && b.type !== "urgent") return -1;
      if (a.type !== "urgent" && b.type === "urgent") return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return NextResponse.json({
      announcements,
      total: announcements.length,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST - Create a new announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, startDate, endDate, targetAudience, language, isActive } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const announcements = await getAnnouncements();

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      type: type || "info",
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      targetAudience: targetAudience || "all",
      language: language || "both",
      isActive: isActive !== false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    announcements.unshift(newAnnouncement);
    await saveAnnouncements(announcements);

    await addAuditLog("Admin", "CREATE", "announcement", newAnnouncement.id, {
      title: newAnnouncement.title,
      type: newAnnouncement.type,
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing announcement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, type, startDate, endDate, targetAudience, language, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    const announcements = await getAnnouncements();
    const index = announcements.findIndex((ann) => ann.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const updatedAnnouncement: Announcement = {
      ...announcements[index],
      title: title ?? announcements[index].title,
      content: content ?? announcements[index].content,
      type: type ?? announcements[index].type,
      startDate: startDate ?? announcements[index].startDate,
      endDate: endDate ?? announcements[index].endDate,
      targetAudience: targetAudience ?? announcements[index].targetAudience,
      language: language ?? announcements[index].language,
      isActive: isActive ?? announcements[index].isActive,
      updatedAt: new Date().toISOString(),
    };

    announcements[index] = updatedAnnouncement;
    await saveAnnouncements(announcements);

    await addAuditLog("Admin", "UPDATE", "announcement", id, {
      title: updatedAnnouncement.title,
      changes: { title, content, type, startDate, endDate, targetAudience, language, isActive },
    });

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an announcement
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    const announcements = await getAnnouncements();
    const index = announcements.findIndex((ann) => ann.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const deletedAnnouncement = announcements[index];
    announcements.splice(index, 1);
    await saveAnnouncements(announcements);

    await addAuditLog("Admin", "DELETE", "announcement", id, {
      title: deletedAnnouncement.title,
    });

    return NextResponse.json({ success: true, deleted: deletedAnnouncement });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
