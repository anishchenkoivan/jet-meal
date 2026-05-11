"use client";

import { Faq } from "./Faq/Faq";
import { JetMealInfo } from "./JetMealInfo/JetMealInfo";
import { LandingCtaBar } from "./LandingCtaBar/LandingCtaBar";
import { LandingsCarousel } from "./LandingsCarousel/LandingsCarousel";

export function LandingPage() {
  return (
    <div className="flex flex-col w-full min-h-0 [padding-bottom:calc(112px+env(safe-area-inset-bottom,0px))]">
      <LandingsCarousel />
      <JetMealInfo />
      <Faq />
      <LandingCtaBar />
    </div>
  );
}
