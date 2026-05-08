"use client";

import { Checkbox as AntCheckbox } from "antd";
import type { CheckboxProps } from "antd";

export function Checkbox(props: CheckboxProps) {
  return <AntCheckbox {...props} />;
}
