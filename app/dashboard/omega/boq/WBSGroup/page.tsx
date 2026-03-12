"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, X, Layers, Component } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTableControls } from "@/app/hooks/useTableControls";
import { TableControls } from "@/app/components/Dashboard/TableControls";

type WBSGroup = {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
  parent?: WBSGroup | null;
};

export default function WBSGroupPage() {
  const [wbsGroups, setWbsGroups] = useState<WBSGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    name: "",
    parentId: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wbsgroups");
      if (res.ok) {
        const data = await res.json();
        setWbsGroups(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (group?: WBSGroup) => {
    setError("");
    if (group) {
      setFormData({
        id: group.id,
        code: group.code,
        name: group.name,
        parentId: group.parentId || "",
        isActive: group.isActive,
      });
    } else {
      setFormData({ id: "", code: "", name: "", parentId: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: "", code: "", name: "", parentId: "", isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = formData.id ? `/api/wbsgroups/${formData.id}` : "/api/wbsgroups";
      const method = formData.id ? "PUT" : "POST";

      const payload = {
        code: formData.code,
        name: formData.name,
        parentId: formData.parentId || null,
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      await fetchData();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(`ยืนยันการระงับการใช้งานหมวดหมู่งาน WBS "${name}"?
(ระบบจะเปลี่ยนสถานะเป็น Inactive เพื่องดการใช้งานชั่วคราว หากไม่มีข้อมูลลูกข่ายหรือ BOQ Item ผูกพันอยู่)`)
    )
      return;

    try {
      const res = await fetch(`/api/wbsgroups/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const { paged, tableProps } = useTableControls(wbsGroups, {
    filterFn: (g, term) => [
      g.code, g.name, g.parent?.name ?? "", g.parent?.code ?? ""
    ].some(v => v.toLowerCase().includes(term)),
    defaultPerPage: 10,
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 space-y-6 min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Work Breakdown Structure
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              จัดโครงสร้างหมวดหมู่งานหลัก-งานย่อย (WBS) สำหรับฐานข้อมูลกลาง (BOQ)
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 font-medium"
        >
          <Plus size={20} />
          เพิ่มหมวด WBS 
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <TableControls table={tableProps} entityLabel="หมวดหมู่ WBS" searchPlaceholder="ค้นหารหัส หรือชื่อหมวดหมู่..." />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">
                  รหัส WBS
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  ชื่อหมวดหมู่ (WBS Name)
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  หมวดหมู่หลัก (Parent)
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center w-28">
                  สถานะ
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right border-b border-slate-200 w-24">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-medium text-slate-400">
                    ไม่มีข้อมูลโครงสร้าง WBS ที่ค้นหา
                  </td>
                </tr>
              ) : (
                paged.map((group) => (
                  <tr
                    key={group.id}
                    className="hover:bg-slate-50/80 transition-colors group/row"
                  >
                    <td className="py-4 px-6 align-middle">
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-mono text-xs font-bold rounded-lg border border-indigo-100">
                        {group.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        {group.parentId && <Component size={14} className="text-slate-400" />}
                        {group.name}
                      </p>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      {group.parent ? (
                         <span className="text-sm font-medium text-slate-500">
                           {group.parent.code} - {group.parent.name}
                         </span>
                      ) : (
                         <span className="text-xs italic text-slate-400">-- หมวดหมู่หลัก --</span>
                      )}
                    </td>
                    <td className="py-4 px-6 align-middle text-center">
                      {group.isActive ? (
                        <span className="inline-flex flex-col items-center justify-center">
                          <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-green-200">
                            <Check size={12} className="text-green-600" />
                            Active
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex flex-col items-center justify-center">
                          <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-slate-200 opacity-80">
                            <X size={12} className="text-slate-400" />
                            Inactive
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(group)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขหมวดหมู่"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id, group.name)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            group.isActive
                              ? "text-red-500 hover:bg-red-50"
                              : "text-slate-400 cursor-not-allowed"
                          }`}
                          title={
                            group.isActive
                              ? "ระงับการใช้งาน"
                              : "ไม่รองรับการแก้ไข"
                          }
                          disabled={!group.isActive}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          <TableControls table={tableProps} entityLabel="หมวดหมู่ WBS" searchPlaceholder="" />
        </div>
      </div>

      {/* Modal */}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  {formData.id
                    ? "แก้ไข WBS (Edit WBS Group)"
                    : "เพิ่ม WBS ใหม่ (New WBS Group)"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2">
                    <X size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      รหัส WBS Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="เช่น 01, 01.1, 02.A"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium uppercase"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      ชื่อหมวดหมู่งาน (WBS Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="เช่น งานโครงสร้างทั่วไป, งานฐานราก"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      สังกัดหมวดหมู่หลัก (Parent Group)
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) =>
                        setFormData({ ...formData, parentId: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    >
                      <option value="">-- เป็นหมวดหมู่โครงสร้างหลัก (Level 1) --</option>
                      {wbsGroups
                        .filter((g) => g.id !== formData.id && g.isActive !== false)
                        .map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.code} - {g.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2.5 text-sm font-bold text-slate-700 cursor-pointer"
                  >
                    เปิดใช้งาน (Active)
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 mt-6 border-t border-slate-100/50">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm shadow-indigo-600/20"
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    <span>{saving ? "กำลังบันทึก..." : "บันทึกฐานข้อมูล WBS"}</span>
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
