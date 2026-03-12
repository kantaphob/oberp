import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// อัปเดตข้อมูลทีม (ชื่อทีม, หัวหน้า, สมาชิก)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
            try {
                        const { id } = await params;
                        const body = await req.json();
                        const { name, description, leaderId, memberIds } = body;

                        // เคลียร์ลูกทีมเก่าออกให้หมดก่อน แล้วค่อย connect ลูกทีมชุดใหม่เข้าไป
                        const updatedTeam = await prisma.constructionTeam.update({
                                    where: { id },
                                    data: {
                                                name,
                                                description: description || null,
                                                leaderId: leaderId || null,
                                                members: {
                                                            set: [], // เคลียร์คนเก่า (ตัดความสัมพันธ์)
                                                            connect: memberIds ? memberIds.map((userId: string) => ({ id: userId })) : [] // ต่อคนใหม่
                                                }
                                    },
                                    include: {
                                        leader: { select: { id: true, username: true, profile: { select: { firstName: true, lastName: true } } } },
                                        members: { select: { id: true, username: true, role: { select: { name: true } }, profile: { select: { firstName: true, lastName: true } } } }
                                    }
                        });

                        return NextResponse.json({ message: "อัปเดตทีมสำเร็จ", team: updatedTeam });
            } catch (error) {
                        return NextResponse.json({ error: "อัปเดตข้อมูลทีมไม่สำเร็จ" }, { status: 500 });
            }
}

// ลบทีม (Soft Delete หรือเปลี่ยนสถานะ)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
            try {
                        const { id } = await params;
                        await prisma.constructionTeam.update({
                                    where: { id },
                                    data: { status: "INACTIVE" }
                        });
                        return NextResponse.json({ message: "ระงับทีมสำเร็จ" });
            } catch (error) {
                        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบทีม" }, { status: 500 });
            }
}