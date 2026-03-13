import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: { include: { department: true } },
        profile: {
          include: { role: true, department: true, district: true, subdistrict: true, province: true }
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const { specialCode, approverUsername, ...updateData } = body;

    const {
      username, password, email, status, roleId,
      firstName, lastName, taxId, telephoneNumber, addressDetail,
      provinceId, districtId, subdistrictId, zipcode,
      lineId, gender, nationality, birthDate, startDate
    } = updateData;

    // 1. ดึงข้อมูล User ที่กำลังจะถูกแก้ไข
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, role: true }
    });

    if (!targetUser) return NextResponse.json({ error: "ไม่พบผู้ใช้นี้ในระบบ" }, { status: 404 });

    const currentUserLevel = session.user.level;
    const targetUserLevel = targetUser.role?.level ?? 999;

    // 🛡️ Hierarchy Logic: ปกป้องบัญชี Level 0 (God Mode)
    if (targetUserLevel === 0 && currentUserLevel !== 0) {
      const masterCode = process.env.FOUNDER_SECRET_CODE;

      // ✅ เช็คจากทั้ง specialCode หรือ approverUsername (ที่กรอกผ่าน Modal)
      const providedCode = specialCode || approverUsername;
      if (!providedCode || providedCode !== masterCode) {
        return NextResponse.json({
          error: "สิทธิ์ไม่เพียงพอ: บัญชีระดับ Level 0 ต้องใช้ Master Key ในการแก้ไขเท่านั้น",
          requireSupervisor: true
        }, { status: 403 });
      }
    }

    // 🛡️ SUPERVISOR OVERRIDE & STAGING LOGIC
    if (currentUserLevel > 0 && targetUserLevel !== 0) {
      if (!approverUsername) {
        return NextResponse.json({
          error: "สิทธิ์ไม่เพียงพอ: กรุณาระบุรหัสผู้ดูแล (Level 0) เพื่อส่งเรื่องขออนุมัติ",
          requireSupervisor: true
        }, { status: 403 });
      }

      const cleanUsername = approverUsername.trim();
      const masterCode = process.env.FOUNDER_SECRET_CODE;
      const isMasterKey = cleanUsername === masterCode;

      const approver = await prisma.user.findFirst({
        where: isMasterKey 
          ? { role: { level: 0 } }
          : { username: cleanUsername },
        include: { role: true }
      });

      if (!approver || (approver.role?.level ?? 999) !== 0) {
        return NextResponse.json({ 
          error: isMasterKey 
            ? "ไม่พบผู้ใช้ระดับ Level 0 ในระบบ เพื่อรองรับรหัส Master Key"
            : `ไม่พบรหัสผู้ดูแล "${cleanUsername}" ที่มีระดับ Level 0 ในระบบ` 
        }, { status: 403 });
      }

      const payloadToSave = { ...updateData };
      delete payloadToSave.password;

      await prisma.pendingAction.create({
        data: {
          action: "UPDATE_USER",
          description: `ขอแก้ไขข้อมูลพนักงาน @${targetUser.username} โดย @${session.user.username}`,
          payload: JSON.parse(JSON.stringify(payloadToSave)),
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

    // --- Level 0 Commit Logic ---
    const dataToUpdate: any = {};
    if (username) dataToUpdate.username = username;
    if (status) dataToUpdate.status = status;
    if (roleId) dataToUpdate.roleId = roleId;
    if (email) dataToUpdate.email = email;
    if (password && password !== "********") {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    let finalDeptId = body.departmentId || targetUser.profile?.departmentId;
    if (roleId && roleId !== targetUser.roleId) {
      const newRole = await prisma.jobRole.findUnique({ where: { id: roleId } });
      if (newRole?.departmentId && !body.departmentId) finalDeptId = newRole.departmentId;
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
              telephoneNumber: telephoneNumber || "-",
              addressDetail: addressDetail || "-",
              departmentId: finalDeptId ? finalDeptId : undefined,
              roleId: roleId || targetUser.roleId,
              provinceId: provinceId ? parseInt(provinceId, 10) : null,
              districtId: districtId ? parseInt(districtId, 10) : null,
              subdistrictId: subdistrictId ? parseInt(subdistrictId, 10) : null,
              zipcode: zipcode || null,
              lineId: lineId || null,
              gender: gender || null,
              nationality: nationality || null,
              birthDate: birthDate ? new Date(birthDate) : null,
              startDate: startDate ? new Date(startDate) : new Date(),
            },
            update: {
              firstName, lastName, taxId, telephoneNumber, addressDetail,
              departmentId: finalDeptId ? finalDeptId : undefined,
              roleId: roleId,
              provinceId: provinceId ? parseInt(provinceId, 10) : null,
              districtId: districtId ? parseInt(districtId, 10) : null,
              subdistrictId: subdistrictId ? parseInt(subdistrictId, 10) : null,
              zipcode: zipcode || null,
              lineId: lineId || null,
              gender: gender || null,
              nationality: nationality || null,
              birthDate: birthDate ? new Date(birthDate) : null,
              startDate: startDate ? new Date(startDate) : undefined,
            }
          }
        },
      },
      include: {
        role: { include: { department: true } },
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

    const body = await req.json().catch(() => ({}));
    const { approverUsername, status: chosenStatus } = body;
    const finalStatus = chosenStatus || "TERMINATED";

    const currentUserLevel = session.user.level;
    const targetUserLevel = targetUser.role?.level ?? 999;

    // 🛡️ Hierarchy logic: Founders (Level 0) can delete any account directly. 
    // Others require Master Key for Level 0 accounts, or staging for others.
    if (targetUserLevel === 0 && currentUserLevel !== 0) {
      const providedCode = approverUsername;
      const masterCode = process.env.FOUNDER_SECRET_CODE;

      if (!providedCode || providedCode !== masterCode) {
        return NextResponse.json({ 
          error: "สิทธิ์ไม่เพียงพอ: บัญชีระดับ Level 0 ต้องใช้ Master Key ในการลบเท่านั้น",
          requireSupervisor: true
        }, { status: 403 });
      }
    }

    // 🛡️ SUPERVISOR OVERRIDE & STAGING
    if (currentUserLevel > 0) {
      if (!approverUsername) {
        return NextResponse.json({
          error: "สิทธิ์ไม่เพียงพอ: กรุณาระบุรหัสผู้ดูแล (Level 0) เพื่อส่งเรื่องขออนุมัติลบ",
          requireSupervisor: true
        }, { status: 403 });
      }

      const cleanUsername = approverUsername?.trim();
      const masterCode = process.env.FOUNDER_SECRET_CODE;
      const isMasterKey = cleanUsername === masterCode;

      const approver = await prisma.user.findFirst({
        where: isMasterKey
          ? { role: { level: 0 } }
          : { username: cleanUsername },
        include: { role: true }
      });

      if (!approver || (approver.role?.level ?? 999) !== 0) {
        return NextResponse.json({ 
          error: isMasterKey 
            ? "ไม่พบผู้ใช้ระดับ Level 0 ในระบบ"
            : `ไม่พบรหัสผู้ดูแล "${cleanUsername}" ที่มีระดับ Level 0` 
        }, { status: 403 });
      }

      await prisma.pendingAction.create({
        data: {
          action: "DELETE_USER",
          description: `ขอระงับการใช้งานและเปลี่ยนสถานะเป็น ${finalStatus} สำหรับพนักงาน @${targetUser.username} โดย ${session.user.username}`,
          payload: { status: finalStatus },
          targetModel: "User",
          targetId: id,
          requesterId: session.user.id,
          approverId: approver.id,
          status: "PENDING"
        }
      });

      return NextResponse.json({
        message: `ส่งคำขอระงับการใช้งาน (${finalStatus}) สำเร็จ`
      }, { status: 202 });
    }

    // --- Level 0 Commit Logic ---
    const softDeletedUser = await prisma.user.update({
      where: { id },
      data: { status: finalStatus as any }
    });

    return NextResponse.json({
      message: `ระงับการใช้งานและเปลี่ยนสถานะเป็น ${finalStatus} เรียบร้อยแล้ว`,
      user: softDeletedUser
    });
  } catch (error: any) {
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล", details: error?.message }, { status: 500 });
  }
}
