"use client";

import type { TagProps } from "antd";
import { Tag as AntTag } from "antd";

export function Tag(props: TagProps) {
  return <AntTag {...props} />;
}
