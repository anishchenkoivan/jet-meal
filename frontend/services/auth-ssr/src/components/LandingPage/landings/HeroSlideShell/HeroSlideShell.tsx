"use client";

import { CachedImage } from "@jet-meal/ui-lib/src/components/CachedImage/CachedImage";
import type { ReactNode } from "react";
import styles from "./HeroSlideShell.module.css";

export type HeroSlideShellProps = {
  imageSrc: string;
  priority?: boolean;
  children: ReactNode;
};

export function HeroSlideShell({
  imageSrc,
  priority = false,
  children,
}: HeroSlideShellProps) {
  return (
    <section className={styles["slide"]}>
      <div className={styles["slideBg"]}>
        <CachedImage
          src={imageSrc}
          alt=""
          fill
          objectFit="cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </div>
      <div className={styles["slideOverlay"]} aria-hidden />
      <div className={styles["slideInner"]}>{children}</div>
    </section>
  );
}
