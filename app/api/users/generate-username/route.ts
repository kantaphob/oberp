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

    // Strip hyphens from prefix for username (e.g. FIN-MGR → FINMGR)
    const cleanPrefix = role.prefix.replace(/-/g, '');
    const year = new Date().getFullYear().toString().slice(-2);
    const searchPrefix = `${cleanPrefix}${year}`;

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
      // Extract trailing digits (3–4 digits) after the searchPrefix
      const suffix = lastUser.username.slice(searchPrefix.length);
      const parsed = parseInt(suffix, 10);
      if (!isNaN(parsed)) {
        nextNumber = parsed + 1;
      }
    }

    // Pad to 3 digits minimum (e.g. 001, 002 … 999, 1000)
    const paddedNumber = nextNumber < 1000
      ? nextNumber.toString().padStart(3, '0')
      : nextNumber.toString();

    const generatedUsername = `${searchPrefix}${paddedNumber}`;

    return NextResponse.json({ username: generatedUsername });
  } catch (error) {
    console.error("Failed to generate username", error);
    return NextResponse.json({ error: "Failed to generate username" }, { status: 500 });
  }
}
