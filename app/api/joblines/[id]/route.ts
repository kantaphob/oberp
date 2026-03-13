import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const { id } = p;
    const body = await request.json();
    const { name, code, description, isActive } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
    }

    const updatedJobLine = await prisma.jobLine.update({
      where: { id },
      data: {
        name,
        code,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(updatedJobLine);
  } catch (error: any) {
    console.error("Error updating job line:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "JobLine not found." }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "JobLine code or name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update job line" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.level !== 0) {
      return NextResponse.json({ error: "คุณไม่มีสิทธิ์ลบข้อมูลนี้ (ต้องใช้งานด้วยสิทธิ์ผู้ดูแลระบบสูงสุด)" }, { status: 403 });
    }

    const p = await params;
    const { id } = p;

    // Check if in use
    const usageCount = await prisma.jobRole.count({
      where: { jobLineId: id }
    });

    if (usageCount > 0) {
      return NextResponse.json({ error: "ไม่สามารถลบได้เนื่องจากมีการใช้งานอยู่ในระบบ (Job Roles)" }, { status: 400 });
    }

    await prisma.jobLine.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error: any) {
    console.error("Error deleting job line:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบข้อมูลที่ต้องการลบ" }, { status: 404 });
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
