"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Form } from "@jet-meal/ui-lib/src/components/Form/Form";
import { Input, Search, TextArea } from "@jet-meal/ui-lib/src/components/Input/Input";
import { Modal } from "@jet-meal/ui-lib/src/components/Modal/Modal";
import { Select } from "@jet-meal/ui-lib/src/components/Select/Select";
import { Tag } from "@jet-meal/ui-lib/src/components/Tag/Tag";
import { Title, Paragraph } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import {
  COURIER_ORDER_TOTAL,
  getCourierOrdersSlice,
  type CourierOrderRow,
  type CourierWorkStatus,
} from "../../lib/courierMockOrders";
import { CourierScheduleModal } from "../CourierScheduleModal/CourierScheduleModal";
import courierModalMobile from "../CourierModalMobile.module.css";
import styles from "./courierDashboard.module.css";

const SETTINGS_KEY = "jet-meal-courier-settings.v1";

type CourierSettings = {
  baseAddress: string;
  radiusKm: number;
  transport: string;
  bio: string;
};

const defaultSettings: CourierSettings = {
  baseAddress: "Москва, м. Тверская",
  radiusKm: 3,
  transport: "bicycle",
  bio: "Опыт курьером 2 года, термосумка 45 л.",
};

function loadSettings(): CourierSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }
    return { ...defaultSettings, ...JSON.parse(raw) } as CourierSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(s: CourierSettings) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const when = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

function statusLabel(s: CourierWorkStatus): string {
  if (s === "searching") {
    return "Поиск заказов";
  }
  if (s === "on_order") {
    return "На заказе";
  }
  return "—";
}

function statusColor(s: CourierWorkStatus): "processing" | "success" | undefined {
  if (s === "searching") {
    return "processing";
  }
  if (s === "on_order") {
    return "success";
  }
  return undefined;
}

