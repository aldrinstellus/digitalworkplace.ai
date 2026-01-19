import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeEntries, saveKnowledgeEntries, addAuditLog, KnowledgeEntry } from "@/lib/data-store";

// GET - Retrieve all custom knowledge entries
export async function GET() {
  try {
    const entries = await getKnowledgeEntries();

    // Group by section for stats
    const sections = [...new Set(entries.map(e => e.section))];

    const stats = {
      total: entries.length,
      sections: sections.length,
      bySection: sections.reduce((acc, section) => {
        acc[section] = entries.filter(e => e.section === section).length;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      entries,
      stats,
    });
  } catch (error) {
    console.error("Error fetching knowledge entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge entries" },
      { status: 500 }
    );
  }
}

// POST - Create a new knowledge entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, section, url } = body;

    if (!title || !content || !section) {
      return NextResponse.json(
        { error: "Required fields: title, content, section" },
        { status: 400 }
      );
    }

    const entries = await getKnowledgeEntries();

    const newEntry: KnowledgeEntry = {
      id: `ke-${Date.now()}`,
      title,
      content,
      section,
      url: url || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    entries.unshift(newEntry);
    await saveKnowledgeEntries(entries);

    await addAuditLog("Admin", "CREATE", "knowledge_entry", newEntry.id, {
      title: newEntry.title,
      section: newEntry.section,
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating knowledge entry:", error);
    return NextResponse.json(
      { error: "Failed to create knowledge entry" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing knowledge entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, section, url } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const entries = await getKnowledgeEntries();
    const index = entries.findIndex(e => e.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Knowledge entry not found" },
        { status: 404 }
      );
    }

    const updatedEntry: KnowledgeEntry = {
      ...entries[index],
      title: title ?? entries[index].title,
      content: content ?? entries[index].content,
      section: section ?? entries[index].section,
      url: url ?? entries[index].url,
      updatedAt: new Date().toISOString(),
    };

    entries[index] = updatedEntry;
    await saveKnowledgeEntries(entries);

    await addAuditLog("Admin", "UPDATE", "knowledge_entry", id, {
      title: updatedEntry.title,
      section: updatedEntry.section,
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating knowledge entry:", error);
    return NextResponse.json(
      { error: "Failed to update knowledge entry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a knowledge entry
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const entries = await getKnowledgeEntries();
    const index = entries.findIndex(e => e.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Knowledge entry not found" },
        { status: 404 }
      );
    }

    const deletedEntry = entries[index];
    entries.splice(index, 1);
    await saveKnowledgeEntries(entries);

    await addAuditLog("Admin", "DELETE", "knowledge_entry", id, {
      title: deletedEntry.title,
    });

    return NextResponse.json({ success: true, deleted: deletedEntry });
  } catch (error) {
    console.error("Error deleting knowledge entry:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge entry" },
      { status: 500 }
    );
  }
}
