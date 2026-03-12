import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipcode = searchParams.get('zipcode');

  if (!zipcode) {
    return NextResponse.json({ error: 'Missing zipcode parameter' }, { status: 400 });
  }

  try {
    // Simple validation - check if zipcode is 5 digits
    if (!/^\d{5}$/.test(zipcode)) {
      return NextResponse.json({ 
        valid: false, 
        message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก' 
      });
    }

    // For now, accept any 5-digit zipcode as valid
    // In the future, you could integrate with a real postcode API
    return NextResponse.json({ 
      valid: true, 
      message: 'รหัสไปรษณีย์ถูกต้อง' 
    });

  } catch (error) {
    console.error('Zipcode validation error:', error);
    return NextResponse.json({ 
      valid: false, 
      message: 'ไม่สามารถตรวจสอบรหัสไปรษณีย์ได้' 
    }, { status: 500 });
  }
}
