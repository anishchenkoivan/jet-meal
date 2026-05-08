"use client";

import { StarIcon } from "../Icons/Icons";
import cx from "classnames";
import styles from "./CardHeader.module.css";

export type CardHeaderProps = {
  name: string;
  addressLine: string;
  rating?: number;
};

export function CardHeader({ name, addressLine, rating }: CardHeaderProps) {
  const showRating =
    rating != null && !Number.isNaN(rating) && Number.isFinite(rating);

  return (
    <div className={cx(styles["head"])}>
      <div className={cx(styles["titleRow"])}>
        {showRating ? (
          <div className={cx(styles["rating"])} title={`Рейтинг ${rating}`}>
            <StarIcon className={cx(styles["star"])} aria-hidden />
            <span>{rating.toFixed(1)}</span>
          </div>
        ) : null}
        <h3 className={cx(styles["title"])}>{name}</h3>
      </div>
      <p className={cx(styles["address"])}>{addressLine}</p>
    </div>
  );
}
