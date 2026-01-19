import { NextRequest, NextResponse } from "next/server";
import { getUploadedDocuments, saveUploadedDocuments, addAuditLog, UploadedDocument } from "@/lib/data-store";

// GET - Retrieve all uploaded documents
export async function GET() {
  try {
    const documents = await getUploadedDocuments();

    // Calculate stats
    const stats = {
      total: documents.length,
      pdfs: documents.filter(d => d.type === 'pdf').length,
      docx: documents.filter(d => d.type === 'docx').length,
      txt: documents.filter(d => d.type === 'txt').length,
      totalChunks: documents.reduce((sum, d) => sum + d.chunks, 0),
      totalSize: documents.reduce((sum, d) => sum + d.size, 0),
    };

    return NextResponse.json({
      documents,
      stats,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST - Add a new document (mock upload - in real app would handle file)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, originalName, type, size, chunks } = body;

    if (!filename || !originalName || !type) {
      return NextResponse.json(
        { error: "Required fields: filename, originalName, type" },
        { status: 400 }
      );
    }

    const documents = await getUploadedDocuments();

    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      filename,
      originalName,
      type: type as 'pdf' | 'docx' | 'txt',
      size: size || 0,
      chunks: chunks || 0,
      uploadedAt: new Date().toISOString(),
    };

    documents.unshift(newDoc);
    await saveUploadedDocuments(documents);

    await addAuditLog("Admin", "UPLOAD", "document", newDoc.id, {
      filename: newDoc.originalName,
      type: newDoc.type,
      size: newDoc.size,
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error("Error adding document:", error);
    return NextResponse.json(
      { error: "Failed to add document" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const documents = await getUploadedDocuments();
    const index = documents.findIndex(d => d.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const deletedDoc = documents[index];
    documents.splice(index, 1);
    await saveUploadedDocuments(documents);

    await addAuditLog("Admin", "DELETE", "document", id, {
      filename: deletedDoc.originalName,
    });

    return NextResponse.json({ success: true, deleted: deletedDoc });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
