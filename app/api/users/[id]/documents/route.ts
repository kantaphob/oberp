import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { uploadFileToServer } from "@/app/lib/uploadHelper"; 

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    // 1. รับข้อมูลแบบ FormData
    const formData = await req.formData();
    
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const documentType = formData.get("documentType") as string;
    const expireDateStr = formData.get("expireDate") as string;

    // 2. ตรวจสอบว่าส่งไฟล์มาจริงไหม
    if (!file) {
      return NextResponse.json({ error: "กรุณาแนบไฟล์เอกสาร" }, { status: 400 });
    }

    // 3. หารหัส UserProfile ID จาก User ID
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userId }
    });

    if (!userProfile) {
      return NextResponse.json({ error: "ไม่พบข้อมูลประวัติพนักงาน กรุณาสร้างประวัติก่อนแนบไฟล์" }, { status: 404 });
    }

    // 4. อัปโหลดไฟล์
    const savedFileUrl = await uploadFileToServer(file, "hr-documents");

    // 5. บันทึกข้อมูลลง Database
    const newDocument = await prisma.userProfilesFile.create({
      data: {
        userProfileId: userProfile.id,
        file: savedFileUrl,
        fileName: file.name,
        category: category,
        documentType: documentType,
        expireDate: expireDateStr ? new Date(expireDateStr) : null,
      }
    });

    return NextResponse.json({ 
      message: "อัปโหลดและบันทึกเอกสารสำเร็จ", 
      document: newDocument 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Document Upload API Error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปโหลด" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: userId } = await params;
        
        const userProfile = await prisma.userProfile.findUnique({
            where: { userId: userId },
            include: {
                file: true
            }
        });

        if (!userProfile) {
            return NextResponse.json({ error: "ไม่พบข้อมูลโปรไฟล์" }, { status: 404 });
        }

        return NextResponse.json(userProfile.file);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { searchParams } = new URL(req.url);
        const docId = searchParams.get("docId");

        if (!docId) {
            return NextResponse.json({ error: "ระบุรหัสเอกสารที่ต้องการลบ" }, { status: 400 });
        }

        // เช็คว่าเอกสารเป็นของ User นี้จริงไหม (Security check)
        const document = await prisma.userProfilesFile.findUnique({
            where: { id: docId },
            include: { userProfile: true }
        });

        const { id: userId } = await params;
        if (!document || document.userProfile.userId !== userId) {
            return NextResponse.json({ error: "ไม่พบเอกสาร หรือไม่มีสิทธิ์ลบ" }, { status: 404 });
        }

        // ลบจาก Database
        await prisma.userProfilesFile.delete({
            where: { id: docId }
        });

        // หมายเหตุ: ในระบบจริงควรลบไฟล์จาก storage ด้วย (fs.unlink)
        // แต่เพื่อความปลอดภัยในตัวอย่างนี้เราจะลบแค่ record ใน DB ก่อนครับ

        return NextResponse.json({ message: "ลบเอกสารเรียบร้อยแล้ว" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
