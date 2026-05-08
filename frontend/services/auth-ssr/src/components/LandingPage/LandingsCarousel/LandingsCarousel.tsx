"use client";

import { Carousel } from "antd";
import { CatalogLandingSlide } from "../landings/CatalogLanding/CatalogLandingSlide";
import { PartnershipLandingSlide } from "../landings/PartnershipLanding/PartnershipLandingSlide";
import { RestaurantsLandingSlide } from "../landings/RestaurantsLanding/RestaurantsLandingSlide";
import styles from "./LandingsCarousel.module.css";

export function LandingsCarousel() {
  return (
    <div className={styles["root"]}>
      <Carousel
        className={styles["carousel"]}
        dots
        adaptiveHeight={false}
        arrows
        draggable
      >
        <CatalogLandingSlide />
        <RestaurantsLandingSlide />
        <PartnershipLandingSlide />
      </Carousel>
    </div>
  );
}
