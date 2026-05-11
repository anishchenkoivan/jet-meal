"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type BandRenderFn = () => ReactNode;

// Split into two contexts so NavListBlock (setter consumer) doesn't re-render
// when renderFn changes — only LayoutBandSlot (value consumer) does.
const LayoutBandSetterContext = createContext<(fn: BandRenderFn | null) => void>(
  () => {},
);
const LayoutBandValueContext = createContext<BandRenderFn | null>(null);

export function LayoutBandProvider({ children }: { children: ReactNode }) {
  const [renderFn, _set] = useState<BandRenderFn | null>(null);

  const setRenderFn = useCallback((fn: BandRenderFn | null) => {
    // Must use updater form so React stores the function itself, not calls it
    _set(fn === null ? null : () => fn);
  }, []);

  return (
    <LayoutBandSetterContext.Provider value={setRenderFn}>
      <LayoutBandValueContext.Provider value={renderFn}>
        {children}
      </LayoutBandValueContext.Provider>
    </LayoutBandSetterContext.Provider>
  );
}

/** Renders whatever NavListBlock injected. Lives in the header. */
export function LayoutBandSlot() {
  const renderFn = useContext(LayoutBandValueContext);
  return <>{renderFn?.() ?? null}</>;
}

/** Used by NavListBlock to inject header controls before browser paint. */
export function useSetLayoutBandFn(): (fn: BandRenderFn | null) => void {
  return useContext(LayoutBandSetterContext);
}
