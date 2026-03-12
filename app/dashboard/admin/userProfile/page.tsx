"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  UserProfile as UserProfileType,
  JobRole,
  Department,
  District,
  Subdistrict,
  Province,
} from "@/app/generated/prisma";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

// --- Type Definitions ---
type UserWithProfile = User & {
  profile: UserProfileType & {
    role: JobRole;
    department: Department;
    district: District | null;
    subdistrict: Subdistrict | null;
    province: Province | null;
  };
};

// --- Columns ---
const columns: ColumnDef<UserWithProfile>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "profile.firstName",
    header: "Name",
    cell: ({ row }) =>
      `${row.original.profile?.firstName || "-"} ${row.original.profile?.lastName || ""}`,
  },
  {
    accessorKey: "profile.telephoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "profile.taxId",
    header: "Tax ID",
  },
  {
    accessorKey: "profile.role.name",
    header: "Role",
    cell: ({ row }) => row.original.profile?.role?.name || "-",
  },
  {
    accessorKey: "profile.department.name",
    header: "Department",
    cell: ({ row }) => row.original.profile?.department?.name || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === "ACTIVE"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800";
      return <Badge className={color}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const handleDelete = async () => {
        if (
          !confirm(
            `คุณต้องการระงับบัญชีผู้ใช้ "${user.profile?.firstName || user.username}" ใช่หรือไม่?\n\nข้อมูลโปรไฟล์และประวัติการทำงานจะยังคงอยู่ แต่ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีก`,
          )
        )
          return;

        try {
          const res = await fetch(`/api/users/${user.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            toast.success("ระงับบัญชีผู้ใช้เรียบร้อยแล้ว (TERMINATED)");
            window.location.reload();
          } else {
            const data = await res.json();
            toast.error(data.error || "เกิดข้อผิดพลาด");
          }
        } catch (error) {
          toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
      };

      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/userProfile/edit/${user.id}`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

// --- Main Component ---
export default function UserProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">UserProfile</h1>
          <p className="text-muted-foreground">
            บันทึกและจัดการข้อมูลทางด้านบุคคล
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/admin/userProfile/create")}
          className="bg-orange-600 hover:bg-orange-700 shadow-md transition-all active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มข้อมูลพนักงาน
        </Button>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  );
}
