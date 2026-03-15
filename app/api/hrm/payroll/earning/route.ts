import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * @description ดึงรายการรายรับพิเศษ (Payroll Earnings)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const targetMonth = searchParams.get("targetMonth");

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (targetMonth) where.targetMonth = targetMonth;

    const earnings = await prisma.payrollEarning.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = earnings.map((item) => ({
      ...item,
      employeeName: item.user.profile 
        ? `${item.user.profile.firstName} ${item.user.profile.lastName}` 
        : item.user.username
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("[PAYROLL_EARNING_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * @description สร้างรายการรายรับพิเศษใหม่
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, code, amount, reason, refNumber, targetMonth } = body;

    const earning = await prisma.payrollEarning.create({
      data: {
        userId,
        code,
        amount: parseFloat(amount),
        reason,
        refNumber,
        targetMonth,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, message: "เพิ่มรายการรายรับสำเร็จ", data: earning });
  } catch (error: any) {
    console.error("[PAYROLL_EARNING_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * @description ลบหรืออัปเดตรายการรายรับ
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, amount, reason, targetMonth } = body;

    const existing = await prisma.payrollEarning.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "ไม่พบรายการที่ระบุ" }, { status: 404 });
    }

    // ห้ามแก้รายการที่จ่ายไปแล้ว
    if (existing.status === "PAID") {
      return NextResponse.json({ success: false, message: "ไม่สามารถแก้ไขรายการที่จ่ายเงินไปแล้วได้" }, { status: 400 });
    }

    const updated = await prisma.payrollEarning.update({
      where: { id },
      data: {
        status: status || existing.status,
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
        reason: reason || existing.reason,
        targetMonth: targetMonth || existing.targetMonth,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message: "อัปเดตรายการสำเร็จ", data: updated });
  } catch (error: any) {
    console.error("[PAYROLL_EARNING_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });

    const existing = await prisma.payrollEarning.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "ไม่พบรายการ" }, { status: 404 });
    }

    if (existing.status === "PAID") {
      return NextResponse.json({ success: false, message: "ไม่สามารถลบรายการที่จ่ายเงินไปแล้วได้" }, { status: 400 });
    }

    await prisma.payrollEarning.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบรายการสำเร็จ" });
  } catch (error: any) {
    console.error("[PAYROLL_EARNING_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
