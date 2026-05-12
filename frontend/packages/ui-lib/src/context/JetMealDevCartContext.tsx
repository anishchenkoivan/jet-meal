"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

export type JetMealDevCartLine = {
  name: string;
  quantity: number;
  priceRub: number;
};

export type JetMealDevCartSnapshot = {
  lines: JetMealDevCartLine[];
  totalRub: number;
  restaurantId: string | null;
  restaurantName: string | null;
};

const EMPTY: JetMealDevCartSnapshot = {
  lines: [],
  totalRub: 0,
  restaurantId: null,
  restaurantName: null,
};

const JetMealDevCartContext = createContext<JetMealDevCartSnapshot>(EMPTY);

export function JetMealDevCartProvider({
  value,
  children,
}: {
  value: JetMealDevCartSnapshot;
  children: ReactNode;
}) {
  const v = useMemo(() => value, [value]);
  return (
    <JetMealDevCartContext.Provider value={v}>
      {children}
    </JetMealDevCartContext.Provider>
  );
}

export function useJetMealDevCart(): JetMealDevCartSnapshot {
  return useContext(JetMealDevCartContext);
}
