import { NextRequest, NextResponse } from "next/server";
import { getEscalations, saveEscalations, addAuditLog, Escalation } from "@/lib/data-store";

// GET - Retrieve all escalations with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let escalations = await getEscalations();

    // Filter by status
    if (status && status !== "all") {
      escalations = escalations.filter((e) => e.status === status);
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      escalations = escalations.filter(
        (e) =>
          e.userName.toLowerCase().includes(query) ||
          e.contactValue.toLowerCase().includes(query) ||
          e.reason.toLowerCase().includes(query)
      );
    }

    // Sort by requestedAt (newest first), pending first
    escalations.sort((a, b) => {
      // Pending items first
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      // Then by date
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });

    return NextResponse.json({
      escalations,
      total: escalations.length,
    });
  } catch (error) {
    console.error("Error fetching escalations:", error);
    return NextResponse.json(
      { error: "Failed to fetch escalations" },
      { status: 500 }
    );
  }
}

// POST - Create a new escalation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const escalations = await getEscalations();

    const newEscalation: Escalation = {
      id: `esc-${Date.now()}`,
      sessionId: body.sessionId || `sess-${Math.random().toString(36).slice(2, 11)}`,
      userName: body.userName || "Anonymous User",
      contactMethod: body.contactMethod || "email",
      contactValue: body.contactValue || "",
      reason: body.reason || "General inquiry",
      status: "pending",
      requestedAt: new Date().toISOString(),
      notes: "",
    };

    escalations.unshift(newEscalation);
    await saveEscalations(escalations);

    await addAuditLog("System", "CREATE", "escalation", newEscalation.id, {
      userName: newEscalation.userName,
      reason: newEscalation.reason,
    });

    return NextResponse.json(newEscalation, { status: 201 });
  } catch (error) {
    console.error("Error creating escalation:", error);
    return NextResponse.json(
      { error: "Failed to create escalation" },
      { status: 500 }
    );
  }
}

// PUT - Update an escalation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes, assignedTo } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Escalation ID is required" },
        { status: 400 }
      );
    }

    const escalations = await getEscalations();
    const index = escalations.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Escalation not found" },
        { status: 404 }
      );
    }

    const updatedEscalation: Escalation = {
      ...escalations[index],
      status: status ?? escalations[index].status,
      notes: notes ?? escalations[index].notes,
      assignedTo: assignedTo ?? escalations[index].assignedTo,
      resolvedAt: status === "resolved" ? new Date().toISOString() : escalations[index].resolvedAt,
    };

    escalations[index] = updatedEscalation;
    await saveEscalations(escalations);

    await addAuditLog("Admin", "UPDATE", "escalation", id, {
      newStatus: status,
      assignedTo,
    });

    return NextResponse.json(updatedEscalation);
  } catch (error) {
    console.error("Error updating escalation:", error);
    return NextResponse.json(
      { error: "Failed to update escalation" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an escalation
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Escalation ID is required" },
        { status: 400 }
      );
    }

    const escalations = await getEscalations();
    const index = escalations.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Escalation not found" },
        { status: 404 }
      );
    }

    const deletedEscalation = escalations[index];
    escalations.splice(index, 1);
    await saveEscalations(escalations);

    await addAuditLog("Admin", "DELETE", "escalation", id, {
      userName: deletedEscalation.userName,
      reason: deletedEscalation.reason,
    });

    return NextResponse.json({ success: true, deleted: deletedEscalation });
  } catch (error) {
    console.error("Error deleting escalation:", error);
    return NextResponse.json(
      { error: "Failed to delete escalation" },
      { status: 500 }
    );
  }
}
