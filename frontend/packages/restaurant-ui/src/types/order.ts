import type { Address, Money, UserError } from "./common";

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PLACED = "PLACED",
  ACCEPTED_BY_RESTAURANT = "ACCEPTED_BY_RESTAURANT",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  COURIER_ASSIGNED = "COURIER_ASSIGNED",
  COURIER_EN_ROUTE = "COURIER_EN_ROUTE",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CARD = "CARD",
  CASH = "CASH",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  AUTHORIZED = "AUTHORIZED",
  CAPTURED = "CAPTURED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  COURIER = "COURIER",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
  ADMIN = "ADMIN",
}

export interface OrderLine {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  note?: string;
}

export interface OrderTotals {
  subtotal: Money;
  deliveryFee: Money;
  serviceFee?: Money;
  discount?: Money;
  total: Money;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  at: string; // DateTime as ISO string
  actorRole?: UserRole;
  message?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: Money;
  externalReference?: string;
  updatedAt: string; // DateTime as ISO string
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  paymentLink?: string;
  status: PaymentStatus;
  amount: Money;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  customerId: string;
  restaurantId: string;
  courierId?: string;
  lines: OrderLine[];
  deliveryAddress: Address;
  totals: OrderTotals;
  payment?: Payment;
  timeline: OrderTimelineEvent[];
  createdAt: string; // DateTime as ISO string
  estimatedDeliveryAt?: string; // DateTime as ISO string
}

// Input types
export interface CheckoutInput {
  cartId: string;
  deliveryAddressId?: string;
  newDeliveryAddress?: {
    label?: string;
    formattedLine: string;
    lat: number;
    lon: number;
    building?: string;
    apartment?: string;
    entrance?: string;
    floor?: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
  };
  paymentMethod: PaymentMethod;
  paymentInstrumentId?: string;
}

export interface CheckoutPayload {
  order?: Order;
  paymentIntent?: PaymentIntent;
  errors: UserError[];
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
  providerPayload?: string;
}
