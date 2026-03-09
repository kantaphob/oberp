"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Check, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MaterialCategory = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export default function MaterialCategoryPage() {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/materialcategories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
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

  const openModal = (category?: MaterialCategory) => {
    setError("");
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      });
    } else {
      setFormData({ id: "", name: "", description: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: "", name: "", description: "", isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = formData.id
        ? `/api/materialcategories/${formData.id}`
        : "/api/materialcategories";
      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          isActive: formData.isActive,
        }),
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
      !confirm(`ยืนยันการระงับการใช้งานหมวดหมู่วัสดุ "${name}"?
(ระบบจะเปลี่ยนสถานะเป็น Inactive หากหมวดหมู่นี้ไม่ได้ถูกใช้กับวัสดุใดในระบบ)`)
    )
      return;

    try {
      const res = await fetch(`/api/materialcategories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredData = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 space-y-6 min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Material Categories
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              จัดการหมวดหมู่วัสดุก่อสร้าง (เช่น หมวดงานคอนกรีต, หมวดเหล็กเส้น, ฯลฯ)
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 font-medium"
        >
          <Plus size={20} />
          เพิ่มหมวดหมู่วัสดุ
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อหมวดหมู่ หรือรายละเอียด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder-slate-400"
            />
          </div>
          <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
            ทั้งหมด {filteredData.length} รายการ
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16 text-center">
                  #
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  ชื่อหมวดหมู่วัสดุ
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  รายละเอียดเพิ่มเติม (คำอธิบาย)
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    ไม่มีข้อมูลหมวดหมู่วัสดุ
                  </td>
                </tr>
              ) : (
                filteredData.map((category, idx) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-4 px-6 text-sm text-slate-400 font-medium text-center align-middle">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <p className="text-sm font-bold text-slate-700">
                        {category.name}
                      </p>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      {category.description ? (
                         <span className="text-sm font-medium text-slate-500">
                           {category.description}
                         </span>
                      ) : (
                         <span className="text-sm italic text-slate-400">- ไม่ระบุ -</span>
                      )}
                    </td>
                    <td className="py-4 px-6 align-middle text-center">
                      {category.isActive ? (
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
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขหมวดหมู่วัสดุ"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            category.isActive
                              ? "text-red-500 hover:bg-red-50"
                              : "text-slate-400 cursor-not-allowed"
                          }`}
                          title={
                            category.isActive
                              ? "ระงับการใช้งาน"
                              : "ไม่รองรับการแก้ไข"
                          }
                          disabled={!category.isActive}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" />
                  {formData.id
                    ? "แก้ไขหมวดหมู่ (Edit Category)"
                    : "เพิ่มหมวดหมู่ใหม่ (New Category)"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2">
                    <X size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    ชื่อหมวดหมู่วัสดุ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="เช่น หมวดงานดินและทราย, หมวดคอนกรีต"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    รายละเอียด (อธิบายเพิ่มเติม)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="ใส่คำอธิบายเพิ่มเติมเกี่ยวกับหมวดหมู่นี้ (ถ้ามี)..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium resize-none shadow-sm shadow-slate-100 inset-0"
                  />
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

                <div className="pt-4 flex items-center justify-end gap-3 mt-6 border-t border-slate-100/50 pt-6">
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
                    <span>{saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
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
