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
    const mode = searchParams.get("mode") || "my-requests"; // 'my-requests' | 'team-approvals'
    const userId = session.user.id;

    if (mode === "my-requests") {
      const myRequests = await prisma.leaveRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json({ success: true, data: myRequests });
    }

    if (mode === "team-approvals") {
      const teamRequests = await prisma.leaveRequest.findMany({
        where: {
          OR: [
             { approverId: userId },
             { status: "PENDING" } 
          ]
        },
        include: { 
          user: { 
            select: { 
              username: true,
              profile: { select: { firstName: true, lastName: true } }
            } 
          } 
        },
        orderBy: { createdAt: "desc" }
      });

      const formatted = teamRequests.map((r: any) => ({
        ...r,
        userName: r.user.profile?.firstName ? `${r.user.profile.firstName} ${r.user.profile.lastName}` : (r.user.username || "พนักงาน")
      }));

      return NextResponse.json({ success: true, data: formatted });
    }

    if (mode === "quota") {
      const requests = await prisma.leaveRequest.findMany({
        where: { userId, status: "APPROVED" }
      });

      const quota = {
        SICK: { used: 0, total: 30 },
        PERSONAL: { used: 0, total: 6 },
        ANNUAL: { used: 0, total: 6 },
        FIELD: { used: 0, total: 99 } // Unlimited or high
      };

      requests.forEach(r => {
        const diffTime = Math.abs(new Date(r.endDate).getTime() - new Date(r.startDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (r.type in quota) {
          (quota as any)[r.type].used += diffDays;
        }
      });

      return NextResponse.json({ success: true, data: quota });
    }

    return NextResponse.json({ success: false, message: "Invalid mode" }, { status: 400 });

  } catch (error: any) {
    console.error("[LEAVE_REQUEST_GET_ERROR]", error);
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
    const { startDate, endDate, reason, type, documentUrl } = body;
    const userId = session.user.id;

    const request = await prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        type: type as any,
        documentUrl,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, message: "ส่งคำขอลาสำเร็จ", data: request });

  } catch (error: any) {
    console.error("[LEAVE_REQUEST_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, startDate, endDate, reason, type } = body;

    // Fetch existing request
    const existing = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    const isOwner = existing.userId === session.user.id;
    const isManager = session.user.level <= 5;

    // 1. Owner Actions (Update or Cancel)
    if (isOwner) {
      // If user wants to CANCEL
      if (status === "CANCELLED") {
        const updated = await prisma.leaveRequest.update({
          where: { id },
          data: { status: "CANCELLED", updatedAt: new Date() }
        });
        return NextResponse.json({ success: true, message: "ยกเลิกคำขอเรียบร้อยแล้ว", data: updated });
      }

      // If user wants to UPDATE (Move)
      if (existing.status === "PENDING") {
        const updated = await prisma.leaveRequest.update({
          where: { id },
          data: {
            startDate: startDate ? new Date(startDate) : existing.startDate,
            endDate: endDate ? new Date(endDate) : existing.endDate,
            reason: reason || existing.reason,
            type: type || existing.type,
            updatedAt: new Date()
          }
        });
        return NextResponse.json({ success: true, message: "อัปเดตข้อมูลคำขอเรียบร้อยแล้ว", data: updated });
      }

      return NextResponse.json({ success: false, message: "ไม่สามารถอัปเดตรายการที่ผ่านการอนุมัติแล้วได้" }, { status: 403 });
    }

    // 2. Manager Actions (Approve/Reject)
    if (isManager) {
      const updated = await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: status as any,
          approverId: session.user.id,
          updatedAt: new Date()
        }
      });
      return NextResponse.json({ success: true, message: "อัปเดตสถานะการอนุมัติเรียบร้อยแล้ว", data: updated });
    }

    return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });

  } catch (error: any) {
    console.error("[LEAVE_REQUEST_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
