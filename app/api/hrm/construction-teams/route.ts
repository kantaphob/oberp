import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const teams = await prisma.constructionTeam.findMany({
      where: { status: "ACTIVE" },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            profile: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        leader: {
          select: {
            profile: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: teams });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