export function CourierDashboard() {
  const [workStatus, setWorkStatus] = useState<CourierWorkStatus>("none");
  const [settings, setSettings] = useState<CourierSettings>(defaultSettings);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleSummary, setScheduleSummary] = useState(
    "Пн–Пт 8:00–16:00, выходные по согласованию (демо)",
  );
  const [shiftOn, setShiftOn] = useState(false);
  const [orderQuery, setOrderQuery] = useState("");
  const [visibleOrders, setVisibleOrders] = useState(5);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const [profileForm] = Form.useForm<CourierSettings>();

  useEffect(() => {
    if (profileOpen) {
      profileForm.setFieldsValue(settings);
    }
  }, [profileOpen, profileForm, settings]);

  const filteredAll = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    const all = getCourierOrdersSlice(0, COURIER_ORDER_TOTAL);
    if (!q) {
      return all;
    }
    return all.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.route.toLowerCase().includes(q) ||
        String(o.amountRub).includes(q),
    );
  }, [orderQuery]);

  const orders = useMemo(
    () => filteredAll.slice(0, visibleOrders),
    [filteredAll, visibleOrders],
  );

  useEffect(() => {
    setVisibleOrders(5);
  }, [orderQuery]);

  const saveProfile = useCallback(() => {
    return profileForm.validateFields().then((v) => {
      const next: CourierSettings = {
        ...v,
        radiusKm: Number(v.radiusKm) || defaultSettings.radiusKm,
      };
      setSettings(next);
      saveSettings(next);
      setProfileOpen(false);
    });
  }, [profileForm]);

  return (
    <div className={styles["page"]}>
      <header className={styles["header"]}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Кабинет курьера
          </Title>
          <Paragraph type="secondary" style={{ margin: "6px 0 0" }}>
            Статус, профиль и смены — всё в одном месте (демо-интерфейс).
          </Paragraph>
        </div>
        <Button type="text" aria-label="Профиль" onClick={() => setProfileOpen(true)}>
          ✎ Профиль
        </Button>
      </header>

      <p className={styles["settingsHint"]}>
        Точка поиска: {settings.baseAddress} · радиус {settings.radiusKm} км
      </p>

      <section className={styles["panel"]}>
        <div className={styles["rowBetween"]}>
          <span className={styles["muted"]}>Статус</span>
          <Tag color={statusColor(workStatus)}>{statusLabel(workStatus)}</Tag>
        </div>
        <Select
          style={{ width: "100%", maxWidth: 320, marginTop: 10 }}
          value={workStatus}
          onChange={(v) => setWorkStatus(v as CourierWorkStatus)}
          options={[
            { value: "none", label: "Нет активного статуса" },
            { value: "searching", label: "Поиск заказов" },
            { value: "on_order", label: "На заказе" },
          ]}
        />
        <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
          Точку поиска заказов и транспорт можно настроить в профиле. Ниже — типичные поля: район
          старта, радиус, тип доставки, коротко о себе (для диспетчера и ресторана).
        </Paragraph>
      </section>

      <section className={styles["panel"]}>
        <Title level={4} style={{ marginTop: 0 }}>
          Выполненные заказы
        </Title>
        <Search
          allowClear
          placeholder="Поиск по номеру, маршруту, сумме"
          value={orderQuery}
          onChange={(e) => setOrderQuery(e.target.value)}
          style={{ marginBottom: 12, maxWidth: 420 }}
        />
        <div className={styles["ordersGrid"]}>
          {orders.map((o) => (
            <CourierOrderCard key={o.id} order={o} />
          ))}
        </div>
        {orders.length === 0 ? (
          <Paragraph type="secondary">Ничего не найдено.</Paragraph>
        ) : null}
        {visibleOrders < filteredAll.length ? (
          <Button style={{ marginTop: 12 }} onClick={() => setVisibleOrders((n) => n + 5)}>
            Загрузить ещё
          </Button>
        ) : null}
      </section>

      <section className={styles["panel"]}>
        <Title level={4} style={{ marginTop: 0 }}>
          Контрактные данные
        </Title>
        <Paragraph style={{ marginTop: 0 }}>{scheduleSummary}</Paragraph>
        <div className={styles["contractActions"]}>
          <Button type={shiftOn ? "default" : "primary"} onClick={() => setShiftOn((v) => !v)}>
            {shiftOn ? "Сняться со смены" : "Выйти на смену"}
          </Button>
          <Button onClick={() => setScheduleOpen(true)}>Обновить информацию</Button>
        </div>
      </section>

      <Modal
        title="Профиль курьера"
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        onOk={saveProfile}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
        wrapClassName={courierModalMobile.fullscreenWrapper}
      >
        <Form<CourierSettings> form={profileForm} layout="vertical">
          <Form.Item label="Точка старта (откуда искать заказы)" name="baseAddress">
            <Input placeholder="Город, метро, адрес" />
          </Form.Item>
          <Form.Item label="Радиус поиска, км" name="radiusKm">
            <Input type="number" min={1} max={25} step={1} />
          </Form.Item>
          <Form.Item label="Транспорт" name="transport">
            <Select
              options={[
                { value: "foot", label: "Пешком" },
                { value: "bicycle", label: "Велосипед" },
                { value: "ebike", label: "Электровелосипед" },
                { value: "moto", label: "Мото / скутер" },
                { value: "car", label: "Автомобиль" },
              ]}
            />
          </Form.Item>
          <Form.Item label="О себе для диспетчера" name="bio">
            <TextArea rows={4} placeholder="Опыт, габариты сумки, предпочтения по районам" />
          </Form.Item>
        </Form>
      </Modal>

      <CourierScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSave={(s) => setScheduleSummary(s)}
      />
    </div>
  );
}

function CourierOrderCard({ order }: { order: CourierOrderRow }) {
  return (
    <article className={styles["orderCard"]}>
      <div className={styles["orderTop"]}>
        <span className={styles["orderNo"]}>{order.number}</span>
        <span className={styles["orderAmt"]}>{money.format(order.amountRub)}</span>
      </div>
      <p className={styles["orderRoute"]}>{order.route}</p>
      <p className={styles["orderWhen"]}>{when.format(new Date(order.completedAt))}</p>
    </article>
  );
}
