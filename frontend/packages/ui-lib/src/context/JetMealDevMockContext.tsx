"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ensureJetMealDevStorageDefaults,
  JET_MEAL_DEV_STORAGE,
  markJetMealDevMocksDirty,
  readJetMealDevJson,
  writeJetMealDevJson,
} from "../lib/jetMealDev/jetMealDevStorage";
import {
  defaultJetMealDevPaymentProfile,
  type JetMealDevPaymentProfile,
} from "../lib/jetMealDev/jetMealDevPaymentTypes";
import type { JetMealDevOrder } from "../lib/jetMealDev/jetMealDevOrderTypes";

const IS_DEV = process.env["NODE_ENV"] === "development";

export type JetMealDevPayScenario = "success" | "error" | "stuck";

type JetMealDevMockContextValue = {
  isDev: boolean;
  hydrated: boolean;
  payment: JetMealDevPaymentProfile;
  setPaymentProfile: (patch: Partial<JetMealDevPaymentProfile>) => void;
  replacePaymentProfile: (p: JetMealDevPaymentProfile) => void;
  orders: JetMealDevOrder[];
  addOrder: (
    o: Omit<JetMealDevOrder, "id" | "createdAt"> & { id?: string },
  ) => JetMealDevOrder;
  refreshFromStorage: () => void;
  nextCheckoutPayScenario: JetMealDevPayScenario;
  setNextCheckoutPayScenario: (s: JetMealDevPayScenario) => void;
  consumeCheckoutPayScenario: () => JetMealDevPayScenario;
  resetDevData: () => void;
};

const noop = () => {};

const voidOrder: JetMealDevOrder = {
  id: "",
  restaurantId: "",
  restaurantName: "",
  lines: [],
  totalRub: 0,
  createdAt: "",
};

const defaultContext: JetMealDevMockContextValue = {
  isDev: false,
  hydrated: true,
  payment: defaultJetMealDevPaymentProfile,
  setPaymentProfile: noop,
  replacePaymentProfile: noop,
  orders: [],
  addOrder: () => voidOrder,
  refreshFromStorage: noop,
  nextCheckoutPayScenario: "success",
  setNextCheckoutPayScenario: noop,
  consumeCheckoutPayScenario: () => "success",
  resetDevData: noop,
};

const JetMealDevMockContext =
  createContext<JetMealDevMockContextValue>(defaultContext);

function loadPayment(): JetMealDevPaymentProfile {
  return {
    ...defaultJetMealDevPaymentProfile,
    ...readJetMealDevJson<Partial<JetMealDevPaymentProfile>>(
      JET_MEAL_DEV_STORAGE.payment,
      {},
    ),
  };
}

function loadOrders(): JetMealDevOrder[] {
  return readJetMealDevJson<JetMealDevOrder[]>(JET_MEAL_DEV_STORAGE.orders, []);
}

export function JetMealDevMockProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [payment, setPayment] = useState<JetMealDevPaymentProfile>(
    defaultJetMealDevPaymentProfile,
  );
  const [orders, setOrders] = useState<JetMealDevOrder[]>([]);
  const [nextCheckoutPayScenario, setNextCheckoutPayScenarioState] =
    useState<JetMealDevPayScenario>("success");
  const nextCheckoutScenarioRef = useRef<JetMealDevPayScenario>("success");
  nextCheckoutScenarioRef.current = nextCheckoutPayScenario;

  const setNextCheckoutPayScenario = useCallback((s: JetMealDevPayScenario) => {
    nextCheckoutScenarioRef.current = s;
    setNextCheckoutPayScenarioState(s);
  }, []);

  useLayoutEffect(() => {
    if (!IS_DEV) {
      return;
    }
    ensureJetMealDevStorageDefaults();
    setPayment(loadPayment());
    setOrders(loadOrders());
    setHydrated(true);
  }, []);

  const setPaymentProfile = useCallback(
    (patch: Partial<JetMealDevPaymentProfile>) => {
      setPayment((prev) => {
        const merged = { ...prev, ...patch };
        markJetMealDevMocksDirty();
        writeJetMealDevJson(JET_MEAL_DEV_STORAGE.payment, merged);
        return merged;
      });
    },
    [],
  );

  const replacePaymentProfile = useCallback((p: JetMealDevPaymentProfile) => {
    const merged = { ...defaultJetMealDevPaymentProfile, ...p };
    markJetMealDevMocksDirty();
    setPayment(merged);
    writeJetMealDevJson(JET_MEAL_DEV_STORAGE.payment, merged);
  }, []);

  const refreshFromStorage = useCallback(() => {
    if (!IS_DEV) {
      return;
    }
    setPayment(loadPayment());
    setOrders(loadOrders());
  }, []);

  const addOrder = useCallback(
    (
      o: Omit<JetMealDevOrder, "id" | "createdAt"> & { id?: string },
    ): JetMealDevOrder => {
      if (!IS_DEV) {
        return voidOrder;
      }
      const id =
        o.id ??
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID().slice(0, 8)
          : `o_${Math.random().toString(36).slice(2, 10)}`);
      const row: JetMealDevOrder = {
        ...o,
        id,
        createdAt: new Date().toISOString(),
        deliveryMockState: o.deliveryMockState ?? "completed",
      };
      setOrders((prev) => {
        const next = [row, ...prev];
        markJetMealDevMocksDirty();
        writeJetMealDevJson(JET_MEAL_DEV_STORAGE.orders, next);
        return next;
      });
      return row;
    },
    [],
  );

  const consumeCheckoutPayScenario = useCallback(() => {
    const s = nextCheckoutScenarioRef.current;
    nextCheckoutScenarioRef.current = "success";
    setNextCheckoutPayScenarioState("success");
    return s;
  }, []);

  const resetDevData = useCallback(() => {
    if (!IS_DEV) {
      return;
    }
    writeJetMealDevJson(JET_MEAL_DEV_STORAGE.orders, []);
    writeJetMealDevJson(
      JET_MEAL_DEV_STORAGE.payment,
      defaultJetMealDevPaymentProfile,
    );
    writeJetMealDevJson(JET_MEAL_DEV_STORAGE.dirty, false);
    setOrders([]);
    setPayment(defaultJetMealDevPaymentProfile);
    setNextCheckoutPayScenarioState("success");
    nextCheckoutScenarioRef.current = "success";
  }, []);

  const value = useMemo<JetMealDevMockContextValue>(() => {
    if (!IS_DEV) {
      return defaultContext;
    }
    return {
      isDev: true,
      hydrated,
      payment,
      setPaymentProfile,
      replacePaymentProfile,
      orders,
      addOrder,
      refreshFromStorage,
      nextCheckoutPayScenario,
      setNextCheckoutPayScenario,
      consumeCheckoutPayScenario,
      resetDevData,
    };
  }, [
    hydrated,
    payment,
    setPaymentProfile,
    replacePaymentProfile,
    orders,
    addOrder,
    refreshFromStorage,
    nextCheckoutPayScenario,
    setNextCheckoutPayScenario,
    consumeCheckoutPayScenario,
    resetDevData,
  ]);

  return (
    <JetMealDevMockContext.Provider value={value}>
      {children}
    </JetMealDevMockContext.Provider>
  );
}

export function useJetMealDevMock() {
  return useContext(JetMealDevMockContext);
}
