import { NextRequest, NextResponse } from "next/server";

// Mock data for now - will be replaced with database data when connection is fixed
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

export async function GET() {
  try {
    // Try to use Prisma if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const { PrismaClient } = await import("@/app/generated/prisma");
      const prisma = new PrismaClient();

      const services = await prisma.serviceUs.findMany({
        include: {
          projects: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { isActive: 'desc' },
          { code: 'asc' }
        ],
      });

      return NextResponse.json(services);
    } else {
      // Fallback to mock data
      console.log("Using mock data - DATABASE_URL not configured");
      return NextResponse.json(mockServices);
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    // Fallback to mock data if database fails
    return NextResponse.json(mockServices);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, isActive = true } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Try to use Prisma if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const { PrismaClient } = await import("@/app/generated/prisma");
      const prisma = new PrismaClient();

      // Check if code already exists
      const existingService = await prisma.serviceUs.findUnique({
        where: { code }
      });

      if (existingService) {
        return NextResponse.json(
          { error: "Service code already exists" },
          { status: 409 }
        );
      }

      const newService = await prisma.serviceUs.create({
        data: {
          name,
          code,
          description,
          isActive,
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

      return NextResponse.json(newService, { status: 201 });
    } else {
      // Check if code already exists
      const existingService = mockServices.find(s => s.code === code);
      if (existingService) {
        return NextResponse.json(
          { error: "Service code already exists" },
          { status: 409 }
        );
      }

      // Create new service (mock implementation)
      const newService = {
        id: (mockServices.length + 1).toString(),
        name,
        code,
        description,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projects: []
      };

      mockServices.push(newService);

      return NextResponse.json(newService, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
