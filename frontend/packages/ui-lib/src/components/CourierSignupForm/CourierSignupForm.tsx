"use client";

import { Button, Card, Input, Typography } from "antd";
import { useState } from "react";
import { Checkbox } from "../Checkbox/Checkbox";
import { Form } from "../Form/Form";

export type CourierSignupFormValues = {
  fullName?: string;
  passport?: string;
  inn?: string;
  consentPersonal: boolean;
  consentContract: boolean;
};

export type CourierSignupFormProps = {
  title?: string;
  /** Отправка: без обязательных полей (демо). */
  onComplete: (values: CourierSignupFormValues) => Promise<void> | void;
};

/**
 * Оформление профиля курьера в том же визуальном стиле, что и {@link AuthPage}.
 */
export function CourierSignupForm({
  title = "Подключение курьера Jet Meal",
  onComplete,
}: CourierSignupFormProps) {
  const [form] = Form.useForm<CourierSignupFormValues>();
  const [pending, setPending] = useState(false);

  return (
    <Card style={{ width: "100%", maxWidth: 640 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
        Заполните паспортные данные и ИНН для договора. Сейчас форма демонстрационная: можно
        отправить пустой и всё равно продолжить.
      </Typography.Paragraph>

      <Form<CourierSignupFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          consentPersonal: false,
          consentContract: false,
        }}
        onFinish={async (values) => {
          setPending(true);
          try {
            await onComplete(values);
          } finally {
            setPending(false);
          }
        }}
      >
        <Form.Item label="ФИО (как в паспорте)" name="fullName">
          <Input autoComplete="name" placeholder="Иванов Иван Иванович" />
        </Form.Item>
        <Form.Item label="Серия и номер паспорта" name="passport">
          <Input placeholder="0000 000000" />
        </Form.Item>
        <Form.Item label="ИНН" name="inn">
          <Input placeholder="12 цифр" inputMode="numeric" />
        </Form.Item>
        <Form.Item name="consentPersonal" valuePropName="checked">
          <Checkbox>
            Согласен на обработку персональных данных и передачу сведений партнёрам сервиса
          </Checkbox>
        </Form.Item>
        <Form.Item name="consentContract" valuePropName="checked">
          <Checkbox>Ознакомился с типовым договором и принимаю условия</Checkbox>
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={pending} block size="large">
          Создать аккаунт курьера
        </Button>
      </Form>
    </Card>
  );
}
