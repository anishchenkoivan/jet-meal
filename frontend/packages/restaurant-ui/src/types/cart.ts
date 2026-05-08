import type { Money } from './common';

// Cart types for temporary ordering within restaurant
export interface CartLine {
  id: string;
  menuItemId: string;
  nameSnapshot: string;
  unitPrice: Money;
  quantity: number;
  note?: string;
}

export interface Cart {
  id: string;
  restaurantId?: string;
  lines: CartLine[];
  subtotal: Money;
  deliveryFee?: Money;
  currency: string;
  notes?: string;
  updatedAt: string; // DateTime as ISO string
}

// Input types for cart operations
export interface AddCartLineInput {
  cartId?: string;
  restaurantId: string;
  menuItemId: string;
  quantity: number;
  note?: string;
}

export interface UpdateCartLineInput {
  cartId: string;
  lineId: string;
  quantity: number;
  note?: string;
}

export interface RemoveCartLineInput {
  cartId: string;
  lineId: string;
}