"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  ShieldAlert,
  Search,
  RefreshCw,
  AlertCircle,
  Network,
  Users,
  Layers,
  TrendingUp,
  ChevronRight,
  Building2,
  GitBranch,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTableControls } from "@/app/hooks/useTableControls";
import { TableControls } from "@/app/components/Dashboard/TableControls";

type Department = { id: string; code: string; name: string };
type JobLine = { id: string; code: string; name: string };
type JobRole = {
  id: string;
  name: string;
  prefix: string;
  level: number;
  description: string | null;
  departmentId: string | null;
  jobLineId: string | null;
  parentRoleId: string | null;
  isActive: boolean;
  department?: Department | null;
  jobLine?: JobLine | null;
  parentRole?: { id: string; name: string; prefix: string } | null;
};

// ── Level config ──────────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; bar: string; ring: string }
> = {
  "0": {
    label: "Executive",
    color: "text-rose-700",
    bg: "bg-rose-50",
    bar: "bg-rose-500",
    ring: "ring-rose-200",
  },
  "1": {
    label: "C-Suite",
    color: "text-rose-700",
    bg: "bg-rose-50",
    bar: "bg-rose-400",
    ring: "ring-rose-200",
  },
  "2": {
    label: "Director",
    color: "text-orange-700",
    bg: "bg-orange-50",
    bar: "bg-orange-500",
    ring: "ring-orange-200",
  },
  "3": {
    label: "Manager",
    color: "text-amber-700",
    bg: "bg-amber-50",
    bar: "bg-amber-500",
    ring: "ring-amber-200",
  },
  "4": {
    label: "Sr. Lead",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    bar: "bg-yellow-500",
    ring: "ring-yellow-200",
  },
  "5": {
    label: "Lead",
    color: "text-lime-700",
    bg: "bg-lime-50",
    bar: "bg-lime-500",
    ring: "ring-lime-200",
  },
  "6": {
    label: "Senior",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    bar: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  "7": {
    label: "Staff",
    color: "text-teal-700",
    bg: "bg-teal-50",
    bar: "bg-teal-500",
    ring: "ring-teal-200",
  },
  "8": {
    label: "Jr. Staff",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    bar: "bg-cyan-500",
    ring: "ring-cyan-200",
  },
  "9": {
    label: "Trainee",
    color: "text-blue-700",
    bg: "bg-blue-50",
    bar: "bg-blue-400",
    ring: "ring-blue-200",
  },
  "10": {
    label: "General",
    color: "text-slate-600",
    bg: "bg-slate-100",
    bar: "bg-slate-400",
    ring: "ring-slate-200",
  },
};
const getLevelCfg = (lv: number) =>
  LEVEL_CONFIG[String(lv)] ?? LEVEL_CONFIG["10"];

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 overflow-hidden flex items-center gap-4"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">
          {value}
        </p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div
        className={`absolute right-0 top-0 h-full w-1 rounded-r-2xl ${color.replace("bg-", "bg-").split(" ")[0]}`}
      />
    </motion.div>
  );
}

