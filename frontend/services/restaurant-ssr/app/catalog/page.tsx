"use client";

import { gql } from "@apollo/client";
import { useSuspenseQuery } from "@apollo/client/react";
import { Empty, Spin } from "antd";
import cx from "classnames";
import { Suspense, type ReactNode } from "react";
import { RestaurantsCatalogPage } from "../../../../packages/ui-lib/src/components/RestaurantsCatalogPage/RestaurantsCatalogPage";
import styles from "./page.module.css";

const RESTAURANTS_QUERY = gql`
  query Restaurants {
    restaurants {
      id
      name
      city
      description
    }
  }
`;

type RestaurantsQueryData = {
  restaurants: Array<{
    id: string;
    name: string;
    city: string;
    description?: string;
  }>;
};

/**
 * useSuspenseQuery приостанавливает рендер, пока нет данных — состояние «loading»
 * задаётся только через родительский <Suspense fallback={...}>, не через поле в результате хука.
 */
function CatalogRestaurantsSection() {
  const { data, error } = useSuspenseQuery<RestaurantsQueryData>(RESTAURANTS_QUERY, {
    errorPolicy: "all",
  });
  const items = data?.restaurants ?? [];

  let catalogBody: ReactNode;
  if (error) {
    catalogBody = (
      <Empty
        className={cx(styles["catalogSlot"])}
        description="Не удалось загрузить каталог. Попробуйте позже."
      />
    );
  } else if (items.length === 0) {
    catalogBody = (
      <Empty
        className={cx(styles["catalogSlot"])}
        description="Ничего не найдено, попробуйте позже"
      />
    );
  } else {
    catalogBody = <RestaurantsCatalogPage items={items} />;
  }

  return catalogBody;
}

export default function CatalogPage() {
  return (
    <main className={cx(styles["main"])}>
      <h1 className={cx(styles["title"])}>Catalog</h1>
      <p>
        Публичный каталог. Вход в панель ресторана:{" "}
        <a href="/restaurant/login">/restaurant/login</a>.
      </p>
      <Suspense
        fallback={
          <div className={cx(styles["catalogSlot"])}>
            <Spin size="large" />
          </div>
        }
      >
        <CatalogRestaurantsSection />
      </Suspense>
    </main>
  );
}
