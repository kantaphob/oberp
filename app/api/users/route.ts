import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: {
          include: {
            department: true,
          }
        },
        profile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const currentUser = session.user;

    // 2. ดึงข้อมูลตำแหน่งที่กำลังจะสร้าง
    const targetRole = await prisma.jobRole.findUnique({ where: { id: body.roleId } });
    if (!targetRole) return NextResponse.json({ error: "ไม่พบตำแหน่งนี้ในระบบ" }, { status: 400 });

    // 🛡️ ป้องกันการสร้างบัญชี Level 0 ผ่านทาง API 
    // อนุญาตให้สร้างได้ "เฉพาะ" กรณีที่คนสร้างคนปัจจุบันคือ Level 0 เท่านั้น (Co-Founder สร้างกันเองได้)
    if (targetRole.level === 0 && currentUser.level !== 0) {
      return NextResponse.json({ error: "ไม่สามารถสร้างบัญชีผู้ก่อตั้ง (Level 0) เพิ่มเติมได้ (ต้องใช้บัญชีระดับ God Mode ในการสร้างเท่านั้น)" }, { status: 403 });
    }

    // 🛡️ SUPERVISOR OVERRIDE & STAGING LOGIC
    let finalApproverId = null;
    const { approverUsername, ...cleanPayload } = body;

    // ถ้าคนสร้างไม่ใช่ Level 0 จะต้องมีการขออนุมัติ (Stage to Report)
    if (currentUser.level > 0) {
      if (!approverUsername) {
        return NextResponse.json({ 
          error: "สิทธิ์ไม่เพียงพอ: กรุณาระบุรหัสผู้ดูแล (Level 0) เพื่อส่งเรื่องขออนุมัติ", 
          requireSupervisor: true 
        }, { status: 403 });
      }

      // ตรวจสอบผู้ยืนยัน (Case-insensitive & Trim)
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
      // เคลียร์ฟิลด์ที่ไม่เกี่ยวข้องออกก่อนลง DB ( isAdmin, approverUsername ถูกดึงออกไปแล้ว)
      console.log("DEBUG POST: Prisma Keys available:", Object.keys(prisma).filter(k => !k.startsWith("_")));
      const payloadToSave: any = { ...cleanPayload };
      if (payloadToSave.password) payloadToSave.password = "********";

      await prisma.pendingAction.create({
        data: {
          action: "CREATE_USER",
          description: `ขอสั่งสร้างพนักงานใหม่ @${body.username || "unknown"} (${targetRole.name}) โดย ${currentUser.username}`,
          payload: JSON.parse(JSON.stringify(payloadToSave)), // ล้างค่า undefined เพื่อป้องกัน Error 500
          targetModel: "User",
          requesterId: currentUser.id,
          approverId: approver.id,
          status: "PENDING"
        }
      });

      return NextResponse.json({ 
        message: "สั่งสร้างข้อมูลสำเร็จ (รายการถูกส่งไปที่ Report เพื่อรอการยืนยันขั้นตอนสุดท้าย)" 
      }, { status: 202 });
    }

    const exist = await prisma.user.findFirst({
      where: {
        OR: [
          { username: body.username },
          { email: body.email || undefined }
        ]
      }
    });

    if (exist) {
      return NextResponse.json({ error: "Username หรือ Email นี้มีในระบบแล้ว" }, { status: 400 });
    }
    
    // จัดการกรณีที่ Role เป็นระดับผู้บริหาร (ไม่มีแผนก) จะดึงแผนกเริ่มต้นแทนเพื่อไม่ให้ Profile บันทึกบกพร่อง
    let profileDepartmentId = targetRole.departmentId;
    if (!profileDepartmentId) {
      const fallbackDept = await prisma.department.findFirst();
      if (fallbackDept) {
        profileDepartmentId = fallbackDept.id;
      }
    }

    // 💾 4. สร้าง User และ Profile (ผ่านฉลุย)
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // ป้องกันปัญหา Duplicate Constraint เมื่อแอดมินหรือ HR ไม่ได้กรอกเลขบัตรประชาชน/เบอร์โทรศัพท์
    const finalTaxId = body.taxId || `0000${Math.floor(100000000 + Math.random() * 900000000)}`;
    const finalTel = body.telephoneNumber || `00${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email || null,
        passwordHash: hashedPassword,
        status: body.status || "ACTIVE",
        roleId: body.roleId,
        createdById: currentUser.id, // บันทึก ID ผู้สร้างที่แท้จริง
        approvedById: finalApproverId, // เก็บหลักฐานคนยืนยัน (ถ้ามี)
        
        profile: {
          create: {
            firstName: body.firstName || "-",
            lastName: body.lastName || "-",
            taxId: finalTaxId,
            telephoneNumber: finalTel,
            departmentId: profileDepartmentId as string, // อิงแผนกตามตำแหน่งอัตโนมัติ
            roleId: body.roleId,
            addressDetail: body.addressDetail || "-",
            startDate: body.startDate ? new Date(body.startDate) : new Date(),
          }
        }
      },
      include: {
        role: true,
        profile: true
      }
    });

    return NextResponse.json(newUser, { status: 201 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 'P2002') { // Prisma Unique Constraint Violation
      const target = error?.meta?.target ? String(error.meta.target) : "ที่ระบุ";
      return NextResponse.json({ error: `ข้อมูล ${target} นี้มีอยู่ในระบบแล้ว` }, { status: 400 });
    }
    console.error("User Creation Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างข้อมูลผู้ใช้: " + (error?.message || String(error)) }, { status: 500 });
  }
}