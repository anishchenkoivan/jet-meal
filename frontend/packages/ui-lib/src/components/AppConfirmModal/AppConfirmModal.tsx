"use client";

import type { ReactNode } from "react";
import { Modal } from "../Modal/Modal";

export type AppConfirmModalProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  okText?: string;
  cancelText?: string;
  /** Красная кнопка подтверждения (например удаление / закрытие). */
  okDanger?: boolean;
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
  okDanger,
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
      okButtonProps={okDanger ? { danger: true } : undefined}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
}
