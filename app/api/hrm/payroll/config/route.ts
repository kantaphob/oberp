import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * @description ดึงการตั้งค่ากลาง (Payroll Config)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const config = await prisma.payrollConfig.findFirst();

    // หากยังไม่มีข้อมูล ให้ส่งค่าเริ่มต้นกลับไปเพื่อให้ Frontend ทำงานต่อได้
    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          ssoRateEmployee: 5.0,
          ssoRateCompany: 5.0,
          ssoMaxBase: 15000,
          whtRateDaily: 3.0,
          otRateNormal: 1.5,
          otRateHoliday: 3.0,
          latePenaltyPerMin: 5.0
        }
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error("[PAYROLL_CONFIG_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * @description อัปเดตข้อมูลการตั้งค่ากลาง (Payroll Config)
 * รองรับทั้งการสร้างครั้งแรก (Create) และการอัปเดต (Update)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // เฉพาะผู้ที่มีสิทธิ์ Admin หรือ Manager ขึ้นไป (สมมติ level <= 5)
    if (session.user.level > 5) {
       return NextResponse.json({ success: false, message: "คุณไม่มีสิทธิ์ในการแก้ไขการตั้งค่านี้" }, { status: 403 });
    }

    const body = await req.json();
    const existing = await prisma.payrollConfig.findFirst();

    // เตรียมข้อมูลสำหรับบันทึก
    const data = {
      ssoRateEmployee: parseFloat(body.ssoRateEmployee) || 0,
      ssoRateCompany: parseFloat(body.ssoRateCompany) || 0,
      ssoMaxBase: parseFloat(body.ssoMaxBase) || 0,
      whtRateDaily: parseFloat(body.whtRateDaily) || 0,
      otRateNormal: parseFloat(body.otRateNormal) || 0,
      otRateHoliday: parseFloat(body.otRateHoliday) || 0,
      latePenaltyPerMin: parseFloat(body.latePenaltyPerMin) || 0,
      updatedById: session.user.id
    };

    let result;
    if (existing) {
      result = await prisma.payrollConfig.update({
        where: { id: existing.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } else {
      result = await prisma.payrollConfig.create({
        data
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: result, 
      message: existing ? "อัปเดตการตั้งค่าสำเร็จ" : "สร้างการตั้งค่าเริ่มต้นสำเร็จ" 
    });
  } catch (error: any) {
    console.error("[PAYROLL_CONFIG_PUT_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
