"use client";

import { HeroSlideShell } from "../HeroSlideShell/HeroSlideShell";
import { partnershipLandingMedia } from "../copy/partnershipLanding";
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
