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
      const requests = await prisma.otRequest.findMany({
        where: { userId },
        orderBy: { date: "desc" }
      });
      return NextResponse.json({ success: true, data: requests });
    }

    if (mode === "team-approvals") {
      const requests = await prisma.otRequest.findMany({
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
        orderBy: { date: "desc" }
      });

      const formatted = requests.map((r: any) => ({
        ...r,
        userName: r.user.profile ? `${r.user.profile.firstName} ${r.user.profile.lastName}` : r.user.username
      }));

      return NextResponse.json({ success: true, data: formatted });
    }

    return NextResponse.json({ success: false, message: "Invalid mode" }, { status: 400 });

  } catch (error: any) {
    console.error("[OT_REQUEST_GET_ERROR]", error);
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
    const { date, plannedHours, reason } = body;

    const request = await prisma.otRequest.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        plannedHours: parseFloat(plannedHours),
        reason,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, message: "ส่งคำขอ OT สำเร็จ", data: request });

  } catch (error: any) {
     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 7) {
      return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, actualHours } = body;

    const request = await prisma.otRequest.update({
      where: { id },
      data: {
        status: status as any,
        actualHours: actualHours ? parseFloat(actualHours) : undefined,
        approverId: session.user.id,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message: "อัปเดตสถานะ OT สำเร็จ", data: request });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
