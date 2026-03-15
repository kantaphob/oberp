"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Shield,
  DollarSign,
  Users,
  MoreVertical,
  Building2,
  TrendingUp,
  Loader2,
  Save,
  Trash2,
  Edit2,
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";

interface JobRole {
  id: string;
  name: string;
  prefix: string;
  level: number;
  departmentId: string | null;
  jobLineId: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  startingSalary: number | null;
  defaultPaymentType: string;
  description: string | null;
  department?: { name: string };
  jobLine?: { name: string };
  _count?: { users: number };
}

export default function JobRolePage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    prefix: "",
    level: 10,
    departmentId: "",
    jobLineId: "",
    minSalary: "",
    maxSalary: "",
    startingSalary: "",
    defaultPaymentType: "MONTHLY",
    description: "",
  });

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/hrm/job-roles");
      const result = await res.json();
      if (result.success) {
        setRoles(result.data);
      }
    } catch (error) {
      notify.error("ไม่สามารถดึงข้อมูลตำแหน่งงานได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const result = await res.json();
      if (Array.isArray(result)) {
        setDepartments(result);
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/job-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        notify.success(
          formData.id ? "อัปเดตตำแหน่งงานสำเร็จ" : "สร้างตำแหน่งงานสำเร็จ",
        );
        setShowModal(false);
        resetForm();
        fetchRoles();
      } else {
        notify.error("เกิดข้อผิดพลาด", result.message);
      }
    } catch (error) {
      notify.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      prefix: "",
      level: 10,
      departmentId: "",
      jobLineId: "",
      minSalary: "",
      maxSalary: "",
      startingSalary: "",
      defaultPaymentType: "MONTHLY",
      description: "",
    });
  };

  const handleEdit = (role: JobRole) => {
    setFormData({
      id: role.id,
      name: role.name,
      prefix: role.prefix,
      level: role.level,
      departmentId: role.departmentId || "",
      jobLineId: role.jobLineId || "",
      minSalary: role.minSalary?.toString() || "",
      maxSalary: role.maxSalary?.toString() || "",
      startingSalary: role.startingSalary?.toString() || "",
      defaultPaymentType: role.defaultPaymentType,
      description: role.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบตำแหน่งงานนี้?")) return;
    try {
      const res = await fetch(`/api/hrm/job-roles?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        notify.success("ลบตำแหน่งงานสำเร็จ");
        fetchRoles();
      } else {
        notify.error("ล้มเหลว", result.message);
      }
    } catch (error) {
      notify.error("เกิดข้อผิดพลาด");
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prefix.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Briefcase size={28} />
            </div>
            Job Roles & Salary Bands
          </h2>
          <p className="text-slate-500 font-medium ml-1">
            จัดการโครงสร้างตำแหน่งงาน สายบังคับบัญชา และกระบอกเงินเดือนกลาง
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus size={18} /> สร้างตำแหน่งใหม่
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-6 group hover:border-indigo-500 transition-all">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              ระดับตำแหน่ง (Levels)
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {new Set(roles.map((r) => r.level)).size}{" "}
              <span className="text-sm font-bold text-slate-400">Levels</span>
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-6 group hover:border-emerald-500 transition-all">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              แผนกที่มีตำแหน่ง (Depts)
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {new Set(roles.map((r) => r.departmentId)).size}{" "}
              <span className="text-sm font-bold text-emerald-400">Depts</span>
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-6 group hover:border-blue-500 transition-all">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              จำนวนตำแหน่งทั้งหมด
            </p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">
              {roles.length}{" "}
              <span className="text-sm font-bold text-blue-400">Roles</span>
            </h3>
          </div>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาตำแหน่ง, รหัส Prefix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
            <Filter size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Loading Roles...
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-slate-100 italic">
                <tr>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Level / Prefix
                  </th>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Job Role
                  </th>
                  <th className="px-8 py-5 text-right font-black text-emerald-500 uppercase tracking-widest text-[10px]">
                    Salary Band
                  </th>
                  <th className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Staff
                  </th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 italic">
                {filteredRoles.map((role) => (
                  <tr
                    key={role.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-6 font-serif">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-black shadow-md">
                          {role.level}
                        </span>
                        <span className="font-black text-slate-400 tracking-widest uppercase">
                          {role.prefix}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-black text-slate-800 text-base">
                        {role.name}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-500 mt-1 tracking-widest uppercase">
                        {role.department?.name || "ไม่ระบุแผนก"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 font-black text-slate-700">
                          <span className="text-slate-400">
                            ฿ {role.minSalary?.toLocaleString() || "-"}
                          </span>
                          <span className="text-slate-300">-</span>
                          <span className="text-emerald-600">
                            ฿ {role.maxSalary?.toLocaleString() || "-"}
                          </span>
                        </div>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-gradient-to-r from-slate-300 to-emerald-400 w-full opacity-80"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 font-black rounded-lg text-xs">
                        {role._count?.users || 0}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-slate-400 hover:text-indigo-600"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-slate-400 hover:text-rose-600"
                          onClick={() => handleDelete(role.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal: สร้าง/แก้ไข ตำแหน่งงาน ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 italic">
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-white/20 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Briefcase className="text-indigo-500" />{" "}
              {formData.id ? "แก้ไขตำแหน่งงาน" : "สร้างตำแหน่งงานใหม่"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    ชื่อตำแหน่ง (Role Name) *
                  </Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="เช่น Project Manager"
                    className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    รหัสย่อ (Prefix) *
                  </Label>
                  <Input
                    required
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({ ...formData, prefix: e.target.value })
                    }
                    placeholder="เช่น PM"
                    className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    ระดับ (Level 0-13) *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="13"
                    required
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: Number(e.target.value),
                      })
                    }
                    className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-indigo-600 focus:border-indigo-500"
                  />
                  <p className="text-[10px] font-bold text-slate-400 mt-2 italic">
                    * 0 = Founder, 13 = Labor
                  </p>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    แผนก (Department)
                  </Label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    className="w-full h-14 bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 🌟 Salary Band */}
              <div className="p-6 bg-emerald-50/50 border-2 border-emerald-100 rounded-[2rem] space-y-4">
                <h4 className="font-black text-emerald-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <DollarSign size={18} /> กระบอกเงินเดือนกลาง (Salary Band)
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[10px] font-black uppercase text-emerald-600/70 mb-2 block tracking-widest">
                      ขั้นต่ำ (Min Salary)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.minSalary}
                      onChange={(e) =>
                        setFormData({ ...formData, minSalary: e.target.value })
                      }
                      className="h-12 bg-white border-2 border-emerald-100 rounded-xl font-black text-slate-700 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase text-emerald-600/70 mb-2 block tracking-widest">
                      เพดานสูงสุด (Max Salary)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.maxSalary}
                      onChange={(e) =>
                        setFormData({ ...formData, maxSalary: e.target.value })
                      }
                      className="h-12 bg-white border-2 border-emerald-100 rounded-xl font-black text-emerald-600 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-emerald-600/70 italic leading-relaxed">
                  *
                  ใช้สำหรับควบคุมงบประมาณและตรวจสอบความเหมาะสมเมื่อปรับเงินเดือน
                </p>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-16 rounded-[2rem] font-black uppercase text-xs tracking-widest text-slate-400"
                >
                  ยกเลิก
                </Button>
                <Button
                  disabled={submitting}
                  className="flex-[2] h-16 bg-slate-900 hover:bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all"
                >
                  {submitting && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  {formData.id ? "บันทึกการแก้ไข" : "สร้างตำแหน่งงาน"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
