import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const { id } = p;
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
          action: "UPDATE_JOBLINE",
          description: `ขอแก้ไขสายงาน: ${name} (${code}) โดย ${session.user.username}`,
          payload: body,
          targetModel: "JobLine",
          targetId: id,
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

    const updatedJobLine = await prisma.jobLine.update({
      where: { id },
      data: {
        name,
        code,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(updatedJobLine);
  } catch (error: any) {
    console.error("Error updating job line:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "JobLine not found." }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "JobLine code or name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update job line" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.level !== 0) {
      return NextResponse.json({ error: "คุณไม่มีสิทธิ์ลบข้อมูลนี้ (ต้องใช้งานด้วยสิทธิ์ผู้ดูแลระบบสูงสุด)" }, { status: 403 });
    }

    const p = await params;
    const { id } = p;

    // Check if in use
    const usageCount = await prisma.jobRole.count({
      where: { jobLineId: id }
    });

    if (usageCount > 0) {
      return NextResponse.json({ error: "ไม่สามารถลบได้เนื่องจากมีการใช้งานอยู่ในระบบ (Job Roles)" }, { status: 400 });
    }

    await prisma.jobLine.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error: any) {
    console.error("Error deleting job line:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบข้อมูลที่ต้องการลบ" }, { status: 404 });
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
