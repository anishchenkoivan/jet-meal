import type { CatalogMenuItem } from "../../types/catalog-menu-item";
import { mockRestaurantDetails } from "./restaurant-detail";

function parsePriceRub(subtitle?: string | null): number {
  const m = /(\d+)/.exec(subtitle ?? "");
  return m ? Number(m[1]) : 0;
}

function categoryForDivision(divisionId: string): string {
  if (divisionId.includes("pizza")) {
    return "pizza";
  }
  if (divisionId === "drinks") {
    return "drink";
  }
  if (divisionId === "desserts") {
    return "dessert";
  }
  if (divisionId === "burgers" || divisionId === "combos") {
    return "main";
  }
  if (divisionId === "sides") {
    return "snack";
  }
  if (divisionId === "home") {
    return "first";
  }
  if (divisionId === "all") {
    return "main";
  }
  return "main";
}

function tagsForBlock(divisionId: string, title: string): string[] | undefined {
  const t = title.toLowerCase();
  const tags = new Set<string>();
  if (divisionId.includes("pizza")) {
    tags.add("pizza");
    tags.add("italian");
  }
  if (divisionId === "drinks") {
    tags.add("snack");
  }
  if (divisionId === "desserts") {
    tags.add("dessert");
  }
  if (divisionId === "burgers" || divisionId === "combos") {
    tags.add("comfort");
    tags.add("main_course");
    tags.add("fastfood");
  }
  if (divisionId === "sides") {
    tags.add("kids");
    tags.add("snack");
  }
  if (t.includes("остр") || t.includes("чили") || t.includes("diablo")) {
    tags.add("spicy");
  }
  if (t.includes("вег") || t.includes("вегет")) {
    tags.add("vegetarian");
  }
  if (divisionId === "home" || t.includes("борщ") || t.includes("щи")) {
    tags.add("soup");
    tags.add("comfort");
  }
  if (t.includes("кофе") || t.includes("капуч") || t.includes("флэт")) {
    tags.add("dessert");
  }
  if (t.includes("рыб") || t.includes("лосос") || t.includes("морск")) {
    tags.add("sea");
  }
  return tags.size ? [...tags] : ["comfort"];
}

function cityForRestaurant(id: string): string {
  return id === "cafe2" ? "spb" : "moscow";
}

function deliveryMinutesFor(restaurantId: string, idx: number): number {
  const base: Record<string, number> = {
    burg: 28,
    piz1: 40,
    piz2: 35,
    cafe1: 25,
    cafe2: 45,
  };
  return (base[restaurantId] ?? 35) + (idx % 5) * 3;
}

function buildMockCatalogItems(): CatalogMenuItem[] {
  const out: CatalogMenuItem[] = [];
  let idx = 0;
  for (const r of Object.values(mockRestaurantDetails)) {
    const sections = r.mainSections ?? [];
    for (const sec of sections) {
      for (const div of sec.divisions) {
        for (const b of div.blocks) {
          const priceRub = parsePriceRub(b.subtitle);
          const city = cityForRestaurant(r.id);
          out.push({
            id: b.id,
            name: b.title,
            description: b.extraText ?? undefined,
            restaurantId: r.id,
            restaurantName: r.name,
            priceLabel: `${priceRub} ₽`,
            priceRub,
            images: b.image ? [b.image] : [],
            category: categoryForDivision(div.id),
            city,
            rating: r.preview?.rating,
            deliveryMinutes: deliveryMinutesFor(r.id, idx),
            dishTags: tagsForBlock(div.id, b.title),
          });
          idx += 1;
        }
      }
    }
  }
  return out;
}

export const mockCatalogItems: CatalogMenuItem[] = buildMockCatalogItems();
