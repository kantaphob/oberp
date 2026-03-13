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

    const updatedDept = await prisma.department.update({
      where: { id },
      data: {
        name,
        code,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(updatedDept);
  } catch (error: any) {
    console.error("Error updating department:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Department not found." }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Department code or name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
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
    const rolesCount = await prisma.jobRole.count({
      where: { departmentId: id }
    });

    const profilesCount = await prisma.userProfile.count({
      where: { departmentId: id }
    });

    if (rolesCount > 0 || profilesCount > 0) {
      return NextResponse.json({ error: "ไม่สามารถลบได้เนื่องจากมีการใช้งานอยู่ในระบบ (Job Roles หรือ User Profiles)" }, { status: 400 });
    }

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error: any) {
    console.error("Error deleting department:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบข้อมูลที่ต้องการลบ" }, { status: 404 });
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
