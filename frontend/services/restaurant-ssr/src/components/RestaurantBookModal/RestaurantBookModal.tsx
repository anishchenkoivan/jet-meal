"use client";

import { useEffect, useState } from "react";
import { message } from "@jet-meal/ui-lib/src/antdMessage";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Divider } from "@jet-meal/ui-lib/src/components/Divider/Divider";
import { Modal } from "@jet-meal/ui-lib/src/components/Modal/Modal";
import { TimeInput } from "@jet-meal/ui-lib/src/components/TimeInput/TimeInput";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";

export type RestaurantBookModalProps = {
  open: boolean;
  onClose: () => void;
  bookHref?: string;
  phone?: string;
};

function telHref(raw: string): string {
  const cleaned = raw.trim().replace(/[^\d+]/g, "");
  if (!cleaned) {
    return "#";
  }
  return cleaned.startsWith("+") ? `tel:${cleaned}` : `tel:+${cleaned}`;
}

export function RestaurantBookModal({
  open,
  onClose,
  bookHref,
  phone = "+7 (495) 000-00-00",
}: RestaurantBookModalProps) {
  const [when, setWhen] = useState("");

  useEffect(() => {
    if (!open) {
      setWhen("");
    }
  }, [open]);

  return (
    <Modal
      title="Забронировать"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Typography.Paragraph style={{ marginBottom: 8 }}>
        Вначале укажите время
      </Typography.Paragraph>
      <TimeInput
        value={when}
        onChange={setWhen}
        placeholder="Дата и время визита"
      />
      <Button
        type="primary"
        block
        style={{ marginTop: 16 }}
        onClick={() => {
          if (!when.trim()) {
            message.warning("Выберите дату и время");
            return;
          }
          if (bookHref) {
            window.open(bookHref, "_blank", "noopener,noreferrer");
          } else {
            message.success("Позвоните в ресторан по номеру ниже.");
          }
          onClose();
        }}
      >
        Забронировать
      </Button>
      <Divider style={{ margin: "20px 0 16px" }} />
      <Typography.Text
        type="secondary"
        style={{ display: "block", marginBottom: 8 }}
      >
        Или позвоните по номеру:
      </Typography.Text>
      <Typography.Link href={telHref(phone)} copyable strong style={{ fontSize: 18 }}>
        {phone}
      </Typography.Link>
    </Modal>
  );
}
