import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendance.findUnique({
      where: {
        userId_date: { userId, date: today }
      }
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, lat, lng, photoUrl } = body;
    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get user and their shift
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { workShiftId: true }
    });

    if (!user?.workShiftId) {
      const defaultShift = await prisma.workShift.findFirst();
      if (!defaultShift) {
        return NextResponse.json({ success: false, message: "ไม่พบข้อมูลกะการทำงานในระบบ" }, { status: 400 });
      }
      user!.workShiftId = defaultShift.id;
    }

    const now = new Date();
    const existingRecord = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (type === "IN") {
      if (existingRecord?.checkInTime) {
        return NextResponse.json({ success: false, message: "วันนี้คุณลงเวลาเข้างานไปแล้ว" }, { status: 400 });
      }

      let status = "PRESENT";
      let lateMinutes = 0;

      const shift = await prisma.workShift.findUnique({ where: { id: user!.workShiftId! } });
      if (shift) {
        const [h, m] = shift.startTime.split(':').map(Number);
        const startTime = new Date(today);
        startTime.setHours(h, m, 0, 0);

        if (now > startTime) {
          lateMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
          if (lateMinutes > shift.lateThreshold) {
            status = "LATE";
          }
        }
      }

      const record = await prisma.attendance.upsert({
        where: { userId_date: { userId, date: today } },
        update: {
          checkInTime: now,
          checkInLocation: lat && lng ? `${lat},${lng}` : null,
          checkInPhotoUrl: photoUrl || null,
          status: status as any,
          lateMinutes,
          shiftId: user!.workShiftId!
        },
        create: {
          userId,
          date: today,
          checkInTime: now,
          checkInLocation: lat && lng ? `${lat},${lng}` : null,
          checkInPhotoUrl: photoUrl || null,
          status: status as any,
          lateMinutes,
          shiftId: user!.workShiftId!
        }
      });

      return NextResponse.json({ success: true, message: "ลงเวลาเข้างานสำเร็จ", data: record });
    }

    if (type === "OUT") {
      if (!existingRecord?.checkInTime) {
        return NextResponse.json({ success: false, message: "กรุณาลงเวลาเข้างานก่อน" }, { status: 400 });
      }
      if (existingRecord.checkOutTime) {
        return NextResponse.json({ success: false, message: "คุณลงเวลาออกงานไปแล้ว" }, { status: 400 });
      }

      const shift = await prisma.workShift.findUnique({ 
        where: { id: existingRecord.shiftId } 
      });

      let otHours = 0;
      let pendingActionId = null;

      if (shift) {
        const [h, m] = shift.endTime.split(':').map(Number);
        const shiftEndTime = new Date(today);
        shiftEndTime.setHours(h, m, 0, 0);

        // Calculate diff in minutes
        const diffInMinutes = Math.floor((now.getTime() - shiftEndTime.getTime()) / 60000);

        // rule: 30 minutes threshold
        if (diffInMinutes >= 30) {
          otHours = parseFloat((diffInMinutes / 60).toFixed(2));
          
          // Create PendingAction for PM to confirm Actual OT
          const pAction = await prisma.pendingAction.create({
            data: {
              action: "CONFIRM_OT",
              description: `ขออนุมัติ OT จากการลงเวลาออกจริง (${otHours} ชม.)`,
              targetModel: "Attendance",
              targetId: existingRecord.id,
              requesterId: userId,
              payload: {
                otHours,
                checkOutTime: now,
                shiftEndTime: shift.endTime
              }
            }
          });
          pendingActionId = pAction.id;
        }
      }

      const updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkOutTime: now,
          otHours: otHours
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: otHours > 0 ? `ลงเวลาออกสำเร็จ (ตรวจพบ OT ${otHours} ชม. ส่งคำขออนุมัติแล้ว)` : "ลงเวลาออกงานสำเร็จ", 
        data: { ...updatedRecord, pendingActionId }
      });
    }

    return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });

  } catch (error: any) {
    console.error("[ATTENDANCE_CLOCK_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
