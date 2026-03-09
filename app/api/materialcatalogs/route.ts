import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const catalogs = await prisma.materialCatalog.findMany({
      include: {
        category: true,
        unit: true,
      },
      orderBy: { code: "asc" },
    });
    return NextResponse.json(catalogs);
  } catch (error) {
    console.error("Error fetching material catalogs:", error);
    return NextResponse.json({ error: "Failed to fetch material catalogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, brand, categoryId, unitId, unitPrice, laborPrice, isActive } = body;

    if (!code || !name || !unitId) {
      return NextResponse.json({ error: "Code, Name, and Unit are required" }, { status: 400 });
    }

    const existing = await prisma.materialCatalog.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: "รหัสวัสดุนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }

    const catalog = await prisma.materialCatalog.create({
      data: {
        code,
        name,
        brand: brand || null,
        categoryId: categoryId || null,
        unitId,
        unitPrice: Number(unitPrice) || 0,
        laborPrice: Number(laborPrice) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        category: true,
        unit: true,
      },
    });

    return NextResponse.json(catalog, { status: 201 });
  } catch (error) {
    console.error("Error creating material catalog:", error);
    return NextResponse.json({ error: "Failed to create material catalog" }, { status: 500 });
  }
}
