"use client";

import { Card } from "antd";
import cx from "classnames";
import type { RestaurantCatalogItem } from "../../types/restaurantCatalog";
import styles from "./RestaurantCard.module.css";

export type RestaurantCardProps = {
  item: RestaurantCatalogItem;
};

export function RestaurantCard({ item }: RestaurantCardProps) {
  return (
    <Card className={cx(styles["card"])} size="small" hoverable>
      <h3 className={cx(styles["title"])}>{item.name}</h3>
      <p className={cx(styles["meta"])}>{item.city}</p>
      {item.description ? (
        <p className={cx(styles["meta"])}>{item.description}</p>
      ) : null}
    </Card>
  );
}
