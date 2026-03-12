import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const {
      username, password, email, status, roleId,
      firstName, lastName, taxId, telephoneNumber, addressDetail
    } = body;

    // 1. ดึงข้อมูล User ที่กำลังจะถูกแก้ไข
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        role: true
      }
    });

    if (!targetUser) return NextResponse.json({ error: "ไม่พบผู้ใช้นี้ในระบบ" }, { status: 404 });

    const currentUserLevel = session.user.level;
    const targetUserLevel = targetUser.role?.level ?? 999;

    // 🛡️ Hierarchy Logic (ตามกฎของลูกค้า)

    // Level 0: God Mode (แตะต้องไม่ได้) - ไม่มีใครลบหรือแก้ไขบัญชีนี้ได้ (แม้แต่ Level 0 ด้วยกัน)
    if (targetUserLevel === 0) {
      return NextResponse.json({ error: "บัญชีผู้ก่อตั้ง (Level 0) ไม่สามารถแก้ไขได้" }, { status: 403 });
    }

    // 🛡️ SUPERVISOR OVERRIDE & STAGING LOGIC
    const { approverUsername, ...cleanPayload } = body;
    
    // ถ้าคนแก้ไม่ใช่ Level 0 จะต้องมีการขออนุมัติ (Stage to Report)
    if (currentUserLevel > 0) {
      if (!approverUsername) {
        return NextResponse.json({ 
          error: "สิทธิ์ไม่เพียงพอ: กรุณาระบุรหัสผู้ดูแล (Level 0) เพื่อส่งเรื่องขออนุมัติ", 
          requireSupervisor: true 
        }, { status: 403 });
      }

      // ตรวจสอบชื่อผู้ยืนยัน (Case-insensitive & Trim)
      const cleanUsername = approverUsername?.trim();
      const approver = await prisma.user.findFirst({ 
        where: { 
          username: {
            equals: cleanUsername,
            mode: 'insensitive'
          }
        },
        include: { role: true }
      });

      if (!approver || (approver.role?.level ?? 999) !== 0) {
        return NextResponse.json({ error: `ไม่พบรหัสผู้ดูแล "${cleanUsername}" ที่มีระดับ Level 0 ในระบบ` }, { status: 403 });
      }

      // บันทึกลงระบบ Staging (PendingAction)
      // เคลียร์ฟิลด์ที่ไม่เกี่ยวข้องก่อนลง DB และเซ็ตค่ารหัสผ่านหากมีการส่งเข้ามาเป็นดาว
      console.log("DEBUG: Prisma Keys available:", Object.keys(prisma).filter(k => !k.startsWith("_")));
      const payloadToSave: any = { ...cleanPayload };
      if (payloadToSave.password) payloadToSave.password = "********";
      
      await prisma.pendingAction.create({
        data: {
          action: "UPDATE_USER",
          description: `ขอแก้ไขข้อมูลพนักงาน @${targetUser.username} โดย ${session.user.username}`,
          payload: JSON.parse(JSON.stringify(payloadToSave)), // ล้างค่า undefined เพื่อป้องกัน Error 500
          targetModel: "User",
          targetId: id,
          requesterId: session.user.id,
          approverId: approver.id,
          status: "PENDING"
        }
      });

      return NextResponse.json({ 
        message: "บันทึกข้อมูลสำเร็จ (ข้อมูลจะถูกส่งไปที่ Report เพื่อให้ Level 0 กดยอมรับการทำงาน)" 
      }, { status: 202 });
    }

    // --- ถ้าเป็น Level 0 จะข้ามมาที่นี่และ Commit ทันที ---
    
    const dataToUpdate: Record<string, string | null> = {
      username,
      status,
      roleId,
    };

    if (email) dataToUpdate.email = email;
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    // Try finding the new role to update department implicitly
    let departmentId = targetUser.profile?.departmentId;
    if (roleId && roleId !== targetUser.roleId) {
      const newRole = await prisma.jobRole.findUnique({ where: { id: roleId } });
      if (newRole && newRole.departmentId) departmentId = newRole.departmentId;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...dataToUpdate,
        profile: {
          upsert: {
            create: {
              firstName: firstName || "-",
              lastName: lastName || "-",
              taxId: taxId || `0000${Math.floor(100000000 + Math.random() * 900000000)}`,
              telephoneNumber: telephoneNumber || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
              addressDetail: addressDetail || "-",
              departmentId: departmentId || "",
              roleId: roleId || targetUser.roleId,
            },
            update: {
              firstName,
              lastName,
              taxId,
              telephoneNumber,
              addressDetail,
              departmentId,
              roleId,
            }
          }
        }
      },
      include: {
        role: {
          include: {
            department: true,
          }
        },
        profile: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ 
      error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล", 
      details: error?.message || "Internal Server Error" 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!targetUser) return NextResponse.json({ error: "ไม่พบผู้ใช้นี้ในระบบ" }, { status: 404 });

    const currentUserLevel = session.user.level;
    const targetUserLevel = targetUser.role?.level ?? 999;

    // 🛡️ Hierarchy logic for DELETE
    if (targetUserLevel === 0) {
      return NextResponse.json({ error: "บัญชีผู้ก่อตั้ง (Level 0) ไม่สามารถลบได้" }, { status: 403 });
    }

    // 🛡️ SUPERVISOR OVERRIDE & STAGING
    const body = await req.json().catch(() => ({}));
    const { approverUsername } = body;

    if (currentUserLevel > 0) {
      if (!approverUsername) {
        return NextResponse.json({ 
          error: "สิทธิ์ไม่เพียงพอ: กรุณาระบุรหัสผู้ดูแล (Level 0) เพื่อส่งเรื่องขออนุมัติลบ", 
          requireSupervisor: true 
        }, { status: 403 });
      }

      // Verify Supervisor (Case-insensitive & Trim)
      const cleanUsername = approverUsername?.trim();
      const approver = await prisma.user.findFirst({ 
        where: { 
          username: {
            equals: cleanUsername,
            mode: 'insensitive'
          }
        },
        include: { role: true }
      });

      if (!approver || (approver.role?.level ?? 999) !== 0) {
        return NextResponse.json({ error: `ไม่พบรหัสผู้ดูแล "${cleanUsername}" ที่มีระดับ Level 0 ในระบบ` }, { status: 403 });
      }

      // Stage for final approval
      await prisma.pendingAction.create({
        data: {
          action: "DELETE_USER",
          description: `ขอสั่งลบพนักงาน @${targetUser.username} โดย ${session.user.username}`,
          payload: {}, // No payload needed for delete, just targetId
          targetModel: "User",
          targetId: id,
          requesterId: session.user.id,
          approverId: approver.id,
          status: "PENDING"
        }
      });

      return NextResponse.json({ 
        message: "สั่งลบข้อมูลสำเร็จ (รายการถูกส่งไปที่ Report เพื่อรอการยืนยันขั้นตอนสุดท้าย)" 
      }, { status: 202 });
    }

    // --- Level 0 can delete directly ---
    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
