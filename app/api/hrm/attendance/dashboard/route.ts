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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch Stats
    const totalEmployees = await prisma.user.count({ 
      where: { 
        status: { notIn: ["INACTIVE", "SUSPENDED", "RESIGNED", "TERMINATED"] } 
      } 
    });

    const attendancesToday = await prisma.attendance.findMany({
      where: { date: today },
      include: { 
        user: { 
          select: { 
            username: true, 
            role: { select: { name: true } },
            profile: { select: { firstName: true, lastName: true } }
          } 
        } 
      }
    });

    const presentCount = attendancesToday.filter((a: any) => !!a.checkInTime).length;
    const lateCount = attendancesToday.filter((a: any) => a.status === "LATE").length;
    
    // For Leave count, check LeaveRequest overlapping today
    const leavesToday = await prisma.leaveRequest.count({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
        status: "APPROVED"
      }
    });

    // 2. Fetch Recent Logs (Today's check-ins)
    const logs = attendancesToday.map((a: any) => ({
      user: a.user.profile?.firstName ? `${a.user.profile.firstName} ${a.user.profile.lastName}` : (a.user.username || "พนักงาน"),
      role: a.user.role?.name || "Staff",
      in: a.checkInTime ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(a.checkInTime) + " น." : "-",
      out: a.checkOutTime ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(a.checkOutTime) + " น." : "-",
      status: a.status,
      statusThai: a.status === "LATE" ? `สาย (${a.lateMinutes} นาที)` : "ปกติ",
      location: a.checkInLocation || "Site",
    }));

    return NextResponse.json({
      success: true,
      stats: {
        total: totalEmployees,
        present: presentCount,
        late: lateCount,
        onLeave: leavesToday
      },
      logs
    });

  } catch (error: any) {
    console.error("[HRM_DASHBOARD_STATS_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
