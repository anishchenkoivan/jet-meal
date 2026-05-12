"use client";

import { restaurantsLandingMedia } from "../copy/restaurantsLanding";
import { HeroSlideShell } from "../HeroSlideShell/HeroSlideShell";
import { RestaurantsLandingText } from "./RestaurantsLandingText";

export function RestaurantsLandingSlide() {
  return (
    <div>
      <HeroSlideShell imageSrc={restaurantsLandingMedia.image}>
        <RestaurantsLandingText />
      </HeroSlideShell>
    </div>
  );
}
