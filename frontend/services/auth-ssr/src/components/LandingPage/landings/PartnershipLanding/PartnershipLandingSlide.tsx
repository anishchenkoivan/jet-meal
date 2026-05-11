"use client";

import { partnershipLandingMedia } from "../copy/partnershipLanding";
import { HeroSlideShell } from "../HeroSlideShell/HeroSlideShell";
import { PartnershipLandingText } from "./PartnershipLandingText";

export function PartnershipLandingSlide() {
  return (
    <div>
      <HeroSlideShell imageSrc={partnershipLandingMedia.image}>
        <PartnershipLandingText />
      </HeroSlideShell>
    </div>
  );
}
