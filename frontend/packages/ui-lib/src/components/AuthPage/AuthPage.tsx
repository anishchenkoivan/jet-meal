"use client";

import { Button, Card, Form, Input, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { MiddleColumn } from "../MiddleColumn/MiddleColumn";

export type AuthMode = "login" | "register";

export type AuthFormValues = {
  login: string;
  password: string;
  /** Заполняется после подтверждения почты при регистрации */
  email?: string;
};

export type AuthPageProps = {
  /** Заголовок формы входа */
  title?: string;
  /** Заголовок формы регистрации (до шага с кодом) */
  registerTitle?: string;
  /** Заголовок экрана ввода кода из письма */
  verifyEmailTitle?: string;
  /** Режим при первом рендере (например, из query `?register=1`). */
  initialMode?: AuthMode;
  onSubmit: (mode: AuthMode, values: AuthFormValues) => Promise<void> | void;
  /** Длина кода в письме (по умолчанию 6). */
  verificationCodeLength?: number;
};

type RegisterDraft = {
  login: string;
  email: string;
  password: string;
};

type RegisterFormFields = RegisterDraft & {
  confirmPassword: string;
};

function randomDigits(length: number): string {
  let s = "";
  for (let i = 0; i < length; i += 1) {
    s += String(Math.floor(Math.random() * 10));
  }
  return s;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || !local) {
    return email;
  }
  const vis =
    local.length <= 2
      ? `${local[0] ?? ""}*`
      : `${local.slice(0, 2)}…${local.slice(-1)}`;
  return `${vis}@${domain}`;
}

