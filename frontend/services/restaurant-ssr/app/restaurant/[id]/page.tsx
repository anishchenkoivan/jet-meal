import { notFound } from "next/navigation";
import { RestaurantDetailPage } from "../../../src/containers/RestaurantDetailPage/RestaurantDetailPage";
import { fetchRestaurantDetail } from "../../../src/lib/gql-wrapper";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailPageRoute({ params }: PageProps) {
  const { id } = await params;

  const restaurant = await fetchRestaurantDetail(id);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetailPage restaurant={restaurant} />;
}
