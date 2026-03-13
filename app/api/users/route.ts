import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noProfile = searchParams.get('noProfile') === 'true';

    const users = await prisma.user.findMany({
      where: noProfile ? { profile: null } : undefined,
      include: {
        role: {
          include: {
            department: true,
          }
        },
        profile: {
          include: {
            role: true,
            department: true,
            province: true,
            district: true,
            subdistrict: true,
          }
        },
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

    // --- Prepare Basic Data (Fallback Department, IDs) ---
    let profileDepartmentId = targetRole.departmentId;
    if (!profileDepartmentId) {
      const fallbackDept = await prisma.department.findFirst();
      if (fallbackDept) profileDepartmentId = fallbackDept.id;
    }

    const finalTaxId = body.taxId || `0000${Math.floor(100000000 + Math.random() * 900000000)}`;
    const finalTel = body.telephoneNumber || `00${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 🛡️ SUPERVISOR OVERRIDE & STAGING LOGIC
    const { approverUsername, userId, ...cleanPayload } = body;

    // 1. ถ้าคนสร้างไม่ใช่ Level 0 จะต้องมีการขออนุมัติ (Stage to Report)
    if (session.user.level > 0) {
      if (!approverUsername) {
        return NextResponse.json({ 
          error: "สิทธิ์ไม่เพียงพอ: กรุณาระบุรหัสผู้ดูแล (Level 0) เพื่อส่งเรื่องขออนุมัติ", 
          requireSupervisor: true 
        }, { status: 403 });
      }

      // ตรวจสอบ Supervisor หรือ Master Key
      const masterCode = process.env.FOUNDER_SECRET_CODE;
      const isMasterKey = approverUsername.trim() === masterCode;

      const supervisor = await prisma.user.findFirst({
        where: isMasterKey 
          ? { role: { level: 0 } }
          : { username: approverUsername.trim(), role: { level: 0 } },
        include: { role: true }
      });

      if (!supervisor) {
        return NextResponse.json({ 
          error: isMasterKey 
            ? "ไม่พบผู้ใช้ระดับ Level 0 ในระบบที่จะมารองรับ Master Key"
            : "ไม่พบรหัสผู้ดูแลนี้ หรือผู้ดูแลไม่มีสิทธิ์ระดับ 0" 
        }, { status: 403 });
      }

      // บันทึกรายการรออนุมัติ
      const payloadToSave = JSON.parse(JSON.stringify(cleanPayload));
      if (payloadToSave.password) payloadToSave.password = "********";
      if (userId) payloadToSave.userId = userId;

      await prisma.pendingAction.create({
        data: {
          action: userId ? "UPDATE_USER" : "CREATE_USER",
          description: userId 
            ? `ขอเพิ่มข้อมูลประวัติพนักงาน (UserId: ${userId}) โดย ${session.user.username}`
            : `ขอสร้างพนักงานใหม่ @${body.username} โดย ${session.user.username}`,
          payload: payloadToSave,
          targetModel: "User",
          targetId: userId || null,
          requesterId: session.user.id,
          approverId: supervisor.id,
          status: "PENDING",
        }
      });

      return NextResponse.json({ 
        message: "ส่งคำขออนุมัติเรียบร้อยแล้ว กรุณารอผู้ดูแลตรวจสอบ",
        pending: true 
      });
    }

    // --- Direct Logic for Level 0 ---

    if (userId) {
      // โหมดเพิ่มข้อมูล Profile ให้ User เดิม
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          roleId: body.roleId,
          status: body.status || "ACTIVE",
          profile: {
            create: {
              firstName: body.firstName || "-",
              lastName: body.lastName || "-",
              taxId: finalTaxId,
              telephoneNumber: finalTel,
              departmentId: profileDepartmentId as string,
              roleId: body.roleId,
              addressDetail: body.addressDetail || "-",
              provinceId: (body.provinceId && body.provinceId !== "") ? parseInt(body.provinceId, 10) : null,
              districtId: (body.districtId && body.districtId !== "") ? parseInt(body.districtId, 10) : null,
              subdistrictId: (body.subdistrictId && body.subdistrictId !== "") ? parseInt(body.subdistrictId, 10) : null,
              zipcode: body.zipcode || null,
              lineId: body.lineId || null,
              gender: body.gender || null,
              nationality: body.nationality || null,
              birthDate: body.birthDate ? new Date(body.birthDate) : null,
              startDate: body.startDate ? new Date(body.startDate) : new Date(),
            }
          }
        }
      });
      return NextResponse.json({ message: "เพิ่มข้อมูลพนักงานสำเร็จ", user: updatedUser }, { status: 201 });
    }

    // โหมดสร้าง User ใหม่พร้อม Profile
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
    
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email || null,
        passwordHash: hashedPassword,
        status: body.status || "ACTIVE",
        roleId: body.roleId,
        createdById: currentUser.id,
        
        profile: {
          create: {
            firstName: body.firstName || "-",
            lastName: body.lastName || "-",
            taxId: finalTaxId,
            telephoneNumber: finalTel,
            departmentId: profileDepartmentId as string,
            roleId: body.roleId,
            addressDetail: body.addressDetail || "-",
            provinceId: (body.provinceId && body.provinceId !== "") ? parseInt(body.provinceId, 10) : null,
            districtId: (body.districtId && body.districtId !== "") ? parseInt(body.districtId, 10) : null,
            subdistrictId: (body.subdistrictId && body.subdistrictId !== "") ? parseInt(body.subdistrictId, 10) : null,
            zipcode: body.zipcode || null,
            lineId: body.lineId || null,
            gender: body.gender || null,
            nationality: body.nationality || null,
            birthDate: body.birthDate ? new Date(body.birthDate) : null,
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