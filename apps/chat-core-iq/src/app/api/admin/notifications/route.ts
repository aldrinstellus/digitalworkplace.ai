import { NextRequest, NextResponse } from "next/server";
import { getNotifications, createNotification, addAuditLog, Notification } from "@/lib/data-store";

// GET - Retrieve all notifications with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as Notification["type"] | null;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let notifications = await getNotifications();

    // Filter by type if specified
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    // Filter unread only if specified
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.isRead);
    }

    // Sort by createdAt descending (newest first)
    notifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate stats
    const allNotifications = await getNotifications();
    const stats = {
      total: allNotifications.length,
      unread: allNotifications.filter(n => !n.isRead).length,
      byType: {
        system: allNotifications.filter(n => n.type === "system").length,
        activity: allNotifications.filter(n => n.type === "activity").length,
        reminder: allNotifications.filter(n => n.type === "reminder").length,
      },
      bySeverity: {
        info: allNotifications.filter(n => n.severity === "info").length,
        warning: allNotifications.filter(n => n.severity === "warning").length,
        error: allNotifications.filter(n => n.severity === "error").length,
        success: allNotifications.filter(n => n.severity === "success").length,
      },
    };

    return NextResponse.json({
      notifications,
      total: notifications.length,
      stats,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, title, message, severity, link, metadata } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Type, title, and message are required" },
        { status: 400 }
      );
    }

    const newNotification = await createNotification({
      type,
      category: category || type,
      title,
      message,
      severity: severity || "info",
      link,
      metadata,
    });

    await addAuditLog("System", "CREATE", "notification", newNotification.id, {
      title: newNotification.title,
      type: newNotification.type,
    });

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
