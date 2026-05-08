import { fetchRestaurants } from "../../src/lib/gql-wrapper";
import { RestaurantsPage } from "../../src/containers/RestaurantsPage/RestaurantsPage";

export const dynamic = "force-dynamic";

export default async function RestaurantsPageRoute({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>> 
}) {
  const sp = await searchParams;
  
  const filters = {
    city: typeof sp["city"] === "string" ? sp["city"] : undefined,
    search: typeof sp["search"] === "string" ? sp["search"] : undefined,
    publishedOnly: true,
  };

  const restaurants = await fetchRestaurants(filters);

  return <RestaurantsPage restaurants={restaurants} />;
}