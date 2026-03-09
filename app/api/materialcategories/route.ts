import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET - Get all material categories
export async function GET() {
  try {
    const categories = await prisma.materialCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching material categories:", error);
    return NextResponse.json({ error: "Failed to fetch material categories" }, { status: 500 });
  }
}

// POST - Create a new material category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await prisma.materialCategory.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่วัสดุนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }

    const category = await prisma.materialCategory.create({
      data: {
        name,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating material category:", error);
    return NextResponse.json({ error: "Failed to create material category" }, { status: 500 });
  }
}
