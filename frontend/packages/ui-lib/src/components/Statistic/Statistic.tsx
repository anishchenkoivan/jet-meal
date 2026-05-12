"use client";

import type { StatisticProps } from "antd";
import { Statistic as AntStatistic } from "antd";

export function Statistic(props: StatisticProps) {
  return <AntStatistic {...props} />;
}
