import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * ฟังก์ชันสำหรับรับไฟล์จาก Client และบันทึกลง Server (Local Storage)
 * @param file ไฟล์ที่ได้จาก FormData
 * @param folderName ชื่อโฟลเดอร์ย่อย (ค่าเริ่มต้นคือ 'documents')
 * @returns Path ของไฟล์ที่เซฟสำเร็จ (เช่น '/uploads/documents/123-abc.pdf')
 */
export async function uploadFileToServer(file: File, folderName: string = "documents"): Promise<string> {
  try {
    // 1. แปลงไฟล์ที่รับมาเป็น Buffer (ก้อนข้อมูล)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. สร้างชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน (ป้องกันไฟล์ชื่อซ้ำแล้วทับกัน)
    const extension = path.extname(file.name); 
    const uniqueFilename = `${uuidv4()}${extension}`; // เช่น "a1b2c3d4.pdf"

    // 3. กำหนดโฟลเดอร์ปลายทาง (เซฟไว้ที่ public/uploads/documents)
    const uploadDir = path.join(process.cwd(), "public", "uploads", folderName);

    // 4. เช็คว่ามีโฟลเดอร์นี้หรือยัง ถ้ายังไม่มีให้สร้างใหม่
    await mkdir(uploadDir, { recursive: true });

    // 5. บันทึกไฟล์ลง Server
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // 6. ส่ง URL กลับไปให้ Database บันทึก (URL ที่หน้าเว็บเรียกดูได้)
    return `/uploads/${folderName}/${uniqueFilename}`;

  } catch (error) {
    console.error("Upload File Error:", error);
    throw new Error("ไม่สามารถบันทึกไฟล์ลง Server ได้");
  }
}
