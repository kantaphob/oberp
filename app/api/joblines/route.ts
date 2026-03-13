import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

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
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const { name, code, description, isActive, approverUsername } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
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
          action: "CREATE_JOBLINE",
          description: `ขอสร้างสายงานใหม่: ${name} (${code}) โดย ${session.user.username}`,
          payload: body,
          targetModel: "JobLine",
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
