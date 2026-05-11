"use client";

import type { DropdownProps } from "antd";
import { Dropdown as AntDropdown } from "antd";

export type AppDropdownProps = DropdownProps;

/** Выпадающее меню на базе Ant Design — импортируйте из ui-lib, не из `antd` в сервисах. */
export function AppDropdown(props: AppDropdownProps) {
  return <AntDropdown {...props} />;
}
