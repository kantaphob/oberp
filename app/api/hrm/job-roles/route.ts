import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * @description ดึงข้อมุลตำแหน่งงาน (Job Roles) พร้อมฐานเงินเดือนกลาง
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const roles = await prisma.jobRole.findMany({
      include: {
        department: true,
        jobLine: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { level: "asc" }
    });

    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    console.error("[JOB_ROLES_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * @description สร้างหรืออัปเดตตำแหน่งงาน และกระบอกเงินเดือน
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 2) {
      return NextResponse.json({ success: false, message: "Unauthorized: สิทธิ์ไม่เพียงพอ" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      id, name, prefix, level, departmentId, jobLineId, 
      minSalary, maxSalary, startingSalary, defaultPaymentType, description 
    } = body;
    const data = {
      name,
      prefix,
      level: parseInt(level),
      departmentId,
      jobLineId,
      minSalary: minSalary ? parseFloat(minSalary) : null,
      maxSalary: maxSalary ? parseFloat(maxSalary) : null,
      startingSalary: startingSalary ? parseFloat(startingSalary) : 0,
      defaultPaymentType: defaultPaymentType || "MONTHLY",
      description,
      isActive: true
    };

    let result;
    if (id) {
      result = await prisma.jobRole.update({
        where: { id },
        data
      });
    } else {
      result = await prisma.jobRole.create({
        data
      });
    }

    return NextResponse.json({ success: true, data: result, message: id ? "อัปเดตตำแหน่งงานสำเร็จ" : "สร้างตำแหน่งงานสำเร็จ" });
  } catch (error: any) {
    console.error("[JOB_ROLES_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * @description ลบตำแหน่งงาน
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 2) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });

    // ตรวจสอบก่อนว่ามีพนักงานใช้ตำแหน่งนี้อยู่ไหม
    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      return NextResponse.json({ success: false, message: "ไม่สามารถลบได้เนื่องจากมีพนักงานอยู่ในตำแหน่งนี้" }, { status: 400 });
    }

    await prisma.jobRole.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "ลบตำแหน่งงานสำเร็จ" });
  } catch (error: any) {
    console.error("[JOB_ROLES_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
