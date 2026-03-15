"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Loader2,
  FolderOpen,
  FolderPlus,
  FilePlus,
  X,
  GripVertical,
  Trash2,
  Edit2,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import FileUpload from "@/app/components/FileUpload";
import { Reorder } from "framer-motion";
import { ConfirmActionModal } from "@/app/components/Dashboard/ConfirmActionModal";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { useSession } from "next-auth/react";

export default function DocumentCenterPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { notify } = useToast();

  // 🌟 States สำหรับ Modal สร้างหมวดหมู่ (เอา categoryOrder ออก ให้ระบบจัดการเอง)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  // 🌟 States สำหรับ Modal อัปโหลดไฟล์ (เอา sortOrder ออก)
  const [showFileModal, setShowFileModal] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [fileData, setFileData] = useState({ fileName: "", fileUrl: "" });

  const [deleteConfig, setDeleteConfig] = useState<{
    id: string;
    type: "category" | "file";
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editConfig, setEditConfig] = useState<{
    id: string;
    type: "category" | "file";
    name: string;
    desc?: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 🛡️ Supervisor Auth States
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hrm/documents");
      const result = await res.json();
      if (result.success) setDocuments(result.data);
    } catch (error) {
      notify.error(
        "ไม่สามารถโหลดข้อมูลได้",
        "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🔀 ฟังก์ชันอัปเดตลำดับหมวดหมู่
  const handleReorderCategories = async (newOrder: any[]) => {
    setDocuments(newOrder); // อัปเดตหน้าจอทันทีให้ดูลื่นไหล
    try {
      await fetch("/api/hrm/documents/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // ส่งลำดับใหม่ไปให้ Backend เซฟ (อิงตาม Index)
        body: JSON.stringify({
          items: newOrder.map((doc, idx) => ({ id: doc.id, sortOrder: idx })),
        }),
      });
    } catch (err) {
      notify.error("บันทึกลำดับไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // 🔀 ฟังก์ชันอัปเดตลำดับไฟล์ภายในหมวดหมู่
  const handleReorderFiles = async (docId: string, newFiles: any[]) => {
    const updatedDocs = documents.map((doc) => {
      if (doc.id === docId) return { ...doc, files: newFiles };
      return doc;
    });
    setDocuments(updatedDocs);

    try {
      await fetch("/api/hrm/documents/files/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: newFiles.map((file, idx) => ({ id: file.id, sortOrder: idx })),
        }),
      });
    } catch (err) {
      notify.error("บันทึกลำดับไฟล์ไม่สำเร็จ");
    }
  };

  const toggleFolder = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 🟢 ฟังก์ชันสร้างหมวดหมู่ใหม่ (ระบบคิด Sort Order ให้เลย)
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      const res = await fetch("/api/hrm/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDesc,
          // 💡 ให้ต่อท้ายหมวดหมู่เดิมอัตโนมัติ ไม่เกิดเลขซ้ำ
          sortOrder: documents.length,
        }),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("สร้างหมวดหมู่สำเร็จ", categoryName);
        setShowCategoryModal(false);
        setCategoryName("");
        setCategoryDesc("");
        fetchDocuments();
      } else notify.error("ไม่สามารถสร้างหมวดหมู่ได้", result.message);
    } catch (err) {
      notify.error("เกิดข้อผิดพลาด", "โปรดลองอีกครั้งในภายหลัง");
    }
  };

  // 🔵 ฟังก์ชันบันทึกไฟล์ลงหมวดหมู่ (ระบบคิด Sort Order ให้เลย)
  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData.fileUrl || !fileData.fileName) {
      notify.warning(
        "ข้อมูลไม่ครบถ้วน",
        "กรุณาระบุชื่อไฟล์ และอัปโหลดไฟล์ให้เรียบร้อย",
      );
      return;
    }

    const targetDoc = documents.find((d) => d.id === activeDocumentId);
    const newFileOrder = targetDoc?.files?.length || 0;

    try {
      const res = await fetch("/api/hrm/documents/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: activeDocumentId,
          fileName: fileData.fileName,
          fileUrl: fileData.fileUrl,
          sortOrder: newFileOrder, // 💡 ให้ไฟล์ไปต่อท้ายสุดเสมอ
        }),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("เพิ่มไฟล์สำเร็จ", fileData.fileName);
        setShowFileModal(false);
        setFileData({ fileName: "", fileUrl: "" });
        fetchDocuments();
      } else notify.error("ไม่สามารถบันทึกไฟล์ได้", result.message);
    } catch (err) {
      notify.error("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfig) return;

    // 1. Check if category is "In Use" (has files)
    if (deleteConfig.type === "category") {
      const doc = documents.find((d) => d.id === deleteConfig.id);
      if (doc && (doc._count?.files || 0) > 0) {
        notify.warning(
          "ไม่สามารถลบได้",
          "หมวดหมู่นี้ยังมีไฟล์อยู่ภายใน โปรดลบไฟล์ออกทั้งหมดก่อน",
        );
        setDeleteConfig(null);
        return;
      }
    }

    const userLevel = session?.user?.level ?? 5;

    // 2. Check if supervisor auth is needed
    // If user is already Level 0, proceed directly with confirmation
    if (userLevel === 0) {
      await proceedDelete();
    } else {
      // Lower level users need supervisor auth
      setShowSupervisorModal(true);
    }
  };

  const proceedDelete = async (supervisor?: string, password?: string) => {
    if (!deleteConfig) return;
    setIsDeleting(true);
    try {
      // 1. ตรวจสอบสิทธิ์และบันทึก Audit (DoA & Staging)
      const auditRes = await fetch("/api/sys/audit-staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: `DELETE_HR_DOCUMENT_${deleteConfig.type.toUpperCase()}`,
          description: `ลบ${deleteConfig.type === "category" ? "แฟ้ม" : "ไฟล์"}: ${deleteConfig.name}`,
          targetModel: deleteConfig.type === "category" ? "hrDocument" : "hrDocumentFile",
          targetId: deleteConfig.id,
          payload: { action: "DELETE", id: deleteConfig.id, type: deleteConfig.type },
          auth: {
            identifier: supervisor || session?.user?.username,
            password: password,
          },
        }),
      });

      const auditData = await auditRes.json();
      if (!auditData.success) {
        notify.error("การตรวจสอบล้มเหลว", auditData.message);
        return;
      }

      // 🏆 กรณี Staged (Maker-Checker)
      if (auditData.status === "STAGED") {
        notify.success("ส่งคำขอสำเร็จ", "รายการถูกส่งไปยัง Report เพื่อรอการอนุมัติขั้นสุดท้ายจากส่วนกลาง");
        setDeleteConfig(null);
        setShowSupervisorModal(false);
        return;
      }

      // 🏆 กรณี Authorized (Direct Approval): ดำเนินการลบทันที
      const url =
        deleteConfig.type === "category"
          ? `/api/hrm/documents?id=${deleteConfig.id}`
          : `/api/hrm/documents/files?id=${deleteConfig.id}`;

      const res = await fetch(url, { method: "DELETE" });
      const result = await res.json();

      if (result.success) {
        notify.success("ลบรายการสำเร็จ", deleteConfig.name);
        setDeleteConfig(null);
        setShowSupervisorModal(false);
        fetchDocuments();
      } else {
        notify.error("ไม่สามารถลบได้", result.message);
      }
    } catch (err) {
      notify.error("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setIsDeleting(false);
    }
  };

  // 🟡 ฟังก์ชันแก้ไขรายการ
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editConfig) return;

    const userLevel = session?.user?.level ?? 5;

    if (userLevel === 0) {
      await proceedEdit();
    } else {
      setShowSupervisorModal(true);
    }
  };

  const proceedEdit = async (supervisor?: string, password?: string) => {
    if (!editConfig) return;
    setIsEditing(true);

    try {
      const editPayload =
        editConfig.type === "category"
          ? { id: editConfig.id, name: editConfig.name, description: editConfig.desc }
          : { id: editConfig.id, fileName: editConfig.name };

      // 1. ตรวจสอบสิทธิ์และบันทึก Audit (DoA & Staging)
      const auditRes = await fetch("/api/sys/audit-staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: `EDIT_HR_DOCUMENT_${editConfig.type.toUpperCase()}`,
          description: `แก้ไขข้อมูล ${editConfig.type === "category" ? "แฟ้ม" : "ไฟล์"}: ${editConfig.name}`,
          targetModel: editConfig.type === "category" ? "hrDocument" : "hrDocumentFile",
          targetId: editConfig.id,
          payload: { action: "UPDATE", ...editPayload },
          auth: {
            identifier: supervisor || session?.user?.username,
            password: password,
          },
        }),
      });

      const auditData = await auditRes.json();
      if (!auditData.success) {
        notify.error("การตรวจสอบล้มเหลว", auditData.message);
        return;
      }

      // 🏆 กรณี Staged (Maker-Checker)
      if (auditData.status === "STAGED") {
        notify.success("ส่งคำขอแก้ไขสำเร็จ", "รายการถูกส่งไปยัง Report เพื่อรอตรวจและอนุมัติจากส่วนกลาง");
        setEditConfig(null);
        setShowSupervisorModal(false);
        return;
      }

      // 🏆 กรณี Authorized (Direct Approval): ดำเนินการอัปเดตทันที
      const url =
        editConfig.type === "category"
          ? "/api/hrm/documents"
          : "/api/hrm/documents/files";

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPayload),
      });
      const result = await res.json();

      if (result.success) {
        notify.success("อัปเดตข้อมูลสำเร็จ");
        setEditConfig(null);
        setShowSupervisorModal(false);
        fetchDocuments();
      } else {
        notify.error("ล้มเหลว", result.message);
      }
    } catch (err) {
      notify.error("เกิดข้อผิดพลาดในการแก้ไข");
    } finally {
      setIsEditing(false);
    }
  };

  const getFileIcon = (fileName: string = "") => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png"].includes(ext || ""))
      return (
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <ImageIcon size={16} />
        </div>
      );
    if (["xls", "xlsx", "csv"].includes(ext || ""))
      return (
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <FileSpreadsheet size={16} />
        </div>
      );
    return (
      <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
        <FileText size={16} />
      </div>
    );
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1000px] mx-auto animate-in fade-in duration-500 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg shadow-indigo-200">
            <FolderOpen size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              ประกาศ / ข่าวสาร
            </h2>
            <p className="text-slate-500 font-medium">
              ศูนย์รวมคู่มือ นโยบาย และเอกสารสำคัญของบริษัท
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200 active:scale-95"
        >
          <FolderPlus size={18} /> สร้างหมวดหมู่ใหม่
        </button>
      </div>

      {/* ── Document List ── */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-indigo-500">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center font-bold text-slate-400">
            ยังไม่มีเอกสารในระบบ
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={documents}
            onReorder={handleReorderCategories}
            className="divide-y divide-slate-100"
          >
            {documents.map((doc, index) => {
              const isExpanded = expandedId === doc.id;

              return (
                <Reorder.Item
                  key={doc.id}
                  value={doc}
                  className="bg-white relative z-10" // 💡 ป้องกัน UI ซ้อนทับกันตอนลาก
                >
                  <div
                    className={`flex items-center p-4 transition-colors ${isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                  >
                    {/* 💡 1. แยกพื้นที่ "จับลาก" (Drag Handle) ออกมาให้ชัดเจน */}
                    <div
                      className="p-3 text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing mr-2"
                      title="กดค้างเพื่อเลื่อนลำดับ"
                    >
                      <GripVertical size={20} />
                    </div>

                    {/* 💡 2. พื้นที่ "กดเพื่อเปิดโฟลเดอร์" (Click to expand) */}
                    <div
                      className="flex items-center justify-between flex-1 cursor-pointer py-2"
                      onClick={() => toggleFolder(doc.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 font-bold w-6 text-right">
                          {index + 1}.
                        </span>
                        <h4
                          className={`font-bold text-base ${isExpanded ? "text-indigo-700" : "text-slate-700"}`}
                        >
                          {doc.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditConfig({
                              id: doc.id,
                              type: "category",
                              name: doc.name,
                              desc: doc.description || "",
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfig({
                              id: doc.id,
                              type: "category",
                              name: doc.name,
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 📄 เนื้อหาด้านในโฟลเดอร์ (ไม่เกี่ยวกับการลากของโฟลเดอร์แม่) */}
                  {isExpanded && (
                    <div
                      className="bg-slate-50/80 p-6 border-t border-slate-100 cursor-default"
                      onPointerDown={(e) => e.stopPropagation()} // 💡 ป้องกันการคลิกด้านในแล้วเผลอไปลากโฟลเดอร์แม่
                    >
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => {
                            setActiveDocumentId(doc.id);
                            setShowFileModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <FilePlus size={16} /> อัปโหลดไฟล์เพิ่ม
                        </button>
                      </div>

                      {doc.files.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-4 italic">
                          ไม่มีไฟล์แนบในหมวดหมู่นี้
                        </p>
                      ) : (
                        <Reorder.Group
                          axis="y"
                          values={doc.files}
                          onReorder={(newFiles) =>
                            handleReorderFiles(doc.id, newFiles)
                          }
                          className="space-y-3 pl-8 pr-2"
                        >
                          {doc.files.map((file: any) => (
                            <Reorder.Item
                              key={file.id}
                              value={file}
                              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all group relative z-20"
                            >
                              <div className="flex items-center gap-3">
                                {/* 💡 Drag Handle ของไฟล์ */}
                                <div className="p-2 text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing">
                                  <GripVertical size={16} />
                                </div>
                                {getFileIcon(file.fileName || file.fileUrl)}
                                <span className="font-bold text-sm text-slate-700 group-hover:text-indigo-700 transition-colors">
                                  {file.fileName || "เอกสารแนบ"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-xl transition-all border border-slate-100"
                                >
                                  <Eye size={18} strokeWidth={2.5} />
                                </a>
                                <button
                                  onClick={() =>
                                    setEditConfig({
                                      id: file.id,
                                      type: "file",
                                      name: file.fileName,
                                    })
                                  }
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfig({
                                      id: file.id,
                                      type: "file",
                                      name: file.fileName,
                                    })
                                  }
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      )}
                    </div>
                  )}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {/* ── Modal 1: สร้างหมวดหมู่ ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">
                สร้างหมวดหมู่ใหม่
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="mb-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                    ชื่อหมวดหมู่
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="เช่น คู่มือการใช้งาน MiHCM"
                    className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                    คำอธิบาย (ไม่บังคับ)
                  </label>
                  <textarea
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม..."
                    className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-bold text-sm focus:border-indigo-500 outline-none h-24 resize-none"
                  />
                </div>
                {/* 💡 ถอดช่องกรอกตัวเลขลำดับออก เพื่อป้องกันความผิดพลาดจากคนพิมพ์ */}
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                บันทึกหมวดหมู่
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: แก้ไขรายการ ── */}
      {editConfig && !showSupervisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">
                แก้ไข{editConfig.type === "category" ? "หมวดหมู่" : "ชื่อไฟล์"}
              </h3>
              <button
                onClick={() => setEditConfig(null)}
                className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                  {editConfig.type === "category"
                    ? "ชื่อหมวดหมู่"
                    : "ชื่อไฟล์เอกสาร"}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editConfig.name}
                  onChange={(e) =>
                    setEditConfig({ ...editConfig, name: e.target.value })
                  }
                  className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black focus:border-indigo-500 outline-none"
                />
              </div>

              {editConfig.type === "category" && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                    คำอธิบาย (ไม่บังคับ)
                  </label>
                  <textarea
                    value={editConfig.desc}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, desc: e.target.value })
                    }
                    className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-bold text-sm focus:border-indigo-500 outline-none h-24 resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isEditing}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {isEditing ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal ยืนยันการลบ ── */}
      <ConfirmActionModal
        isOpen={!!deleteConfig && !showSupervisorModal}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={`ยืนยันการลบ${deleteConfig?.type === "category" ? "หมวดหมู่" : "ไฟล์"}`}
        description={`คุณแน่ใจหรือไม่ที่จะลบ "${deleteConfig?.name}"? การกระทำนี้ไม่สามารถย้อนคืนได้`}
        variant="danger"
        confirmLabel="ลบทันที"
      />

      {/* ── Supervisor Authorization Modal ── */}
      <SupervisorModal
        isOpen={showSupervisorModal}
        onClose={() => setShowSupervisorModal(false)}
        loading={isDeleting || isEditing}
        onConfirm={async (supervisor, password) => {
          if (deleteConfig) await proceedDelete(supervisor, password);
          else if (editConfig) await proceedEdit(supervisor, password);
        }}
        title="Supervisor Authorization Required"
        description={`กรุณาระบุรหัสผู้ดูแลระดับสูง (Level 0) และรหัสผ่านเพื่อยืนยันการ${deleteConfig ? "ลบ" : "แก้ไข"}ข้อมูล`}
      />

      {/* ── Modal 2: อัปโหลดไฟล์ ── */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">
                อัปโหลดเอกสารใหม่
              </h3>
              <button
                onClick={() => setShowFileModal(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFile} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                  ชื่อเอกสารที่จะแสดงผล
                </label>
                <input
                  type="text"
                  required
                  value={fileData.fileName}
                  onChange={(e) =>
                    setFileData({ ...fileData, fileName: e.target.value })
                  }
                  placeholder="เช่น คู่มือการลาออก.pdf"
                  className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black focus:border-indigo-500 outline-none"
                />
              </div>

              <FileUpload
                label="อัปโหลดไฟล์ (PDF, รูปภาพ, Excel)"
                accept=".pdf, image/*, .xls, .xlsx"
                folder="hrm"
                onUploadSuccess={(url) =>
                  setFileData({ ...fileData, fileUrl: url })
                }
              />

              <button
                type="submit"
                disabled={!fileData.fileUrl}
                className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all ${fileData.fileUrl ? "bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
              >
                ยืนยันการเพิ่มไฟล์
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
