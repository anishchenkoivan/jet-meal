"use client";

import { catalogLandingCopy } from "../copy/catalogLanding";
import { LANDING_URLS } from "../copy/urls";

export function CatalogLandingText() {
  return (
    <>
      <h1 className="m-0 mb-3 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
        <a
          className="inline-flex items-center justify-center px-[22px] py-3 mt-1 text-[clamp(1.35rem,3.2vw,1.85rem)] font-bold leading-[1.2] tracking-[-0.02em] text-white no-underline [background:linear-gradient(160deg,rgb(255_255_255/26%)_0%,rgb(255_255_255/10%)_100%)] border border-white/[0.48] rounded-[999px] shadow-[0_6px_28px_rgb(0_0_0/35%),inset_0_1px_0_rgb(255_255_255/28%)] [backdrop-filter:blur(10px)] transition-[transform,background,border-color] duration-[180ms] ease hover:[background:linear-gradient(160deg,rgb(255_255_255/36%)_0%,rgb(255_255_255/16%)_100%)] hover:border-white/[0.72] hover:-translate-y-0.5"
          href={LANDING_URLS.catalog}
        >
          {catalogLandingCopy.title}
        </a>
      </h1>
      <p className="m-0 text-[1.125rem] leading-[1.6] opacity-[0.94] max-w-[560px] [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
        {catalogLandingCopy.lead}
      </p>
    </>
  );
}
