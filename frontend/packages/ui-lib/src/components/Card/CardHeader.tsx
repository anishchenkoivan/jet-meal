"use client";

import cx from "classnames";
import { StarIcon } from "../Icons/Icons";

export type CardHeaderProps = {
  name: string;
  addressLine: string;
  rating?: number;
};

export function CardHeader({ name, addressLine, rating }: CardHeaderProps) {
  const showRating =
    rating != null && !Number.isNaN(rating) && Number.isFinite(rating);

  return (
    <div className="flex flex-col gap-[6px] w-full min-w-0">
      <div
        className={cx(
          "flex flex-wrap items-start gap-x-3 gap-y-[10px] w-full min-w-0",
          "max-md:flex-col max-md:items-stretch max-md:gap-2",
        )}
      >
        {showRating ? (
          <div
            className="inline-flex flex-shrink-0 items-center gap-[6px] px-[10px] py-1 [border-radius:var(--ant-border-radius-lg,8px)] [background-color:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))] [color:var(--ant-color-text,rgba(0,0,0,0.88))] text-[15px] font-semibold leading-[1.35] max-md:self-start"
            title={`Рейтинг ${rating}`}
          >
            <StarIcon
              className="[color:var(--ant-color-warning,#faad14)] text-sm"
              aria-hidden
            />
            <span>{rating.toFixed(1)}</span>
          </div>
        ) : null}
        <h3
          className={cx(
            "flex-[1_1_160px] min-w-0 max-w-full m-0 text-[20px] font-semibold leading-[1.25] [overflow-wrap:anywhere] [word-break:break-word] md:text-[22px]",
            "max-md:flex-none max-md:w-full",
          )}
        >
          {name}
        </h3>
      </div>
      <p className="m-0 [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))] text-sm leading-[1.45] [overflow-wrap:anywhere]">
        {addressLine}
      </p>
    </div>
  );
}
