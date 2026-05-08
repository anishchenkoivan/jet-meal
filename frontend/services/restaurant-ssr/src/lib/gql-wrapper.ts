import { apolloClient } from "./apollo-client";
import { CATALOG_ITEMS_LIST, RESTAURANTS_LIST, RESTAURANT_DETAIL } from "./graphql/documents";
import { mockCatalogItems } from "./mocks/catalog-items";
import { mockRestaurants } from "./mocks/restaurants";
import { mockRestaurantDetails } from "./mocks/restaurant-detail";
import type { CatalogMenuItem, CatalogItemFiltersInput } from "../types/catalog-menu-item";
import type { Restaurant, RestaurantFiltersInput } from "../types/restaurant";

const isDev = process.env.NODE_ENV === "development";

type CatalogItemsQueryData = {
  catalogItems: CatalogMenuItem[];
};

type RestaurantsQueryData = {
  restaurants: Restaurant[];
};

type RestaurantDetailQueryData = {
  restaurant: Restaurant;
};

export async function fetchCatalogItems(filters: CatalogItemFiltersInput = {}): Promise<CatalogMenuItem[]> {
  if (isDev) {
    // В dev возвращаем моки с фильтрацией
    let items = [...mockCatalogItems];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }
    
    if (filters.restaurantSearch) {
      const search = filters.restaurantSearch.toLowerCase();
      items = items.filter(item => 
        item.restaurantName.toLowerCase().includes(search)
      );
    }
    
    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters.tagIds?.length) {
      const tagSet = new Set(filters.tagIds);
      items = items.filter((item) =>
        item.dishTags?.some((t) => tagSet.has(t)),
      );
    }

    if (filters.restaurantId) {
      items = items.filter((item) => item.restaurantId === filters.restaurantId);
    }

    if (filters.city) {
      items = items.filter((item) => item.city === filters.city);
    }

    if (filters.deliveryMaxMinutes != null) {
      items = items.filter(
        (item) => (item.deliveryMinutes ?? 999) <= filters.deliveryMaxMinutes!,
      );
    }

    if (filters.deliveryToday) {
      items = items.filter(
        (item) => (item.deliveryMinutes ?? 999) <= 90,
      );
    }

    return items;
  }

  try {
    const { data } = await apolloClient.query<CatalogItemsQueryData>({
      query: CATALOG_ITEMS_LIST,
      variables: { filters },
      fetchPolicy: "network-only",
    });
    if (!data?.catalogItems) {
      return mockCatalogItems;
    }
    return data.catalogItems;
  } catch (error) {
    console.error("Failed to fetch catalog items:", error);
    return mockCatalogItems; // fallback на моки даже в проде
  }
}

export async function fetchRestaurants(filters: RestaurantFiltersInput = {}): Promise<Restaurant[]> {
  if (isDev) {
    // В dev возвращаем моки с фильтрацией
    let restaurants = [...mockRestaurants];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      restaurants = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.preview?.description?.toLowerCase().includes(search)
      );
    }
    
    const cityFilter = filters.city;
    if (cityFilter) {
      const cityLower = cityFilter.toLowerCase();
      restaurants = restaurants.filter(
        (restaurant) =>
          restaurant.preview?.city?.toLowerCase() === cityLower,
      );
    }
    
    if (filters.publishedOnly !== false) {
      restaurants = restaurants.filter(restaurant => restaurant.published);
    }
    
    return restaurants;
  }

  try {
    const { data } = await apolloClient.query<RestaurantsQueryData>({
      query: RESTAURANTS_LIST,
      variables: { filters },
      fetchPolicy: "network-only",
    });
    if (!data?.restaurants) {
      return mockRestaurants;
    }
    return data.restaurants;
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    return mockRestaurants; // fallback на моки
  }
}

export async function fetchRestaurantDetail(id: string): Promise<Restaurant | null> {
  if (isDev) {
    // В dev возвращаем мок по ID
    return mockRestaurantDetails[id] || null;
  }

  try {
    const { data } = await apolloClient.query<RestaurantDetailQueryData>({
      query: RESTAURANT_DETAIL,
      variables: { id },
      fetchPolicy: "network-only",
    });
    if (!data?.restaurant) {
      return mockRestaurantDetails[id] ?? null;
    }
    return data.restaurant;
  } catch (error) {
    console.error("Failed to fetch restaurant detail:", error);
    return mockRestaurantDetails[id] || null; // fallback на мок
  }
}