import type { DividerProps } from "antd";
import { Divider as AntDivider } from "antd";

export function Divider(props: DividerProps) {
  return <AntDivider {...props} />;
}
