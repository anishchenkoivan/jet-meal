"use client";

import type { ButtonProps } from "antd";
import { Button as AntButton } from "antd";

export function Button(props: ButtonProps) {
  return <AntButton {...props} />;
}
