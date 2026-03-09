import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET - Get all WBS Groups
export async function GET() {
  try {
    const wbsGroups = await prisma.wBSGroup.findMany({
      include: {
        parent: true,
      },
      orderBy: { code: "asc" },
    });
    return NextResponse.json(wbsGroups);
  } catch (error) {
    console.error("Error fetching WBS groups:", error);
    return NextResponse.json({ error: "Failed to fetch WBS groups" }, { status: 500 });
  }
}

// POST - Create a new WBS Group
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, parentId, isActive } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "Code and Name are required" }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await prisma.wBSGroup.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: "รหัส WBS นี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }

    const wbsGroup = await prisma.wBSGroup.create({
      data: {
        code,
        name,
        parentId: parentId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(wbsGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating WBS group:", error);
    return NextResponse.json({ error: "Failed to create WBS group" }, { status: 500 });
  }
}
