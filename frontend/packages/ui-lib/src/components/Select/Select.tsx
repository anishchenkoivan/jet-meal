"use client";

import type { SelectProps } from "antd";
import { Select as AntSelect } from "antd";

export function Select(props: SelectProps) {
  return <AntSelect {...props} />;
}
