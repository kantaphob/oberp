"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, ShieldAlert, Search, RefreshCw, AlertCircle, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Department = { id: string; code: string; name: string; };
type JobLine = { id: string; code: string; name: string; };
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
  parentRole?: { id: string; name: string; prefix: string; } | null;
};

export default function JobRolePage() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobLines, setJobLines] = useState<JobLine[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
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
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (role?: JobRole) => {
    setError("");
    if (role) {
      setFormData({
        id: role.id,
        name: role.name,
        prefix: role.prefix,
        level: role.level,
        description: role.description || "",
        departmentId: role.departmentId || "",
        jobLineId: role.jobLineId || "",
        parentRoleId: role.parentRoleId || "",
        isActive: role.isActive !== undefined ? role.isActive : true,
      });
    } else {
      setFormData({ 
        id: "", name: "", prefix: "", level: 10, 
        description: "", departmentId: "", jobLineId: "", parentRoleId: "", isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Basic Validation for self assignment
    if (formData.id && formData.parentRoleId === formData.id) {
      setError("ไม่สามารถเลือกหัวหน้างานเป็นตัวเองได้");
      setSaving(false);
      return;
    }

    try {
      const isEdit = !!formData.id;
      const endpoint = isEdit ? `/api/jobroles/${formData.id}` : "/api/jobroles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
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
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      await fetchData();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredData = jobRoles.filter(
    (role) =>
      role.isActive !== false &&
      (role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.department?.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-600" />
            Job Role (ตำแหน่งงาน)
          </h1>
          <p className="text-sm text-slate-500 mt-1 pl-8">
            โครงสร้างเส้นสายการบังคับบัญชา และการตั้งตำแหน่งงาน
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>เพิ่มตำแหน่ง</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อตำแหน่ง, ตัวย่อ หรือ เเผนก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>รีเฟรช</span>
          </button>
        </div>

        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-white shadow-sm shadow-slate-100 z-10">
              <tr>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-24">LV.</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-1/4">ตำแหน่ง (Role)</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-44">ตัวย่อ (Prefix)</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">สังกัด (Dept / Line)</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-48">รายงานตรงต่อ (Reports To)</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider text-right w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && jobRoles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-slate-300" />
                    <p>กำลังโหลดข้อมูลตำแหน่งงาน...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <ShieldAlert className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-lg font-medium text-slate-600">ไม่พบข้อมูลคำค้นหา</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-sm font-bold text-slate-700 align-top">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${role.level <= 2 ? 'bg-red-100 text-red-700' : 
                          role.level <= 4 ? 'bg-orange-100 text-orange-700' : 
                          role.level <= 8 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}
                      `}>
                        {role.level}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900 border-l border-slate-100/50">
                      {role.name}
                      {role.description && <div className="text-xs text-slate-400 mt-1 font-normal line-clamp-1">{role.description}</div>}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-mono text-xs font-bold tracking-widest">
                        {role.prefix}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {role.department ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-800">🏢 {role.department.name}</span>
                          {role.jobLine && <span className="text-slate-500 pl-4">↳ {role.jobLine.name}</span>}
                        </div>
                      ) : <span className="text-slate-400 italic">ไม่ระบุสังกัด</span>}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {role.parentRole ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs rounded-md border border-amber-100/50">
                          <Network size={12} className="opacity-60" />
                          <span className="font-medium">{role.parentRole.prefix}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic opacity-70">- ไม่มีหน. (สูงสุด)</span>
                      )}
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal(role)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="แก้ไขรายละเอียด"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden custom-scrollbar"
            >
              <div className="sticky top-0 px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-500" />
                  {formData.id ? "สายบังคับบัญชา - แก้ไข" : "สายบังคับบัญชา - สร้างใหม่"}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4 md:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2"> ข้อมูลพื้นฐาน</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อตำแหน่ง (Name) <span className="text-red-500">*</span></label>
                    <input
                      type="text" required value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น Managing Director, Project Manager"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสย่อหน้าไซต์ (Prefix) <span className="text-red-500">*</span></label>
                    <input
                      type="text" required value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                      placeholder="เช่น MD, PM, SE, FM"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2 mt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2"> องค์กรและสายบังคับบัญชา (Matrix Org.)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ระดับ (Level 0-10)</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      {[0,1,2,3,4,5,6,7,8,9,10].map(lvl => (
                        <option key={lvl} value={lvl}>Level {lvl} {lvl === 0 ? '(บริหารระดับสูง)' : lvl === 10 ? '(พนักงานทั่วไป)' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      หัวหน้าสายตรง (Reports To)
                    </label>
                    <select
                      value={formData.parentRoleId}
                      onChange={(e) => setFormData({ ...formData, parentRoleId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-amber-900"
                    >
                      <option value="">-- [ไม่มีหัวหน้า / ขึ้นตรงบริหาร] --</option>
                      {jobRoles
                        .filter(r => r.id !== formData.id && r.level <= formData.level && r.isActive !== false) // กรองตำแหน่งเป้าหมาย
                        .sort((a,b) => a.level - b.level)
                        .map(r => (
                        <option key={r.id} value={r.id}>[LV.{r.level}] {r.prefix} - {r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-slate-700">
                      สถานะ: เปิดใช้งาน (Active) - ติ๊กออกเพื่อระงับการใช้งานและซ่อนจากระบบ
                    </label>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">แผนกหลัก (Department)</label>
                      <select
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                      >
                        <option value="">-- เลือกแผนก --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">รับรหัสสายงาน (JobLine)</label>
                      <select
                        value={formData.jobLineId}
                        onChange={(e) => setFormData({ ...formData, jobLineId: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                      >
                        <option value="">-- เลือกสายงานวิชาชีพ --</option>
                        {jobLines.map(jl => (
                          <option key={jl.id} value={jl.id}>{jl.code} - {jl.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">เนื้องาน/ความรับผิดชอบเพิ่มเติม</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="ข้อมูลบันทึกเกี่ยวกับตำแหน่งนี้"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                    />
                  </div>

                </div>

                <div className="pt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-6 -mb-6 p-6 border-t border-slate-100">
                  <button
                    type="button" onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20"
                  >
                    {saving && <RefreshCw size={16} className="animate-spin" />}
                    <span>{saving ? "กำลังเพิ่มผังองค์กร..." : "บันทึกข้อมูลตำแหน่ง"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}