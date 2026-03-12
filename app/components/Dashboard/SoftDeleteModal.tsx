"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserX, LogOut, ShieldAlert, X, Loader2, CheckCircle2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SoftDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: "RESIGNED" | "TERMINATED") => void;
  userName: string;
  loading?: boolean;
}

export const SoftDeleteModal: React.FC<SoftDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  loading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<"RESIGNED" | "TERMINATED">("RESIGNED");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-8 text-white text-center relative">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/30">
                  <UserX className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">สิ้นสุดการจ้างงาน</h3>
              <p className="text-white/60 text-xs max-w-[280px] mx-auto leading-relaxed">
                ระบุสาเหตุการสิ้นสุดการจ้างงานของ <span className="text-white font-bold">{userName}</span> ข้อมูลจะถูกเก็บไว้เป็นประวัติแต่จะระงับสิทธิ์การใช้งานทันที
              </p>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selection Content */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {/* RESIGNED Option */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus("RESIGNED")}
                  className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
                    selectedStatus === "RESIGNED" 
                      ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10" 
                      : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200"
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${
                    selectedStatus === "RESIGNED" ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    <LogOut size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${selectedStatus === "RESIGNED" ? "text-orange-900" : "text-slate-700"}`}>
                      RESIGNED (ลาออกเอง)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      ใช้เมื่อพนักงานลาออกตามปกติ แจ้งล่วงหน้า และจัดการเอกสารครบถ้วน
                    </p>
                  </div>
                </button>

                {/* TERMINATED Option */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus("TERMINATED")}
                  className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
                    selectedStatus === "TERMINATED" 
                      ? "border-red-500 bg-red-50 shadow-lg shadow-red-500/10" 
                      : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200"
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${
                    selectedStatus === "TERMINATED" ? "bg-red-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${selectedStatus === "TERMINATED" ? "text-red-900" : "text-slate-700"}`}>
                      TERMINATED (เลิกจ้าง / ไล่ออก)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      ใช้เมื่อทำผิดกฎร้ายแรง, ไม่ผ่านโปร, หรือถูกสั่งให้ออกจากงานทันที
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={() => onConfirm(selectedStatus)}
                  disabled={loading}
                  className={`w-full py-7 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.97] ${
                    selectedStatus === "TERMINATED" ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20"
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                  ยืนยันการบันทึกสถานะ
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-7 rounded-2xl font-bold text-slate-500 hover:bg-slate-100/50"
                >
                  ยกเลิก
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-emerald-500" />
                No Hard Delete - History Preserved
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
