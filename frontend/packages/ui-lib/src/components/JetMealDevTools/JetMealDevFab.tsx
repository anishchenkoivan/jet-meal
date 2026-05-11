"use client";

import { useJetMealDevMock } from "../../context/JetMealDevMockContext";
import { DevToolsFab } from "./DevToolsFab";
import { JetMealDevBugPanel } from "./JetMealDevBugPanel";

const DEFAULT_DRAWER_ID = "jet-meal-dev-tools";

/** Единая плавающая кнопка dev: те же моки во всех сервисах. */
export function JetMealDevFab() {
  const dev = useJetMealDevMock();
  if (!dev.isDev) {
    return null;
  }
  return (
    <DevToolsFab
      enabled
      drawerId={DEFAULT_DRAWER_ID}
      drawerTitle="DEV — моки"
      renderPanel={({ close }) => <JetMealDevBugPanel onClose={close} />}
    />
  );
}
