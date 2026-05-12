"use client";

import type { ModalProps } from "antd";
import { Modal as AntModal } from "antd";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

export function Modal(props: ModalProps) {
  useBodyScrollLock(Boolean(props.open));
  return <AntModal {...props} />;
}
