// Base types from GraphQL schema

export interface Money {
  amount: string; // Decimal as string
  currency: string;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface Address {
  id: string;
  label?: string;
  formattedLine: string;
  point: GeoPoint;
  building?: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export interface DeliveryEstimate {
  distanceMeters: number;
  durationSeconds: number;
  routePolyline?: string;
  suggestedDeliveryFee?: Money;
}

export interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
}

export interface UserError {
  code: string;
  message: string;
  field?: string;
}
