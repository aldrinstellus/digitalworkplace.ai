import { NextRequest, NextResponse } from "next/server";
import { getFAQs, saveFAQs, addAuditLog, FAQ } from "@/lib/data-store";

// CORS headers for widget access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Retrieve all FAQs with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const url = searchParams.get("url");
    const urlFilter = searchParams.get("urlFilter"); // "all" | "global" | "page-specific"

    let faqs = await getFAQs();

    // Filter by status
    if (status && status !== "all") {
      faqs = faqs.filter((faq) => faq.status === status);
    }

    // Filter by category
    if (category && category !== "all") {
      faqs = faqs.filter((faq) => faq.category === category);
    }

    // Filter by priority
    if (priority && priority !== "all") {
      faqs = faqs.filter((faq) => faq.priority === priority);
    }

    // Filter by URL (for page-specific FAQs)
    if (url) {
      faqs = faqs.filter((faq) => {
        if (!faq.url) return true; // Include global FAQs
        return url.startsWith(faq.url) || faq.url === url;
      });
    }

    // Filter by URL type (global vs page-specific)
    if (urlFilter === "global") {
      faqs = faqs.filter((faq) => !faq.url);
    } else if (urlFilter === "page-specific") {
      faqs = faqs.filter((faq) => !!faq.url);
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      faqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.category.toLowerCase().includes(query) ||
          (faq.url && faq.url.toLowerCase().includes(query))
      );
    }

    // Sort by priority (high first), then by views
    faqs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.views - a.views;
    });

    return NextResponse.json({
      faqs,
      total: faqs.length,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST - Create a new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, category, priority, status, url } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    // Validate URL format if provided
    if (url && !url.startsWith("/") && !url.startsWith("http")) {
      return NextResponse.json(
        { error: "URL must start with '/' or 'http'" },
        { status: 400 }
      );
    }

    const faqs = await getFAQs();

    const newFAQ: FAQ = {
      id: `faq-${Date.now()}`,
      question,
      answer,
      category: category || "General",
      priority: priority || "medium",
      views: 0,
      helpful: 0,
      notHelpful: 0,
      status: status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(url && { url }), // Only include if provided
    };

    faqs.unshift(newFAQ);
    await saveFAQs(faqs);

    await addAuditLog("Admin", "CREATE", "faq", newFAQ.id, {
      question: newFAQ.question,
      category: newFAQ.category,
    });

    return NextResponse.json(newFAQ, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing FAQ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, question, answer, category, priority, status, url, workflowAction } = body;

    if (!id) {
      return NextResponse.json(
        { error: "FAQ ID is required" },
        { status: 400 }
      );
    }

    // Validate URL format if provided
    if (url && !url.startsWith("/") && !url.startsWith("http")) {
      return NextResponse.json(
        { error: "URL must start with '/' or 'http'" },
        { status: 400 }
      );
    }

    // Validate workflowAction if provided
    if (workflowAction) {
      const { type, buttonLabel, externalUrl } = workflowAction;

      if (!type || !["appointment", "service-request", "external-link"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid workflow action type" },
          { status: 400 }
        );
      }

      if (!buttonLabel || buttonLabel.trim() === "") {
        return NextResponse.json(
          { error: "Button label is required for workflow actions" },
          { status: 400 }
        );
      }

      if (type === "external-link") {
        if (!externalUrl || externalUrl.trim() === "") {
          return NextResponse.json(
            { error: "External URL is required for external-link actions" },
            { status: 400 }
          );
        }
        if (!externalUrl.startsWith("http://") && !externalUrl.startsWith("https://")) {
          return NextResponse.json(
            { error: "External URL must start with http:// or https://" },
            { status: 400 }
          );
        }
      }
    }

    const faqs = await getFAQs();
    const index = faqs.findIndex((faq) => faq.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    const updatedFAQ: FAQ = {
      ...faqs[index],
      question: question ?? faqs[index].question,
      answer: answer ?? faqs[index].answer,
      category: category ?? faqs[index].category,
      priority: priority ?? faqs[index].priority,
      status: status ?? faqs[index].status,
      updatedAt: new Date().toISOString(),
      // Handle URL: if explicitly set to empty string, remove it; if undefined, keep existing
      ...(url !== undefined ? (url ? { url } : {}) : (faqs[index].url ? { url: faqs[index].url } : {})),
      // Handle workflowAction: if explicitly set (including null to remove), use it; otherwise keep existing
      ...(workflowAction !== undefined
        ? (workflowAction ? { workflowAction } : {})
        : (faqs[index].workflowAction ? { workflowAction: faqs[index].workflowAction } : {})),
    };

    faqs[index] = updatedFAQ;
    await saveFAQs(faqs);

    await addAuditLog("Admin", "UPDATE", "faq", id, {
      question: updatedFAQ.question,
      changes: { question, answer, category, priority, status, url },
    });

    return NextResponse.json(updatedFAQ);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an FAQ
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "FAQ ID is required" },
        { status: 400 }
      );
    }

    const faqs = await getFAQs();
    const index = faqs.findIndex((faq) => faq.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    const deletedFAQ = faqs[index];
    faqs.splice(index, 1);
    await saveFAQs(faqs);

    await addAuditLog("Admin", "DELETE", "faq", id, {
      question: deletedFAQ.question,
    });

    return NextResponse.json({ success: true, deleted: deletedFAQ });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
