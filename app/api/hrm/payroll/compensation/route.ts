import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * @description ดึงข้อมูลค่าตอบแทนพนักงาน (Compensation)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
    }

    const compensation = await prisma.employeeCompensation.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            role: true,
            profile: true
          }
        }
      }
    });

    // ดึงประวัติการปรับเงินเดือนด้วย
    const adjustments = await prisma.salaryAdjustment.findMany({
      where: { userId },
      orderBy: { effectiveDate: "desc" },
      include: {
        approver: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        compensation,
        adjustments
      }
    });
  } catch (error: any) {
    console.error("[COMPENSATION_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * @description ตั้งค่าหรืออัปเดตฐานเงินเดือนพนักงาน
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 2) {
      return NextResponse.json({ success: false, message: "Unauthorized: สิทธิ์ไม่เพียงพอ" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, paymentType, baseWage, fixedOtRatePerHour, fixedAllowance, deductSso, deductTax } = body;

    const result = await prisma.employeeCompensation.upsert({
      where: { userId },
      update: {
        paymentType,
        baseWage: parseFloat(baseWage),
        fixedOtRatePerHour: fixedOtRatePerHour ? parseFloat(fixedOtRatePerHour) : null,
        fixedAllowance: parseFloat(fixedAllowance) || 0,
        deductSso,
        deductTax
      },
      create: {
        userId,
        paymentType,
        baseWage: parseFloat(baseWage),
        fixedOtRatePerHour: fixedOtRatePerHour ? parseFloat(fixedOtRatePerHour) : null,
        fixedAllowance: parseFloat(fixedAllowance) || 0,
        deductSso,
        deductTax
      }
    });

    return NextResponse.json({ success: true, data: result, message: "บันทึกข้อมูลค่าตอบแทนสำเร็จ" });
  } catch (error: any) {
    console.error("[COMPENSATION_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * @description ยื่นเรื่องขอปรับเงินเดือน (Salary Adjustment)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, oldWage, newWage, reason, effectiveDate } = body;

    const adjustment = await prisma.salaryAdjustment.create({
      data: {
        userId,
        oldWage: parseFloat(oldWage),
        newWage: parseFloat(newWage),
        reason,
        effectiveDate: new Date(effectiveDate),
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, data: adjustment, message: "ส่งคำขอปรับเงินเดือนสำเร็จ รอการอนุมัติ" });
  } catch (error: any) {
    console.error("[ADJUSTMENT_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
