import { notFound } from "next/navigation";
import { AdminRestaurantsPageClient } from "../../../src/containers/AdminRestaurantsPage/AdminRestaurantsPageClient";
import { fetchRestaurantDetail } from "../../../src/lib/gql-wrapper";
import { OWNED_RESTAURANT_ID } from "../../../src/lib/mocks/ownedRestaurantId";
import { saveRestaurantAction, deleteRestaurantAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  const restaurant = await fetchRestaurantDetail(OWNED_RESTAURANT_ID);
  if (!restaurant) {
    notFound();
  }
  return (
    <AdminRestaurantsPageClient
      initialRestaurant={restaurant}
      yandexMapsApiKey={process.env["NEXT_PUBLIC_YANDEX_MAPS_API_KEY"] ?? ""}
      onSave={saveRestaurantAction}
      onDelete={deleteRestaurantAction}
    />
  );
}
