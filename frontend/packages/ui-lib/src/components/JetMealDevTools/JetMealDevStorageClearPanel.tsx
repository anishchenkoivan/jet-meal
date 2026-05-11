"use client";

import {
  clearLocalStorageByPrefix,
  JET_MEAL_DEV_STORAGE_PREFIX,
} from "../../lib/devLocalStoragePrefix";
import { Button } from "../Button/Button";
import { MiddleColumn } from "../MiddleColumn/MiddleColumn";

export type JetMealDevStorageClearPanelProps = {
  onClose: () => void;
};

/** Панель для dev: очистка всех ключей `jet-meal-dev:*` в localStorage. */
export function JetMealDevStorageClearPanel({
  onClose,
}: JetMealDevStorageClearPanelProps) {
  return (
    <MiddleColumn verticalAlign="top" maxWidthPx={640}>
      <div className="flex flex-col gap-4 py-2">
        <p className="m-0 text-sm leading-relaxed [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">
          Очистка локального dev-кэша Jet Meal (префикс{" "}
          <code className="text-xs">{JET_MEAL_DEV_STORAGE_PREFIX}</code>
          ): моки ресторана, чекаут, список «Мои заказы» в доставке и др.
        </p>
        <Button
          danger
          onClick={() => {
            clearLocalStorageByPrefix(JET_MEAL_DEV_STORAGE_PREFIX);
            onClose();
            window.location.reload();
          }}
        >
          Очистить dev localStorage и перезагрузить
        </Button>
      </div>
    </MiddleColumn>
  );
}
