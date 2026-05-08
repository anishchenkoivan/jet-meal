"use client";

import { AdaptiveDrawer } from "@jet-meal/ui-lib/src/components/AdaptiveDrawer/AdaptiveDrawer";
import { useCart } from "../../providers/CartProvider";
import { OrderCard } from "../OrderCard/OrderCard";

export interface CartDrawerProps {
  /** Обработчик оформления заказа */
  onCheckout?: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { isVisible, hideCart, restaurant, getTotalItems } = useCart();

  const handleCheckout = () => {
    onCheckout?.();
  };

  const getDrawerTitle = () => {
    if (!restaurant) return "Корзина";
    return `Заказ из ${restaurant.name}`;
  };

  return (
    <AdaptiveDrawer
      open={isVisible}
      onClose={hideCart}
      title={getDrawerTitle()}
      defaultCollapsed={true}
      footer={
        <div style={{ 
          fontSize: '14px', 
          color: '#8c8c8c',
          textAlign: 'center' 
        }}>
          {getTotalItems() > 0 
            ? `${getTotalItems()} товаров в корзине`
            : "Корзина пуста"
          }
        </div>
      }
    >
      <OrderCard 
        onCheckout={handleCheckout}
        showClearButton={true}
      />
    </AdaptiveDrawer>
  );
}