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

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "master"; // 'master' | 'roster' | 'conflicts'
    const teamId = searchParams.get("teamId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (mode === "master") {
      const shifts = await prisma.workShift.findMany({
        where: { isActive: true },
        include: { _count: { select: { users: true } } }
      });
      return NextResponse.json({ success: true, data: shifts });
    }

    if (mode === "roster") {
      const q = searchParams.get("q") || "";
      
      const users = await prisma.user.findMany({
        where: {
          status: "ACTIVE",
          OR: teamId ? [{ teamId }] : [
            { username: { contains: q, mode: 'insensitive' } },
            { profile: { firstName: { contains: q, mode: 'insensitive' } } },
            { profile: { lastName: { contains: q, mode: 'insensitive' } } }
          ]
        },
        include: {
          profile: { select: { firstName: true, lastName: true } },
          team: { select: { name: true } },
          workSchedules: {
            where: startDate && endDate ? {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            } : {},
            include: { shift: true }
          }
        }
      });

      return NextResponse.json({ success: true, data: users });
    }

    return NextResponse.json({ success: false, message: "Invalid mode" }, { status: 400 });

  } catch (error: any) {
    console.error("[WORK_SHIFT_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 11) {
      return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    if (action === "PATTERN_ASSIGN") {
      const { userIds, shiftId, dayOffShiftId, dayOffs, startDate, endDate } = data;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const ops = [];
      for (const userId of userIds) {
        let current = new Date(start);
        while (current <= end) {
          const date = new Date(current);
          const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday ...
          
          // dayOffs is array of numbers [0..6] (JS days)
          const isDayOff = dayOffs.includes(dayOfWeek);
          const activeShiftId = isDayOff ? dayOffShiftId : shiftId;

          if (activeShiftId) {
            ops.push(
              prisma.workSchedule.upsert({
                where: { userId_date: { userId, date } },
                update: { shiftId: activeShiftId },
                create: { userId, date, shiftId: activeShiftId }
              })
            );
          }
          current.setDate(current.getDate() + 1);
        }
      }

      await prisma.$transaction(ops);
      return NextResponse.json({ success: true, message: "จัดตารางงานตามรูปแบบสำเร็จ" });
    }

    if (action === "CLEAR_SCHEDULE") {
      const { userIds, startDate, endDate } = data;
      await prisma.workSchedule.deleteMany({
        where: {
          userId: { in: userIds },
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      });
      return NextResponse.json({ success: true, message: "ล้างตารางงานในช่วงที่กำหนดเรียบร้อยแล้ว" });
    }

    if (action === "CREATE_SHIFT") {
      const shift = await prisma.workShift.create({
        data: {
          name: data.name,
          code: data.code,
          startTime: data.startTime,
          endTime: data.endTime,
          lateThreshold: data.lateThreshold || 15,
          otStartTime: data.otStartTime || null
        }
      });
      return NextResponse.json({ success: true, data: shift });
    }

    if (action === "BULK_ASSIGN") {
      const { userIds, shiftId, startDate, endDate } = data;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const days = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      const operations = [];
      for (const userId of userIds) {
        for (const date of days) {
          operations.push(
            prisma.workSchedule.upsert({
              where: {
                userId_date: { userId, date }
              },
              update: { shiftId },
              create: { userId, date, shiftId }
            })
          );
        }
      }

      await prisma.$transaction(operations);
      return NextResponse.json({ success: true, message: `มอบหมายกะงานสำเร็จสำหรับ ${userIds.length} คน` });
    }

    if (action === "ASSIGN_SHIFT") {
       const assignment = await prisma.user.update({
         where: { id: data.userId },
         data: { workShiftId: data.shiftId }
       });
       return NextResponse.json({ success: true, data: assignment });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("[WORK_SHIFT_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
