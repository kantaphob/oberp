import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// PUT - Update a WBS Group
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { code, name, parentId, isActive } = body;

    // Optional Check for duplicate code if code changed
    if (code) {
      const existing = await prisma.wBSGroup.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "รหัส WBS นี้มีอยู่ในระบบแล้ว" }, { status: 400 });
      }
    }

    const wbsGroup = await prisma.wBSGroup.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        parentId: parentId !== undefined ? parentId : undefined,
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(wbsGroup);
  } catch (error) {
    console.error("Error updating WBS group:", error);
    return NextResponse.json({ error: "Failed to update WBS group" }, { status: 500 });
  }
}

// DELETE - Soft delete a WBS Group
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Check if WBS is actively used by BOQ Items or has children
    const childCount = await prisma.wBSGroup.count({
      where: { parentId: id, isActive: true }
    });

    const boqItemCount = await prisma.bOQItem.count({
      where: { wbsId: id }
    });

    if (childCount > 0 || boqItemCount > 0) {
      return NextResponse.json({
        error: `ไม่สามารถลบได้ เนื่องจากมีหมวดหมู่ย่อยภายใต้หมวดหมู่นี้ (${childCount} รายการ) หรือถูกใช้งานอยู่ใน BOQ (${boqItemCount} รายการ)`
      }, { status: 400 });
    }

    // Soft delete
    const wbsGroup = await prisma.wBSGroup.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "ลบสำเร็จ", wbsGroup });
  } catch (error) {
    console.error("Error deleting WBS group:", error);
    return NextResponse.json({ error: "Failed to delete WBS group" }, { status: 500 });
  }
}
