"use client";

import {
  DeleteIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { useCart } from "../../providers/CartProvider";

export interface OrderCardProps {
  /** Обработчик оформления заказа */
  onCheckout?: () => void;
  /** Показать кнопку очистки корзины */
  showClearButton?: boolean;
}

export function OrderCard({
  onCheckout,
  showClearButton = true,
}: OrderCardProps) {
  const {
    cart,
    restaurant,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  const formatPrice = (amount: string, currency: string) => {
    return `${amount} ${currency === "RUB" ? "₽" : currency}`;
  };

  const formatLineTotal = (
    unitPrice: { amount: string; currency: string },
    quantity: number,
  ) => {
    const total = parseFloat(unitPrice.amount) * quantity;
    return formatPrice(total.toString(), unitPrice.currency);
  };

  if (!cart || !restaurant) {
    return (
      <div className="p-0">
        <div className="text-center py-10 px-5 text-[#8c8c8c]">
          <div className="text-5xl mb-4 text-[#d9d9d9]">
            <ShoppingCartIcon size={48} color="#888" />
          </div>
          <h3 className="text-base font-semibold m-0 mb-2 text-[#595959]">Корзина пуста</h3>
          <p className="text-sm m-0 leading-[1.4]">
            Добавьте товары из меню,
            <br />
            чтобы оформить заказ
          </p>
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="p-0">
      {/* Товары в корзине */}
      <div className="max-h-[60vh] overflow-y-auto p-0 m-0">
        {cart.lines.map((line) => (
          <div key={line.id} className="flex items-start gap-3 px-5 py-4 border-b border-[#f0f0f0] last:border-b-0">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold m-0 mb-1 text-[#262626] leading-[1.3]">{line.nameSnapshot}</div>
              <div className="text-[13px] text-[#8c8c8c] m-0 mb-2">
                {formatPrice(line.unitPrice.amount, line.unitPrice.currency)} ×{" "}
                {line.quantity} ={" "}
                {formatLineTotal(line.unitPrice, line.quantity)}
              </div>
              {line.note && (
                <div className="text-xs text-[#595959] italic mt-1 m-0 leading-[1.3]">
                  Комментарий: {line.note}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-[#f5f5f5] rounded-md p-0.5">
                <button
                  className="w-7 h-7 border-none bg-none cursor-pointer flex items-center justify-center rounded text-[#595959] transition-all duration-200 hover:bg-[#e6f7ff] hover:text-[#1677ff] disabled:text-[#d9d9d9] disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#d9d9d9]"
                  onClick={() => updateQuantity(line.id, line.quantity - 1)}
                  disabled={line.quantity <= 1}
                >
                  <MinusIcon />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-[#262626]">
                  {line.quantity}
                </span>
                <button
                  className="w-7 h-7 border-none bg-none cursor-pointer flex items-center justify-center rounded text-[#595959] transition-all duration-200 hover:bg-[#e6f7ff] hover:text-[#1677ff]"
                  onClick={() => updateQuantity(line.id, line.quantity + 1)}
                >
                  <PlusIcon />
                </button>
              </div>

              <button
                className="w-7 h-7 border-none bg-none cursor-pointer flex items-center justify-center rounded text-[#8c8c8c] transition-all duration-200 hover:bg-[#fff1f0] hover:text-[#ff4d4f]"
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
      <div className="p-5 border-t border-[#f0f0f0] bg-[#fafafa]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#595959] text-sm">
            Товары ({totalItems} шт.)
          </span>
          <span className="text-[#262626] text-sm">
            {formatPrice(cart.subtotal.amount, cart.subtotal.currency)}
          </span>
        </div>

        {cart.deliveryFee && parseFloat(cart.deliveryFee.amount) > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#595959] text-sm">Доставка</span>
            <span className="text-[#262626] text-sm">
              {formatPrice(cart.deliveryFee.amount, cart.deliveryFee.currency)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-0 font-semibold text-base text-[#262626] pt-2 border-t border-[#e8e8e8]">
          <span className="text-[#595959] text-base font-semibold">Итого</span>
          <span className="text-[#262626] text-base font-semibold">
            {formatPrice(totalPrice.toString(), cart.currency)}
          </span>
        </div>
      </div>

      {/* Действия */}
      <div className="p-5 border-t border-[#f0f0f0]">
        <button
          className="w-full h-12 bg-[#1677ff] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-[#0958d9] disabled:bg-[#d9d9d9] disabled:cursor-not-allowed"
          onClick={onCheckout}
          disabled={totalItems === 0}
        >
          <ShoppingCartIcon />
          Оформить заказ ({formatPrice(totalPrice.toString(), cart.currency)})
        </button>

        {showClearButton && (
          <button
            className="w-full h-10 bg-none text-[#8c8c8c] border border-[#d9d9d9] rounded-md text-sm cursor-pointer mt-3 transition-all duration-200 hover:border-[#ff4d4f] hover:text-[#ff4d4f]"
            onClick={clearCart}
          >
            Очистить корзину
          </button>
        )}
      </div>
    </div>
  );
}
