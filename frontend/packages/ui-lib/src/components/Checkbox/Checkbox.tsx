"use client";

import type { CheckboxProps } from "antd";
import { Checkbox as AntCheckbox } from "antd";

export function Checkbox(props: CheckboxProps) {
  return <AntCheckbox {...props} />;
}
