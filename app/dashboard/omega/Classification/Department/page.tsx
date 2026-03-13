"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, ShieldAlert, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTableControls } from "@/app/hooks/useTableControls";
import { TableControls } from "@/app/components/Dashboard/TableControls";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { useSupervisor } from "@/app/hooks/useSupervisor";

type Department = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export default function DepartmentPage() {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [itemToDelete, setItemToDelete] = useState<Department | null>(null);
  
  const {
    isOpen: isSupervisorOpen,
    loading: supervisorLoading,
    openModal: openSupervisorModal,
    closeModal: closeSupervisorModal,
  } = useSupervisor();
  
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    name: "",
    description: "",
  });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openModal = (dept?: Department) => {
    setError("");
    if (dept) {
      setFormData({
        id: dept.id,
        code: dept.code,
        name: dept.name,
        description: dept.description || "",
      });
    } else {
      setFormData({ id: "", code: "", name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: "", code: "", name: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent, approverUsername?: string) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const isEdit = !!formData.id;
      const endpoint = isEdit ? `/api/departments/${formData.id}` : "/api/departments";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          approverUsername,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.requireSupervisor) {
          openSupervisorModal(async (username) => {
            await handleSubmit(null as any, username);
          });
          return;
        }
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      await fetchDepartments();
      closeModal();
      closeSupervisorModal();
      toast.success(isEdit ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มข้อมูลสำเร็จ");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/departments/${itemToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");
      }
      toast.success("ลบข้อมูลแผนกเรียบร้อยแล้ว");
      await fetchDepartments();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const { paged, tableProps } = useTableControls(departments, {
    searchKeys: ["code", "name"],
    defaultPerPage: 10,
  });

  const isLevel0 = session?.user?.level === 0;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Departments (แผนก)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดการข้อมูลแผนก โครงสร้าง และหน้าที่รับผิดชอบในองค์กร
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>เพิ่มแผนกใหม่</span>
        </button>
      </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
            <TableControls table={tableProps} entityLabel="แผนก" searchPlaceholder="ค้นหาจากรหัสแผนก หรือชื่อแผนก..." actions={
              <button
                onClick={fetchDepartments}
                className="flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span>รีเฟรช</span>
              </button>
            } />
          </div>

        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm shadow-slate-100 z-10">
              <tr>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-24">
                  รหัส (Code)
                </th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-1/4">
                  ชื่อแผนก
                </th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
                  หน้าที่รับผิดชอบ / ตำแหน่ง
                </th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider text-right w-32">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-slate-300" />
                    <p>กำลังโหลดข้อมูลแผนก...</p>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <ShieldAlert className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-lg font-medium text-slate-600">ไม่พบข้อมูลแผนก</p>
                    <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือเพิ่มแผนกใหม่</p>
                  </td>
                </tr>
              ) : (
                paged.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-sm font-bold text-slate-700 align-top">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900 align-top leading-relaxed">
                      {dept.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 align-top leading-relaxed whitespace-pre-line">
                      {dept.description || "-"}
                    </td>
                    <td className="py-4 px-6 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(dept)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="แก้ไขรายละเอียด"
                        >
                          <Edit size={16} />
                        </button>
                        {isLevel0 ? (
                          <button
                            onClick={() => {
                              setItemToDelete(dept);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="ลบแผนก"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-2 text-slate-300 cursor-not-allowed rounded-lg"
                            title="ระบบป้องกันการลบข้อมูลเชิงโครงสร้าง"
                          >
                            <ShieldAlert size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          <TableControls table={tableProps} entityLabel="แผนก" searchPlaceholder="" />
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">
                  {formData.id ? "แก้ไขข้อมูลแผนก" : "เพิ่มแผนกใหม่"}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      รหัสแผนก (Code) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="เช่น EXC, OPS, ENG"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      ชื่อแผนก <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น ฝ่ายบริหารงาน (Executive & Board)"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      หน้าที่รับผิดชอบ / ตำแหน่ง
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="อธิบายหน้าที่และความรับผิดชอบของแผนกนี้ รวมถึงรายชื่อตำแหน่ง..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving && <RefreshCw size={16} className="animate-spin" />}
                    <span>{saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">ยืนยันการลบข้อมูล?</h3>
                <p className="text-slate-500 mb-6">
                  คุณกำลังจะลบแผนก <span className="font-semibold text-slate-700">"{itemToDelete?.name}"</span> ({itemToDelete?.code}) <br/>
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70"
                  >
                    {saving && <RefreshCw size={16} className="animate-spin" />}
                    <span>{saving ? "กำลังลบ..." : "ยืนยันการลบ"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SupervisorModal
        isOpen={isSupervisorOpen}
        onClose={closeSupervisorModal}
        onConfirm={async (username) => {}}
        loading={saving || supervisorLoading}
        title="อนุมัติการแก้ไขข้อมูลแผนก"
        description="กรุณาระบุรหัสผู้ดูแล Level 0 หรือ Master Key เพื่อยืนยันการบันทึกโครงสร้างองค์กร"
      />
    </div>
  );
}
