"use client";

import { CourierScheduleEditor } from "../CourierScheduleModal/CourierScheduleModal";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Form } from "@jet-meal/ui-lib/src/components/Form/Form";
import {
  Input,
  Search,
  TextArea,
} from "@jet-meal/ui-lib/src/components/Input/Input";
import { Select } from "@jet-meal/ui-lib/src/components/Select/Select";
import { Tag } from "@jet-meal/ui-lib/src/components/Tag/Tag";
import {
  Paragraph,
  Title,
} from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { MiddleColumn } from "@jet-meal/ui-lib/src/components/MiddleColumn/MiddleColumn";
import { useDrawer } from "@jet-meal/ui-lib/src/components/DrawerProvider/DrawerProvider";
import { useJetMealDevMock } from "@jet-meal/ui-lib/src/context/JetMealDevMockContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  courierRowsFromJetMealDevOrders,
  type CourierOrderRow,
} from "../../lib/courierMockOrders";
import {
  COURIER_PROFILE_DRAWER_ID,
  COURIER_SCHEDULE_DRAWER_ID,
} from "../../lib/courierDrawerIds";
import {
  ensureCourierNotificationPermission,
  operationalStatusLabel,
  operationalTagColor,
  pushCourierNotify,
  useCourierShiftRuntime,
} from "../../lib/courierShiftRuntime";
import { templateContractLabel } from "../../lib/courierScheduleTypes";

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

