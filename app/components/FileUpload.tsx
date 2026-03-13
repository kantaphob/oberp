"use client";

import React, { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/app/hooks/useToast";

interface FileUploadProps {
  label?: string;
  accept?: string;
  onUploadSuccess: (url: string) => void;
  folder?: string;
}

export default function FileUpload({ 
  label = "อัปโหลดไฟล์เอกสาร", 
  accept = ".pdf, .jpg, .png, .xlsx",
  onUploadSuccess,
  folder = "documents"
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) {
        formData.append("folder", folder);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setPreview(data.url);
        onUploadSuccess(data.url);
        notify.success("อัปโหลดไฟล์สำเร็จ", file.name);
      } else {
        throw new Error(data.error || "อัปโหลดล้มเหลว");
      }
    } catch (error: any) {
      notify.error("เกิดข้อผิดพลาดในการอัปโหลด", error.message);
      setFileName(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = () => {
    setPreview(null);
    setFileName(null);
    onUploadSuccess("");
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
        {label}
      </label>
      
      {!preview && !isUploading ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group relative border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-[2rem] p-10 transition-all cursor-pointer flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
            <Upload size={28} />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-slate-600 group-hover:text-indigo-700">คลิก หรือลากไฟล์มาวางที่นี่</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
              รองรับ {accept.replace(/\./g, "").toUpperCase()}
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 flex items-center gap-4 animate-in zoom-in-95 duration-200">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUploading ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isUploading ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-700 truncate">{fileName || "กำลังประมวลผล..."}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              {isUploading ? 'ระบบกำลังบันทึกข้อมูลและสร้างลิงก์ถาวร...' : 'อัปโหลดเสร็จสมบูรณ์ พร้อมบันทึกรายการ'}
            </p>
          </div>

          {!isUploading && (
            <button 
              onClick={removeFile}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
