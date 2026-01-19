import { NextRequest, NextResponse } from "next/server";
import { getEscalations, saveEscalations, addAuditLog, Escalation } from "@/lib/data-store";

// GET - Get a single escalation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const escalations = await getEscalations();
    const escalation = escalations.find((e) => e.id === id);

    if (!escalation) {
      return NextResponse.json(
        { error: "Escalation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(escalation);
  } catch (error) {
    console.error("Error fetching escalation:", error);
    return NextResponse.json(
      { error: "Failed to fetch escalation" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update of an escalation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, assignedTo } = body;

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
      notes: notes?.slice(0, 50),
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

// DELETE - Delete an escalation by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
