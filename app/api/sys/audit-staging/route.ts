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

    const { action, description, auth, targetId, targetModel, payload } = await req.json();

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

    // 2. Verify Password or Master Key
    if (!auth.password) {
      return NextResponse.json({ success: false, message: "กรุณาระบุรหัสผ่านเพื่อยืนยันตัวตน" }, { status: 400 });
    }

    const MASTER_KEY = process.env.MASTER_KEY;
    let isAuthorized = false;
    let authMethod = "PASSWORD";

    // a. Check if it's the Master Key
    if (MASTER_KEY && auth.password === MASTER_KEY) {
      isAuthorized = true;
      authMethod = "MASTER_KEY";
    } else {
      // b. Verify Supervisor Account Password
      const isPasswordValid = await bcrypt.compare(auth.password, supervisor.passwordHash);
      if (isPasswordValid) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      // Log failed attempt
      await prisma.activityLog.create({
        data: {
          action: "AUDIT_FAIL",
          description: `Failed supervisor password attempt by ${session.user.username} using supervisor ${auth.identifier}. Method: ${authMethod}`,
          userId: session.user.id,
          roleName: session.user.roleName || "User",
          status: "FAILED"
        }
      });
      return NextResponse.json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" }, { status: 403 });
    }

    // 3. Delegation of Authority (DoA) Logic
    const supervisorLevel = authMethod === "MASTER_KEY" ? 0 : (supervisor.role?.level ?? 14);

    if (supervisorLevel > 6) {
      return NextResponse.json({ success: false, message: "ระดับผู้มีอำนาจไม่เพียงพอ (ต้องการระดับหัวหน้างานขึ้นไป)" }, { status: 403 });
    }

    // 🏆 Determine Action Type: Direct vs Staged
    // Level 0-2 (Founder, MD, CEO): Direct Approval
    // Level 3-6 (CFO, DIR, MGR, PM): Staged Approval (Maker)
    const isDirectApproval = supervisorLevel <= 2;

    if (isDirectApproval) {
      // 4a. Direct Approval: Create Activity Log and grant access
      const log = await prisma.activityLog.create({
        data: {
          action: `DIRECT_AUTH:${action}`,
          description: `${description} (Approved by: ${supervisor.username})`,
          userId: session.user.id,
          roleName: session.user.roleName || "User",
          status: "SUCCESS"
        }
      });

      return NextResponse.json({
        success: true,
        status: "AUTHORIZED",
        message: "สิทธิ์การเข้าถึงได้รับการอนุมัติทันที",
        authorizedBy: supervisor.username,
        logId: log.id
      });
    } else {
      // 4b. Staged Approval: Create Pending Action in Staging (Maker-Checker)
      const pendingAction = await prisma.pendingAction.create({
        data: {
          action,
          description: `${description} (ผู้รับรองหน้างาน: ${supervisor.username})`,
          payload: payload || {},
          targetModel: targetModel || "System",
          targetId: targetId || null,
          requesterId: session.user.id,
          approverId: supervisor.id, // หัวหน้าหน้างานที่เป็นคนกดรหัส
          status: "PENDING"
        }
      });

      // Also log the staging attempt
      await prisma.activityLog.create({
        data: {
          action: `STAGING_QUEUED:${action}`,
          description: `${description} (สแตนบายรออนุมัติขั้นสุดท้าย)`,
          userId: session.user.id,
          roleName: session.user.roleName || "User",
          status: "PENDING"
        }
      });

      return NextResponse.json({
        success: true,
        status: "STAGED",
        message: "บันทึกใน Staging สำเร็จ รายการจะถูกส่งไปยัง Report เพื่อรอการอนุมัติขั้นสุดท้ายจากส่วนกลาง",
        authorizedBy: supervisor.username,
        pendingActionId: pendingAction.id
      });
    }

  } catch (error: any) {
    console.error("[AUDIT_STAGING_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
