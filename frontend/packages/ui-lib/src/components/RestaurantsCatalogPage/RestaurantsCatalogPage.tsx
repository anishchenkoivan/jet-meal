"use client";

import { Col, Empty, Row } from "antd";
import cx from "classnames";
import type { RestaurantCatalogItem } from "../../types/restaurantCatalog";
import { RestaurantCard } from "../RestaurantCard/RestaurantCard";
import styles from "./RestaurantsCatalogPage.module.css";

export type RestaurantsCatalogPageProps = {
  items: RestaurantCatalogItem[];
};

function FallbackEmpty() {
  return (
    <Empty
      className={cx(styles["empty"])}
      description="Ничего не найдено, попробуйте позже"
    />
  );
}

export function RestaurantsCatalogPage({ items }: RestaurantsCatalogPageProps) {
  if (items.length === 0) {
    return <FallbackEmpty />;
  }

  return (
    <div className={cx(styles["wrap"])}>
      <Row gutter={16}>
        {items.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}>
            <RestaurantCard item={item} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
