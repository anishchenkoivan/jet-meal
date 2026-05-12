import type { GeoPoint, Money } from "./common";

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  cuisines: string[];
  rating?: number;
  reviewCount?: number;
  heroImageUrl?: string;
  location: GeoPoint;
  isOpen: boolean;
  minOrderAmount?: Money;
  prepTimeMinutes?: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: Money;
  imageUrl?: string;
  isAvailable: boolean;
  ingredients?: string[];
  allergens?: string[];
  tags: string[];
  calories?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface Menu {
  restaurantId: string;
  categories: MenuCategory[];
  updatedAt: string; // DateTime as ISO string
}

export enum CuisineType {
  ITALIAN = "ITALIAN",
  ASIAN = "ASIAN",
  FAST_FOOD = "FAST_FOOD",
  HEALTHY = "HEALTHY",
  DESSERT = "DESSERT",
  OTHER = "OTHER",
}

// Input types for forms
export interface RestaurantSearchInput {
  near: {
    lat: number;
    lon: number;
  };
  radiusMeters?: number;
  cuisines?: CuisineType[];
  query?: string;
  onlyOpen?: boolean;
  page?: {
    first?: number;
    after?: string;
  };
}

export interface DeliveryEstimateInput {
  restaurantId: string;
  deliveryPoint: {
    lat: number;
    lon: number;
  };
}
