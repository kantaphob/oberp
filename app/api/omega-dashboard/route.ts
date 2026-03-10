import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { PrismaClient } = await import("@/app/generated/prisma");
    const prisma = new PrismaClient();

    // Fetch Job roles with relations 
    const jobRoles = await prisma.jobRole.findMany({
      include: {
        department: true,
        jobLine: true,
      },
      orderBy: { level: 'asc' }
    });

    // Fetch BOQs
    const boqs = await prisma.bOQ.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
      }
    });

    // Fetch Services
    const services = await prisma.serviceUs.findMany({
      select: {
        id: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Fetch Permissions
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        roleId: true,
        menuId: true,
        canRead: true,
        canWrite: true,
        canDelete: true,
      }
    });

    return NextResponse.json({
      jobRoles,
      boqs,
      services,
      permissions
    });

  } catch (error) {
    console.error("omega-dashboard err", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
