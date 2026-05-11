"use client";

import { AppConfirmModal } from "@jet-meal/ui-lib/src/components/AppConfirmModal/AppConfirmModal";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { CenteredColumn } from "@jet-meal/ui-lib/src/components/CenteredColumn/CenteredColumn";
import { GeoMarkersFrame } from "@jet-meal/ui-lib/src/components/GeoMarkersFrame/GeoMarkersFrame";
import { Modal } from "@jet-meal/ui-lib/src/components/Modal/Modal";
import { Tag } from "@jet-meal/ui-lib/src/components/Tag/Tag";
import {
  Paragraph,
  Title,
} from "@jet-meal/ui-lib/src/components/Typography/Typography";
import type { SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMinutes,
  buildWorkflowOffersNear,
  defaultCourierPosition,
  estimateTravelMinutes,
  type WorkflowCoords,
  type WorkflowOffer,
} from "../../lib/courierWorkflowMock";
import {
  useCourierShiftRuntime,
  writeCourierOperational,
} from "../../lib/courierShiftRuntime";
import { YandexWorkflowRouteMap } from "../YandexWorkflowRouteMap/YandexWorkflowRouteMap";

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const timeFmt = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

type ActiveJob = {
  offer: WorkflowOffer;
  pickedUpFromRestaurant: boolean;
  /** Сколько промежуточных точек уже «закрыто» кнопкой «Заказ получен». */
  completedWaypointLegs: number;
  /** Расчётное время готовности заказа к выдаче (момент принятия + readyInMinutes). */
  readyAt: Date;
};

type ConfirmKind =
  | "pickup_restaurant"
  | "waypoint_done"
  | "handoff_client"
  | null;

const WORKFLOW_JOB_KEY = "jet-meal-courier-workflow-job.v1";

function parseJob(raw: string | null): ActiveJob | null {
  if (!raw) {
    return null;
  }
  try {
    const o = JSON.parse(raw) as {
      offer: WorkflowOffer;
      pickedUpFromRestaurant: boolean;
      completedWaypointLegs: number;
      readyAt: string;
    };
    return {
      offer: o.offer,
      pickedUpFromRestaurant: o.pickedUpFromRestaurant,
      completedWaypointLegs: o.completedWaypointLegs,
      readyAt: new Date(o.readyAt),
    };
  } catch {
    return null;
  }
}

function persistJob(job: ActiveJob | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (!job) {
    window.sessionStorage.removeItem(WORKFLOW_JOB_KEY);
    return;
  }
  window.sessionStorage.setItem(
    WORKFLOW_JOB_KEY,
    JSON.stringify({
      ...job,
      readyAt: job.readyAt.toISOString(),
    }),
  );
}

function sumLegMinutes(points: WorkflowCoords[]): number {
  let s = 0;
  for (let i = 1; i < points.length; i++) {
    s += estimateTravelMinutes(points[i - 1]!, points[i]!);
  }
  return s;
}

export type CourierWorkflowClientProps = {
  yandexMapsApiKey: string;
};

