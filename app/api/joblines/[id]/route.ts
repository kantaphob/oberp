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
    const p = await params;
    const { id } = p;
    await prisma.jobLine.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ message: "ยกเลิกข้อมูลสำเร็จ (Soft Delete)" });
  } catch (error) {
    console.error("Error deleting job line (Soft delete):", error);
    return NextResponse.json({ error: "Failed to delete job line" }, { status: 500 });
  }
}
