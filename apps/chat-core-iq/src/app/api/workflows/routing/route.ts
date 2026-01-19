import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "workflow-routing.json");

interface RoutingRule {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  targetDepartment: string;
  priority: "low" | "medium" | "high" | "urgent";
  slaHours: number;
  autoAssign: boolean;
  isActive: boolean;
  createdAt: string;
}

async function readRules(): Promise<RoutingRule[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeRules(rules: RoutingRule[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(rules, null, 2));
}

// GET - List all routing rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const department = searchParams.get("department");
    const category = searchParams.get("category");

    let rules = await readRules();

    if (activeOnly) {
      rules = rules.filter((r) => r.isActive);
    }
    if (department) {
      rules = rules.filter((r) => r.targetDepartment === department);
    }
    if (category) {
      rules = rules.filter((r) => r.category === category);
    }

    // Sort by priority (urgent first) then by name
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    rules.sort((a, b) => {
      const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityCompare !== 0) return priorityCompare;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching routing rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch routing rules" },
      { status: 500 }
    );
  }
}

// POST - Create new routing rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      keywords,
      targetDepartment,
      priority,
      slaHours,
      autoAssign,
    } = body;

    if (!name || !category || !targetDepartment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rules = await readRules();

    const newRule: RoutingRule = {
      id: `route-${Date.now()}`,
      name,
      category,
      keywords: keywords || [],
      targetDepartment,
      priority: priority || "medium",
      slaHours: slaHours || 48,
      autoAssign: autoAssign || false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    rules.push(newRule);
    await writeRules(rules);

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error("Error creating routing rule:", error);
    return NextResponse.json(
      { error: "Failed to create routing rule" },
      { status: 500 }
    );
  }
}

// PUT - Update routing rule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Routing rule ID required" },
        { status: 400 }
      );
    }

    const rules = await readRules();
    const index = rules.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Routing rule not found" },
        { status: 404 }
      );
    }

    rules[index] = {
      ...rules[index],
      ...updates,
    };

    await writeRules(rules);

    return NextResponse.json(rules[index]);
  } catch (error) {
    console.error("Error updating routing rule:", error);
    return NextResponse.json(
      { error: "Failed to update routing rule" },
      { status: 500 }
    );
  }
}

// DELETE - Delete routing rule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Routing rule ID required" },
        { status: 400 }
      );
    }

    const rules = await readRules();
    const index = rules.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Routing rule not found" },
        { status: 404 }
      );
    }

    rules.splice(index, 1);
    await writeRules(rules);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting routing rule:", error);
    return NextResponse.json(
      { error: "Failed to delete routing rule" },
      { status: 500 }
    );
  }
}

// Helper function to match text against routing rules
export function matchRoutingRule(text: string, rules: RoutingRule[]): RoutingRule | null {
  const lowerText = text.toLowerCase();

  for (const rule of rules) {
    if (!rule.isActive) continue;

    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return rule;
      }
    }
  }

  // Return general inquiry rule if no match
  return rules.find((r) => r.category === "general" && r.isActive) || null;
}
