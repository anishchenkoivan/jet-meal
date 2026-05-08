"use client";

import {
  EditOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Descriptions, Space, Tooltip, Typography } from "antd";
import { useRouter } from "next/navigation";
import {
  ACCOUNT_LOGIN_COOKIE,
  SESSION_EXPIRES_AT_COOKIE,
  SESSION_ID_COOKIE,
} from "../../lib/middlewares/authGuard";

function clearCookie(name: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: сброс демо-cookie при выходе
  document.cookie = `${name}=; path=/; max-age=0`;
}

type Props = {
  login: string;
  expiresAtMs: number;
  sessionId: string;
};

export function AccountSignedIn({ login, expiresAtMs, sessionId }: Props) {
  const router = useRouter();
  const expiresFmt = new Date(expiresAtMs).toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const sessionShort =
    sessionId.length > 12
      ? `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`
      : sessionId;

  function logout() {
    clearCookie(ACCOUNT_LOGIN_COOKIE);
    clearCookie(SESSION_ID_COOKIE);
    clearCookie(SESSION_EXPIRES_AT_COOKIE);
    router.push("/my");
    router.refresh();
  }

  return (
    <Card style={{ width: "100%" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Button type="link" danger onClick={logout} style={{ paddingInline: 4 }}>
              Выйти
            </Button>
            <Typography.Title level={3} style={{ margin: 0, flex: 1 }}>
              <UserOutlined /> Личный кабинет
            </Typography.Title>
            <Tooltip title="Редактировать профиль">
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label="Редактировать профиль"
                onClick={() => router.push("/my/profile")}
              />
            </Tooltip>
          </div>
        </div>

        <Descriptions
          bordered
          column={1}
          size="small"
          labelStyle={{ width: 180 }}
        >
          <Descriptions.Item label="Логин">{login}</Descriptions.Item>
          <Descriptions.Item label="Сессия активна до">
            {expiresFmt}
          </Descriptions.Item>
          <Descriptions.Item label="Идентификатор сессии">
            {sessionShort}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Здесь позже появятся сохранённые адреса доставки, способы оплаты и
          персональные акции.
        </Typography.Paragraph>

        <Space wrap>
          <Button
            type="primary"
            icon={<ShoppingOutlined />}
            onClick={() => router.push("/my/orders")}
          >
            Мои заказы
          </Button>
          <Button
            type="default"
            icon={<SettingOutlined />}
            onClick={() => router.push("/admin")}
          >
            Админка
          </Button>
        </Space>
      </Space>
    </Card>
  );
}
