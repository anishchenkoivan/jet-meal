"use client";

import { Button, Typography } from "antd";
import { Modal } from "../Modal/Modal";
import type { ButtonProps } from "antd";
import cx from "classnames";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import styles from "./DangerousButton.module.css";

export type DangerousButtonProps = {
  children: ReactNode;
  /** Как триггер: обычная кнопка или текстовая ссылка */
  trigger?: "button" | "link";
  /** Пропсы кнопки, если trigger === "button" */
  buttonProps?: Omit<ButtonProps, "onClick" | "children">;
  modalTitle?: string;
  /** Текст в теле модалки */
  confirmText?: string;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
};

const DEFAULT_CONFIRM =
  "Вы уверены, что хотите выполнить действие? Это нельзя будет отменить автоматически.";

export function DangerousButton({
  children,
  trigger = "button",
  buttonProps,
  modalTitle = "Подтверждение",
  confirmText = DEFAULT_CONFIRM,
  okText = "Да",
  cancelText = "Отмена",
  onConfirm,
}: DangerousButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleCancel = useCallback(() => setOpen(false), []);

  const handleOk = useCallback(async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [onConfirm]);

  return (
    <>
      {trigger === "link" ? (
        <Typography.Link
          className={cx(styles["link"])}
          onClick={handleOpen}
          role="button"
        >
          {children}
        </Typography.Link>
      ) : (
        <Button {...buttonProps} onClick={handleOpen}>
          {children}
        </Button>
      )}
      <Modal
        title={modalTitle}
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        okText={okText}
        cancelText={cancelText}
        confirmLoading={loading}
        okButtonProps={{ danger: true }}
        destroyOnHidden
      >
        <p className={cx(styles["bodyText"])}>{confirmText}</p>
      </Modal>
    </>
  );
}
