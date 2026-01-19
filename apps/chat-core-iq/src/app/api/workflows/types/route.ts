import { NextRequest, NextResponse } from "next/server";
import {
  getWorkflowTypes,
  saveWorkflowTypes,
  addAuditLog,
  WorkflowType,
} from "@/lib/data-store";

// GET - List all workflow types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    let types = await getWorkflowTypes();

    if (activeOnly) {
      types = types.filter((t) => t.isActive);
    }

    // Sort by order
    types.sort((a, b) => a.order - b.order);

    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching workflow types:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow types" },
      { status: 500 }
    );
  }
}

// POST - Create new workflow type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, color, handlerType } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, hyphens only)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be lowercase with hyphens only (e.g., 'my-workflow')" },
        { status: 400 }
      );
    }

    const types = await getWorkflowTypes();

    // Check for duplicate slug
    if (types.some((t) => t.slug === slug)) {
      return NextResponse.json(
        { error: "A workflow type with this slug already exists" },
        { status: 409 }
      );
    }

    // Get max order
    const maxOrder = types.length > 0 ? Math.max(...types.map((t) => t.order)) : 0;

    const newType: WorkflowType = {
      id: `wf-${Date.now()}`,
      name,
      slug,
      description: description || "",
      icon: icon || "Workflow",
      color: color || "from-gray-500 to-gray-600",
      handlerType: handlerType || "custom",
      isActive: true,
      isSystem: false, // User-created types are not system types
      order: maxOrder + 1,
      config: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    types.push(newType);
    await saveWorkflowTypes(types);

    await addAuditLog("Admin", "CREATE", "workflow-type", newType.id, {
      name: newType.name,
      slug: newType.slug,
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow type:", error);
    return NextResponse.json(
      { error: "Failed to create workflow type" },
      { status: 500 }
    );
  }
}

// PUT - Update workflow type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Workflow type ID is required" },
        { status: 400 }
      );
    }

    const types = await getWorkflowTypes();
    const index = types.findIndex((t) => t.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Workflow type not found" },
        { status: 404 }
      );
    }

    // Validate slug format if being updated
    if (updates.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(updates.slug)) {
        return NextResponse.json(
          { error: "Slug must be lowercase with hyphens only" },
          { status: 400 }
        );
      }
      // Check for duplicate slug (excluding current)
      if (types.some((t) => t.slug === updates.slug && t.id !== id)) {
        return NextResponse.json(
          { error: "A workflow type with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Prevent modifying certain fields on system types
    if (types[index].isSystem) {
      delete updates.slug;
      delete updates.handlerType;
      delete updates.isSystem;
    }

    types[index] = {
      ...types[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveWorkflowTypes(types);

    await addAuditLog("Admin", "UPDATE", "workflow-type", id, {
      name: types[index].name,
      changes: updates,
    });

    return NextResponse.json(types[index]);
  } catch (error) {
    console.error("Error updating workflow type:", error);
    return NextResponse.json(
      { error: "Failed to update workflow type" },
      { status: 500 }
    );
  }
}

// DELETE - Delete workflow type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Workflow type ID is required" },
        { status: 400 }
      );
    }

    const types = await getWorkflowTypes();
    const index = types.findIndex((t) => t.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Workflow type not found" },
        { status: 404 }
      );
    }

    // Prevent deleting system types
    if (types[index].isSystem) {
      return NextResponse.json(
        { error: "Cannot delete system workflow types" },
        { status: 403 }
      );
    }

    const deletedType = types[index];
    types.splice(index, 1);
    await saveWorkflowTypes(types);

    await addAuditLog("Admin", "DELETE", "workflow-type", id, {
      name: deletedType.name,
    });

    return NextResponse.json({ success: true, deleted: deletedType });
  } catch (error) {
    console.error("Error deleting workflow type:", error);
    return NextResponse.json(
      { error: "Failed to delete workflow type" },
      { status: 500 }
    );
  }
}
