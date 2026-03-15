"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  Fingerprint,
  AlertCircle,
  RefreshCw,
  Check,
  X,
} from "lucide-react";

interface SupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    supervisorUsername: string,
    supervisorPassword?: string,
  ) => Promise<void>;
  title?: string;
  description?: string;
  loading?: boolean;
}

export const SupervisorModal: React.FC<SupervisorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "ส่งคำขออนุมัติ",
  description = "ระบุรหัสผู้ดูแลระดับ Level 0 และรหัสผ่านเพื่อยืนยันรายการ",
  loading = false,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!username.trim() || !password.trim()) {
      setError("กรุณาระบุรหัสผู้ดูแลและรหัสผ่านก่อนดำเนินการ");
      return;
    }
    setError("");
    try {
      await onConfirm(username.trim(), password.trim());
    } catch (err: any) {
      setError(
        err.message || "ไม่พบรหัสผู้ดูแลนี้ในระบบ หรือระดับสิทธิ์ไม่เพียงพอ",
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-[0_32px_96px_-12px_rgba(249,115,22,0.15)] border border-white/40 w-full max-w-md relative z-10 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white/30 text-white">
                  <Shield size={32} />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  {title}
                </h3>
                <p className="text-orange-50 text-sm font-medium opacity-90 text-center max-w-[240px]">
                  {description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-red-50 text-red-600 text-[11px] font-bold border border-red-100 flex items-center gap-2.5"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                  <p className="text-[11px] text-orange-700 leading-relaxed font-semibold">
                    ⚠️ รายการนี้ต้องการการอนุมัติ (Level 0 / Master Key)
                    เพื่อยืนยันความปลอดภัยของข้อมูล
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                      Identity Supervisor
                    </label>
                    <div className="relative">
                      <Fingerprint
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="ระบุรหัสผู้ดูแล"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 tracking-widest"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                      Master Key / Password
                    </label>
                    <div className="relative">
                      <ShieldAlert
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={18}
                      />
                      <input
                        type="password"
                        placeholder="ระบุรหัสผ่านยืนยัน"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirm}
                  className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black shadow-[0_16px_32px_-8px_rgba(249,115,22,0.4)] hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      ยืนยันรายการ <Check size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
