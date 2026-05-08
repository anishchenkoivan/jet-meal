"use client";

import { Select as AntSelect } from "antd";
import type { SelectProps } from "antd";

export function Select(props: SelectProps) {
  return <AntSelect {...props} />;
}
