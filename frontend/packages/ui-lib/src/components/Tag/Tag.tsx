"use client";

import { Tag as AntTag } from "antd";
import type { TagProps } from "antd";

export function Tag(props: TagProps) {
  return <AntTag {...props} />;
}