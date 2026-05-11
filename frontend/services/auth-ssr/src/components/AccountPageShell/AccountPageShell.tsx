"use client";

import { CenteredColumn } from "@jet-meal/ui-lib/src/components/CenteredColumn/CenteredColumn";
import type { ReactNode } from "react";

export function AccountPageShell({ children }: { children: ReactNode }) {
  return <CenteredColumn maxWidthPx={720}>{children}</CenteredColumn>;
}
