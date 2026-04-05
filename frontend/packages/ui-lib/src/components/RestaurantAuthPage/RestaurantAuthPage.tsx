"use client";

import { Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";

export type RestaurantAuthMode = "login" | "register";

export type RestaurantAuthFormValues = {
  login: string;
  password: string;
};

export type RestaurantAuthFormProps = {
  title?: string;
  onSubmit: (
    mode: RestaurantAuthMode,
    values: RestaurantAuthFormValues,
  ) => Promise<void> | void;
};

export function RestaurantAuthForm({
  title = "Авторизация ресторана",
  onSubmit,
}: RestaurantAuthFormProps) {
  const [mode, setMode] = useState<RestaurantAuthMode>("login");
  const [pending, setPending] = useState(false);

  return (
    <Card style={{ width: "100%", maxWidth: 460 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {title}
      </Typography.Title>
      <Form<RestaurantAuthFormValues>
        layout="vertical"
        onFinish={async (values) => {
          setPending(true);
          try {
            await onSubmit(mode, values);
          } finally {
            setPending(false);
          }
        }}
      >
        <Form.Item
          label="Логин"
          name="login"
          rules={[{ required: true, message: "Укажи логин" }]}
        >
          <Input autoComplete="username" />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: "Укажи пароль" }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={pending} block>
          {mode === "login" ? "Войти" : "Зарегистрироваться"}
        </Button>
      </Form>

      <div style={{ marginTop: 12 }}>
        {mode === "login" ? (
          <Button type="link" onClick={() => setMode("register")} style={{ padding: 0 }}>
            Нет аккаунта? Зарегистрируйтесь
          </Button>
        ) : (
          <Button type="link" onClick={() => setMode("login")} style={{ padding: 0 }}>
            Уже есть аккаунт? Войдите
          </Button>
        )}
      </div>
    </Card>
  );
}
