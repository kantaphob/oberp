import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

// CORS headers for Flutter app
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * POST /api/auth/mobile-login
 * Login endpoint for Flutter mobile app
 * Returns JWT token for mobile authentication
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      },
      include: {
        role: {
          include: {
            jobLine: true,
            department: true
          }
        },
        profile: {
          include: {
            department: true
          }
        }
      }
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "ไม่พบชื่อผู้ใช้หรือบัญชีไม่พร้อมใช้งาน" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Generate JWT token
    const secret = process.env.NEXTAUTH_SECRET || "vPWcL5Fk/7H0RcEI8iRw3cA3SVymPzZdP5InvoC5L10=";
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.role?.level ?? 999,
        roleId: user.roleId,
        roleName: user.role?.name || "Unknown Role",
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        isAdmin: user.role?.level === 0 || user.role?.name === "Admin" || user.role?.name === "Founder",
        departmentId: user.profile?.departmentId ?? user.role?.departmentId ?? undefined,
        departmentName: user.profile?.department?.name ?? user.role?.department?.name ?? undefined,
        jobLineId: user.role?.jobLineId ?? undefined,
        jobLineName: user.role?.jobLine?.name ?? undefined,
      },
      secret,
      { expiresIn: "8h" }
    );

    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.role?.level ?? 999,
        roleName: user.role?.name || "Unknown Role",
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        isAdmin: user.role?.level === 0 || user.role?.name === "Admin" || user.role?.name === "Founder",
        departmentName: user.profile?.department?.name ?? user.role?.department?.name ?? undefined,
        jobLineName: user.role?.jobLine?.name ?? undefined,
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Mobile Login Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500, headers: corsHeaders }
    );
  }
}
