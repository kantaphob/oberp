import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

/**
 * System Audit & Staging Endpoint
 * Handles high-risk actions that require supervisor override
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { action, description, auth, targetId, targetModel } = await req.json();

    if (!auth || !auth.identifier) {
      return NextResponse.json({ success: false, message: "Require Supervisor Identifier" }, { status: 400 });
    }

    // 1. Find Supervisor
    const supervisor = await prisma.user.findFirst({
      where: {
        OR: [{ username: auth.identifier }, { email: auth.identifier }]
      },
      include: { role: true }
    });

    if (!supervisor || supervisor.status !== "ACTIVE") {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลผู้ดูแลที่คุณระบุ หรือบัญชีไม่อยู่ในสถานะใช้งาน" }, { status: 403 });
    }

    // 2. Verify Supervisor Level (Level 0-5 for Staging/Audit override)
    // สำหรับ SupervisorModal จะเน้นที่การระบุตัวตนระบบที่ระดับสิทธิ์สูง
    if (supervisor.role && supervisor.role.level > 5) {
      return NextResponse.json({ success: false, message: "ระดับผู้มีอำนาจไม่เพียงพอ (ต้องการระดับหน่วยงานที่สูงกว่า)" }, { status: 403 });
    }

    // 3. Verify Password (If provided)
    if (auth.password) {
      const isPasswordValid = await bcrypt.compare(auth.password, supervisor.passwordHash);
      if (!isPasswordValid) {
         // Log failed attempt
         await prisma.activityLog.create({
           data: {
             action: "AUDIT_FAIL",
             description: `Failed supervisor password attempt by ${session.user.username} using supervisor ${auth.identifier} for action: ${action}`,
             userId: session.user.id,
             roleName: session.user.roleName || "User",
             status: "FAILED"
           }
         });
         return NextResponse.json({ success: false, message: "รหัสผ่านผู้ดูแลไม่ถูกต้อง" }, { status: 403 });
      }
    }

    // 4. Create Activity Log for Successful Audit
    const log = await prisma.activityLog.create({
      data: {
        action: `AUDIT_STAGING:${action}`,
        description: `${description} (Authorized by: ${supervisor.username})`,
        userId: session.user.id,
        roleName: session.user.roleName || "User",
        status: "SUCCESS"
      }
    });

    // 5. Register in Pending Actions if needed (Staging)
    // For now we just return success to allow the caller to proceed
    
    return NextResponse.json({ 
      success: true, 
      message: "Authorization Granted", 
      authorizedBy: supervisor.username,
      logId: log.id
    });

  } catch (error: any) {
    console.error("[AUDIT_STAGING_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
