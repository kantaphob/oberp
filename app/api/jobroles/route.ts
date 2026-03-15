import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const { 
      name, prefix, level, description, departmentId, jobLineId, parentRoleId, isActive,
      minSalary, maxSalary,
      approverUsername 
    } = body;

    if (!name || !prefix) {
      return NextResponse.json({ error: "ชื่อตำแหน่งและตัวย่อ (Prefix) เป็นข้อมูลบังคับ" }, { status: 400 });
    }

    // 🛡️ AUTHORIZATION & STAGING
    if (session.user.level > 0) {
      if (!approverUsername) {
        return NextResponse.json({ 
          error: "สิทธิ์ไม่เพียงพอ: กรุณาระบุรหัสผู้ดูแล (Level 0) เพื่อส่งเรื่องขออนุมัติ", 
          requireSupervisor: true 
        }, { status: 403 });
      }

      const masterCode = process.env.FOUNDER_SECRET_CODE;
      const isMasterKey = approverUsername.trim() === masterCode;

      const supervisor = await prisma.user.findFirst({
        where: isMasterKey 
          ? { role: { level: 0 } }
          : { username: approverUsername.trim(), role: { level: 0 } }
      });

      if (!supervisor) {
        return NextResponse.json({ 
          error: isMasterKey 
            ? "ไม่พบผู้ใช้ระดับ Level 0 ในระบบที่จะมารองรับ Master Key"
            : "ไม่พบรหัสผู้ดูแลนี้ หรือผู้ดูแลไม่มีสิทธิ์ระดับ 0" 
        }, { status: 403 });
      }

      // Stage for approval
      await prisma.pendingAction.create({
        data: {
          action: "CREATE_JOBROLE",
          description: `ขอสร้างตำแหน่งงานใหม่: ${name} (${prefix}) โดย ${session.user.username}`,
          payload: body,
          targetModel: "JobRole",
          requesterId: session.user.id,
          approverId: supervisor.id,
          status: "PENDING"
        }
      });

      return NextResponse.json({ 
        message: "ส่งคำขออนุมัติเรียบร้อยแล้ว รายการจะแจ้งเตือนไปที่ผู้ดูแลระบบ",
        pending: true 
      }, { status: 202 });
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
        minSalary: minSalary ? parseFloat(minSalary) : null,
        maxSalary: maxSalary ? parseFloat(maxSalary) : null,
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
