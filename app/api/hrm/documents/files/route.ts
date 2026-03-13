import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * POST: Upload a file record and link it to a document category
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { documentId, fileName, fileUrl, category, expireDate, remark } = await req.json();

    if (!documentId || !fileUrl) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Verify document belongs to user or user has authority
    const document = await prisma.hrDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ success: false, message: "Document category not found" }, { status: 404 });
    }

    // Basic permission check (Simple for now: Owner or Admin)
    if (document.userId !== session.user.id && session.user.level !== 0) {
      return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });
    }

    const newFile = await prisma.hrDocumentFile.create({
      data: {
        documentId,
        fileName: fileName || "Unnamed File",
        fileUrl,
        category: category || null,
        expireDate: expireDate ? new Date(expireDate) : null,
        remark: remark || null,
        uploadedById: session.user.id,
        userId: document.userId || session.user.id // Default to document owner
      }
    });

    return NextResponse.json({ success: true, data: newFile });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_FILES_POST]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id, fileName } = await req.json();

    if (!id || !fileName) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const updatedFile = await prisma.hrDocumentFile.update({
      where: { id },
      data: { fileName }
    });

    return NextResponse.json({ success: true, data: updatedFile });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_FILES_PATCH]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    const file = await prisma.hrDocumentFile.findUnique({ where: { id } });
    if (!file) return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });

    // Permission check
    if (file.uploadedById !== session.user.id && session.user.level !== 0) {
      return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });
    }

    await prisma.hrDocumentFile.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_FILES_DELETE]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
