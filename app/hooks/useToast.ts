"use client";

import { useMemo } from "react";
import { showToast as toastManager } from "../lib/toast";

/**
 * Hook สำหรับจัดการการแจ้งเตือนใน Dashboard
 * รองรับทั้งการบันทึก, การลบ และการจัดการข้อผิดพลาด
 */
export function useToast() {
  const notify = useMemo(() => ({
    success: (message: string, description?: string) => {
      toastManager.success(message, description);
    },
    error: (message: string, description?: string) => {
      toastManager.error(message, description);
    },
    warning: (message: string, description?: string) => {
      toastManager.warning(message, description);
    },
    info: (message: string, description?: string) => {
      toastManager.info(message, description);
    },
    
    // สำหรับการบันทึกข้อมูล
    onSaveSuccess: (description?: string) => {
      toastManager.success("บันทึกข้อมูลสำเร็จ", description);
    },
    
    // สำหรับการลบข้อมูล
    onDeleteSuccess: (description?: string) => {
      toastManager.success("ลบข้อมูลเรียบร้อยแล้ว", description);
    },
    
    // สำหรับ Error จาก API
    onApiError: (error: any, customTitle?: string) => {
      const message = error?.response?.data?.error || error?.message || "โปรดลองอีกครั้งในภายหลัง";
      toastManager.error(customTitle || "เกิดข้อผิดพลาด", message);
    },
    
    // แจ้งเตือนเมื่อมีข้อมูลใหม่ (เช่น ในระบบ Approval)
    onNewUpdate: (message: string) => {
      toastManager.info("มีการอัปเดตข้อมูลใหม่", message);
    }
  }), []);

  const showToast = useMemo(() => (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    notify[type](message);
  }, [notify]);

  return { notify, showToast };
}

// alias 
export const useNotify = useToast;
