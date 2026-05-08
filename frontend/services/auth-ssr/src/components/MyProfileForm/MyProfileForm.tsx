"use client";

import { CloseOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Space, Tooltip, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "jet-meal-my-profile-v1";

export type MyProfileValues = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  comment: string;
};

const empty: MyProfileValues = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  comment: "",
};

function load(): MyProfileValues {
  if (typeof window === "undefined") {
    return empty;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return empty;
    }
    const v = JSON.parse(raw) as Partial<MyProfileValues>;
    return { ...empty, ...v };
  } catch {
    return empty;
  }
}

function save(values: MyProfileValues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

export function MyProfileForm() {
  const router = useRouter();
  const [form] = Form.useForm<MyProfileValues>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    form.setFieldsValue(load());
  }, [form]);

  function revert() {
    form.setFieldsValue(load());
  }

  return (
    <Card style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Профиль и доставка
        </Typography.Title>
        <Tooltip title="Назад">
          <Button
            type="text"
            icon={<CloseOutlined />}
            aria-label="Закрыть и вернуться"
            onClick={() => router.back()}
          />
        </Tooltip>
      </div>
      <Typography.Paragraph type="secondary">
        Данные хранятся локально в браузере (демо). Позже здесь будет сохранение
        на сервере.
      </Typography.Paragraph>
      <Form<MyProfileValues>
        layout="vertical"
        form={form}
        onFinish={(values) => {
          save(values);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
        }}
      >
        <Form.Item
          label="Имя и фамилия"
          name="fullName"
          rules={[{ required: true, message: "Укажите имя" }]}
        >
          <Input autoComplete="name" placeholder="Иван Иванов" />
        </Form.Item>
        <Form.Item label="Телефон" name="phone">
          <Input autoComplete="tel" placeholder="+7 …" />
        </Form.Item>
        <Form.Item
          label="Почта"
          name="email"
          rules={[{ type: "email", message: "Некорректная почта" }]}
        >
          <Input autoComplete="email" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item label="Город" name="city">
          <Input placeholder="Город" />
        </Form.Item>
        <Form.Item label="Адрес доставки" name="address">
          <Input.TextArea
            rows={3}
            placeholder="Улица, дом, подъезд, домофон"
          />
        </Form.Item>
        <Form.Item label="Комментарий курьеру" name="comment">
          <Input.TextArea rows={2} placeholder="Например, не звонить в домофон" />
        </Form.Item>
        <Space align="center" wrap>
          <Button type="primary" htmlType="submit">
            Сохранить
          </Button>
          <Button type="link" onClick={revert}>
            Отмена
          </Button>
          {saved ? (
            <Typography.Text type="success">Сохранено</Typography.Text>
          ) : null}
        </Space>
      </Form>
    </Card>
  );
}
