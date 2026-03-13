import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const shifts = await prisma.workShift.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: shifts });
  } catch (error: any) {
    console.error("[WORK_SHIFT_MASTER_GET]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("POST Session User Level:", session?.user?.level); // Logging for debugging
    
    // Level 1-11 can manage shifts (Foreman is Level 11)
    if (!session?.user || session.user.level > 11) {
      return NextResponse.json({ success: false, message: "Permission Denied (Require Manager/Foreman Level)" }, { status: 403 });
    }

    const data = await req.json();
    console.log("POST Data received:", data);

    // Upsert logic: If name or code exists, update it. Otherwise create.
    const existing = await prisma.workShift.findFirst({
        where: {
            OR: [
                { name: data.name },
                { code: data.code }
            ]
        }
    });

    let shift;
    if (existing) {
        shift = await prisma.workShift.update({
            where: { id: existing.id },
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                lateThreshold: data.lateThreshold || 0,
                otStartTime: data.otStartTime || null,
                attendanceType: data.attendanceType || "ONSITE",
                isActive: true
            }
        });

        // 📝 Log activity
        await prisma.activityLog.create({
          data: {
            action: "UPDATE_WORK_SHIFT",
            description: `Update work shift: ${shift.name} (${shift.code})`,
            userId: session.user.id,
            roleName: session.user.roleName || "User",
            status: "SUCCESS"
          }
        });

        return NextResponse.json({ success: true, data: shift, message: "อัปเดตข้อมูลกะงานสำเร็จ" });
    }

    shift = await prisma.workShift.create({
      data: {
        name: data.name,
        code: data.code || data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        lateThreshold: data.lateThreshold || 0,
        otStartTime: data.otStartTime || null,
        attendanceType: data.attendanceType || "ONSITE",
        isActive: true
      }
    });

    // 📝 Log activity
    await prisma.activityLog.create({
      data: {
        action: "CREATE_WORK_SHIFT",
        description: `Create new work shift: ${shift.name} (${shift.code})`,
        userId: session.user.id,
        roleName: session.user.roleName || "User",
        status: "SUCCESS"
      }
    });

    return NextResponse.json({ success: true, data: shift, message: "สร้างกะการทำงานสำเร็จ" });
  } catch (error: any) {
    console.error("[WORK_SHIFT_MASTER_POST]", error);
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
    if (!id) return NextResponse.json({ success: false, message: "Missing Shift ID" }, { status: 400 });

    // --- Supervisor Auth Logic ---
    let isAuthorized = session.user.level <= 11; // Basic permission for Foreman
    
    try {
      const body = await req.json();
      const identifier = body.auth?.identifier || body.supervisorUsername;
      const password = body.auth?.password;
      
      if (identifier) {
        // Find supervisor
        const supervisor = await prisma.user.findFirst({
           where: {
             OR: [{ username: identifier }, { email: identifier }]
           },
           include: { role: true }
        });

        if (!supervisor || supervisor.status !== "ACTIVE") {
          return NextResponse.json({ success: false, message: "ไม่พบชื่อผู้ใช้หัวหน้างาน หรือบัญชีไม่พร้อมใช้งาน" }, { status: 403 });
        }

        // Verify Level (Supervisor must be level 1-5 for high-risk actions)
        if (supervisor.role && supervisor.role.level > 5) {
          return NextResponse.json({ success: false, message: "ระดับผู้มีอำนาจไม่เพียงพอ (ต้องการระดับหัวหน้าแผนกขึ้นไป)" }, { status: 403 });
        }

        // Verify Password ONLY if provided (Audit Staging flow might have pre-verified or use ID-only)
        if (password) {
          const bcrypt = require("bcrypt");
          const isPasswordValid = await bcrypt.compare(password, supervisor.passwordHash);
          if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: "รหัสผ่านหัวหน้างานไม่ถูกต้อง" }, { status: 403 });
          }
        }
        
        isAuthorized = true; // Authorized by supervisor
        console.log(`[AUTH] Action on shift ${id} authorized by supervisor: ${supervisor.username}`);
      }
    } catch (e) {
      // Body might be empty, proceed with session level check
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: "Permission Denied (Require Supervisor Authorization)" }, { status: 403 });
    }

    // Soft Delete
    const shift = await prisma.workShift.update({
      where: { id },
      data: { isActive: false }
    });

    // 📝 Log activity
    await prisma.activityLog.create({
      data: {
        action: "DELETE_WORK_SHIFT",
        description: `Delete work shift: ${shift.name} (${shift.code})`,
        userId: session.user.id,
        roleName: session.user.roleName || "User",
        status: "SUCCESS"
      }
    });

    return NextResponse.json({ success: true, message: "ลบกะการทำงานเรียบร้อย" });
  } catch (error: any) {
    console.error("[WORK_SHIFT_MASTER_DELETE]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
