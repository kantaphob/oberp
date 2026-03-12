import { useState } from "react";

interface SupervisorContext {
  isOpen: boolean;
  loading: boolean;
  openModal: (onConfirmAction: (supervisorUsername: string) => Promise<void>) => void;
  closeModal: () => void;
  handleConfirm: (supervisorUsername: string) => Promise<void>;
  onConfirmCallback: ((supervisorUsername: string) => Promise<void>) | null;
}

export function useSupervisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onConfirmCallback, setOnConfirmCallback] = useState<((supervisorUsername: string) => Promise<void>) | null>(null);

  const openModal = (onConfirmAction: (supervisorUsername: string) => Promise<void>) => {
    setOnConfirmCallback(() => onConfirmAction);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setLoading(false);
    setOnConfirmCallback(null);
  };

  const handleConfirm = async (supervisorUsername: string) => {
    if (!onConfirmCallback) return;
    setLoading(true);
    try {
      await onConfirmCallback(supervisorUsername);
      setIsOpen(false);
    } catch (err: any) {
      throw err; // ให้ Modal แสดงผล Error
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    loading,
    openModal,
    closeModal,
    handleConfirm,
  };
}
