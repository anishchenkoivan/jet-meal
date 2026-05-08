"use client";

import { restaurantsLandingCopy } from "../copy/restaurantsLanding";
import { LANDING_URLS } from "../copy/urls";
import styles from "../HeroSlideShell/HeroSlideShell.module.css";

export function RestaurantsLandingText() {
  return (
    <>
      <h1 className={styles["slideTitle"]}>{restaurantsLandingCopy.title}</h1>
      <p className={styles["slideLead"]}>{restaurantsLandingCopy.lead}</p>
      <div className={styles["ctaRow"]}>
        <a className={styles["ctaPill"]} href={LANDING_URLS.restaurants}>
          {restaurantsLandingCopy.ctaLabel}
        </a>
      </div>
    </>
  );
}