export function AuthPage({
  title = "Вход",
  registerTitle = "Регистрация",
  verifyEmailTitle = "Введите код из письма",
  initialMode = "login",
  onSubmit,
  verificationCodeLength = 6,
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [pending, setPending] = useState(false);
  const [registerStep, setRegisterStep] = useState<"form" | "verify">("form");
  const [loginForm] = Form.useForm<AuthFormValues>();
  const [registerForm] = Form.useForm<RegisterFormFields>();
  const [verifyForm] = Form.useForm<{ code: string }>();
  const [draft, setDraft] = useState<RegisterDraft | null>(null);
  const [sentCode, setSentCode] = useState<string>("");

  const resetRegisterFlow = useCallback(() => {
    setRegisterStep("form");
    setDraft(null);
    setSentCode("");
    verifyForm.resetFields();
  }, [verifyForm]);

  useEffect(() => {
    setMode(initialMode);
    resetRegisterFlow();
    loginForm.resetFields();
    registerForm.resetFields();
  }, [initialMode, loginForm, registerForm, resetRegisterFlow]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetRegisterFlow();
    loginForm.resetFields();
    registerForm.resetFields();
  };

  const heading =
    mode === "login"
      ? title
      : registerStep === "verify"
        ? verifyEmailTitle
        : registerTitle;

  const handleRegisterFormFinish = async (values: RegisterFormFields) => {
    setPending(true);
    try {
      const code = randomDigits(verificationCodeLength);
      setDraft({
        login: values.login.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      setSentCode(code);
      setRegisterStep("verify");
      verifyForm.resetFields();
    } finally {
      setPending(false);
    }
  };

  const handleVerifyFinish = async (values: { code: string }) => {
    if (!draft) {
      return;
    }
    const entered = values.code.replace(/\s/g, "");
    if (entered.length !== verificationCodeLength || entered !== sentCode) {
      verifyForm.setFields([
        { name: "code", errors: ["Неверный код. Проверьте письмо."] },
      ]);
      return;
    }
    setPending(true);
    try {
      await onSubmit("register", {
        login: draft.login,
        password: draft.password,
        email: draft.email,
      });
    } finally {
      setPending(false);
    }
  };

  const resendCode = () => {
    setSentCode(randomDigits(verificationCodeLength));
    verifyForm.setFields([{ name: "code", errors: [] }]);
  };

  const backToRegisterForm = () => {
    if (!draft) {
      return;
    }
    const saved = draft;
    setRegisterStep("form");
    setDraft(null);
    setSentCode("");
    verifyForm.resetFields();
    registerForm.setFieldsValue({
      login: saved.login,
      email: saved.email,
      password: saved.password,
      confirmPassword: saved.password,
    });
  };

  return (
    <MiddleColumn
      verticalAlign="center"
      maxWidthPx={640}
      className="min-h-0 flex-1 py-4"
    >
      <Card style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {heading}
        </Typography.Title>

        {mode === "register" && registerStep === "verify" && draft ? (
          <>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
              Мы отправили код на{" "}
              <Typography.Text strong>{maskEmail(draft.email)}</Typography.Text>
              . Введите его ниже.
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
              Без почтового сервера код показывается только здесь (демо):{" "}
              <Typography.Text code copyable>
                {sentCode}
              </Typography.Text>
            </Typography.Paragraph>
            <Form<{ code: string }>
              form={verifyForm}
              layout="vertical"
              onFinish={handleVerifyFinish}
            >
              <Form.Item
                label="Код из письма"
                name="code"
                rules={[
                  { required: true, message: "Введите код" },
                  {
                    len: verificationCodeLength,
                    message: `Код из ${verificationCodeLength} цифр`,
                  },
                ]}
              >
                <Input.OTP
                  length={verificationCodeLength}
                  size="large"
                  inputMode="numeric"
                  autoFocus={false}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={pending} block>
                Подтвердить и зарегистрироваться
              </Button>
            </Form>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "space-between",
              }}
            >
              <Button type="link" onClick={resendCode} style={{ padding: 0 }}>
                Отправить код снова
              </Button>
              <Button
                type="link"
                onClick={backToRegisterForm}
                style={{ padding: 0 }}
              >
                Изменить почту и данные
              </Button>
            </div>
          </>
        ) : mode === "login" ? (
          <>
            <Form<AuthFormValues>
              form={loginForm}
              layout="vertical"
              onFinish={async (values) => {
                setPending(true);
                try {
                  await onSubmit("login", {
                    login: values.login.trim(),
                    password: values.password,
                  });
                } finally {
                  setPending(false);
                }
              }}
            >
              <Form.Item
                label="Логин"
                name="login"
                rules={[{ required: true, message: "Укажите логин" }]}
              >
                <Input autoComplete="username" autoFocus={false} />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: "Укажите пароль" }]}
              >
                <Input.Password
                  autoComplete="current-password"
                  autoFocus={false}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={pending} block>
                Войти
              </Button>
            </Form>

            <div style={{ marginTop: 12 }}>
              <Button
                type="link"
                onClick={() => switchMode("register")}
                style={{ padding: 0 }}
              >
                Нет аккаунта? Зарегистрируйтесь
              </Button>
            </div>
          </>
        ) : (
          <>
            <Form<RegisterFormFields>
              form={registerForm}
              layout="vertical"
              onFinish={handleRegisterFormFinish}
            >
              <Form.Item
                label="Логин"
                name="login"
                rules={[{ required: true, message: "Укажите логин" }]}
              >
                <Input autoComplete="username" autoFocus={false} />
              </Form.Item>

              <Form.Item
                label="Почта"
                name="email"
                rules={[
                  { required: true, message: "Укажите почту" },
                  { type: "email", message: "Некорректный адрес почты" },
                ]}
              >
                <Input autoComplete="email" autoFocus={false} />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: "Укажите пароль" }]}
              >
                <Input.Password autoComplete="new-password" autoFocus={false} />
              </Form.Item>

              <Form.Item
                label="Подтвердите пароль"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Повторите пароль" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Пароли не совпадают"));
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" autoFocus={false} />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={pending} block>
                Зарегистрироваться
              </Button>
            </Form>

            <div style={{ marginTop: 12 }}>
              <Button
                type="link"
                onClick={() => switchMode("login")}
                style={{ padding: 0 }}
              >
                Уже есть аккаунт? Войдите
              </Button>
            </div>
          </>
        )}
      </Card>
    </MiddleColumn>
  );
}
