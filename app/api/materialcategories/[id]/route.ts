import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// PUT - Update a material category
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, isActive } = body;

    // Optional Check for duplicate name if name changed
    if (name) {
      const existing = await prisma.materialCategory.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "ชื่อหมวดหมู่วัสดุนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
      }
    }

    const category = await prisma.materialCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating material category:", error);
    return NextResponse.json({ error: "Failed to update material category" }, { status: 500 });
  }
}

// DELETE - Soft delete a material category
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Check if category is actively used by Material Catalog items
    const catalogCount = await prisma.materialCatalog.count({
      where: { categoryId: id }
    });

    if (catalogCount > 0) {
      return NextResponse.json({
        error: `ไม่สามารถลบได้ เนื่องจากถูกใช้งานอยู่ใน Material Catalog จำนวน ${catalogCount} รายการ`
      }, { status: 400 });
    }

    // Soft delete
    const category = await prisma.materialCategory.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "ลบสำเร็จ", category });
  } catch (error) {
    console.error("Error deleting material category:", error);
    return NextResponse.json({ error: "Failed to delete material category" }, { status: 500 });
  }
}
