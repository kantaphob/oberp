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

    const types = await prisma.payrollDeductionType.findMany({
      orderBy: { code: "asc" }
    });

    return NextResponse.json({ success: true, data: types });
  } catch (error: any) {
    console.error("[DEDUCTION_TYPES_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 5) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, code, name, isActive } = body;

    if (!code || !name) {
      return NextResponse.json({ success: false, message: "กรุณาระบุรหัสและชื่อประเภทการหัก" }, { status: 400 });
    }

    let result;
    if (id) {
      result = await prisma.payrollDeductionType.update({
        where: { id },
        data: { code, name, isActive: isActive ?? true }
      });
    } else {
      result = await prisma.payrollDeductionType.create({
        data: { code, name, isActive: isActive ?? true }
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[DEDUCTION_TYPES_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.level > 5) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });

    await prisma.payrollDeductionType.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "ลบประเภทการหักสำเร็จ" });
  } catch (error: any) {
    console.error("[DEDUCTION_TYPES_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
