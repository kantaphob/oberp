import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const { id } = p;
    const body = await request.json();
    const { name, prefix, level, description, departmentId, jobLineId, parentRoleId, isActive } = body;

    if (!name || !prefix) {
      return NextResponse.json({ error: "ชื่อตำแหน่งและตัวย่อ (Prefix) เป็นข้อมูลบังคับ" }, { status: 400 });
    }

    const parsedLevel = parseInt(level, 10);

    const updatedJobRole = await prisma.jobRole.update({
      where: { id },
      data: {
        name,
        prefix,
        level: isNaN(parsedLevel) ? 10 : parsedLevel,
        description,
        departmentId: departmentId || null,
        jobLineId: jobLineId || null,
        parentRoleId: parentRoleId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        department: true,
        jobLine: true,
        parentRole: true,
      }
    });

    return NextResponse.json(updatedJobRole);
  } catch (error: any) {
    console.error("Error updating job role:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบตำแหน่งนี้ในระบบ" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "ชื่อตำแหน่งหรือตัวย่อนี้มีในระบบแล้ว" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update job role" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const { id } = p;
    await prisma.jobRole.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ message: "ยกเลิกข้อมูลสำเร็จ (Soft Delete)" });
  } catch (error) {
    console.error("Error deleting job role (Soft delete):", error);
    return NextResponse.json({ error: "Failed to delete job role" }, { status: 500 });
  }
}
