"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Eye, Trash2, Calendar, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { DOCUMENT_CATEGORIES } from "@/app/lib/documentTypes";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<{ category: string, type: string } | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Fetch docs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUpload) {
      const file = e.target.files[0];
      const { category, type } = activeUpload;
      const expireDate = expiryDates[type] || "";

      await uploadFile(file, category, type, expireDate);
      
      // Reset
      e.target.value = "";
      setActiveUpload(null);
    }
  };

  const uploadFile = async (file: File, category: string, documentType: string, expireDate: string) => {
    try {
      setUploadingDocType(documentType);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("documentType", documentType);
      if (expireDate) formData.append("expireDate", expireDate);

      const res = await fetch(`/api/users/${userId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("อัปโหลดสำเร็จ");
        fetchDocuments();
      } else {
        const data = await res.json();
        throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("คุณต้องการลบเอกสารนี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/users/${userId}/documents?docId=${docId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("ลบเอกสารเรียบร้อยแล้ว");
        fetchDocuments();
      } else {
        const data = await res.json();
        throw new Error(data.error || "ลบไม่สำเร็จ");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const triggerUpload = (category: string, type: string) => {
    const docTypeInfo = DOCUMENT_CATEGORIES.find(c => c.id === category)?.types.find(t => t.code === type);
    if (docTypeInfo?.hasExpiry && !expiryDates[type]) {
        toast.warning("กรุณาระบุวันหมดอายุก่อนอัปโหลด");
        return;
    }
    setActiveUpload({ category, type });
    fileInputRef.current?.click();
  };

  const handleExpiryChange = (type: string, date: string) => {
    setExpiryDates(prev => ({ ...prev, [type]: date }));
  };

  const safeFormatDate = (date: string | null | undefined, formatStr: string = "d MMM yyyy") => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return format(d, formatStr, { locale: th });
  };

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Upload className="h-6 w-6 text-orange-600" />
        เอกสารประกอบการสมัครงาน / เอกสารสำคัญ
      </h2>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf"
      />

      {DOCUMENT_CATEGORIES.map((category) => (
        <Card key={category.id} className="shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b py-3">
            <CardTitle className="text-sm font-bold text-slate-700">{category.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {category.types.map((type) => {
                const typeDocs = documents.filter(d => d.documentType === type.code);
                const isUploading = uploadingDocType === type.code;

                return (
                  <div key={type.code} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                    {/* Header: Label and Upload Button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-bold text-slate-800 text-base">{type.label}</Label>
                          {typeDocs.length > 0 && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                              {typeDocs.length} ไฟล์
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {type.hasExpiry && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500">วันหมดอายุสำหรับไฟล์ใหม่</span>
                            <Input 
                              type="date" 
                              className="h-8 text-xs w-36 border-slate-300"
                              value={expiryDates[type.code] || ""}
                              onChange={(e) => handleExpiryChange(type.code, e.target.value)}
                            />
                          </div>
                        )}

                        <Button 
                          variant="default"
                          size="sm" 
                          className="h-9 bg-orange-600 hover:bg-orange-700 min-w-[120px] shadow-sm transition-all active:scale-95"
                          disabled={isUploading}
                          onClick={() => triggerUpload(category.id, type.code)}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><Upload className="h-4 w-4 mr-2" /> เพิ่มเอกสาร</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* File List for this Type */}
                    <div className="space-y-2 pl-2 border-l-2 border-slate-100 ml-1">
                      {typeDocs.length > 0 ? (
                        typeDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 shadow-sm group">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-orange-50 rounded text-orange-600">
                                <FileText size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700 line-clamp-1">{doc.fileName}</p>
                                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} /> {safeFormatDate(doc.createdAt)}
                                  </span>
                                  {doc.expireDate && (
                                    <span className={`flex items-center gap-1 font-bold ${new Date(doc.expireDate) < new Date() ? 'text-red-500' : 'text-blue-600'}`}>
                                      หมดอายุ: {safeFormatDate(doc.expireDate)}
                                    </span>
                                  )}
                                  {doc.isVerified && (
                                    <span className="flex items-center gap-1 text-green-600 font-bold">
                                      <CheckCircle2 size={12} /> ตรวจสอบแล้ว
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                                <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                  <Eye size={16} />
                                </a>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(doc.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic py-1">ยังไม่มีการเพิ่มเอกสารในส่วนนี้</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
