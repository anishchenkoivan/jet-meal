"use client";

import { HeroSlideShell } from "../HeroSlideShell/HeroSlideShell";
import { restaurantsLandingMedia } from "../copy/restaurantsLanding";
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
