"use client";

import { DeleteIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { useCart } from "../../providers/CartProvider";
import styles from "./OrderCard.module.css";

export interface OrderCardProps {
  /** Обработчик оформления заказа */
  onCheckout?: () => void;
  /** Показать кнопку очистки корзины */
  showClearButton?: boolean;
}

export function OrderCard({
  onCheckout,
  showClearButton = true
}: OrderCardProps) {
  const {
    cart,
    restaurant,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useCart();

  const formatPrice = (amount: string, currency: string) => {
    return `${amount} ${currency === 'RUB' ? '₽' : currency}`;
  };

  const formatLineTotal = (unitPrice: { amount: string; currency: string }, quantity: number) => {
    const total = parseFloat(unitPrice.amount) * quantity;
    return formatPrice(total.toString(), unitPrice.currency);
  };

  if (!cart || !restaurant) {
    return (
      <div className={styles["orderCard"]}>
        <div className={styles["cartEmpty"]}>
          <div className={styles["emptyIcon"]}>
            <ShoppingCartIcon size={48} color="#888" />
          </div>
          <h3 className={styles["emptyTitle"]}>Корзина пуста</h3>
          <p className={styles["emptyText"]}>
            Добавьте товары из меню,<br />
            чтобы оформить заказ
          </p>
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className={styles["orderCard"]}>
      {/* Товары в корзине */}
      <div className={styles["cartItems"]}>
        {cart.lines.map((line) => (
          <div key={line.id} className={styles["cartItem"]}>
            <div className={styles["itemDetails"]}>
              <div className={styles["itemName"]}>{line.nameSnapshot}</div>
              <div className={styles["itemPrice"]}>
                {formatPrice(line.unitPrice.amount, line.unitPrice.currency)} × {line.quantity} = {formatLineTotal(line.unitPrice, line.quantity)}
              </div>
              {line.note && (
                <div className={styles["itemNote"]}>
                  Комментарий: {line.note}
                </div>
              )}
            </div>

            <div className={styles["itemControls"]}>
              <div className={styles["quantityControl"]}>
                <button
                  className={styles["quantityButton"]}
                  onClick={() => updateQuantity(line.id, line.quantity - 1)}
                  disabled={line.quantity <= 1}
                >
                  <MinusIcon />
                </button>
                <span className={styles["quantityDisplay"]}>
                  {line.quantity}
                </span>
                <button
                  className={styles["quantityButton"]}
                  onClick={() => updateQuantity(line.id, line.quantity + 1)}
                >
                  <PlusIcon />
                </button>
              </div>

              <button
                className={styles["removeButton"]}
                onClick={() => removeFromCart(line.id)}
                title="Удалить товар"
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Итоги */}
      <div className={styles["totals"]}>
        <div className={styles["totalRow"]}>
          <span className={styles["totalLabel"]}>Товары ({totalItems} шт.)</span>
          <span className={styles["totalValue"]}>
            {formatPrice(cart.subtotal.amount, cart.subtotal.currency)}
          </span>
        </div>
        
        {cart.deliveryFee && parseFloat(cart.deliveryFee.amount) > 0 && (
          <div className={styles["totalRow"]}>
            <span className={styles["totalLabel"]}>Доставка</span>
            <span className={styles["totalValue"]}>
              {formatPrice(cart.deliveryFee.amount, cart.deliveryFee.currency)}
            </span>
          </div>
        )}

        <div className={styles["totalRow"]}>
          <span className={styles["totalLabel"]}>Итого</span>
          <span className={styles["totalValue"]}>
            {formatPrice(totalPrice.toString(), cart.currency)}
          </span>
        </div>
      </div>

      {/* Действия */}
      <div className={styles["actions"]}>
        <button
          className={styles["checkoutButton"]}
          onClick={onCheckout}
          disabled={totalItems === 0}
        >
          <ShoppingCartIcon />
          Оформить заказ ({formatPrice(totalPrice.toString(), cart.currency)})
        </button>

        {showClearButton && (
          <button
            className={styles["clearButton"]}
            onClick={clearCart}
          >
            Очистить корзину
          </button>
        )}
      </div>
    </div>
  );
}