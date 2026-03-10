import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const companyServices = [
      { 
        code: 'SRV-CON', 
        name: 'รับเหมาก่อสร้าง (Construction)', 
        description: 'งานก่อสร้างอาคาร บ้านใหม่ คอนโด ตั้งแต่โครงสร้างจนจบงาน',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      },
      { 
        code: 'SRV-EXT', 
        name: 'ต่อเติม (Extension)', 
        description: 'งานต่อเติมพื้นที่จากโครงสร้างเดิม เช่น ต่อเติมครัว โรงจอดรถ',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      },
      { 
        code: 'SRV-REN', 
        name: 'รีโนเวท (Renovation)', 
        description: 'งานปรับปรุง ซ่อมแซม และตกแต่งใหม่บนโครงสร้างเดิม',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      },
      { 
        code: 'SRV-DES', 
        name: 'ออกแบบ (Design)', 
        description: 'งานบริการออกแบบสถาปัตยกรรม ภายใน และเขียนแบบ',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      },
      { 
        code: 'SRV-INS', 
        name: 'ตรวจบ้าน (Home Inspection)', 
        description: 'งานบริการตรวจรับบ้าน คอนโด ก่อนโอน หรือตรวจรอยร้าว',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      },
      { 
        code: 'SRV-OTH', 
        name: 'อื่นๆ (Others)', 
        description: 'งานบริการพิเศษ งานจิปาถะ หรือโปรเจกต์ที่ยังไม่ระบุหมวดหมู่ชัดเจน',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      },
    ];

    console.log('🌱 Seeding services via API...');

    if (process.env.DATABASE_URL) {
      const { PrismaClient } = await import("@/app/generated/prisma");
      const prisma = new PrismaClient();

      for (const service of companyServices) {
        const { projects, createdAt, updatedAt, ...data } = service;
        const exists = await prisma.serviceUs.findUnique({
          where: { code: data.code }
        });
        
        if (!exists) {
          await prisma.serviceUs.create({ data });
        } else {
          await prisma.serviceUs.update({
            where: { code: data.code },
            data: {
              name: data.name,
              description: data.description,
              isActive: data.isActive
            }
          });
        }
      }

      return NextResponse.json({
        message: "Services seeded successfully in database",
        services: companyServices
      });
    }

    // Fallback if no database
    return NextResponse.json({
      message: "Services seeded (mock only)",
      services: companyServices
    });
  } catch (error) {
    console.error("Error seeding services:", error);
    return NextResponse.json(
      { error: "Failed to seed services" },
      { status: 500 }
    );
  }
}
