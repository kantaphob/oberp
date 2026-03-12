"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText, Upload, Eye, Trash2, Calendar, CheckCircle2,
  AlertCircle, Loader2, FolderOpen, ShieldCheck, Clock,
  ChevronDown, Plus,
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import { ConfirmActionModal } from "@/app/components/Dashboard/ConfirmActionModal";
import { DOCUMENT_CATEGORIES } from "@/app/lib/documentTypes";
import { getCategoryAccent } from "@/app/lib/ui-configs";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface UserDocument {
  id: string;
  file: string;
  fileName: string;
  category: string;
  documentType: string;
  expireDate: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface UserDocumentsPanelProps {
  userId: string;
}



export function UserDocumentsPanel({ userId }: UserDocumentsPanelProps) {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<{ category: string; type: string } | null>(null);
  const { notify } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}/documents`);
      if (res.ok) setDocuments(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (userId) fetchDocuments();
    // Open all categories by default
    const init: Record<string, boolean> = {};
    DOCUMENT_CATEGORIES.forEach(c => { init[c.id] = true; });
    setOpenCategories(init);
  }, [userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && activeUpload) {
      const { category, type } = activeUpload;
      await uploadFile(e.target.files[0], category, type, expiryDates[type] || "");
      e.target.value = "";
      setActiveUpload(null);
    }
  };

  const uploadFile = async (file: File, category: string, documentType: string, expireDate: string) => {
    try {
      setUploadingDocType(documentType);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      fd.append("documentType", documentType);
      if (expireDate) fd.append("expireDate", expireDate);
      const res = await fetch(`/api/users/${userId}/documents`, { method: "POST", body: fd });
      if (res.ok) { notify.success("อัปโหลดสำเร็จ"); fetchDocuments(); }
      else { const d = await res.json(); throw new Error(d.error || "อัปโหลดไม่สำเร็จ"); }
    } catch (e: any) { notify.onApiError(e, "อัปโหลดเอกสาร"); }
    finally { setUploadingDocType(null); }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/users/${userId}/documents?docId=${deleteId}`, { method: "DELETE" });
      if (res.ok) { notify.onDeleteSuccess("ลบเอกสารสำเร็จ"); fetchDocuments(); }
      else { const d = await res.json(); throw new Error(d.error || "ลบไม่สำเร็จ"); }
    } catch (e: any) { notify.onApiError(e, "ลบเอกสาร"); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const triggerUpload = (category: string, type: string) => {
    const cat = DOCUMENT_CATEGORIES.find(c => c.id === category);
    const docType = cat?.types.find(t => t.code === type);
    if (docType?.hasExpiry && !expiryDates[type]) {
      notify.warning("กรุณาระบุวันหมดอายุก่อนอัปโหลด");
      return;
    }
    setActiveUpload({ category, type });
    fileInputRef.current?.click();
  };

  const safeDate = (d: string | null | undefined, fmt = "d MMM yyyy") => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "—" : format(dt, fmt, { locale: th });
  };

  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(d => d.isVerified).length;
  const expiredDocs = documents.filter(d => d.expireDate && isExpired(d.expireDate)).length;

  return (
    <>


      <div className="space-y-5 mt-8">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/25">
              <FolderOpen size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">เอกสารประกอบ</h2>
              <p className="text-[11px] text-slate-400">เอกสารสำคัญ &amp; ใบรับรองต่างๆ</p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-2">
            <div className="stat-glass flex items-center gap-2 px-3 py-1.5 rounded-xl">
              <FileText size={13} className="text-indigo-400" />
              <span className="text-[12px] font-bold text-slate-700">{totalDocs}</span>
              <span className="text-[10px] text-slate-400">ไฟล์</span>
            </div>
            {verifiedDocs > 0 && (
              <div className="stat-glass flex items-center gap-2 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span className="text-[12px] font-bold text-emerald-700">{verifiedDocs}</span>
                <span className="text-[10px] text-slate-400">ยืนยันแล้ว</span>
              </div>
            )}
            {expiredDocs > 0 && (
              <div className="stat-glass flex items-center gap-2 px-3 py-1.5 rounded-xl">
                <AlertCircle size={13} className="text-red-400" />
                <span className="text-[12px] font-bold text-red-600">{expiredDocs}</span>
                <span className="text-[10px] text-slate-400">หมดอายุ</span>
              </div>
            )}
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />

        {/* ── Category Cards ──────────────────────────────── */}
        {DOCUMENT_CATEGORIES.map((category, catIdx) => {
          const accent = getCategoryAccent(catIdx);
          const catDocs = documents.filter(d => d.category === category.id);
          const isOpen = openCategories[category.id] ?? true;

          return (
            <div key={category.id} className="doc-glass rounded-2xl overflow-hidden">

              {/* Category Header — collapsible */}
              <div
                className="doc-cat-header"
                onClick={() => setOpenCategories(p => ({ ...p, [category.id]: !p[category.id] }))}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${accent.dot} shrink-0`} />
                  <span className="text-[13px] font-bold text-slate-700">{category.name}</span>
                  {catDocs.length > 0 && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                      style={{ background: accent.badgeBg, color: accent.badge, border: `1px solid ${accent.badgeBorder}` }}>
                      {catDocs.length} ไฟล์
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16} className="text-slate-400 transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </div>

              {/* Document Types */}
              {isOpen && (
                <div>
                  {category.types.map((type) => {
                    const typeDocs = documents.filter(d => d.documentType === type.code);
                    const isUploading = uploadingDocType === type.code;

                    return (
                      <div key={type.code} className="doc-type-row">

                        {/* Type header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[13px] font-semibold text-slate-700 truncate">{type.label}</span>
                            {typeDocs.length > 0 && (
                              <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                                style={{ background: accent.badgeBg, color: accent.badge, border: `1px solid ${accent.badgeBorder}` }}>
                                {typeDocs.length}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Expiry date input */}
                            {type.hasExpiry && (
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-slate-400 shrink-0" />
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">วันหมดอายุ</span>
                                  <input
                                    type="date"
                                    className="doc-date-input w-32"
                                    value={expiryDates[type.code] || ""}
                                    onChange={e => setExpiryDates(p => ({ ...p, [type.code]: e.target.value }))}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Upload button */}
                            <button
                              className="doc-upload-btn"
                              disabled={isUploading}
                              onClick={() => triggerUpload(category.id, type.code)}
                            >
                              {isUploading
                                ? <><Loader2 size={12} className="animate-spin" /> กำลังอัปโหลด...</>
                                : <><Plus size={12} /> เพิ่มเอกสาร</>
                              }
                            </button>
                          </div>
                        </div>

                        {/* File list */}
                        <div className="space-y-2 pl-3 border-l-2 ml-1"
                          style={{ borderColor: `${accent.badgeBorder}` }}>
                          {typeDocs.length > 0 ? typeDocs.map((doc) => {
                            const expired = isExpired(doc.expireDate);
                            return (
                              <div key={doc.id} className="doc-file-card group">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {/* File icon */}
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: accent.badgeBg, border: `1px solid ${accent.badgeBorder}` }}>
                                    <FileText size={14} style={{ color: accent.badge }} />
                                  </div>

                                  {/* File info */}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-semibold text-slate-700 truncate leading-tight">{doc.fileName}</p>
                                    <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Calendar size={10} /> {safeDate(doc.createdAt)}
                                      </span>
                                      {doc.expireDate && (
                                        <span className={`text-[10px] font-bold flex items-center gap-1 ${expired ? "text-red-500" : "text-blue-600"}`}>
                                          {expired ? <AlertCircle size={10} /> : <Clock size={10} />}
                                          หมดอายุ {safeDate(doc.expireDate)}
                                          {expired && " (หมดแล้ว)"}
                                        </span>
                                      )}
                                      {doc.isVerified && (
                                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                          <CheckCircle2 size={10} /> ยืนยันแล้ว
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                  <a href={doc.file} target="_blank" rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                                    <Eye size={14} />
                                  </a>
                                  <button
                                    onClick={() => setDeleteId(doc.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          }) : (
                            <p className="text-[11px] text-slate-400 italic py-1.5">
                              ยังไม่มีเอกสารในส่วนนี้
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmActionModal
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={executeDelete} loading={deleting}
        title="ยืนยันการลบเอกสาร"
        description="คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้? ไม่สามารถย้อนคืนได้"
        confirmLabel="ลบไฟล์ทันที"
        variant="danger"
      />
    </>
  );
}