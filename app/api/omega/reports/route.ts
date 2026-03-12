import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

export async function GET() {
  try {
    const actions = await prisma.pendingAction.findMany({
      include: {
        requester: { select: { username: true, role: { select: { level: true, name: true } } } },
        approver: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(actions);
  } catch (error) {
    console.error("Failed to fetch reports", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || Number(session.user.level) > 0) {
      return NextResponse.json({ error: "เฉพาะผู้ออกแบบระบบ (Level 0) เท่านั้นที่มีสิทธิ์อนุมัติรายการ" }, { status: 403 });
    }

    const { id, actionName } = await req.json();
    console.log("DEBUG REPORTS: Prisma Keys available:", Object.keys(prisma).filter(k => !k.startsWith("_")));

    if (actionName === "APPROVE") {
      const pending = await prisma.pendingAction.findUnique({ where: { id } });
      if (!pending) {
        return NextResponse.json({ error: `ไม่พบรายการ ID: ${id}` }, { status: 400 });
      }
      if (pending.status !== "PENDING") {
        return NextResponse.json({ error: `รายการนี้มีสถานะ ${pending.status} แล้ว (ไม่อยู่ในสถานะ PENDING)` }, { status: 400 });
      }

      const payload = pending.payload as any;
      const targetModel = pending.targetModel;
      const targetId = pending.targetId;

      console.log("APPROVE Process:", { action: pending.action, targetModel, targetId });

      // 🛡️ CREATE actions don't have a targetId yet, but UPDATE/DELETE must have it
      if (!targetId && !pending.action.startsWith("CREATE")) {
        return NextResponse.json({ error: `ไม่พบ Target ID สำหรับการดำเนินการ ${pending.action}` }, { status: 400 });
      }

      // 🛠️ Normalize model name for Prisma (e.g., "User" -> "user")
      const modelKey = targetModel.charAt(0).toLowerCase() + targetModel.slice(1);
      // @ts-ignore
      const model = prisma[modelKey];

      if (!model) {
        return NextResponse.json({ error: `ไม่สนับสนุนการทำงานกับ Model: ${targetModel} (Key: ${modelKey})` }, { status: 400 });
      }

      // 🛡️ SPECIAL LOGIC FOR USER (Because of nested Profile)
      if (targetModel.toLowerCase() === "user") {
        const { 
            password, username, email, status, roleId,
            firstName, lastName, taxId, telephoneNumber, addressDetail,
            startDate
        } = payload;

        if (pending.action.startsWith("DELETE")) {
            await prisma.user.delete({ where: { id: targetId! } });
        } else if (pending.action.startsWith("UPDATE") || pending.action.startsWith("EDIT")) {
            // Reconstruct nested update
            const dataToUpdate: any = { username, email, status, roleId };
            if (password && password !== "********" && password !== "") {
                dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
            }

            await prisma.user.update({
                where: { id: targetId! },
                data: {
                    ...dataToUpdate,
                    profile: {
                        upsert: {
                            create: { firstName, lastName, taxId, telephoneNumber, addressDetail, departmentId: "", roleId, startDate: startDate ? new Date(startDate) : new Date() },
                            update: { firstName, lastName, taxId, telephoneNumber, addressDetail }
                        }
                    }
                }
            });
        } else if (pending.action.startsWith("CREATE")) {
             const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("123456", 10);
             await prisma.user.create({
                 data: {
                     username, email, passwordHash: hashedPassword, status, roleId,
                     profile: {
                         create: { firstName, lastName, taxId, telephoneNumber, addressDetail, departmentId: "", roleId, startDate: startDate ? new Date(startDate) : new Date() }
                     }
                 }
             });
        }
      } else {
        // GENERIC EXECUTION for other models
        if (pending.action.startsWith("DELETE")) {
          await model.delete({ where: { id: targetId! } });
        } else if (pending.action.startsWith("UPDATE") || pending.action.startsWith("EDIT")) {
          await model.update({ 
            where: { id: targetId! },
            data: payload
          });
        } else if (pending.action.startsWith("CREATE")) {
          await model.create({ 
            data: payload
          });
        }
      }

      await prisma.pendingAction.update({
        where: { id: pending.id },
        data: { status: "APPROVED", approverId: session.user.id }
      });

      // LOG SUCCESS
      await prisma.activityLog.create({
        data: {
          action: pending.action,
          description: `อนุมัติการทำงาน: ${pending.description} สำเร็จ`,
          userId: session.user.id,
          status: "SUCCESS"
        }
      });

      return NextResponse.json({ message: "อนุมัติและดำเนินการเรียบร้อยแล้ว" });
    }

    if (actionName === "REJECT") {
      console.log("REJECT Process:", { id });
      await prisma.pendingAction.update({
        where: { id },
        data: { status: "REJECTED", approverId: session.user.id }
      });
      return NextResponse.json({ message: "ปฏิเสธการดำเนินการแล้ว" });
    }

    console.warn("Invalid API Action:", actionName);
    return NextResponse.json({ error: `ไม่สนับสนุน Action: ${actionName}` }, { status: 400 });
  } catch (error) {
    console.error("Approval Error", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการประมวลผล" }, { status: 500 });
  }
}
