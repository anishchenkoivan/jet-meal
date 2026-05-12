"use client";

import { partnershipLandingCopy } from "../copy/partnershipLanding";
import { LANDING_URLS } from "../copy/urls";

const hrefByKey = {
  restaurant: LANDING_URLS.adminRestaurant,
  courier: LANDING_URLS.adminCourier,
  advert: LANDING_URLS.adminAdvert,
} as const;

export function PartnershipLandingText() {
  const { links, intro, outro, title } = partnershipLandingCopy;
  return (
    <>
      <h1 className="m-0 mb-3 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
        {title}
      </h1>
      <p className="m-0 text-[1.125rem] leading-[1.6] opacity-[0.94] max-w-[560px] [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
        {intro}
        {outro ? ` ${outro}` : null}
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-2.5 mt-[22px] max-w-[640px]">
        {links.map((item) => (
          <a
            key={item.key}
            className="inline-flex items-center justify-center px-[18px] py-2.5 text-[0.9375rem] font-semibold leading-[1.25] text-white no-underline tracking-[0.01em] [background:linear-gradient(145deg,rgb(255_255_255/24%)_0%,rgb(255_255_255/9%)_100%)] border border-white/[0.46] rounded-[999px] shadow-[0_4px_18px_rgb(0_0_0/28%),inset_0_1px_0_rgb(255_255_255/22%)] [backdrop-filter:blur(8px)] transition-[transform,background,border-color] duration-[160ms] ease hover:[background:linear-gradient(145deg,rgb(255_255_255/34%)_0%,rgb(255_255_255/14%)_100%)] hover:border-white/[0.72] hover:-translate-y-0.5"
            href={hrefByKey[item.key as keyof typeof hrefByKey]}
          >
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
