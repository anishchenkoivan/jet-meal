"use client";

import { HeroSlideShell } from "../HeroSlideShell/HeroSlideShell";
import { catalogLandingMedia } from "../copy/catalogLanding";
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
