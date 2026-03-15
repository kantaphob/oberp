import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 7) {
      return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });
    }

    const { targetMonth } = await req.json(); // YYYY-MM
    if (!targetMonth) {
      return NextResponse.json({ success: false, message: "Missing targetMonth" }, { status: 400 });
    }

    // 1. Get Payroll Config for OT rates
    const config = await prisma.payrollConfig.findFirst();
    const otRateNormal = config?.otRateNormal || 1.5;

    // 2. Define Date Range for the month
    const startDate = new Date(`${targetMonth}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 3. Fetch all approved OT Requests for this month
    const approvedOtRequests = await prisma.otRequest.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
        status: "APPROVED",
      },
      include: {
        user: {
          include: {
            employeeCompensation: true,
          },
        },
      },
    });

    // 4. Fetch Attendance records with OT hours that haven't been processed yet via OtRequest
    // (Note: In this logic, we'll prioritize OtRequest as formal approval)
    // If the user wants both, they might overlap. Usually, Attendance.otHours is "Actual" and OtRequest is "Planned".
    // But in some systems, PM approves OtRequest AFTER seeing Attendance.
    // Based on user request "Checkin check out และรายการอนุมัติขอ ot", we'll check both.
    
    // For simplicity: We'll create OT Earnings based on Approved OtRequests.
    // If they want Attendance OT directly, we should only take Attendance where no OtRequest exists for that user+date to avoid double counting.
    
    const processedCount = 0;
    const errors: string[] = [];
    const results: any[] = [];

    for (const req of approvedOtRequests) {
      if (!req.user.employeeCompensation) {
        errors.push(`User ${req.user.username} has no compensation data.`);
        continue;
      }

      const comp = req.user.employeeCompensation;
      const hours = req.actualHours || req.plannedHours;
      
      if (hours <= 0) continue;

      // Calculate Amount
      let hourlyRate = 0;
      if (comp.fixedOtRatePerHour) {
        hourlyRate = comp.fixedOtRatePerHour;
      } else {
        // Default: Monthly / 30 / 8
        hourlyRate = comp.baseWage / 30 / 8;
      }

      const otAmount = parseFloat((hours * hourlyRate * otRateNormal).toFixed(2));

      // Check if already synced for this user, date, and OT type
      const refNumber = `OT-${req.id.slice(0, 8)}`;
      const existing = await prisma.payrollEarning.findFirst({
        where: {
          userId: req.userId,
          refNumber,
        },
      });

      if (existing) continue;

      const earning = await prisma.payrollEarning.create({
        data: {
          userId: req.userId,
          code: "OT",
          amount: otAmount,
          reason: `OT (${hours} ชม.) - ${req.reason || 'งานล่วงเวลา'}`,
          refNumber,
          targetMonth,
          status: "PENDING",
        },
      });
      results.push(earning);
    }

    // Optional: Also sync from Attendance records with otHours > 0 AND no linked OtRequest
    const attendancesWithOt = await prisma.attendance.findMany({
        where: {
            date: {
                gte: startDate,
                lt: endDate,
            },
            otHours: { gt: 0 }
        },
        include: {
            user: { include: { employeeCompensation: true } }
        }
    });

    for (const att of attendancesWithOt) {
        // Check if there's an OtRequest for this user and date
        const linkedRequest = approvedOtRequests.find(r => 
            r.userId === att.userId && 
            r.date.toISOString().split('T')[0] === att.date.toISOString().split('T')[0]
        );

        if (linkedRequest) continue; // Already handled

        if (!att.user.employeeCompensation) continue;

        const comp = att.user.employeeCompensation;
        let hourlyRate = 0;
        if (comp.fixedOtRatePerHour) {
            hourlyRate = comp.fixedOtRatePerHour;
        } else {
            hourlyRate = comp.baseWage / 30 / 8;
        }

        const otAmount = parseFloat((att.otHours * hourlyRate * otRateNormal).toFixed(2));
        const refNumber = `ATT-OT-${att.id.slice(0, 8)}`;

        const existing = await prisma.payrollEarning.findFirst({
            where: {
                userId: att.userId,
                refNumber,
            },
        });

        if (existing) continue;

        const earning = await prisma.payrollEarning.create({
            data: {
                userId: att.userId,
                code: "OT",
                amount: otAmount,
                reason: `OT จากการลงเวลา (${att.otHours} ชม.)`,
                refNumber,
                targetMonth,
                status: "PENDING",
            },
        });
        results.push(earning);
    }

    return NextResponse.json({ 
      success: true, 
      message: `ซิงค์ OT สำเร็จ ${results.length} รายการ`, 
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error("[SYNC_OT_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
