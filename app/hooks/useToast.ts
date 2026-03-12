"use client";

import { useMemo } from "react";
import toast from "../lib/toast";
import type { ToastModalOptions } from "../types/toast";

export type Notify = {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  loading: (message: string, title?: string) => string;
  dismiss: (id: string) => void;
  successModal: (options: ToastModalOptions) => void;
  errorModal: (options: ToastModalOptions) => void;
  apiError: (error: unknown, customMessage?: string) => void;
  withLoading: <T>(
    promise: Promise<T>,
    loadingMessage?: string,
    successMessage?: string
  ) => Promise<T>;
  withApiErrorHandling: <T>(
    apiCall: () => Promise<T>,
    customErrorMessage?: string
  ) => Promise<T>;
};

export function useToast() {
  const toMessage = (message: string, title?: string) =>
    title ? `${title}: ${message}` : message;

  const toErrorMessage = (error: unknown, fallback = "เกิดข้อผิดพลาด") => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const notify: Notify = useMemo(
    () => ({
      success: (message, title) => {
        toast.success(toMessage(message, title));
      },
      error: (message, title) => {
        toast.error(toMessage(message, title));
      },
      warning: (message, title) => {
        toast.warning(toMessage(message, title));
      },
      info: (message, title) => {
        toast.info(toMessage(message, title));
      },
      loading: (message, title) => toast.info(toMessage(message, title)),
      dismiss: (id) => {
        toast.remove(id);
      },
      successModal: (options) => {
        toast.success(toMessage(options.description, options.title));
      },
      errorModal: (options) => {
        toast.error(toMessage(options.description, options.title));
      },
      apiError: (error, customMessage) => {
        toast.error(toErrorMessage(error, customMessage));
      },
      withLoading: <T,>(
        promise: Promise<T>,
        loadingMessage?: string,
        successMessage?: string,
      ) => {
        const loadingId = toast.info(loadingMessage ?? "กำลังประมวลผล...");
        return promise
          .then((result) => {
            toast.remove(loadingId);
            if (successMessage) toast.success(successMessage);
            return result;
          })
          .catch((error: unknown) => {
            toast.remove(loadingId);
            toast.error(toErrorMessage(error));
            throw error;
          });
      },
      withApiErrorHandling: <T,>(
        apiCall: () => Promise<T>,
        customErrorMessage?: string,
      ) =>
        apiCall().catch((error: unknown) => {
          toast.error(toErrorMessage(error, customErrorMessage));
          throw error;
        }),
    }),
    [],
  );

  return { notify };
}

// backward compatibility
export const useNotify = useToast;
