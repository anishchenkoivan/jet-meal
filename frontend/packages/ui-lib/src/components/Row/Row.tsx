import type { RowProps } from "antd";
import { Row as AntRow } from "antd";

export function Row(props: RowProps) {
  return <AntRow {...props} />;
}
