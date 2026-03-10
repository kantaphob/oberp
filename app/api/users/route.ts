import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

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
    
    // 1. 🛑 จำลองดึงข้อมูลคนที่กดปุ่ม (ในของจริงดึงจาก Session)
    // สมมติว่าคนที่ล็อกอินคือ HR (Level 3)
    const currentUser = { id: "hr-uuid-123", level: 3 }; 

    // 2. ดึงข้อมูลตำแหน่งที่กำลังจะสร้าง
    const targetRole = await prisma.jobRole.findUnique({ where: { id: body.roleId } });
    if (!targetRole) return NextResponse.json({ error: "ไม่พบตำแหน่งนี้ในระบบ" }, { status: 400 });

    let finalApproverId = null;

    // 🛡️ 3. ระบบตรวจเช็คสิทธิ์ (RBAC & Supervisor Override)
    // ถ้าระดับตำแหน่งที่จะสร้าง "สูงกว่า" ตัวเอง (เลขน้อยกว่า)
    if (targetRole.level < currentUser.level && !body.isAdmin) {
      
      const { approverUsername } = body;

      if (!approverUsername) {
        return NextResponse.json({ 
          requiresOverride: true, 
          error: `การสร้างตำแหน่ง ${targetRole.name} ต้องได้รับการอนุมัติจากผู้บริหาร` 
        }, { status: 403 });
      }

      // ตรวจสอบข้อมูลผู้บริหารที่มาอนุมัติ
      const approver = await prisma.user.findUnique({ 
        where: { username: approverUsername },
        include: { role: true }
      });

      if (!approver || approver.status !== "ACTIVE") {
        return NextResponse.json({ error: "ไม่พบผู้บริหาร หรือบัญชีผู้บริหารไม่พร้อมใช้งานหรือไม่ถูกต้อง" }, { status: 403 });
      }

      // เช็คว่าผู้บริหารที่มาอนุมัติ ตำแหน่งสูงพอไหม? (ต้อง Level เล็กกว่าหรือเท่ากับ ตำแหน่งที่จะสร้าง)
      if (!approver.role || approver.role.level > targetRole.level) {
        return NextResponse.json({ error: `ผู้บริหารท่านนี้ไม่มีสิทธิ์อนุมัติตำแหน่ง ${targetRole.name}` }, { status: 403 });
      }

      // อนุมัติผ่าน! เก็บ ID ผู้บริหารไว้เป็นหลักฐาน
      finalApproverId = approver.id;
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

    // 💾 4. สร้าง User และ Profile (ผ่านฉลุย)
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email || null,
        passwordHash: hashedPassword,
        status: body.status || "ACTIVE",
        roleId: body.roleId,
        createdById: currentUser.id, // เก็บหลักฐานคนกดสร้าง
        approvedById: finalApproverId, // เก็บหลักฐานคนยืนยัน (ถ้ามี)
        
        profile: {
          create: {
            firstName: body.firstName || "-",
            lastName: body.lastName || "-",
            taxId: body.taxId || "0000000000000",
            telephoneNumber: body.telephoneNumber || "0000000000",
            departmentId: targetRole.departmentId!, // อิงแผนกตามตำแหน่งอัตโนมัติ
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

  } catch (error) {
    console.error("User Creation Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างข้อมูลผู้ใช้" }, { status: 500 });
  }
}