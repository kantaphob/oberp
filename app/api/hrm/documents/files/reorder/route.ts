import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

/**
 * PUT: Bulk update sortOrder for files within a category
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json(); // Array of { id: string, sortOrder: number }

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item: any) =>
        prisma.hrDocumentFile.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    return NextResponse.json({ success: true, message: "Files reordered successfully" });
  } catch (error: any) {
    console.error("[HR_DOCUMENTS_FILES_REORDER_PUT]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
