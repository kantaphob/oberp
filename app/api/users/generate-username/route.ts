import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json({ error: "roleId is required" }, { status: 400 });
    }

    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
      select: { prefix: true }
    });

    if (!role || !role.prefix) {
      return NextResponse.json({ error: "ตำแหน่งที่เลือกไม่มีตัวย่อ (Prefix)" }, { status: 400 });
    }

    const year = new Date().getFullYear().toString().slice(-2);
    const searchPrefix = `${role.prefix}${year}`;

    const lastUser = await prisma.user.findFirst({
      where: {
        username: { startsWith: searchPrefix }
      },
      orderBy: {
        username: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastUser) {
      // Extract the last 3 digits
      const match = lastUser.username.match(/(\d{3})$/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    const paddedNumber = nextNumber.toString().padStart(3, '0');
    const generatedUsername = `${searchPrefix}${paddedNumber}`;

    return NextResponse.json({ username: generatedUsername });
  } catch (error) {
    console.error("Failed to generate username", error);
    return NextResponse.json({ error: "Failed to generate username" }, { status: 500 });
  }
}
