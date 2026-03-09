import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceId = searchParams.get('provinceId');

  try {
    const districts = await prisma.district.findMany({
      where: provinceId ? { provinceId: parseInt(provinceId, 10) } : undefined,
      orderBy: { nameTh: 'asc' },
    });
    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 });
  }
}
