"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Check,
  X,
  AlertCircle,
  Save,
  RefreshCw,
} from "lucide-react";

type Service = {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projects: Array<{ id: string; name: string }>;
};

const mockServices: Service[] = [
  {
    id: "1",
    code: "SRV-CON",
    name: "รับเหมาก่อสร้าง (Construction)",
    description: "งานก่อสร้างอาคาร บ้านใหม่ คอนโด ตั้งแต่โครงสร้างจนจบงาน",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: [],
  },
  {
    id: "2",
    code: "SRV-EXT",
    name: "ต่อเติม (Extension)",
    description: "งานต่อเติมพื้นที่จากโครงสร้างเดิม เช่น ต่อเติมครัว โรงจอดรถ",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: [],
  },
  {
    id: "3",
    code: "SRV-REN",
    name: "รีโนเวท (Renovation)",
    description: "งานปรับปรุง ซ่อมแซม และตกแต่งใหม่บนโครงสร้างเดิม",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: [],
  },
  {
    id: "4",
    code: "SRV-DES",
    name: "ออกแบบ (Design)",
    description: "งานบริการออกแบบสถาปัตยกรรม ภายใน และเขียนแบบ",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: [],
  },
  {
    id: "5",
    code: "SRV-INS",
    name: "ตรวจบ้าน (Home Inspection)",
    description: "งานบริการตรวจรับบ้าน คอนโด ก่อนโอน หรือตรวจรอยร้าว",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: [],
  },
  {
    id: "6",
    code: "SRV-OTH",
    name: "อื่นๆ (Others)",
    description:
      "งานบริการพิเศษ งานจิปาถะ หรือโปรเจกต์ที่ยังไม่ระบุหมวดหมู่ชัดเจน",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projects: [],
  },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/services");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        const data = await response.json();
        setServices(data);
        setFilteredServices(data);
      } catch (error) {
        console.error("Error loading services:", error);
        // Fallback to mock data if API fails
        setServices(mockServices);
        setFilteredServices(mockServices);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter services
  useEffect(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter((service) => service.isActive);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, showInactive]);

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      isActive: true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      code: service.code,
      name: service.name,
      description: service.description,
      isActive: service.isActive,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`คุณต้องการปิดใช้งานบริการ "${service.name}" หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete service");
      }

      // Update local state
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: false } : s)),
      );
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("ไม่สามารถลบบริการได้ กรุณาลองใหม่");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) {
      newErrors.code = "กรุณาระบุรหัสบริการ";
    }
    if (!formData.name.trim()) {
      newErrors.name = "กรุณาระบุชื่อบริการ";
    }
    if (!formData.description.trim()) {
      newErrors.description = "กรุณาระบุรายละเอียดบริการ";
    }

    // Check for duplicate code (excluding current service when editing)
    const duplicateCode = services.find(
      (s) => s.code === formData.code && s.id !== editingService?.id,
    );
    if (duplicateCode) {
      newErrors.code = "รหัสบริการนี้มีอยู่แล้ว";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingService) {
        // Update existing service
        const response = await fetch(`/api/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to update service");
        }

        const updatedService = await response.json();

        // Update local state
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? updatedService : s)),
        );
      } else {
        // Create new service
        const response = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to create service");
        }

        const newService = await response.json();

        // Update local state
        setServices((prev) => [...prev, newService]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
      alert("ไม่สามารถบันทึกบริการได้ กรุณาลองใหม่");
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle service status");
      }

      const updatedService = await response.json();

      // Update local state
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? updatedService : s)),
      );
    } catch (error) {
      console.error("Error toggling service status:", error);
      alert("ไม่สามารถเปลี่ยนสถานะบริการได้ กรุณาลองใหม่");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการบริการ</h1>
          <p className="text-gray-600 mt-1">จัดการข้อมูลบริการของบริษัท</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          เพิ่มบริการ
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="ค้นหาบริการ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">แสดงที่ปิดใช้งาน</span>
          </label>
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">
                {searchTerm || !showInactive
                  ? "ไม่พบบริการที่ตรงกับเงื่อนไข"
                  : "ไม่มีข้อมูลบริการ"}
              </p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.code}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        สร้าง:{" "}
                        {new Date(service.createdAt).toLocaleDateString(
                          "th-TH",
                        )}
                      </span>
                      <span>
                        อัปเดต:{" "}
                        {new Date(service.updatedAt).toLocaleDateString(
                          "th-TH",
                        )}
                      </span>
                      {service.projects.length > 0 && (
                        <span>โปรเจกต์: {service.projects.length}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleServiceStatus(service)}
                      className={`p-2 rounded-lg transition-colors ${
                        service.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      title={service.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    >
                      {service.isActive ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ปิดใช้งาน"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingService ? "แก้ไขบริการ" : "เพิ่มบริการใหม่"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสบริการ
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.code ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="เช่น SRV-CON"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อบริการ
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="เช่น รับเหมาก่อสร้าง"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดบริการ
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="ระบุรายละเอียดของบริการ..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-gray-700"
                  >
                    เปิดใช้งาน
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} />
                    {editingService ? "บันทึกการแก้ไข" : "สร้างบริการ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
