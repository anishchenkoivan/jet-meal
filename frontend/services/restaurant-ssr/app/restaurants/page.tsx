import { RestaurantsPage } from "../../src/containers/RestaurantsPage/RestaurantsPage";
import { fetchRestaurants } from "../../src/lib/gql-wrapper";

export const dynamic = "force-dynamic";

export default async function RestaurantsPageRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const tagsRaw = typeof sp["tags"] === "string" ? sp["tags"] : undefined;
  const tagIds = tagsRaw
    ? tagsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const dtRaw = typeof sp["dt"] === "string" ? sp["dt"] : undefined;
  let deliveryMaxMinutes: number | undefined;
  let deliveryToday = false;
  if (dtRaw === "15" || dtRaw === "30" || dtRaw === "60") {
    deliveryMaxMinutes = Number(dtRaw);
  } else if (dtRaw === "today") {
    deliveryToday = true;
  }

  const deliveryWish =
    typeof sp["wish"] === "string" && sp["wish"].trim()
      ? sp["wish"].trim()
      : undefined;

  const filters = {
    city: typeof sp["city"] === "string" ? sp["city"] : undefined,
    search: typeof sp["search"] === "string" ? sp["search"] : undefined,
    publishedOnly: true,
    tagIds,
    deliveryMaxMinutes,
    deliveryToday,
    deliveryWish: dtRaw === "custom" ? deliveryWish : undefined,
  };

  const restaurants = await fetchRestaurants(filters);

  return <RestaurantsPage restaurants={restaurants} />;
}
