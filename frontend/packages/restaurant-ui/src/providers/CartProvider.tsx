"use client";

import { createContext, type ReactNode, useContext, useReducer } from "react";
import type { Cart, CartLine } from "../types/cart";
import type { MenuItem, Restaurant } from "../types/restaurant";

// Events для мгновенных обновлений
export type CartEvent =
  | {
      type: "ADD_ITEM";
      payload: {
        item: MenuItem;
        restaurant: Restaurant;
        quantity?: number;
        note?: string;
      };
    }
  | { type: "UPDATE_QUANTITY"; payload: { lineId: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { lineId: string } }
  | { type: "UPDATE_NOTE"; payload: { lineId: string; note: string } }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: Cart };

interface CartState {
  cart: Cart | null;
  restaurant: Restaurant | null;
  isVisible: boolean;
}

interface CartContextType extends CartState {
  dispatch: (event: CartEvent) => void;
  showCart: () => void;
  hideCart: () => void;
  addToCart: (
    item: MenuItem,
    restaurant: Restaurant,
    quantity?: number,
    note?: string,
  ) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
  updateNote: (lineId: string, note: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Генерация ID для новых элементов корзины
const generateId = () => Math.random().toString(36).substr(2, 9);

// Вычисление итогов корзины
const calculateTotals = (lines: CartLine[], currency = "RUB") => {
  const subtotal = lines.reduce((sum, line) => {
    return sum + parseFloat(line.unitPrice.amount) * line.quantity;
  }, 0);

  return {
    subtotal: { amount: subtotal.toString(), currency },
    deliveryFee: { amount: "0", currency }, // Будет вычисляться на бэкенде
    total: subtotal,
  };
};

// Reducer для управления состоянием корзины
function cartReducer(state: CartState, event: CartEvent): CartState {
  switch (event.type) {
    case "ADD_ITEM": {
      const { item, restaurant, quantity = 1, note } = event.payload;

      // Если корзина пустая или из другого ресторана - создаем новую
      if (!state.cart || state.cart.restaurantId !== restaurant.id) {
        const newLine: CartLine = {
          id: generateId(),
          menuItemId: item.id,
          nameSnapshot: item.name,
          unitPrice: item.price,
          quantity,
          note,
        };

        const totals = calculateTotals([newLine], item.price.currency);

        const newCart: Cart = {
          id: generateId(),
          restaurantId: restaurant.id,
          lines: [newLine],
          subtotal: totals.subtotal,
          currency: item.price.currency,
          updatedAt: new Date().toISOString(),
        };

        return {
          ...state,
          cart: newCart,
          restaurant,
          isVisible: true,
        };
      }

      // Проверяем, есть ли уже такой товар в корзине
      const existingLineIndex = state.cart.lines.findIndex(
        (line) => line.menuItemId === item.id && line.note === note,
      );

      let newLines: CartLine[];

      if (existingLineIndex >= 0) {
        // Обновляем количество существующего товара
        newLines = state.cart.lines.map((line, index) =>
          index === existingLineIndex
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      } else {
        // Добавляем новый товар
        const newLine: CartLine = {
          id: generateId(),
          menuItemId: item.id,
          nameSnapshot: item.name,
          unitPrice: item.price,
          quantity,
          note,
        };
        newLines = [...state.cart.lines, newLine];
      }

      const totals = calculateTotals(newLines, state.cart.currency);

      return {
        ...state,
        cart: {
          ...state.cart,
          lines: newLines,
          subtotal: totals.subtotal,
          updatedAt: new Date().toISOString(),
        },
        isVisible: true,
      };
    }

    case "UPDATE_QUANTITY": {
      if (!state.cart) return state;

      const { lineId, quantity } = event.payload;

      if (quantity <= 0) {
        // Удаляем товар, если количество 0 или меньше
        const newLines = state.cart.lines.filter((line) => line.id !== lineId);

        if (newLines.length === 0) {
          // Если корзина стала пустой
          return {
            ...state,
            cart: null,
            restaurant: null,
            isVisible: false,
          };
        }

        const totals = calculateTotals(newLines, state.cart.currency);

        return {
          ...state,
          cart: {
            ...state.cart,
            lines: newLines,
            subtotal: totals.subtotal,
            updatedAt: new Date().toISOString(),
          },
        };
      }

      const newLines = state.cart.lines.map((line) =>
        line.id === lineId ? { ...line, quantity } : line,
      );

      const totals = calculateTotals(newLines, state.cart.currency);

      return {
        ...state,
        cart: {
          ...state.cart,
          lines: newLines,
          subtotal: totals.subtotal,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case "REMOVE_ITEM": {
      if (!state.cart) return state;

      const newLines = state.cart.lines.filter(
        (line) => line.id !== event.payload.lineId,
      );

      if (newLines.length === 0) {
        return {
          ...state,
          cart: null,
          restaurant: null,
          isVisible: false,
        };
      }

      const totals = calculateTotals(newLines, state.cart.currency);

      return {
        ...state,
        cart: {
          ...state.cart,
          lines: newLines,
          subtotal: totals.subtotal,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case "UPDATE_NOTE": {
      if (!state.cart) return state;

      const newLines = state.cart.lines.map((line) =>
        line.id === event.payload.lineId
          ? { ...line, note: event.payload.note }
          : line,
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          lines: newLines,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        cart: null,
        restaurant: null,
        isVisible: false,
      };
    }

    case "SET_CART": {
      return {
        ...state,
        cart: event.payload,
        isVisible: true,
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    restaurant: null,
    isVisible: false,
  });

  const showCart = () => {
    if (state.cart) {
      dispatch({ type: "SET_CART", payload: state.cart });
    }
  };

  const hideCart = () => {
    dispatch({
      type: "SET_CART",
      payload: state.cart ? { ...state.cart } : (null as any),
    });
  };

  const addToCart = (
    item: MenuItem,
    restaurant: Restaurant,
    quantity = 1,
    note?: string,
  ) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { item, restaurant, quantity, note },
    });
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { lineId, quantity },
    });
  };

  const removeFromCart = (lineId: string) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: { lineId },
    });
  };

  const updateNote = (lineId: string, note: string) => {
    dispatch({
      type: "UPDATE_NOTE",
      payload: { lineId, note },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getTotalItems = () => {
    return state.cart?.lines.reduce((sum, line) => sum + line.quantity, 0) || 0;
  };

  const getTotalPrice = () => {
    if (!state.cart) return 0;
    return parseFloat(state.cart.subtotal.amount);
  };

  const value: CartContextType = {
    ...state,
    dispatch,
    showCart,
    hideCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateNote,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
