"use client";

import { Empty, Row } from "antd";
import cx from "classnames";
import type { ReactNode } from "react";
import styles from "./Catalog.module.css";

export type CatalogProps = {
  /** Пустой список — показываем `Empty` (или `null` при `emptyDescription === null`). */
  isEmpty: boolean;
  /** При `isEmpty === false` — содержимое ряда (обычно набор `<Col key={…}>`). */
  children?: ReactNode;
  /** Текст пустого состояния; `undefined` — текст по умолчанию; `null` — без заглушки. */
  emptyDescription?: ReactNode | null;
};

export function Catalog({
  isEmpty,
  children,
  emptyDescription,
}: CatalogProps) {
  if (isEmpty) {
    if (emptyDescription === null) {
      return null;
    }
    const description =
      emptyDescription !== undefined
        ? emptyDescription
        : "Ничего не найдено, попробуйте позже";
    return (
      <Empty
        className={cx(styles["empty"])}
        description={description}
      />
    );
  }

  return (
    <div className={cx(styles["wrap"])}>
      <Row gutter={[16, 16]}>{children}</Row>
    </div>
  );
}
