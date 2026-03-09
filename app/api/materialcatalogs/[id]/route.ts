import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { code, name, brand, categoryId, unitId, unitPrice, laborPrice, isActive } = body;

    if (code) {
      const existing = await prisma.materialCatalog.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "รหัสวัสดุนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
      }
    }

    const catalog = await prisma.materialCatalog.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        brand: brand || null,
        categoryId: categoryId || null,
        ...(unitId && { unitId }),
        ...(unitPrice !== undefined && { unitPrice: Number(unitPrice) }),
        ...(laborPrice !== undefined && { laborPrice: Number(laborPrice) }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
        unit: true,
      },
    });

    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Error updating material catalog:", error);
    return NextResponse.json({ error: "Failed to update material catalog" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Check if it's used in BOQItems
    const boqItemCount = await prisma.bOQItem.count({
      where: { materialId: id }
    });

    if (boqItemCount > 0) {
      return NextResponse.json({
        error: `ไม่สามารถลบได้ เนื่องจากถูกใช้งานอยู่ใน BOQ จำนวน ${boqItemCount} รายการ`
      }, { status: 400 });
    }

    // Soft delete
    const catalog = await prisma.materialCatalog.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "ลบสำเร็จ", catalog });
  } catch (error) {
    console.error("Error deleting material catalog:", error);
    return NextResponse.json({ error: "Failed to delete material catalog" }, { status: 500 });
  }
}
