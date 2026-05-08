"use client";

import { partnershipLandingCopy } from "../copy/partnershipLanding";
import { LANDING_URLS } from "../copy/urls";
import styles from "../HeroSlideShell/HeroSlideShell.module.css";

const hrefByKey = {
  restaurant: LANDING_URLS.adminRestaurant,
  courier: LANDING_URLS.adminCourier,
  advert: LANDING_URLS.adminAdvert,
} as const;

export function PartnershipLandingText() {
  const { links, intro, outro, title } = partnershipLandingCopy;
  return (
    <>
      <h1 className={styles["slideTitle"]}>{title}</h1>
      <p className={styles["slideLead"]}>
        {intro}
        {outro ? ` ${outro}` : null}
      </p>
      <div className={styles["ctaRow"]}>
        {links.map((item) => (
          <a
            key={item.key}
            className={styles["ctaPill"]}
            href={hrefByKey[item.key as keyof typeof hrefByKey]}
          >
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
