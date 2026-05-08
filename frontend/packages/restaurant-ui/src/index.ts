export type { CartRecommendationItem } from "./types/cartRecommendation";
export {
  CartRecommendations,
  type CartRecommendationsProps,
} from "./components/CartRecommendations/CartRecommendations";

/** Совместимость: предпочтительно импортировать `PageContentShell` и т.д. из `@jet-meal/ui-lib`. */
export {
  PageContentShell as RestaurantPageShell,
  type PageContentShellProps as RestaurantPageShellProps,
} from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
export {
  PageTwoColumnSticky as RestaurantPageTwoColumn,
  type PageTwoColumnStickyProps as RestaurantPageTwoColumnProps,
} from "@jet-meal/ui-lib/src/containers/PageTwoColumnSticky/PageTwoColumnSticky";
export {
  StickyAsidePanel as RestaurantStickyAside,
  type StickyAsidePanelProps as RestaurantStickyAsideProps,
} from "@jet-meal/ui-lib/src/components/StickyAsidePanel/StickyAsidePanel";
