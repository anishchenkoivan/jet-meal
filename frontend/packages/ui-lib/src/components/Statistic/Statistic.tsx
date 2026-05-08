"use client";

import { Statistic as AntStatistic } from "antd";
import type { StatisticProps } from "antd";

export function Statistic(props: StatisticProps) {
  return <AntStatistic {...props} />;
}