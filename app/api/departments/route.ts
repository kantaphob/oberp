import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, isActive } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
    }

    const newDept = await prisma.department.create({
      data: {
        name,
        code,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newDept, { status: 201 });
  } catch (error: any) {
    console.error("Error creating department:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Department code or name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
