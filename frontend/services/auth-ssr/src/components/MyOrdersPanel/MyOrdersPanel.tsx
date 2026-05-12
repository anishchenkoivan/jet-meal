"use client";

import { Card, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

type Row = {
  key: string;
  id: string;
  placedAt: string;
  restaurant: string;
  total: string;
  status: string;
};

const MOCK: Row[] = [
  {
    key: "1",
    id: "JM-10042",
    placedAt: "28.04.2026, 19:40",
    restaurant: "Гастробар «Север»",
    total: "1 890 ₽",
    status: "Доставлен",
  },
  {
    key: "2",
    id: "JM-10018",
    placedAt: "25.04.2026, 12:05",
    restaurant: "Пиццерия «Дрова»",
    total: "920 ₽",
    status: "Доставлен",
  },
  {
    key: "3",
    id: "JM-09991",
    placedAt: "22.04.2026, 20:12",
    restaurant: "Кофе «Утро»",
    total: "640 ₽",
    status: "Отменён",
  },
];

const columns: ColumnsType<Row> = [
  { title: "Номер", dataIndex: "id", key: "id" },
  { title: "Дата", dataIndex: "placedAt", key: "placedAt" },
  { title: "Ресторан", dataIndex: "restaurant", key: "restaurant" },
  { title: "Сумма", dataIndex: "total", key: "total" },
  { title: "Статус", dataIndex: "status", key: "status" },
];

export function MyOrdersPanel() {
  return (
    <Card style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Мои заказы
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Пример списка. При подключении API данные подтянутся с сервера.
      </Typography.Paragraph>
      <Table<Row>
        size="small"
        pagination={false}
        columns={columns}
        dataSource={MOCK}
      />
    </Card>
  );
}
