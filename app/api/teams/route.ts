import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// ดึงข้อมูลทีมทั้งหมด (พร้อมรายชื่อหัวหน้าและลูกทีม)
export async function GET() {
            try {
                        const teams = await prisma.constructionTeam.findMany({
                                    include: {
                                                leader: { select: { id: true, username: true, profile: { select: { firstName: true, lastName: true } } } },
                                                members: { select: { id: true, username: true, role: { select: { name: true } }, profile: { select: { firstName: true, lastName: true } } } }
                                    },
                                    orderBy: { createdAt: 'desc' }
                        });
                        return NextResponse.json(teams);
            } catch (error) {
                        return NextResponse.json({ error: "ดึงข้อมูลทีมไม่สำเร็จ" }, { status: 500 });
            }
}

// สร้างทีมใหม่
export async function POST(req: Request) {
            try {
                        const body = await req.json();
                        const { name, leaderId, memberIds } = body;

                        const newTeam = await prisma.constructionTeam.create({
                                    data: {
                                                name,
                                                leaderId: leaderId || null,
                                                // เพิ่มลูกทีมเข้าทีมทันทีตอนสร้าง
                                                members: {
                                                            connect: memberIds ? memberIds.map((id: string) => ({ id })) : []
                                                }
                                    }
                        });

                        return NextResponse.json({ message: "สร้างทีมสำเร็จ", team: newTeam }, { status: 201 });
            } catch (error) {
                        return NextResponse.json({ error: "สร้างทีมไม่สำเร็จ" }, { status: 500 });
            }
}