"use client";

import { CachedImage } from "@jet-meal/ui-lib/src/components/CachedImage/CachedImage";
import type { ReactNode } from "react";

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
    <section className="relative min-h-[var(--jet-site-main-fill-height)] flex items-end box-border px-6 pt-10 pb-14 text-white">
      <div className="absolute inset-0 z-0">
        <CachedImage
          src={imageSrc}
          alt=""
          fill
          objectFit="cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </div>
      <div
        className="absolute inset-0 z-[1] [background:linear-gradient(to_top,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.22)_55%,rgba(0,0,0,0.38)_100%)]"
        aria-hidden
      />
      <div className="relative z-[2] max-w-[760px]">{children}</div>
    </section>
  );
}
