import { NextResponse } from "next/server";
import { markAllNotificationsRead, addAuditLog } from "@/lib/data-store";

// POST - Mark all notifications as read
export async function POST() {
  try {
    const count = await markAllNotificationsRead();

    await addAuditLog("Admin", "UPDATE", "notification", "all", {
      action: "mark_all_read",
      count,
    });

    return NextResponse.json({ success: true, markedCount: count });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