// ── Level Bar Visual ───────────────────────────────────────────────────────────
function LevelBar({ level }: { level: number }) {
  const cfg = getLevelCfg(level);
  const fill = Math.max(5, Math.round(((10 - level) / 10) * 100));
  return (
    <div className="flex items-center gap-2.5 min-w-[110px]">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-extrabold ring-2 ${cfg.bg} ${cfg.color} ${cfg.ring} shrink-0`}
      >
        {level}
      </div>
      <div className="flex-1">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
          <div
            className={`h-full rounded-full ${cfg.bar} transition-all`}
            style={{ width: `${fill}%` }}
          />
        </div>
        <span className={`text-[10px] font-semibold mt-0.5 block ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function JobRolePage() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobLines, setJobLines] = useState<JobLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const { paged, tableProps } = useTableControls<JobRole>(
    jobRoles
      .filter(r => r.isActive !== false)
      .filter(r => filterLevel === "all" || String(r.level) === filterLevel)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)),
    {
      filterFn: (role, term) => [
        role.name, role.prefix, role.department?.name ?? ""
      ].some(v => v.toLowerCase().includes(term)),
      defaultPerPage: 15,
    }
  );

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    prefix: "",
    level: 10,
    description: "",
    departmentId: "",
    jobLineId: "",
    parentRoleId: "",
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRoles, resDepts, resLines] = await Promise.all([
        fetch("/api/jobroles"),
        fetch("/api/departments"),
        fetch("/api/joblines"),
      ]);
      if (resRoles.ok) setJobRoles(await resRoles.json());
      if (resDepts.ok) setDepartments(await resDepts.json());
      if (resLines.ok) setJobLines(await resLines.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (role?: JobRole) => {
    setError("");
    setFormData(
      role
        ? {
            id: role.id,
            name: role.name,
            prefix: role.prefix,
            level: role.level,
            description: role.description || "",
            departmentId: role.departmentId || "",
            jobLineId: role.jobLineId || "",
            parentRoleId: role.parentRoleId || "",
            isActive: role.isActive !== undefined ? role.isActive : true,
          }
        : {
            id: "",
            name: "",
            prefix: "",
            level: 10,
            description: "",
            departmentId: "",
            jobLineId: "",
            parentRoleId: "",
            isActive: true,
          },
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id && formData.parentRoleId === formData.id) {
      setError("ไม่สามารถเลือกหัวหน้างานเป็นตัวเองได้");
      setSaving(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const isEdit = !!formData.id;
      const res = await fetch(
        isEdit ? `/api/jobroles/${formData.id}` : "/api/jobroles",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            prefix: formData.prefix.toUpperCase(),
            level: Number(formData.level),
            description: formData.description,
            departmentId: formData.departmentId || null,
            jobLineId: formData.jobLineId || null,
            parentRoleId: formData.parentRoleId || null,
            isActive: formData.isActive,
          }),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "เกิดข้อผิดพลาด");
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeRoles = jobRoles.filter((r) => r.isActive !== false);
  const topLevelCount = activeRoles.filter((r) => !r.parentRoleId).length;
  const deptCount = new Set(
    activeRoles.map((r) => r.departmentId).filter(Boolean),
  ).size;

  return (
    <>
      <style>{`
        .glass-modal {
          background: linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,250,255,0.96) 100%);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 32px 80px rgba(99,113,183,0.18), 0 1px 0 rgba(255,255,255,1) inset;
        }
        .glass-input {
          background: rgba(248,250,255,0.8);
          border: 1px solid rgba(203,213,240,0.6);
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .glass-input:focus {
          background: rgba(255,255,255,1);
          border-color: rgba(99,130,255,0.5);
          box-shadow: 0 0 0 3px rgba(99,130,255,0.12);
          outline: none;
        }
        .glass-section {
          background: linear-gradient(135deg, rgba(248,250,255,0.7), rgba(240,245,255,0.5));
          border: 1px solid rgba(210,220,245,0.5);
          backdrop-filter: blur(4px);
        }
        .row-hover:hover { background: rgba(248,250,255,0.8); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .level-pill {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,255,0.7));
          border: 1px solid rgba(210,220,245,0.8);
          box-shadow: 0 1px 3px rgba(99,113,183,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
        }
      `}</style>

      <div className="flex flex-col h-full gap-5">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/25">
                <Network className="w-5 h-5 text-white" />
              </div>
              โครงสร้างตำแหน่งงาน
            </h1>
            <p className="text-sm text-slate-500 mt-1 pl-[46px]">
              Job Role · สายบังคับบัญชา &amp; ผังองค์กร
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/25 text-sm"
          >
            <Plus size={17} />
            เพิ่มตำแหน่งงาน
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="ตำแหน่งทั้งหมด"
            value={activeRoles.length}
            sub="Active roles"
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            icon={TrendingUp}
            label="ระดับบริหาร"
            value={activeRoles.filter((r) => r.level <= 3).length}
            sub="Level 0–3"
            color="bg-rose-50 text-rose-600"
          />
          <StatCard
            icon={GitBranch}
            label="ผู้บังคับบัญชา"
            value={topLevelCount}
            sub="Top-level roles"
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={Building2}
            label="แผนก"
            value={deptCount}
            sub="Departments covered"
            color="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Toolbar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between bg-slate-50/60 items-center">
            <div className="flex-1 w-full">
              <TableControls table={tableProps} entityLabel="ตำแหน่ง" searchPlaceholder="ค้นหาตำแหน่ง, ตัวย่อ, แผนก..." />
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
              {/* Level filter chips */}
              <div className="flex gap-1.5 flex-wrap justify-end">
                {[
                  "all",
                  "0",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                ].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setFilterLevel(lv)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all
                      ${
                        filterLevel === lv
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                  >
                    {lv === "all" ? "ทั้งหมด" : `LV${lv}`}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-sm font-medium border border-slate-200 bg-white"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead className="sticky top-0 z-10 bg-white border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-36">
                    ระดับ
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    ตำแหน่งงาน
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-32">
                    Prefix
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    สังกัด
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-52">
                    รายงานตรงต่อ
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && jobRoles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-slate-400"
                    >
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-slate-300" />
                      <p className="text-sm">กำลังโหลดข้อมูล...</p>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <ShieldAlert className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                      <p className="text-base font-semibold text-slate-500">
                        ไม่พบข้อมูลที่ค้นหา
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        ลองปรับ filter หรือคำค้นหาใหม่
                      </p>
                    </td>
                  </tr>
                ) : (
                  paged
                    .map((role, idx) => {
                      const cfg = getLevelCfg(role.level);
                      const fill = Math.max(
                        5,
                        Math.round(((10 - role.level) / 10) * 100),
                      );
                      return (
                        <motion.tr
                          key={role.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.25 }}
                          className="row-hover border-b border-slate-50 transition-colors group"
                        >
                          {/* Level */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-extrabold ring-2 ${cfg.bg} ${cfg.color} ${cfg.ring} shrink-0`}
                              >
                                {role.level}
                              </div>
                              <div className="flex-1 min-w-[56px]">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${cfg.bar}`}
                                    style={{ width: `${fill}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-[10px] font-semibold mt-0.5 block ${cfg.color}`}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Name */}
                          <td className="py-3.5 px-5">
                            <p className="text-[13px] font-semibold text-slate-800">
                              {role.name}
                            </p>
                            {role.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {role.description}
                              </p>
                            )}
                          </td>

                          {/* Prefix */}
                          <td className="py-3.5 px-5">
                            <span className="level-pill inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[12px] font-bold text-slate-700 tracking-widest">
                              {role.prefix}
                            </span>
                          </td>

                          {/* Dept/Line */}
                          <td className="py-3.5 px-5">
                            {role.department ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Building2
                                    size={12}
                                    className="text-indigo-400 shrink-0"
                                  />
                                  <span className="text-[12px] font-semibold text-slate-700">
                                    {role.department.name}
                                  </span>
                                </div>
                                {role.jobLine && (
                                  <div className="flex items-center gap-1.5 pl-0.5">
                                    <ChevronRight
                                      size={11}
                                      className="text-slate-300 shrink-0"
                                    />
                                    <span className="text-[11px] text-slate-400">
                                      {role.jobLine.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-300 italic">
                                ไม่ระบุสังกัด
                              </span>
                            )}
                          </td>

                          {/* Reports To */}
                          <td className="py-3.5 px-5">
                            {role.parentRole ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl level-pill">
                                <GitBranch
                                  size={12}
                                  className="text-amber-500 shrink-0"
                                />
                                <div>
                                  <span className="text-[12px] font-bold text-amber-700 tracking-wide">
                                    {role.parentRole.prefix}
                                  </span>
                                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                                    {role.parentRole.name}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-[11px] text-slate-400 font-medium">
                                  สูงสุด / Top Level
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => openModal(role)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="แก้ไข"
                            >
                              <Edit size={15} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
            <TableControls table={tableProps} entityLabel="ตำแหน่ง" searchPlaceholder="" />
          </div>
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="glass-modal fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] rounded-3xl z-50 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/25">
                    <Network className="w-4.5 h-4.5 text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-800">
                      {formData.id ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งงานใหม่"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      สายบังคับบัญชา · Matrix Org.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 custom-scrollbar px-7 py-6">
                <form
                  id="role-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

                  {/* Section 1: Basic */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200 inline-block" />
                      ข้อมูลพื้นฐาน
                      <span className="flex-1 h-px bg-slate-100 inline-block" />
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                          ชื่อตำแหน่ง <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="เช่น Managing Director, Project Manager"
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                          รหัสย่อ (Prefix){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.prefix}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prefix: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="เช่น MD, PM, SE"
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-mono tracking-widest"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Hierarchy */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200 inline-block" />
                      สายบังคับบัญชา
                      <span className="flex-1 h-px bg-slate-100 inline-block" />
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Level selector — visual */}
                      <div>
                        <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                          ระดับ (Level)
                        </label>
                        <select
                          value={formData.level}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              level: Number(e.target.value),
                            })
                          }
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lv) => {
                            const c = getLevelCfg(lv);
                            return (
                              <option key={lv} value={lv}>
                                LV.{lv} — {c.label}
                              </option>
                            );
                          })}
                        </select>
                        {/* Preview bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold ring-2 ${getLevelCfg(formData.level).bg} ${getLevelCfg(formData.level).color} ${getLevelCfg(formData.level).ring}`}
                          >
                            {formData.level}
                          </div>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getLevelCfg(formData.level).bar}`}
                              style={{
                                width: `${Math.max(5, ((10 - formData.level) / 10) * 100)}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-bold ${getLevelCfg(formData.level).color}`}
                          >
                            {getLevelCfg(formData.level).label}
                          </span>
                        </div>
                      </div>

                      {/* Reports To */}
                      <div>
                        <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                          หัวหน้าสายตรง (Reports To)
                        </label>
                        <select
                          value={formData.parentRoleId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              parentRoleId: e.target.value,
                            })
                          }
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                          style={{
                            borderColor: "rgba(251,191,36,0.4)",
                            background: "rgba(255,251,235,0.6)",
                          }}
                        >
                          <option value="">— ไม่มีหัวหน้า (Top Level) —</option>
                          {[...jobRoles]
                            .filter(
                              (r) =>
                                r.id !== formData.id &&
                                r.level <= formData.level &&
                                r.isActive !== false,
                            )
                            .sort((a, b) => a.level - b.level)
                            .map((r) => (
                              <option key={r.id} value={r.id}>
                                [LV.{r.level}] {r.prefix} – {r.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Org */}
                  <div className="glass-section rounded-2xl p-4 space-y-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={12} className="text-slate-300" />
                      องค์กร (Dept &amp; JobLine)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                          แผนกหลัก
                        </label>
                        <select
                          value={formData.departmentId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              departmentId: e.target.value,
                            })
                          }
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                        >
                          <option value="">— เลือกแผนก —</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.code} – {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                          สายงานวิชาชีพ
                        </label>
                        <select
                          value={formData.jobLineId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              jobLineId: e.target.value,
                            })
                          }
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                        >
                          <option value="">— เลือก JobLine —</option>
                          {jobLines.map((jl) => (
                            <option key={jl.id} value={jl.id}>
                              {jl.code} – {jl.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                      รายละเอียดงาน / หน้าที่
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="บันทึกข้อมูลเพิ่มเติมเกี่ยวกับตำแหน่งนี้..."
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                    />
                  </div>

                  {/* Active toggle */}
                  <div
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${
                      formData.isActive
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    <div
                      className={`w-9 h-5 rounded-full transition-all relative ${formData.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.isActive ? "left-4.5 translate-x-0.5" : "left-0.5"}`}
                      />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">
                        {formData.isActive
                          ? "เปิดใช้งาน (Active)"
                          : "ระงับการใช้งาน (Inactive)"}
                      </p>
                      <p className="text-[11px] opacity-70">
                        ติ๊กออกเพื่อซ่อนจากระบบ
                      </p>
                    </div>
                    {formData.isActive && (
                      <Check size={15} className="ml-auto text-emerald-500" />
                    )}
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-white/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="role-form"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>
                        {formData.id ? "บันทึกการแก้ไข" : "เพิ่มตำแหน่งงาน"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
