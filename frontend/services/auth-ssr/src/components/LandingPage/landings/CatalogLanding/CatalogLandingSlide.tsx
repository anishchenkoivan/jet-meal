"use client";

import { catalogLandingMedia } from "../copy/catalogLanding";
import { HeroSlideShell } from "../HeroSlideShell/HeroSlideShell";
import { CatalogLandingText } from "./CatalogLandingText";

export function CatalogLandingSlide() {
  return (
    <div>
      <HeroSlideShell imageSrc={catalogLandingMedia.image} priority>
        <CatalogLandingText />
      </HeroSlideShell>
    </div>
  );
}
