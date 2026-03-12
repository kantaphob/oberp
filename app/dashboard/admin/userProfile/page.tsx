"use client";

import React, { useState, useEffect } from "react";
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
import { useToast } from "@/app/hooks/useToast";
import { useTableControls } from "@/app/hooks/useTableControls";
import { TableControls } from "@/app/components/Dashboard/TableControls";
import { ConfirmActionModal } from "@/app/components/Dashboard/ConfirmActionModal";
import { SoftDeleteModal } from "@/app/components/Dashboard/SoftDeleteModal";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { useSupervisor } from "@/app/hooks/useSupervisor";
import { getStatusConfig, getLevelColor } from "@/app/lib/ui-configs";
import {
  Pencil, Trash2, Plus, Loader2,
  Users, ShieldCheck, AlertTriangle,
  Building2, Briefcase,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type UserWithProfile = User & {
  profile: UserProfileType & {
    role: JobRole;
    department: Department;
    district: District | null;
    subdistrict: Subdistrict | null;
    province: Province | null;
  };
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const router = useRouter();
  const { notify } = useToast();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<UserWithProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"RESIGNED" | "TERMINATED" | null>(null);

  const {
    isOpen: isSupervisorOpen,
    loading: supervisorLoading,
    openModal: openSupervisorModal,
    closeModal: closeSupervisorModal,
  } = useSupervisor();

  // ── Table Controls ──────────────────────────────────────────────────────────
  const { paged, tableProps } = useTableControls(users, {
    searchKeys: ["username", "email", "status"],
    filterFn: (item, term) => {
      const p = item.profile;
      return [
        item.username,
        item.email,
        item.status,
        p?.firstName,
        p?.lastName,
        p?.telephoneNumber,
        p?.taxId,
        p?.role?.name,
        p?.department?.name,
      ]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term));
    },
    defaultPerPage: 10,
  });

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Deletion ────────────────────────────────────────────────────────────────
  const handleSoftDelete = (status: "RESIGNED" | "TERMINATED") => {
    setPendingStatus(status);
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
        body: JSON.stringify({ status, approverUsername }),
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
    } catch (e: any) {
      notify.onApiError(e, "ระงับบัญชีผู้ใช้");
    } finally {
      setDeleting(false);
    }
  };

  // ── Summary stats ───────────────────────────────────────────────────────────
  const total     = users.length;
  const active    = users.filter(u => u.status === "ACTIVE").length;
  const inactive  = users.filter(u => !["ACTIVE"].includes(u.status)).length;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-full">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="pf-glass pf-card">
        <div className="pf-card-body flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">จัดการข้อมูลบุคลากร</h1>
            <p className="text-[12px] text-slate-400 mt-0.5">บันทึกและจัดการข้อมูลพนักงาน โปรไฟล์การทำงาน และเอกสารสำคัญ</p>
          </div>
          <Link href="/dashboard/admin/userProfile/create">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-[13px] font-bold hover:bg-orange-700 transition-all shadow-md shadow-orange-600/25 active:scale-95"
            >
              <Plus size={15} />
              เพิ่มข้อมูลพนักงาน
            </button>
          </Link>
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "ทั้งหมด",  value: total,    icon: Users,         color: "#6366f1", bg: "#eef2ff",  border: "#c7d2fe" },
          { label: "Active",   value: active,   icon: ShieldCheck,   color: "#15803d", bg: "#f0fdf4",  border: "#86efac" },
          { label: "Inactive", value: inactive, icon: AlertTriangle, color: "#b91c1c", bg: "#fef2f2",  border: "#fca5a5" },
        ].map(s => (
          <div key={s.label} className="pf-glass pf-card pf-card-body flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-black leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ──────────────────────────────────────────────── */}
      <div className="pf-glass pf-card overflow-hidden">

        {/* Controls Header */}
        <div className="pf-card-header">
          <TableControls
            table={tableProps}
            entityLabel="พนักงาน"
            searchPlaceholder="ค้นหา ชื่อ, Username, Role, แผนก..."
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Username", "ชื่อ-นามสกุล", "โทรศัพท์", "ตำแหน่ง", "แผนก", "สถานะ", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-800 text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-slate-400 text-[13px]">
                    ไม่พบข้อมูลพนักงาน
                  </td>
                </tr>
              ) : paged.map((user, idx) => {
                const p       = user.profile;
                const status  = getStatusConfig(user.status);
                const levelCfg = p?.role?.level !== undefined ? getLevelColor(p.role.level) : null;

                return (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-50 transition-colors hover:bg-slate-50/60 ${idx % 2 === 0 ? "" : "bg-white/40"}`}
                  >
                    {/* Username */}
                    <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">
                      {user.username}
                    </td>

                    {/* Full Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">
                        {[p?.firstName, p?.lastName].filter(Boolean).join(" ") || "—"}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {p?.telephoneNumber || "—"}
                    </td>

                    {/* Role + Level badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p?.role ? (
                        <div className="flex items-center gap-2">
                          <Briefcase size={12} className="text-slate-400 shrink-0" />
                          <span className="text-slate-700 font-medium">{p.role.name}</span>
                          {levelCfg && (
                            <span className="pf-badge text-[9px]"
                              style={{ background: levelCfg.bg, color: levelCfg.text, border: `1px solid ${levelCfg.border}` }}>
                              Lv.{p.role.level}
                            </span>
                          )}
                        </div>
                      ) : "—"}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p?.department ? (
                        <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span className="text-slate-600">{p.department.name}</span>
                        </div>
                      ) : "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="pf-badge"
                        style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: status.dot }} />
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/admin/userProfile/edit/${user.id}`}>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => setDeleteTarget(user)}
                          disabled={user.status === "TERMINATED" || user.status === "RESIGNED"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Controls Footer (Pagination) */}
        <div className="pf-card-header border-t border-slate-100 border-b-0">
          <TableControls
            table={tableProps}
            entityLabel="พนักงาน"
            searchPlaceholder=""
          />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
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
          if (pendingStatus) await executeDelete(pendingStatus, username);
        }}
        loading={deleting || supervisorLoading}
        title="อนุมัติการระงับบัญชี"
        description="กรุณาระบุรหัสผู้ดูแล Level 0 เพื่อยืนยันการระงับบัญชีผู้ใช้นี้"
      />
    </div>
  );
}
