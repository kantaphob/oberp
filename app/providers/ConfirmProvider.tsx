"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ConfirmActionModal } from "@/app/components/Dashboard/ConfirmActionModal";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "warning" | "success" | "orange";
  requireConfirmText?: string;
  requireSupervisorAuth?: boolean;
}

interface ConfirmResult {
  confirmed: boolean;
  auth?: { identifier: string; password?: string };
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<ConfirmResult>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    resolve: (value: ConfirmResult) => void;
    options: ConfirmOptions;
  } | null>(null);

  const confirm = (options: ConfirmOptions) => {
    return new Promise<ConfirmResult>((resolve) => {
      setModalState({
        isOpen: true,
        resolve,
        options,
      });
    });
  };

  const handleClose = () => {
    if (modalState) {
      modalState.resolve({ confirmed: false });
      setModalState(null);
    }
  };

  const handleConfirm = (auth?: { identifier: string; password?: string }) => {
    if (modalState) {
      modalState.resolve({ confirmed: true, auth });
      setModalState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalState && (
        <ConfirmActionModal
          isOpen={modalState.isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={modalState.options.title}
          description={modalState.options.description}
          confirmLabel={modalState.options.confirmLabel}
          cancelLabel={modalState.options.cancelLabel}
          variant={modalState.options.variant}
          requireConfirmText={modalState.options.requireConfirmText}
          requireSupervisorAuth={modalState.options.requireSupervisorAuth}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