export function CourierDashboard() {
  const dev = useJetMealDevMock();
  const { open, close } = useDrawer();
  const { ui, schedule, startShift, startLunch, refresh } =
    useCourierShiftRuntime();

  const [orderQuery, setOrderQuery] = useState("");
  const [visibleOrders, setVisibleOrders] = useState(5);
  const [profileForm] = Form.useForm<CourierSettings>();
  const [mounted, setMounted] = useState(false);
  const prevOp = useRef<string | null>(null);

  useEffect(() => {
    const o = ui.operationalStatus;
    if (!o) {
      prevOp.current = null;
      return;
    }
    if (prevOp.current && prevOp.current !== o) {
      pushCourierNotify(
        "Статус линии",
        operationalStatusLabel(o),
        "courier-op-line",
      );
    }
    prevOp.current = o;
  }, [ui.operationalStatus]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void ensureCourierNotificationPermission();
  }, []);

  const allCourierRows = useMemo(
    () => courierRowsFromJetMealDevOrders(dev.orders),
    [dev.orders],
  );

  const filteredAll = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    const all = allCourierRows;
    if (!q) {
      return all;
    }
    return all.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.route.toLowerCase().includes(q) ||
        String(o.amountRub).includes(q),
    );
  }, [orderQuery, allCourierRows]);

  const orders = useMemo(
    () => filteredAll.slice(0, visibleOrders),
    [filteredAll, visibleOrders],
  );

  useEffect(() => {
    setVisibleOrders(5);
  }, [orderQuery]);

  const openProfile = useCallback(() => {
    profileForm.setFieldsValue(loadSettings());
    open(
      COURIER_PROFILE_DRAWER_ID,
      () => (
        <MiddleColumn
          verticalAlign="top"
          maxWidthPx={640}
          className="h-full min-h-0 flex-1"
          innerClassName="box-border flex min-h-0 flex-1 flex-col overflow-y-auto py-3"
        >
          <Form<CourierSettings> form={profileForm} layout="vertical">
            <Form.Item
              label="Точка старта (откуда искать заказы)"
              name="baseAddress"
            >
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
              <TextArea
                rows={4}
                placeholder="Опыт, габариты сумки, предпочтения по районам"
              />
            </Form.Item>
          </Form>
          <div className="mt-auto flex shrink-0 flex-col gap-2 border-t pt-3 [border-color:var(--ant-color-border-secondary,#f0f0f0)]">
            <Button
              type="primary"
              block
              onClick={() => {
                void profileForm.validateFields().then((v) => {
                  const next: CourierSettings = {
                    ...v,
                    radiusKm: Number(v.radiusKm) || defaultSettings.radiusKm,
                  };
                  saveSettings(next);
                  close();
                });
              }}
            >
              Сохранить
            </Button>
            <Button block onClick={close}>
              Закрыть
            </Button>
          </div>
        </MiddleColumn>
      ),
      { replace: true, persistentModal: true },
    );
  }, [open, close, profileForm]);

  const openSchedule = useCallback(() => {
    open(
      COURIER_SCHEDULE_DRAWER_ID,
      () => (
        <MiddleColumn
          verticalAlign="top"
          maxWidthPx={920}
          className="h-full min-h-0 flex-1"
          innerClassName="box-border flex h-full min-h-0 flex-1 flex-col overflow-hidden py-3"
        >
          <CourierScheduleEditor
            onCancel={close}
            onSave={(_summary, _persist) => {
              refresh();
              close();
            }}
          />
        </MiddleColumn>
      ),
      { replace: true, persistentModal: true },
    );
  }, [open, close, refresh]);

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center gap-2">
        <Button
          type="text"
          aria-label="Профиль"
          className="!h-auto !gap-2.5 !px-2 !py-2 !text-lg !font-semibold leading-tight"
          onClick={openProfile}
        >
          <span className="text-[1.5rem] leading-none" aria-hidden>
            ✎
          </span>
          Профиль
        </Button>
        <Button type="link" className="!px-2" href="/admin/delivery/workflow">
          Рабочий процесс
        </Button>
      </header>

      {mounted ? (
        <section className="py-1">
          <div className="flex flex-col items-start gap-2">
            <Tag className="m-0">{ui.shiftStatusLabel}</Tag>
            {ui.operationalStatus ? (
              <Tag
                className="m-0"
                color={operationalTagColor(ui.operationalStatus)}
              >
                {operationalStatusLabel(ui.operationalStatus)}
              </Tag>
            ) : null}
            {ui.showStartShift ? (
              <Button type="primary" size="small" onClick={startShift}>
                Приступить к работе
              </Button>
            ) : null}
            {ui.showLunch ? (
              <Button size="small" onClick={startLunch}>
                Обед (1 час)
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl px-5 py-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] [background:var(--ant-color-bg-container,#fff)]">
        <Title level={4} style={{ marginTop: 0 }}>
          Заказы
        </Title>
        {ui.ordersFrozen || ui.phase === "lunch" ? (
          <Paragraph type="secondary">
            Обед: список заказов скрыт на час.
          </Paragraph>
        ) : (
          <>
            <Search
              allowClear
              placeholder="Поиск по номеру, маршруту, сумме"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              style={{ marginBottom: 12, maxWidth: 420 }}
            />
            <div className="grid max-[400px]:[grid-template-columns:1fr] max-[640px]:[grid-template-columns:repeat(2,minmax(0,1fr))] gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {orders.map((o) => (
                <CourierOrderCard key={o.id} order={o} />
              ))}
            </div>
            {orders.length === 0 ? (
              <Paragraph type="secondary">Ничего не найдено.</Paragraph>
            ) : null}
            {visibleOrders < filteredAll.length ? (
              <Button
                style={{ marginTop: 12 }}
                onClick={() => setVisibleOrders((n) => n + 5)}
              >
                Загрузить ещё
              </Button>
            ) : null}
          </>
        )}
      </section>

      <section className="rounded-xl px-5 py-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] [background:var(--ant-color-bg-container,#fff)]">
        <Title level={4} style={{ marginTop: 0 }}>
          Контрактные данные
        </Title>
        <Paragraph style={{ marginTop: 0 }}>
          Режим: <strong>{templateContractLabel(schedule.template)}</strong>.
          Фактические слоты согласованы в расписании.
        </Paragraph>
        <Button type="link" className="!px-0" onClick={openSchedule}>
          Подробнее — расписание
        </Button>
      </section>
    </div>
  );
}

function CourierOrderCard({ order }: { order: CourierOrderRow }) {
  return (
    <article className="h-full rounded-[10px] border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-fill-quaternary,#fafafa)] p-3 [color:inherit]">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{order.number}</span>
        <span className="font-semibold [color:var(--ant-color-success,#52c41a)]">
          {money.format(order.amountRub)}
        </span>
      </div>
      <p className="my-1.5 mb-1 text-sm">{order.route}</p>
      <p className="m-0 text-xs [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
        {when.format(new Date(order.completedAt))}
      </p>
    </article>
  );
}
