"use client";

import { useMemo } from "react";
import { showToast } from "../lib/toast";

/**
 * Hook สำหรับจัดการการแจ้งเตือนใน Dashboard
 * รองรับทั้งการบันทึก, การลบ และการจัดการข้อผิดพลาด
 */
export function useToast() {
  const notify = useMemo(() => ({
    success: (message: string, description?: string) => {
      showToast.success(message, description);
    },
    error: (message: string, description?: string) => {
      showToast.error(message, description);
    },
    warning: (message: string, description?: string) => {
      showToast.warning(message, description);
    },
    info: (message: string, description?: string) => {
      showToast.info(message, description);
    },
    
    // สำหรับการบันทึกข้อมูล
    onSaveSuccess: (description?: string) => {
      showToast.success("บันทึกข้อมูลสำเร็จ", description);
    },
    
    // สำหรับการลบข้อมูล
    onDeleteSuccess: (description?: string) => {
      showToast.success("ลบข้อมูลเรียบร้อยแล้ว", description);
    },
    
    // สำหรับ Error จาก API
    onApiError: (error: any, customTitle?: string) => {
      const message = error?.response?.data?.error || error?.message || "โปรดลองอีกครั้งในภายหลัง";
      showToast.error(customTitle || "เกิดข้อผิดพลาด", message);
    },
    
    // แจ้งเตือนเมื่อมีข้อมูลใหม่ (เช่น ในระบบ Approval)
    onNewUpdate: (message: string) => {
      showToast.info("มีการอัปเดตข้อมูลใหม่", message);
    }
  }), []);

  return { notify };
}

// alias 
export const useNotify = useToast;
