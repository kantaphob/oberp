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

    if (userId) {
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
    }

    // กรณีต้องการดูทั้งหมด (Dashboard)
    const allCompensations = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
            startDate: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            level: true,
            startingSalary: true,
            minSalary: true,
            maxSalary: true
          }
        },
        employeeCompensation: true
      },
      orderBy: { username: "asc" }
    });

    return NextResponse.json({ 
      success: true, 
      data: allCompensations
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

    const cleanNum = (val: any) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      return parseFloat(val.toString().replace(/,/g, '')) || 0;
    };

    const result = await prisma.employeeCompensation.upsert({
      where: { userId },
      update: {
        paymentType,
        baseWage: cleanNum(baseWage),
        fixedOtRatePerHour: fixedOtRatePerHour ? cleanNum(fixedOtRatePerHour) : null,
        fixedAllowance: cleanNum(fixedAllowance),
        deductSso,
        deductTax
      },
      create: {
        userId,
        paymentType,
        baseWage: cleanNum(baseWage),
        fixedOtRatePerHour: fixedOtRatePerHour ? cleanNum(fixedOtRatePerHour) : null,
        fixedAllowance: cleanNum(fixedAllowance),
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

    const cleanNum = (val: any) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      return parseFloat(val.toString().replace(/,/g, '')) || 0;
    };

    const adjustment = await prisma.salaryAdjustment.create({
      data: {
        userId,
        oldWage: cleanNum(oldWage),
        newWage: cleanNum(newWage),
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
