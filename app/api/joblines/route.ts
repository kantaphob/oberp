import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const jobLines = await prisma.jobLine.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json(jobLines);
  } catch (error) {
    console.error("Error fetching job lines:", error);
    return NextResponse.json({ error: "Failed to fetch job lines" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, isActive } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
    }

    const newJobLine = await prisma.jobLine.create({
      data: {
        name,
        code,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newJobLine, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job line:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "JobLine code or name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create job line" }, { status: 500 });
  }
}