export function CourierWorkflowClient({
  yandexMapsApiKey,
}: CourierWorkflowClientProps) {
  const { ui, refresh } = useCourierShiftRuntime();
  const [courierPos, setCourierPos] = useState<WorkflowCoords>(() =>
    defaultCourierPosition(),
  );
  const [geoLabel, setGeoLabel] = useState<string>("Определяем позицию…");
  const [job, setJobState] = useState<ActiveJob | null>(null);

  useEffect(() => {
    const j = parseJob(window.sessionStorage.getItem(WORKFLOW_JOB_KEY));
    if (j) {
      setJobState(j);
    }
  }, []);

  const setJob = useCallback((next: SetStateAction<ActiveJob | null>) => {
    setJobState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      persistJob(resolved);
      return resolved;
    });
  }, []);
  const [offerModalId, setOfferModalId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoLabel(
        "Геолокация недоступна — показаны условные координаты (Москва, центр).",
      );
      setCourierPos(defaultCourierPosition());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: WorkflowCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCourierPos(coords);
        setGeoLabel(
          `Позиция по GPS: ${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`,
        );
      },
      () => {
        setCourierPos(defaultCourierPosition());
        setGeoLabel(
          "Не удалось получить геолокацию — показаны условные координаты.",
        );
      },
      { enableHighAccuracy: true, timeout: 14_000, maximumAge: 60_000 },
    );
  }, []);

  const offers = useMemo(
    () => buildWorkflowOffersNear(courierPos),
    [courierPos],
  );

  const modalOffer = useMemo(
    () => offers.find((o) => o.id === offerModalId) ?? null,
    [offers, offerModalId],
  );

  const searching = ui.operationalStatus === "searching";
  const staleOnOrder = !job && ui.operationalStatus === "on_order";
  const showIdle = !job && ui.operationalStatus !== "searching" && !staleOnOrder;
  const showSearchBoard = searching && !job;

  const travelToRestaurantMin = job
    ? estimateTravelMinutes(courierPos, job.offer.restaurantCoords) + 10
    : 0;

  const pickupTargetMs = job
    ? Math.max(
        job.readyAt.getTime(),
        Date.now() + travelToRestaurantMin * 60_000,
      )
    : 0;

  const routeToRestaurant = job
    ? [courierPos, job.offer.restaurantCoords]
    : [];

  const transitRoutePoints = useMemo(() => {
    if (!job?.pickedUpFromRestaurant) {
      return [];
    }
    const { offer, completedWaypointLegs } = job;
    const start: WorkflowCoords =
      completedWaypointLegs === 0
        ? offer.restaurantCoords
        : offer.waypoints[completedWaypointLegs - 1]!.coords;
    const pending = offer.waypoints.slice(completedWaypointLegs);
    if (pending.length > 0) {
      return [start, ...pending.map((w) => w.coords), offer.clientCoords];
    }
    return [start, offer.clientCoords];
  }, [job]);

  const transitApproxMin = useMemo(
    () => (transitRoutePoints.length >= 2 ? sumLegMinutes(transitRoutePoints) : 0),
    [transitRoutePoints],
  );

  const nextWaypoint = job?.pickedUpFromRestaurant
    ? job.offer.waypoints[job.completedWaypointLegs]
    : undefined;

  const allWaypointsDone =
    job?.pickedUpFromRestaurant &&
    job.completedWaypointLegs >= job.offer.waypoints.length;

  const openOffer = useCallback((id: string) => {
    setOfferModalId(id);
  }, []);

  const refuseOffer = useCallback(() => {
    setOfferModalId(null);
  }, []);

  const acceptOffer = useCallback(() => {
    if (!modalOffer) {
      return;
    }
    const readyAt = addMinutes(new Date(), modalOffer.readyInMinutes);
    setJob({
      offer: modalOffer,
      pickedUpFromRestaurant: false,
      completedWaypointLegs: 0,
      readyAt,
    });
    writeCourierOperational({
      status: "on_order",
      updatedAt: new Date().toISOString(),
    });
    refresh();
    setOfferModalId(null);
  }, [modalOffer, refresh]);

  const finishDelivery = useCallback(() => {
    setJob(null);
    writeCourierOperational({
      status: "searching",
      updatedAt: new Date().toISOString(),
    });
    refresh();
  }, [refresh]);

  const searchMarkers = useMemo(() => {
    const base = [
      {
        id: "me",
        latitude: courierPos.lat,
        longitude: courierPos.lng,
        label: "Вы",
      },
      ...offers.map((o) => ({
        id: o.id,
        latitude: o.restaurantCoords.lat,
        longitude: o.restaurantCoords.lng,
        label: o.number,
      })),
    ];
    return base;
  }, [courierPos, offers]);

  const searchCenter = courierPos;

  return (
    <CenteredColumn maxWidthPx={960} className="min-h-0">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button type="text" href="/admin/delivery" className="!px-0">
          ← К кабинету
        </Button>
        {ui.operationalStatus ? (
          <Tag className="m-0">
            {ui.operationalStatus === "searching"
              ? "В поиске заказов"
              : "На заказе"}
          </Tag>
        ) : null}
      </div>

      <Title level={3} style={{ marginTop: 0 }}>
        Рабочий процесс
      </Title>

      {staleOnOrder ? (
        <Paragraph className="!mt-2">
          Статус линии «На заказе», но активный сценарий не загружен (например,
          после перезагрузки). Верните поиск заказов или продолжите с телефона.
        </Paragraph>
      ) : null}
      {staleOnOrder ? (
        <Button
          type="primary"
          className="!mt-2"
          onClick={() => {
            writeCourierOperational({
              status: "searching",
              updatedAt: new Date().toISOString(),
            });
            refresh();
          }}
        >
          Снова в поиске заказов
        </Button>
      ) : null}

      {showIdle ? (
        <Paragraph className="!mt-2">
          Вы сейчас не ищете заказы. Включите статус «В поиске заказов» в
          кабинете (после начала смены он переключается автоматически в демо), и
          вернитесь на эту страницу.
        </Paragraph>
      ) : null}

      {showSearchBoard ? (
        <section className="mt-4 flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-stretch">
          <div className="min-h-[280px] min-w-0 flex-1">
            <Title level={5} style={{ marginTop: 0 }}>
              Карта и доступные заказы
            </Title>
            <Paragraph type="secondary" className="!mt-1 !mb-2 text-sm">
              {geoLabel}. Нажмите на метку заказа на схеме или выберите заказ в
              списке.
            </Paragraph>
            <GeoMarkersFrame
              center={{
                latitude: searchCenter.lat,
                longitude: searchCenter.lng,
              }}
              markers={searchMarkers}
              onMarkerClick={(id) => {
                if (id !== "me" && id.startsWith("wf-offer-")) {
                  openOffer(id);
                }
              }}
              ariaLabel="Карта с вашей позицией и заказами"
              className="min-h-[260px]"
            />
          </div>
          <div className="flex min-w-[240px] max-w-full flex-col gap-2 min-[900px]:w-[280px]">
            <Title level={5} style={{ marginTop: 0 }}>
              Заказы рядом
            </Title>
            {offers.map((o) => (
              <button
                key={o.id}
                type="button"
                className="rounded-lg border border-[var(--ant-color-border-secondary,#f0f0f0)] bg-[var(--ant-color-bg-container,#fff)] px-3 py-2 text-left text-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-[var(--ant-color-primary,#1677ff)]"
                onClick={() => openOffer(o.id)}
              >
                <div className="font-semibold">{o.number}</div>
                <div className="text-xs text-[var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
                  {o.readinessLabel} · {money.format(o.priceRub)}
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {job && !job.pickedUpFromRestaurant ? (
        <section className="mt-4 flex flex-col gap-4 min-[900px]:flex-row">
          <div className="min-w-0 flex-1 space-y-3">
            <Title level={4} style={{ marginTop: 0 }}>
              Заберите заказ у ресторана
            </Title>
            <Paragraph style={{ marginTop: 0 }}>
              <strong>Заказ будет готов:</strong>{" "}
              {timeFmt.format(job.readyAt)}
            </Paragraph>
            <Paragraph className="!mt-2">
              <strong>Заберите его по адресу:</strong>{" "}
              {job.offer.fromAddress}
            </Paragraph>
            <Paragraph type="secondary" className="!mt-2 text-sm">
              Ориентируйтесь приехать к выдаче не позже:{" "}
              <strong>{timeFmt.format(new Date(pickupTargetMs))}</strong> — с
              учётом готовности, дороги от вас (~{travelToRestaurantMin} мин) и
              запаса 10 мин.
            </Paragraph>
            <Button type="primary" onClick={() => setConfirm("pickup_restaurant")}>
              Заказ получен
            </Button>
          </div>
          <div className="min-h-[280px] min-w-0 flex-1">
            <YandexWorkflowRouteMap
              apiKey={yandexMapsApiKey}
              routePoints={routeToRestaurant}
              extraMarkers={[
                {
                  id: "c-me",
                  coords: courierPos,
                  label: "Вы",
                },
              ]}
            />
          </div>
        </section>
      ) : null}

      {job?.pickedUpFromRestaurant ? (
        <section className="mt-4 flex flex-col gap-4 min-[900px]:flex-row">
          <div className="min-w-0 flex-1 space-y-3">
            <Tag color="processing">В пути</Tag>
            {nextWaypoint ? (
              <>
                <Paragraph style={{ marginTop: 8 }}>
                  <strong>Необходимо зайти в:</strong> {nextWaypoint.address}
                </Paragraph>
                <Paragraph type="secondary" className="!mt-2 text-sm">
                  Приблизительное время в пути по оставшемуся маршруту: ~{" "}
                  <strong>{transitApproxMin}</strong> мин
                </Paragraph>
                <Button type="primary" onClick={() => setConfirm("waypoint_done")}>
                  Заказ получен
                </Button>
              </>
            ) : allWaypointsDone ? (
              <>
                <Paragraph style={{ marginTop: 8 }}>
                  <strong>Отнесите заказ клиенту</strong>
                </Paragraph>
                <Paragraph className="!mt-2">
                  Адрес: {job.offer.toAddress}
                </Paragraph>
                <Paragraph type="secondary" className="!mt-2 text-sm">
                  Приблизительное время в пути до клиента: ~{" "}
                  <strong>{transitApproxMin}</strong> мин
                </Paragraph>
                <Button type="primary" onClick={() => setConfirm("handoff_client")}>
                  Заказ передан
                </Button>
              </>
            ) : null}
          </div>
          <div className="min-h-[280px] min-w-0 flex-1">
            <YandexWorkflowRouteMap
              apiKey={yandexMapsApiKey}
              routePoints={transitRoutePoints}
              extraMarkers={[
                {
                  id: "c-me",
                  coords: courierPos,
                  label: "Вы",
                },
              ]}
            />
          </div>
        </section>
      ) : null}

      <Modal
        open={Boolean(modalOffer)}
        title={modalOffer ? `Заказ ${modalOffer.number}` : ""}
        onCancel={refuseOffer}
        footer={null}
        destroyOnHidden
      >
        {modalOffer ? (
          <div className="flex flex-col gap-3">
            <Paragraph className="!mb-0">
              <strong>Откуда:</strong> {modalOffer.fromAddress}
            </Paragraph>
            <Paragraph className="!mb-0">
              <strong>Куда:</strong> {modalOffer.toAddress}
            </Paragraph>
            <Paragraph className="!mb-0">
              <strong>Готовность:</strong> {modalOffer.readinessLabel} (~
              {modalOffer.readyInMinutes} мин)
            </Paragraph>
            <Paragraph className="!mb-0">
              <strong>Цена:</strong> {money.format(modalOffer.priceRub)}
            </Paragraph>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={refuseOffer}>Отказаться</Button>
              <Button type="primary" onClick={acceptOffer}>
                Взять
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <AppConfirmModal
        open={confirm === "pickup_restaurant"}
        title="Подтвердите получение заказа"
        okText="Да, забрал"
        cancelText="Отмена"
        onCancel={() => setConfirm(null)}
        onOk={() => {
          setJob((j) =>
            j ? { ...j, pickedUpFromRestaurant: true } : j,
          );
          setConfirm(null);
        }}
      >
        <Paragraph className="!mb-0">
          Подтвердите, что вы забрали заказ у ресторана и готовы ехать к
          клиенту.
        </Paragraph>
      </AppConfirmModal>

      <AppConfirmModal
        open={confirm === "waypoint_done"}
        title="Подтвердите остановку"
        okText="Да, выполнено"
        cancelText="Отмена"
        onCancel={() => setConfirm(null)}
        onOk={() => {
          setJob((j) =>
            j
              ? {
                  ...j,
                  completedWaypointLegs: j.completedWaypointLegs + 1,
                }
              : j,
          );
          setConfirm(null);
        }}
      >
        <Paragraph className="!mb-0">
          Подтвердите, что вы выполнили остановку и можете продолжать маршрут.
        </Paragraph>
      </AppConfirmModal>

      <AppConfirmModal
        open={confirm === "handoff_client"}
        title="Подтвердите передачу заказа"
        okText="Да, передал клиенту"
        cancelText="Отмена"
        onCancel={() => setConfirm(null)}
        onOk={() => {
          finishDelivery();
          setConfirm(null);
        }}
      >
        <Paragraph className="!mb-0">
          Подтвердите, что вы передали заказ клиенту.
        </Paragraph>
      </AppConfirmModal>
    </CenteredColumn>
  );
}
