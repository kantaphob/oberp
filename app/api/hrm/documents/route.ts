import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * GET: Fetch all document categories and their files
 * POST: Create a new document category
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // สำหรับ Document Center:
    // 1. ดึงนโยบายบริษัท (COMPANY_POLICY)
    // 2. ดึงเอกสารส่วนตัวของผู้ใช้เอง (userId = session.user.id)
    const documents = await prisma.hrDocument.findMany({
      where: {
        OR: [
          { type: "COMPANY_POLICY" },
          { userId: session.user.id }
        ]
      },
      include: {
        files: {
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' }
          ]
        },
        _count: {
          select: { files: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_GET]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, description, type } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "กรุณาระบุชื่อหมวดหมู่" }, { status: 400 });
    }

    const newDoc = await prisma.hrDocument.create({
      data: {
        name,
        description: description || null,
        type: type || (session.user.level === 0 ? "COMPANY_POLICY" : "PERSONAL"),
        userId: session.user.id,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ success: true, data: newDoc });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_POST]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    const updatedDoc = await prisma.hrDocument.update({
      where: { id },
      data: {
        name,
        description: description || null,
      }
    });

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_PATCH]", error);
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

    // Optional: Only allow owner or admin to delete
    const doc = await prisma.hrDocument.findUnique({ 
      where: { id },
      include: { _count: { select: { files: true } } }
    });
    
    if (!doc) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    
    // 🛡️ Check if "in use"
    if (doc._count.files > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่สามารถลบหมวดหมู่นี้ได้เนื่องจากยังมีไฟล์ค้างอยู่ในแฟ้ม โปรดลบไฟล์ทั้งหมดออกก่อน" 
      }, { status: 400 });
    }

    if (doc.userId !== session.user.id && session.user.level !== 0) {
      return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });
    }

    await prisma.hrDocument.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_DELETE]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
