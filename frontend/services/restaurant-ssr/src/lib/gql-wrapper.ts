import type {
  CatalogItemFiltersInput,
  CatalogMenuItem,
} from "../types/catalog-menu-item";
import type { Restaurant, RestaurantFiltersInput } from "../types/restaurant";
import { apolloClient } from "./apollo-client";
import {
  CATALOG_ITEMS_LIST,
  RESTAURANT_DETAIL,
  RESTAURANTS_LIST,
} from "./graphql/documents";
import { mockCatalogItems } from "./mocks/catalog-items";
import { mockRestaurantDetails } from "./mocks/restaurant-detail";
import { mockRestaurants } from "./mocks/restaurants";
import {
  parseDeliveryTimeLabelMaxMinutes,
  restaurantMatchesCatalogTagIds,
} from "./restaurant-catalog-tag-match";

const isDev = process.env.NODE_ENV === "development";

/** Значения `city` в URL как в каталоге (`moscow`) → подстрока в `preview.city` моков. */
const RESTAURANT_CITY_SLUG_HINT: Record<string, string> = {
  moscow: "москва",
  spb: "санкт-петербург",
};

type CatalogItemsQueryData = {
  catalogItems: CatalogMenuItem[];
};

type RestaurantsQueryData = {
  restaurants: Restaurant[];
};

type RestaurantDetailQueryData = {
  restaurant: Restaurant;
};

export async function fetchCatalogItems(
  filters: CatalogItemFiltersInput = {},
): Promise<CatalogMenuItem[]> {
  if (isDev) {
    // В dev возвращаем моки с фильтрацией
    let items = [...mockCatalogItems];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search),
      );
    }

    if (filters.restaurantSearch) {
      const search = filters.restaurantSearch.toLowerCase();
      items = items.filter((item) =>
        item.restaurantName.toLowerCase().includes(search),
      );
    }

    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters.tagIds?.length) {
      const tagSet = new Set(filters.tagIds);
      items = items.filter((item) => item.dishTags?.some((t) => tagSet.has(t)));
    }

    if (filters.restaurantId) {
      items = items.filter(
        (item) => item.restaurantId === filters.restaurantId,
      );
    }

    if (filters.city) {
      items = items.filter((item) => item.city === filters.city);
    }

    if (filters.deliveryMaxMinutes != null) {
      const cap = filters.deliveryMaxMinutes;
      items = items.filter((item) => (item.deliveryMinutes ?? 999) <= cap);
    }

    if (filters.deliveryToday) {
      items = items.filter((item) => (item.deliveryMinutes ?? 999) <= 90);
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

export async function fetchRestaurants(
  filters: RestaurantFiltersInput = {},
): Promise<Restaurant[]> {
  if (isDev) {
    let restaurants = [...mockRestaurants];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      restaurants = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(search) ||
          restaurant.preview?.description?.toLowerCase().includes(search),
      );
    }

    const cityFilter = filters.city;
    if (cityFilter) {
      const hint =
        RESTAURANT_CITY_SLUG_HINT[cityFilter.toLowerCase()] ??
        cityFilter.toLowerCase();
      restaurants = restaurants.filter((restaurant) =>
        (restaurant.preview?.city ?? "").toLowerCase().includes(hint),
      );
    }

    if (filters.tagIds?.length) {
      const tagIds = filters.tagIds;
      restaurants = restaurants.filter((restaurant) =>
        restaurantMatchesCatalogTagIds(restaurant.preview?.cuisineTags, tagIds),
      );
    }

    if (filters.deliveryMaxMinutes != null) {
      const cap = filters.deliveryMaxMinutes;
      restaurants = restaurants.filter((restaurant) => {
        const parsed = parseDeliveryTimeLabelMaxMinutes(
          restaurant.preview?.deliveryTimeLabel,
        );
        if (parsed == null) {
          return true;
        }
        return parsed <= cap;
      });
    }

    if (filters.publishedOnly !== false) {
      restaurants = restaurants.filter((restaurant) => restaurant.published);
    }

    return restaurants;
  }

  try {
    const { data } = await apolloClient.query<RestaurantsQueryData>({
      query: RESTAURANTS_LIST,
      variables: {
        filters: {
          city: filters.city,
          search: filters.search,
          publishedOnly: filters.publishedOnly,
        },
      },
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

export async function fetchRestaurantDetail(
  id: string,
): Promise<Restaurant | null> {
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
