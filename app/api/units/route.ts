import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET - Get all units
export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

// POST - Create a new unit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await prisma.unit.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: "ชื่อหน่วยนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }

    const unit = await prisma.unit.create({
      data: {
        name,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}
