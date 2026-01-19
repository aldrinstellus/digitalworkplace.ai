import { NextRequest, NextResponse } from "next/server";
import {
  getWorkflowCategories,
  saveWorkflowCategories,
  getWorkflowTypes,
  addAuditLog,
  WorkflowCategory,
} from "@/lib/data-store";

// GET - List categories with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowTypeId = searchParams.get("workflowTypeId");
    const activeOnly = searchParams.get("activeOnly") === "true";

    let categories = await getWorkflowCategories();

    if (workflowTypeId) {
      categories = categories.filter((c) => c.workflowTypeId === workflowTypeId);
    }

    if (activeOnly) {
      categories = categories.filter((c) => c.isActive);
    }

    // Sort by order
    categories.sort((a, b) => a.order - b.order);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching workflow categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow categories" },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, workflowTypeId, description } = body;

    if (!name || !workflowTypeId) {
      return NextResponse.json(
        { error: "Name and workflowTypeId are required" },
        { status: 400 }
      );
    }

    // Verify workflow type exists
    const types = await getWorkflowTypes();
    if (!types.some((t) => t.id === workflowTypeId)) {
      return NextResponse.json(
        { error: "Workflow type not found" },
        { status: 404 }
      );
    }

    const categories = await getWorkflowCategories();

    // Check for duplicate name within same workflow type
    if (categories.some((c) => c.name === name && c.workflowTypeId === workflowTypeId)) {
      return NextResponse.json(
        { error: "A category with this name already exists for this workflow type" },
        { status: 409 }
      );
    }

    // Get max order for this workflow type
    const typeCategories = categories.filter((c) => c.workflowTypeId === workflowTypeId);
    const maxOrder = typeCategories.length > 0
      ? Math.max(...typeCategories.map((c) => c.order))
      : 0;

    const newCategory: WorkflowCategory = {
      id: `cat-${Date.now()}`,
      name,
      workflowTypeId,
      description: description || undefined,
      isActive: true,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    await saveWorkflowCategories(categories);

    await addAuditLog("Admin", "CREATE", "workflow-category", newCategory.id, {
      name: newCategory.name,
      workflowTypeId,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow category:", error);
    return NextResponse.json(
      { error: "Failed to create workflow category" },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const categories = await getWorkflowCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== categories[index].name) {
      const workflowTypeId = updates.workflowTypeId || categories[index].workflowTypeId;
      if (categories.some((c) => c.name === updates.name && c.workflowTypeId === workflowTypeId && c.id !== id)) {
        return NextResponse.json(
          { error: "A category with this name already exists for this workflow type" },
          { status: 409 }
        );
      }
    }

    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveWorkflowCategories(categories);

    await addAuditLog("Admin", "UPDATE", "workflow-category", id, {
      name: categories[index].name,
      changes: updates,
    });

    return NextResponse.json(categories[index]);
  } catch (error) {
    console.error("Error updating workflow category:", error);
    return NextResponse.json(
      { error: "Failed to update workflow category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const categories = await getWorkflowCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const deletedCategory = categories[index];
    categories.splice(index, 1);
    await saveWorkflowCategories(categories);

    await addAuditLog("Admin", "DELETE", "workflow-category", id, {
      name: deletedCategory.name,
    });

    return NextResponse.json({ success: true, deleted: deletedCategory });
  } catch (error) {
    console.error("Error deleting workflow category:", error);
    return NextResponse.json(
      { error: "Failed to delete workflow category" },
      { status: 500 }
    );
  }
}
