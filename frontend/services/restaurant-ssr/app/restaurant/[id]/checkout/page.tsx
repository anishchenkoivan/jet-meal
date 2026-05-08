import { notFound } from "next/navigation";
import { fetchRestaurantDetail } from "../../../../src/lib/gql-wrapper";
import { RestaurantCheckoutPage } from "../../../../src/containers/RestaurantCheckoutPage/RestaurantCheckoutPage";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantCheckoutRoute({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await fetchRestaurantDetail(id);
  if (!restaurant) {
    notFound();
  }
  return <RestaurantCheckoutPage restaurant={restaurant} />;
}
