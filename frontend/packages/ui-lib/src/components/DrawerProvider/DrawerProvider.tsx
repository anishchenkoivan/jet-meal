"use client";

import cx from "classnames";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CloseIcon } from "../Icons/Icons";

/** Pass a function so the overlay re-renders with fresh props on each parent commit (e.g. checkout forms). */
export type DrawerContent = ReactNode | (() => ReactNode);

function resolveDrawerContent(content: DrawerContent): ReactNode {
  return typeof content === "function"
    ? (content as () => ReactNode)()
    : content;
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface DrawerOptions {
  replace?: boolean;
  title?: ReactNode;
  /**
   * «Полноэкранный» дровер: серый фон, без крестика в шапке (при `title`),
   * не участвует в авто-закрытии при расширении окна там, где это обрабатывается явно.
   */
  persistentModal?: boolean;
}

export interface DrawerContextValue {
  open: (id: string, content: DrawerContent, options?: DrawerOptions) => void;
  close: () => void;
  isOpen: (id: string) => boolean;
  currentId: string | null;
  /** Верхний дровер открыт с `persistentModal: true`. */
  currentPersistentModal: boolean;
}

// ── Internal types ────────────────────────────────────────────────────────────

interface DrawerEntry {
  key: string;
  id: string;
  content: DrawerContent;
  title?: ReactNode;
  persistentModal?: boolean;
}

interface DrawerInternalValue {
  stack: DrawerEntry[];
  close: () => void;
}

// ── Contexts ──────────────────────────────────────────────────────────────────

const DrawerContext = createContext<DrawerContextValue | null>(null);
const DrawerInternalContext = createContext<DrawerInternalValue | null>(null);

// Portal target element inside DrawerZone — used by MobileDrawer to render absolute overlays
const DrawerZonePortalContext = createContext<HTMLDivElement | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<DrawerEntry[]>([]);

  const open = useCallback(
    (id: string, content: DrawerContent, options: DrawerOptions = {}) => {
      const entry: DrawerEntry = {
        key: `${id}-${Date.now()}`,
        id,
        content,
        title: options.title,
        persistentModal: options.persistentModal === true,
      };
      setStack((prev) => {
        if (options.replace && prev.length > 0) {
          return [...prev.slice(0, -1), entry];
        }
        return [...prev, entry];
      });
    },
    [],
  );

  const close = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const isOpen = useCallback(
    (id: string) => stack.length > 0 && stack[stack.length - 1].id === id,
    [stack],
  );

  const currentId = stack.length > 0 ? stack[stack.length - 1].id : null;
  const currentPersistentModal =
    stack.length > 0 ? stack[stack.length - 1].persistentModal === true : false;

  const value = useMemo<DrawerContextValue>(
    () => ({
      open,
      close,
      isOpen,
      currentId,
      currentPersistentModal,
    }),
    [open, close, isOpen, currentId, currentPersistentModal],
  );

  const internal = useMemo<DrawerInternalValue>(
    () => ({ stack, close }),
    [stack, close],
  );

  return (
    <DrawerContext.Provider value={value}>
      <DrawerInternalContext.Provider value={internal}>
        {children}
      </DrawerInternalContext.Provider>
    </DrawerContext.Provider>
  );
}

// ── DrawerZone ────────────────────────────────────────────────────────────────

/**
 * Renders a position:relative container that fills remaining flex space.
 * Overlays use position:absolute inset-0 — no coordinate measurement needed.
 */
export function DrawerZone({ children }: { children: ReactNode }) {
  const internal = useContext(DrawerInternalContext);
  if (!internal) {
    throw new Error("DrawerZone must be inside DrawerProvider");
  }

  const { stack, close } = internal;
  const current = stack.length > 0 ? stack[stack.length - 1] : null;

  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  return (
    <DrawerZonePortalContext.Provider value={containerEl}>
      <div
        ref={setContainerEl}
        className="relative flex flex-col flex-1 min-h-0"
      >
        {children}
        {current && (
          <div
            className={cx(
              "absolute inset-0 z-[500] flex flex-col overflow-hidden",
              current.persistentModal
                ? "bg-[#fafafa]"
                : "[background:var(--ant-color-bg-container,#fff)]",
            )}
          >
            <div
              key={current.key}
              className={cx(
                "flex-1 min-h-0 flex flex-col overflow-hidden",
                current.persistentModal && "box-border p-3 bg-[#fafafa]",
              )}
            >
              {current.title ? (
                <div className="flex-shrink-0 flex items-center gap-3 px-4 py-[14px] border-b [border-color:var(--ant-color-border-secondary,#f0f0f0)]">
                  <span className="flex-1 min-w-0 text-base font-semibold leading-[1.35] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
                    {current.title}
                  </span>
                  {!current.persistentModal ? (
                    <button
                      type="button"
                      className="box-border inline-flex flex-shrink-0 items-center justify-center w-10 h-10 p-0 m-0 -mr-2 border-none [border-radius:var(--ant-border-radius-sm,6px)] bg-transparent [color:var(--ant-color-text,rgba(0,0,0,0.88))] text-[18px] leading-none cursor-pointer [-webkit-tap-highlight-color:transparent] hover:[background:var(--ant-color-fill-secondary,rgba(0,0,0,0.06))] focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2"
                      onClick={close}
                      aria-label="Закрыть"
                    >
                      <CloseIcon />
                    </button>
                  ) : null}
                </div>
              ) : null}
              <div
                className={cx(
                  "flex-1 min-h-0 flex flex-col overflow-hidden",
                  current.persistentModal &&
                    "bg-[#fafafa] [background:#fafafa]",
                )}
              >
                {resolveDrawerContent(current.content)}
              </div>
            </div>
          </div>
        )}
      </div>
    </DrawerZonePortalContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used within DrawerProvider");
  }
  return ctx;
}

/**
 * Returns the DrawerZone container element for portaling absolute overlays.
 * Null until DrawerZone mounts.
 */
export function useDrawerZonePortal(): HTMLDivElement | null {
  return useContext(DrawerZonePortalContext);
}
