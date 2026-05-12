import type { ColProps } from "antd";
import { Col as AntCol } from "antd";
import type { PropsWithChildren } from "react";

export function Col(props: PropsWithChildren<ColProps>) {
  return <AntCol {...props} />;
}
