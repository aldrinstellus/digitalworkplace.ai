import { NextRequest, NextResponse } from "next/server";
import { markNotificationRead, deleteNotification, addAuditLog } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const notification = await markNotificationRead(id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await addAuditLog("Admin", "UPDATE", "notification", id, {
      action: "mark_read",
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a notification
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const deleted = await deleteNotification(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await addAuditLog("Admin", "DELETE", "notification", id, {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
