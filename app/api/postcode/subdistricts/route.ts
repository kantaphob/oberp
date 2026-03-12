import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/postcode/subdistricts
 *
 * Query params:
 *   - districtId: number  → filter ตำบลตาม อำเภอ (ใช้ตอนเลือก dropdown)
 *   - zipcode: string     → Reverse Lookup หารหัสไปรษณีย์ (ใช้ตอน auto-fill)
 *
 * หมายเหตุ: Response จะ include district → province เสมอ
 * เพื่อให้ฝั่ง Hook ใช้ auto-fill ซ้อน Level ได้โดยไม่ต้อง fetch เพิ่ม
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('districtId');
  const zipcode = searchParams.get('zipcode');

  try {
    const where: any = {};
    if (districtId) where.districtId = parseInt(districtId, 10);
    if (zipcode) where.zipcode = parseInt(zipcode, 10);

    const subdistricts = await prisma.subdistrict.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { nameTh: 'asc' },
      // เสมอ include district → province เพื่อให้ reverse lookup ทำงานได้
      include: {
        district: {
          include: {
            province: true,
          },
        },
      },
    });

    return NextResponse.json(subdistricts);
  } catch (error) {
    console.error('Error fetching subdistricts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subdistricts' },
      { status: 500 }
    );
  }
}
