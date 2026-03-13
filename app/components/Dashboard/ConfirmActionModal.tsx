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
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "warning" | "success" | "orange";
  loading?: boolean;
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
}) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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
            {/* Header with Background Gradient */}
            <div
              className={`bg-gradient-to-br ${theme.bg} p-8 text-white text-center relative`}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/30">
                  {theme.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
              <p className="text-white/80 text-sm max-w-[300px] mx-auto leading-relaxed">
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
            <div className="p-10 space-y-6">
              <div className="flex flex-col gap-3">
                <Button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`w-full py-7 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.97] ${theme.button}`}
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                  {confirmLabel}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-7 rounded-2xl font-bold text-slate-500 hover:bg-slate-100/50"
                >
                  {cancelLabel}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Secure Dashboard Action
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmActionModal;
