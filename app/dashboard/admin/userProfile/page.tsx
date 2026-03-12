"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { useToast } from "@/app/hooks/useToast";
import { ConfirmActionModal } from "@/app/components/Dashboard/ConfirmActionModal";
import { SoftDeleteModal } from "@/app/components/Dashboard/SoftDeleteModal";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { useSupervisor } from "@/app/hooks/useSupervisor";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

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

// --- Main Component ---
export default function UserProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { notify } = useToast();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For Deletion Confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserWithProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"RESIGNED" | "TERMINATED" | null>(null);
  
  const { 
    isOpen: isSupervisorOpen, 
    loading: supervisorLoading, 
    openModal: openSupervisorModal, 
    closeModal: closeSupervisorModal 
  } = useSupervisor();

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

  const handleSoftDelete = (status: "RESIGNED" | "TERMINATED") => {
    setPendingStatus(status);
    // เปิด Supervisor Modal เพื่อขอรหัสก่อนดำเนินการ
    openSupervisorModal(async (supervisorUsername) => {
      await executeDelete(status, supervisorUsername);
    });
  };

  const executeDelete = async (status: string, approverUsername?: string) => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          approverUsername 
        })
      });

      const data = await res.json();

      if (res.ok || res.status === 202) {
        notify.success(data.message || "ดำเนินการระงับบัญชีสำเร็จ");
        fetchUsers();
        setDeleteTarget(null);
        setPendingStatus(null);
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error: any) {
      notify.onApiError(error, "ระงับบัญชีผู้ใช้");
    } finally {
      setDeleting(false);
    }
  };

  // --- Columns moved inside to access notify and state ---
  const columns = useMemo<ColumnDef<UserWithProfile>[]>(() => [
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
      cell: ({ row }) => row.original.profile?.role?.name || (row.original as any).role?.name || "-",
    },
    {
      accessorKey: "profile.department.name",
      header: "Department",
      cell: ({ row }) => row.original.profile?.department?.name || (row.original as any).role?.department?.name || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const color =
          status === "ACTIVE"
            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
          : status === "TERMINATED"
            ? "bg-red-100 text-red-800 border-red-200"
          : status === "RESIGNED"
            ? "bg-amber-100 text-amber-800 border-amber-200"
          : status === "ON_LEAVE"
            ? "bg-blue-100 text-blue-800 border-blue-200"
          : "bg-slate-100 text-slate-800 border-slate-200";
        return <Badge variant="outline" className={`${color} font-bold px-3 py-1 rounded-full text-[10px]`}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/userProfile/edit/${user.id}`}>
              <Button variant="ghost" size="sm" className="hover:text-blue-600 hover:bg-blue-50">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:text-red-600 hover:bg-red-50"
              onClick={() => setDeleteTarget(user)}
              disabled={user.status === "TERMINATED" || user.status === "RESIGNED"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการข้อมูลบุคลากร</h1>
          <p className="text-muted-foreground text-sm">
            บันทึกและจัดการข้อมูลพนักงาน โปรไฟล์การทำงาน และเอกสารสำคัญ
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

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <DataTable columns={columns} data={users} />
      </div>

      <SoftDeleteModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleSoftDelete}
        loading={deleting || supervisorLoading}
        userName={deleteTarget?.profile?.firstName || deleteTarget?.username || ""}
      />

      <SupervisorModal 
        isOpen={isSupervisorOpen}
        onClose={closeSupervisorModal}
        onConfirm={async (username) => {
          if (pendingStatus) {
            await executeDelete(pendingStatus, username);
          }
        }}
        loading={deleting || supervisorLoading}
        title="อนุมัติการระงับบัญชี"
        description="กรุณาระบุรหัสผู้ดูแล Level 0 เพื่อยืนยันการระงับบัญชีผู้ใช้นี้"
      />
    </div>
  );
}
