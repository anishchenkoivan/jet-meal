"use client";

import cx from "classnames";
import { Faq } from "./Faq/Faq";
import { JetMealInfo } from "./JetMealInfo/JetMealInfo";
import { LandingCtaBar } from "./LandingCtaBar/LandingCtaBar";
import { LandingsCarousel } from "./LandingsCarousel/LandingsCarousel";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={cx(styles.shell)}>
      <LandingsCarousel />
      <JetMealInfo />
      <Faq />
      <LandingCtaBar />
    </div>
  );
}
