"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "../ui/button";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "warning" | "success" | "orange";
  loading?: boolean;
  requireConfirmText?: string;
  requireSupervisorAuth?: boolean;
  onConfirm?: (auth?: { identifier: string; password?: string }) => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการดำเนินการ",
  description = "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้? ข้อมูลจะถูกบันทึกเข้าสู่ระบบ",
  confirmLabel = "ยืนยันการบันทึก",
  cancelLabel = "ยกเลิก",
  variant = "primary",
  loading = false,
  requireConfirmText,
  requireSupervisorAuth = false,
}) => {
  const [confirmValue, setConfirmValue] = React.useState("");
  const [auth, setAuth] = React.useState({ identifier: "", password: "" });
  
  const isInputValid = (!requireConfirmText || confirmValue === requireConfirmText) && 
                      (!requireSupervisorAuth || (auth.identifier.length > 0 && auth.password.length > 0));

  // Styles based on variant
  const themes = {
    primary: {
      bg: "from-blue-600 to-indigo-700",
      icon: <Send className="w-8 h-8" />,
      button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    },
    orange: {
      bg: "from-orange-500 to-orange-600",
      icon: <Save className="w-8 h-8" />,
      button: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20",
    },
    danger: {
      bg: "from-red-600 to-rose-700",
      icon: <AlertTriangle className="w-8 h-8" />,
      button: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
    },
    warning: {
      bg: "from-amber-500 to-orange-600",
      icon: <AlertTriangle className="w-8 h-8" />,
      button: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20",
    },
    success: {
      bg: "from-emerald-500 to-teal-600",
      icon: <CheckCircle2 className="w-8 h-8" />,
      button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
    },
  };

  const theme = themes[variant] || themes.primary;

  // Reset input when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setConfirmValue("");
      setAuth({ identifier: "", password: "" });
    }
  }, [isOpen]);

  const handleConfirmClick = () => {
    if (requireSupervisorAuth) {
      onConfirm?.(auth);
    } else {
      onConfirm?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden italic"
          >
            {/* Header with Background Gradient */}
            <div
              className={`bg-gradient-to-br ${theme.bg} p-8 text-white text-center relative`}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/30 transition-transform active:scale-95">
                  {theme.icon}
                </div>
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">{title}</h3>
              <p className="text-white/80 text-sm max-w-[300px] mx-auto leading-relaxed font-bold">
                {description}
              </p>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bottom Section */}
            <div className="p-8 space-y-6">
              {requireConfirmText && (
                 <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                      พิมพ์ตัวอักษรเพื่อยืนยัน: <span className="text-slate-900 underline">{requireConfirmText}</span>
                    </label>
                    <input 
                      type="text"
                      autoFocus
                      value={confirmValue}
                      onChange={(e) => setConfirmValue(e.target.value)}
                      placeholder={`พิมพ์คำว่า "${requireConfirmText}"`}
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-black text-center text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                 </div>
              )}

              {requireSupervisorAuth && (
                 <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white italic shadow-lg shadow-indigo-100">
                          <AlertTriangle size={16} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Supervisor Auth Required</p>
                          <p className="text-[11px] font-black text-slate-800 italic">การลบต้องได้รับอนุมัติจากหัวหน้าแผนก</p>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <input 
                         type="text"
                         value={auth.identifier}
                         onChange={(e) => setAuth(prev => ({ ...prev, identifier: e.target.value }))}
                         placeholder="Username / Employee ID"
                         className="w-full bg-white border-2 border-slate-100 p-3.5 rounded-2xl font-black text-xs text-slate-800 outline-none focus:border-indigo-500 transition-all shadow-sm"
                       />
                       <input 
                         type="password"
                         value={auth.password}
                         onChange={(e) => setAuth(prev => ({ ...prev, password: e.target.value }))}
                         placeholder="Supervisor Password"
                         className="w-full bg-white border-2 border-slate-100 p-3.5 rounded-2xl font-black text-xs text-slate-800 outline-none focus:border-indigo-500 transition-all shadow-sm"
                       />
                    </div>
                 </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirmClick}
                  disabled={loading || !isInputValid}
                  className={`w-full py-7 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.97]
                    ${theme.button} 
                    ${isInputValid ? "opacity-100" : "opacity-30 grayscale cursor-not-allowed"}`}
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                  {confirmLabel}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-7 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                >
                  {cancelLabel}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <div className={`w-1.5 h-1.5 rounded-full ${isInputValid ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {isInputValid ? "Ready to confirm" : "Waiting for security code"}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmActionModal;
