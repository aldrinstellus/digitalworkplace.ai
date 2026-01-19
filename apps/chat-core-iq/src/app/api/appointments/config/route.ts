import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "appointment-config.json");

interface TimeSlot {
  start: string;
  end: string;
}

interface AppointmentConfig {
  id: string;
  department: string;
  serviceName: string;
  description: string;
  duration: number;
  availableDays: string[];
  timeSlots: TimeSlot[];
  maxPerSlot: number;
  leadTimeHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function readConfigs(): Promise<AppointmentConfig[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeConfigs(configs: AppointmentConfig[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(configs, null, 2));
}

// GET - List all appointment configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const department = searchParams.get("department");

    let configs = await readConfigs();

    if (activeOnly) {
      configs = configs.filter((c) => c.isActive);
    }
    if (department) {
      configs = configs.filter((c) => c.department === department);
    }

    // Sort by department and service name
    configs.sort((a, b) => {
      const deptCompare = a.department.localeCompare(b.department);
      if (deptCompare !== 0) return deptCompare;
      return a.serviceName.localeCompare(b.serviceName);
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching appointment configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}

// POST - Create new appointment configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      department,
      serviceName,
      description,
      duration,
      availableDays,
      timeSlots,
      maxPerSlot,
      leadTimeHours,
    } = body;

    if (!department || !serviceName || !duration || !availableDays || !timeSlots) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const configs = await readConfigs();

    const newConfig: AppointmentConfig = {
      id: `apt-${Date.now()}`,
      department,
      serviceName,
      description: description || "",
      duration,
      availableDays,
      timeSlots,
      maxPerSlot: maxPerSlot || 1,
      leadTimeHours: leadTimeHours || 24,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    configs.push(newConfig);
    await writeConfigs(configs);

    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment config:", error);
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    );
  }
}

// PUT - Update appointment configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Configuration ID required" },
        { status: 400 }
      );
    }

    const configs = await readConfigs();
    const index = configs.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    configs[index] = {
      ...configs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await writeConfigs(configs);

    return NextResponse.json(configs[index]);
  } catch (error) {
    console.error("Error updating appointment config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

// DELETE - Delete appointment configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Configuration ID required" },
        { status: 400 }
      );
    }

    const configs = await readConfigs();
    const index = configs.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    configs.splice(index, 1);
    await writeConfigs(configs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment config:", error);
    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}
