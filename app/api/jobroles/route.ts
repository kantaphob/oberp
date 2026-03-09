import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const jobRoles = await prisma.jobRole.findMany({
      orderBy: [
        { level: "asc" },
        { name: "asc" }
      ],
      include: {
        department: true,
        jobLine: true,
        parentRole: true,
      }
    });
    return NextResponse.json(jobRoles);
  } catch (error) {
    console.error("Error fetching job roles:", error);
    return NextResponse.json({ error: "Failed to fetch job roles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, prefix, level, description, departmentId, jobLineId, parentRoleId, isActive } = body;

    if (!name || !prefix) {
      return NextResponse.json({ error: "ชื่อตำแหน่งและตัวย่อ (Prefix) เป็นข้อมูลบังคับ" }, { status: 400 });
    }

    const parsedLevel = parseInt(level, 10);

    const newJobRole = await prisma.jobRole.create({
      data: {
        name,
        prefix,
        level: isNaN(parsedLevel) ? 10 : parsedLevel,
        description,
        departmentId: departmentId || null,
        jobLineId: jobLineId || null,
        parentRoleId: parentRoleId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        department: true,
        jobLine: true,
        parentRole: true,
      }
    });

    return NextResponse.json(newJobRole, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job role:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "ชื่อตำแหน่งหรือตัวย่อนี้มีในระบบแล้ว" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create job role" }, { status: 500 });
  }
}
