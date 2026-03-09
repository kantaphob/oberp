"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Check, X, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MaterialCategory = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  name: string;
};

type MaterialCatalog = {
  id: string;
  code: string;
  name: string;
  brand: string | null;
  categoryId: string | null;
  category: MaterialCategory | null;
  unitId: string;
  unit: Unit;
  costType: string;
  unitPrice: number;
  laborPrice: number;
  isActive: boolean;
};

export default function MaterialCatalogPage() {
  const [catalogs, setCatalogs] = useState<MaterialCatalog[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    name: "",
    brand: "",
    categoryId: "",
    unitId: "",
    costType: "MATERIAL",
    unitPrice: 0,
    laborPrice: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, unitRes, catalogRes] = await Promise.all([
        fetch("/api/materialcategories"),
        fetch("/api/units"),
        fetch("/api/materialcatalogs"),
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (unitRes.ok) setUnits(await unitRes.json());
      if (catalogRes.ok) setCatalogs(await catalogRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (catalog?: MaterialCatalog) => {
    setError("");
    if (catalog) {
      setFormData({
        id: catalog.id,
        code: catalog.code,
        name: catalog.name,
        brand: catalog.brand || "",
        categoryId: catalog.categoryId || "",
        unitId: catalog.unitId,
        costType: catalog.costType || "MATERIAL",
        unitPrice: catalog.unitPrice,
        laborPrice: catalog.laborPrice,
        isActive: catalog.isActive,
      });
    } else {
      setFormData({
        id: "",
        code: "",
        name: "",
        brand: "",
        categoryId: "",
        unitId: "",
        costType: "MATERIAL",
        unitPrice: 0,
        laborPrice: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      id: "",
      code: "",
      name: "",
      brand: "",
      categoryId: "",
      unitId: "",
      costType: "MATERIAL",
      unitPrice: 0,
      laborPrice: 0,
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = formData.id
        ? `/api/materialcatalogs/${formData.id}`
        : "/api/materialcatalogs";
      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          brand: formData.brand || null,
          categoryId: formData.categoryId || null,
          unitId: formData.unitId,
          costType: formData.costType,
          unitPrice: Number(formData.unitPrice),
          laborPrice: Number(formData.laborPrice),
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
      !confirm(`ยืนยันการระงับการใช้งานวัสดุ "${name}"?\n(ระบบจะเปลี่ยนสถานะเป็น Inactive หากวัสดุนี้ไม่ได้ถูกใช้ใน BOQ ใดๆ)`)
    )
      return;

    try {
      const res = await fetch(`/api/materialcatalogs/${id}`, {
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

  const filteredData = catalogs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.brand && c.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category && c.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 space-y-6 min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Box className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Material Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              จัดการรายการวัสดุก่อสร้างและค่าแรง
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 font-medium"
        >
          <Plus size={20} />
          เพิ่มรายการวัสดุ
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
              placeholder="ค้นหารหัส, ชื่อวัสดุ, แบรนด์ หรือหมวดหมู่..."
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  รหัสวัสดุ
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  ชื่อรายการ / แบรนด์
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  หมวดหมู่ / ประเภท
                </th>
                <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">
                  ราคาวัสดุ / ค่าแรง
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ไม่มีข้อมูลรายการวัสดุ
                  </td>
                </tr>
              ) : (
                filteredData.map((catalog) => (
                  <tr
                    key={catalog.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-4 px-6 align-middle">
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {catalog.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <p className="text-sm font-bold text-slate-800">
                        {catalog.name}
                      </p>
                      {catalog.brand && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          แบรนด์: {catalog.brand}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <p className="text-sm font-medium text-slate-600">
                        {catalog.category?.name || "-"}
                      </p>
                      <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {catalog.costType === "MATERIAL" && "วัสดุ (Material)"}
                        {catalog.costType === "LABOR" && "ค่าแรง (Labor)"}
                        {catalog.costType === "EQUIPMENT" && "เครื่องจักร (Equipment)"}
                        {catalog.costType === "SUBCONTRACTOR" && "รับเหมาช่วง (Sub-contractor)"}
                        {catalog.costType === "SERVICE" && "บริการ/อื่นๆ (Service)"}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-indigo-600">
                          ฿ {catalog.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-slate-400 font-normal">/ {catalog.unit?.name || "-"}</span>
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          ค่าแรง: ฿ {catalog.laborPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle text-center">
                      {catalog.isActive ? (
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
                          onClick={() => openModal(catalog)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขรายการวัสดุ"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(catalog.id, catalog.name)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            catalog.isActive
                              ? "text-red-500 hover:bg-red-50"
                              : "text-slate-400 cursor-not-allowed"
                          }`}
                          title={
                            catalog.isActive
                              ? "ระงับการใช้งาน"
                              : "ไม่รองรับการแก้ไข"
                          }
                          disabled={!catalog.isActive}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Box className="w-5 h-5 text-indigo-500" />
                  {formData.id
                    ? "แก้ไขรายการวัสดุ"
                    : "เพิ่มรายการวัสดุใหม่"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2">
                    <X size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      รหัสวัสดุ (Code) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="เช่น MAT-001"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      ชื่อวัสดุ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="ปูนซีเมนต์ปอร์ตแลนด์"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      แบรนด์/ยี่ห้อ (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      placeholder="เช่น SCG"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      หมวดหมู่วัสดุ
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    >
                      <option value="">-- ไม่ระบุ --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      ราคาวัสดุ (ต่อหน่วย)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, unitPrice: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      ค่าแรง (ต่อหน่วย)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.laborPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, laborPrice: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      หน่วยนับ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.unitId}
                      onChange={(e) =>
                        setFormData({ ...formData, unitId: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    >
                      <option value="">-- เลือกหน่วย --</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-center pt-8">
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

