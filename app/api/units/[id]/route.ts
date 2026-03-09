import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// PUT - Update a unit
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, isActive } = body;

    // Optional Check for duplicate name if name changed
    if (name) {
      const existing = await prisma.unit.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "ชื่อหน่วยนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
      }
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}

// DELETE - Soft delete a unit
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Check if unit is actively used
    const catalogCount = await prisma.materialCatalog.count({
      where: { unitId: id }
    });
    
    const boqItemCount = await prisma.bOQItem.count({
      where: { unitId: id }
    });

    if (catalogCount > 0 || boqItemCount > 0) {
      return NextResponse.json({ 
        error: `ไม่สามารถลบได้ เนื่องจากถูกใช้งานอยู่ใน Material Catalog (${catalogCount} รายการ) หรือ BOQ (${boqItemCount} รายการ)` 
      }, { status: 400 });
    }

    // Soft delete
    const unit = await prisma.unit.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "ลบสำเร็จ", unit });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }
}
