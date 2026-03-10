import { NextRequest, NextResponse } from "next/server";

// Mock data - same as in the main route
const mockServices = [
  {
    id: "1",
    code: 'SRV-CON',
    name: 'รับเหมาก่อสร้าง (Construction)',
    description: 'งานก่อสร้างอาคาร บ้านใหม่ คอนโด ตั้งแต่โครงสร้างจนจบงาน',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: []
  },
  {
    id: "2",
    code: 'SRV-EXT',
    name: 'ต่อเติม (Extension)',
    description: 'งานต่อเติมพื้นที่จากโครงสร้างเดิม เช่น ต่อเติมครัว โรงจอดรถ',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: []
  },
  {
    id: "3",
    code: 'SRV-REN',
    name: 'รีโนเวท (Renovation)',
    description: 'งานปรับปรุง ซ่อมแซม และตกแต่งใหม่บนโครงสร้างเดิม',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: []
  },
  {
    id: "4",
    code: 'SRV-DES',
    name: 'ออกแบบ (Design)',
    description: 'งานบริการออกแบบสถาปัตยกรรม ภายใน และเขียนแบบ',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: []
  },
  {
    id: "5",
    code: 'SRV-INS',
    name: 'ตรวจบ้าน (Home Inspection)',
    description: 'งานบริการตรวจรับบ้าน คอนโด ก่อนโอน หรือตรวจรอยร้าว',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: []
  },
  {
    id: "6",
    code: 'SRV-OTH',
    name: 'อื่นๆ (Others)',
    description: 'งานบริการพิเศษ งานจิปาถะ หรือโปรเจกต์ที่ยังไม่ระบุหมวดหมู่ชัดเจน',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: []
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to use Prisma if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const { PrismaClient } = await import("@/app/generated/prisma");
      const prisma = new PrismaClient();

      const service = await prisma.serviceUs.findUnique({
        where: { id: params.id },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(service);
    } else {
      // Fallback to mock data
      const service = mockServices.find(s => s.id === params.id);

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(service);
    }
  } catch (error) {
    console.error("Error fetching service:", error);
    // Fallback to mock data if database fails
    const service = mockServices.find(s => s.id === params.id);

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, code, description, isActive } = body;

    // Try to use Prisma if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const { PrismaClient } = await import("@/app/generated/prisma");
      const prisma = new PrismaClient();

      const service = await prisma.serviceUs.findUnique({
        where: { id: params.id },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Check if code conflicts with another service
      if (code) {
        const existingService = await prisma.serviceUs.findFirst({
          where: {
            code,
            id: { not: params.id }
          },
        });
        if (existingService) {
          return NextResponse.json(
            { error: "Service code already exists" },
            { status: 409 }
          );
        }
      }

      // Update service
      const updatedService = await prisma.serviceUs.update({
        where: { id: params.id },
        data: {
          ...(name && { name }),
          ...(code && { code }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(updatedService);
    } else {
      // Fallback to mock data
      const serviceIndex = mockServices.findIndex(s => s.id === params.id);

      if (serviceIndex === -1) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Check if code conflicts with another service
      if (code) {
        const existingService = mockServices.find(s => s.code === code && s.id !== params.id);
        if (existingService) {
          return NextResponse.json(
            { error: "Service code already exists" },
            { status: 409 }
          );
        }
      }

      // Update service
      const updatedService = {
        ...mockServices[serviceIndex],
        ...(name && { name }),
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date().toISOString(),
      };

      mockServices[serviceIndex] = updatedService;

      return NextResponse.json(updatedService);
    }
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to use Prisma if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const { PrismaClient } = await import("@/app/generated/prisma");
      const prisma = new PrismaClient();

      const service = await prisma.serviceUs.findUnique({
        where: { id: params.id },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Soft delete - deactivate the service
      await prisma.serviceUs.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({ message: "Service deactivated successfully" });
    } else {
      // Fallback to mock data
      const serviceIndex = mockServices.findIndex(s => s.id === params.id);

      if (serviceIndex === -1) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Soft delete - deactivate the service
      mockServices[serviceIndex].isActive = false;
      mockServices[serviceIndex].updatedAt = new Date().toISOString();

      return NextResponse.json({ message: "Service deactivated successfully" });
    }
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
