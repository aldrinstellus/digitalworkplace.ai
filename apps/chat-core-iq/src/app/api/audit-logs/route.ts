import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, saveAuditLogs, AuditLog } from "@/lib/data-store";

// Extended audit log type for the API (includes admin info)
interface ExtendedAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress?: string;
  adminUser: string;
  adminEmail: string;
  userAgent?: string;
}

// Generate initial demo logs if none exist
async function ensureDemoLogs(): Promise<void> {
  const logs = await getAuditLogs();
  if (logs.length > 0) return;

  const actions = ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW_PII", "EXPORT", "VIEW"];
  const resources = ["FAQ", "Announcement", "Escalation", "Settings", "Analytics", "Conversation"];
  const admins = [
    { user: "Admin User", email: "admin@cityofdoral.com" },
    { user: "John Manager", email: "john.m@cityofdoral.com" },
    { user: "Sarah Editor", email: "sarah.e@cityofdoral.com" },
  ];

  const demoLogs: AuditLog[] = [];
  const now = Date.now();

  for (let i = 0; i < 50; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const admin = admins[Math.floor(Math.random() * admins.length)];
    const hoursAgo = Math.floor(Math.random() * 168);

    demoLogs.push({
      id: `audit-${Date.now()}-${i}`,
      timestamp: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
      user: admin.user,
      action,
      resource,
      resourceId: action !== "LOGIN" && action !== "LOGOUT" ? `${1000 + i}` : "",
      details: { email: admin.email },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    });
  }

  demoLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  await saveAuditLogs(demoLogs);
}

export async function GET(request: NextRequest) {
  try {
    await ensureDemoLogs();

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const days = parseInt(searchParams.get("days") || "7");

    let logs = await getAuditLogs();

    // Filter by date range
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    logs = logs.filter((log) => new Date(log.timestamp) >= cutoffDate);

    // Filter by action
    if (action && action !== "all") {
      logs = logs.filter((log) => log.action === action);
    }

    // Filter by resource
    const resource = searchParams.get("resource");
    if (resource && resource !== "all") {
      logs = logs.filter((log) => log.resource.toLowerCase() === resource.toLowerCase());
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.user.toLowerCase().includes(query) ||
          log.resource.toLowerCase().includes(query) ||
          JSON.stringify(log.details).toLowerCase().includes(query)
      );
    }

    // Transform to extended format for API response
    const extendedLogs: ExtendedAuditLog[] = logs.map((log) => ({
      ...log,
      adminUser: log.user,
      adminEmail: (log.details as { email?: string })?.email || `${log.user.toLowerCase().replace(" ", ".")}@cityofdoral.com`,
      details: typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details),
    }));

    return NextResponse.json({
      logs: extendedLogs,
      total: extendedLogs.length,
      dateRange: {
        start: cutoffDate.toISOString(),
        end: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const logs = await getAuditLogs();

    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: body.adminUser || body.user || "System",
      action: body.action || "VIEW",
      resource: body.resource || "Unknown",
      resourceId: body.resourceId || "",
      details: {
        email: body.adminEmail || "system@cityofdoral.com",
        description: body.details || "",
        userAgent: body.userAgent,
      },
      ipAddress: body.ipAddress || "127.0.0.1",
    };

    logs.unshift(newLog);

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000);
    }

    await saveAuditLogs(logs);

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
