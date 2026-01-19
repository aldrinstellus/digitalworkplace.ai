import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "appointments.json");
const CONFIG_FILE = path.join(process.cwd(), "data", "appointment-config.json");

interface AppointmentConfig {
  id: string;
  maxPerSlot: number;
}

interface Appointment {
  id: string;
  configId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  timeSlot: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  reason: string;
  notes: string;
  createdAt: string;
}

async function readAppointments(): Promise<Appointment[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeAppointments(appointments: Appointment[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2));
}

async function readConfigs(): Promise<AppointmentConfig[]> {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET - List appointments with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const configId = searchParams.get("configId");
    const date = searchParams.get("date");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let appointments = await readAppointments();

    // Apply filters
    if (status) {
      appointments = appointments.filter((a) => a.status === status);
    }
    if (configId) {
      appointments = appointments.filter((a) => a.configId === configId);
    }
    if (date) {
      appointments = appointments.filter((a) => a.date === date);
    }
    if (dateFrom) {
      appointments = appointments.filter((a) => a.date >= dateFrom);
    }
    if (dateTo) {
      appointments = appointments.filter((a) => a.date <= dateTo);
    }

    // Sort by date and time
    appointments.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    return NextResponse.json({
      appointments,
      total: appointments.length,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { configId, userName, userEmail, userPhone, date, timeSlot, reason } = body;

    if (!configId || !userName || !userEmail || !date || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const appointments = await readAppointments();
    const configs = await readConfigs();

    // Get config to check maxPerSlot
    const config = configs.find((c) => c.id === configId);
    const maxPerSlot = config?.maxPerSlot || 1;

    // Count existing bookings for this slot
    const existingBookings = appointments.filter(
      (a) =>
        a.configId === configId &&
        a.date === date &&
        a.timeSlot === timeSlot &&
        a.status !== "cancelled"
    ).length;

    if (existingBookings >= maxPerSlot) {
      return NextResponse.json(
        { error: `Time slot is fully booked (max ${maxPerSlot} per slot)` },
        { status: 409 }
      );
    }

    const newAppointment: Appointment = {
      id: `book-${Date.now()}`,
      configId,
      userName,
      userEmail,
      userPhone: userPhone || "",
      date,
      timeSlot,
      status: "scheduled",
      reason: reason || "",
      notes: "",
      createdAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);
    await writeAppointments(appointments);

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// PUT - Update appointment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Appointment ID required" },
        { status: 400 }
      );
    }

    const appointments = await readAppointments();
    const index = appointments.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    appointments[index] = {
      ...appointments[index],
      ...updates,
    };

    await writeAppointments(appointments);

    return NextResponse.json(appointments[index]);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete appointment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Appointment ID required" },
        { status: 400 }
      );
    }

    const appointments = await readAppointments();
    const index = appointments.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Soft delete - mark as cancelled
    appointments[index].status = "cancelled";
    await writeAppointments(appointments);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
