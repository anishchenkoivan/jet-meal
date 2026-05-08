"use client";

import { Modal } from "../Modal/Modal";
import type { ReactNode } from "react";

export type AppConfirmModalProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
};

/**
 * Обёртка над `Modal` для текстов согласий и подтверждений.
 */
export function AppConfirmModal({
  open,
  title,
  children,
  okText = "Понятно",
  cancelText = "Отмена",
  onOk,
  onCancel,
}: AppConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
}
