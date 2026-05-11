"use client";

import { Carousel } from "antd";
import { CatalogLandingSlide } from "../landings/CatalogLanding/CatalogLandingSlide";
import { PartnershipLandingSlide } from "../landings/PartnershipLanding/PartnershipLandingSlide";
import { RestaurantsLandingSlide } from "../landings/RestaurantsLanding/RestaurantsLandingSlide";

export function LandingsCarousel() {
  return (
    <div className="w-full m-0">
      <Carousel
        className={[
          "w-full",
          "[&_.slick-list]:min-h-[var(--jet-site-main-fill-height)]",
          "[&_.slick-track]:h-full [&_.slick-track]:min-h-[var(--jet-site-main-fill-height)]",
          "[&_.slick-slide>div]:h-full [&_.slick-slide>div]:min-h-[var(--jet-site-main-fill-height)]",
          "[&_.slick-dots]:!bottom-5 [&_.slick-dots_li_button]:!bg-white/[0.45] [&_.slick-dots_li.slick-active_button]:!bg-white",
          /* Стрелки: вертикаль по центру слайда (половина h-12), без transform на кнопке — у slick он занят */
          "[&_.slick-arrow]:z-[4] [&_.slick-arrow]:!flex [&_.slick-arrow]:!h-12 [&_.slick-arrow]:!w-12 [&_.slick-arrow]:!items-center [&_.slick-arrow]:!justify-center [&_.slick-arrow]:!p-0 [&_.slick-arrow]:!top-1/2 [&_.slick-arrow]:!-mt-6 [&_.slick-arrow]:rounded-[999px] [&_.slick-arrow]:!border-none [&_.slick-arrow]:!text-white [&_.slick-arrow]:!bg-black/[0.32] [&_.slick-arrow]:[backdrop-filter:blur(4px)]",
          "[&_.slick-arrow:before]:!block [&_.slick-arrow:before]:!leading-none [&_.slick-arrow:before]:!opacity-100 [&_.slick-arrow:before]:!text-[20px] [&_.slick-arrow:before]:!text-center [&_.slick-arrow:before]:!font-sans",
          "[&_.slick-prev]:!left-3 [&_.slick-prev]:!right-auto",
          "[&_.slick-next]:!right-3 [&_.slick-next]:!left-auto",
          "[&_.slick-arrow:hover]:!bg-black/[0.48] [&_.slick-arrow:focus-visible]:!bg-black/[0.48]",
        ].join(" ")}
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
