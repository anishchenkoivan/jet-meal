"use client";

import { catalogLandingCopy } from "../copy/catalogLanding";
import { LANDING_URLS } from "../copy/urls";
import styles from "../HeroSlideShell/HeroSlideShell.module.css";

export function CatalogLandingText() {
  return (
    <>
      <h1 className={styles["slideTitle"]}>
        <a className={styles["titleLink"]} href={LANDING_URLS.catalog}>
          {catalogLandingCopy.title}
        </a>
      </h1>
      <p className={styles["slideLead"]}>{catalogLandingCopy.lead}</p>
    </>
  );
}
