import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { 
      username, password, email, status, roleId,
      firstName, lastName, taxId, telephoneNumber, addressDetail 
    } = body;

    const exist = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!exist) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const dataToUpdate: Record<string, string> = {
      username,
      status,
      roleId,
    };

    if (email) dataToUpdate.email = email;
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    // Try finding the new role to update department implicitly
    let departmentId = exist.profile?.departmentId;
    if (roleId && roleId !== exist.roleId) {
      const newRole = await prisma.jobRole.findUnique({ where: { id: roleId } });
      if (newRole && newRole.departmentId) departmentId = newRole.departmentId;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...dataToUpdate,
        profile: {
          upsert: {
            create: {
              firstName: firstName || "-",
              lastName: lastName || "-",
              taxId: taxId || "0000000000000",
              telephoneNumber: telephoneNumber || "0000000000",
              addressDetail: addressDetail || "-",
              departmentId: departmentId || "",
              roleId: roleId || exist.roleId,
            },
            update: {
              firstName,
              lastName,
              taxId,
              telephoneNumber,
              addressDetail,
              departmentId,
              roleId,
            }
          }
        }
      },
      include: {
        role: {
          include: {
            department: true,
          }
        },
        profile: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
