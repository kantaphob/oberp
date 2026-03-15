import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * @description อนุมัติการปรับเงินเดือน
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // เฉพาะผู้บริหารระดับสูง (Level 0-1) ที่อนุมัติการปรับเงินเดือนได้
    if (!session?.user || session.user.level > 1) {
      return NextResponse.json({ success: false, message: "Unauthorized: สิทธิ์ไม่เพียงพอในการอนุมัติ" }, { status: 403 });
    }

    const body = await req.json();
    const { adjustmentId, status } = body; // status = 'APPROVED' or 'REJECTED'

    if (!adjustmentId || !status) {
      return NextResponse.json({ success: false, message: "Missing adjustmentId or status" }, { status: 400 });
    }

    const adjustment = await prisma.salaryAdjustment.findUnique({
      where: { id: adjustmentId },
    });

    if (!adjustment) {
      return NextResponse.json({ success: false, message: "ไม่พบรายการปรับเงินเดือน" }, { status: 404 });
    }

    if (adjustment.status !== "PENDING") {
      return NextResponse.json({ success: false, message: "รายการนี้ถูกดำเนินการไปแล้ว" }, { status: 400 });
    }

    const updatedAdjustment = await prisma.salaryAdjustment.update({
      where: { id: adjustmentId },
      data: {
        status,
        approvedById: session.user.id,
        updatedAt: new Date()
      }
    });

    // ถ้าอนุมัติ ให้ไปอัปเดต EmployeeCompensation ทันที (หรือจะรอ Effective Date ก็ได้ แต่ปกติระบบ ERP จะอัปเดต Buffer ไว้)
    // ในที่นี้เราจะรอกระบวนการ Batch Update หรืออัปเดตทันทีถ้าชอบแบบ Realtime
    if (status === "APPROVED") {
      await prisma.employeeCompensation.update({
        where: { userId: adjustment.userId },
        data: {
          baseWage: adjustment.newWage
        }
      });
    }

    return NextResponse.json({ success: true, message: `ดำเนินการ ${status} เรียบร้อยแล้ว`, data: updatedAdjustment });
  } catch (error: any) {
    console.error("[ADJUSTMENT_APPROVE_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
