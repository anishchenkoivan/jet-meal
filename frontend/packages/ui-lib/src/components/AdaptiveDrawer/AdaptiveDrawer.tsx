"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CloseIcon } from "../Icons/Icons";

export interface AdaptiveDrawerProps {
  /** Открыт ли drawer */
  open: boolean;
  /** Обработчик закрытия */
  onClose: () => void;
  /** Заголовок drawer */
  title?: string;
  /** Контент в теле drawer */
  children: ReactNode;
  /** Контент в футере drawer */
  footer?: ReactNode;
  /** Скрыть кнопку закрытия */
  hideCloseButton?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** На мобильном: начальное состояние (collapsed показывает только футер) */
  defaultCollapsed?: boolean;
}

export function AdaptiveDrawer({
  open,
  onClose,
  title,
  children,
  footer,
  hideCloseButton = false,
  className,
  defaultCollapsed = true,
}: AdaptiveDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Сбрасываем collapsed состояние при открытии/закрытии
  useEffect(() => {
    if (open && isMobile) {
      setIsCollapsed(defaultCollapsed);
    }
  }, [open, isMobile, defaultCollapsed]);

  // Блокируем скролл body при открытом drawer
  useEffect(() => {
    if (open && (isMobile ? !isCollapsed : true)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isCollapsed, isMobile]);

  const handleBackdropClick = () => {
    if (isMobile && !isCollapsed) {
      // На мобильном сначала сворачиваем
      setIsCollapsed(true);
    } else {
      // На десктопе или если уже свернуто на мобильном - закрываем
      onClose();
    }
  };

  const handleDrawerClick = (e: React.MouseEvent) => {
    // Предотвращаем всплытие на drawer, чтобы клик по backdrop работал
    e.stopPropagation();
  };

  const handleHeaderClick = () => {
    // На мобильном клик по header разворачивает/сворачивает
    if (isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cx(
          "fixed top-0 left-0 right-0 bottom-0 z-[999] [transition:opacity_0.3s_ease]",
          open ? "opacity-100 bg-black/50" : "opacity-0",
          isMobile && isCollapsed && "opacity-0",
        )}
        onClick={handleBackdropClick}
      />

      {/* Desktop Drawer */}
      <div
        className={cx(
          "fixed z-[1000] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.15)] [transition:transform_0.3s_ease]",
          "md:top-0 md:right-0 md:w-[400px] md:h-screen md:rounded-none md:shadow-[-4px_0_24px_rgba(0,0,0,0.15)]",
          open ? "md:translate-x-0" : "md:translate-x-full",
          className,
        )}
        onClick={handleDrawerClick}
      >
        <div className="h-full flex flex-col">
          {title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] bg-white sticky top-0 z-[1]">
              <h3 className="text-[18px] font-semibold m-0 text-[#333]">{title}</h3>
              {!hideCloseButton && (
                <button
                  className="bg-none border-none cursor-pointer p-2 rounded text-[#666] flex items-center justify-center hover:bg-[#f5f5f5] hover:text-[#333]"
                  onClick={onClose}
                  aria-label="Закрыть"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5">{children}</div>

          {footer && (
            <div className="px-5 py-4 border-t border-[#f0f0f0] bg-white sticky bottom-0">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={cx(
          "fixed z-[1000] bg-white [transition:transform_0.3s_ease]",
          "max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:max-h-[80vh] max-md:rounded-t-2xl",
          open && !isCollapsed ? "max-md:translate-y-0" : "",
          open && isCollapsed ? "max-md:[transform:translateY(calc(100%-80px))]" : "",
          !open ? "max-md:translate-y-full" : "",
          className,
        )}
        onClick={handleDrawerClick}
      >
        <div className="h-full flex flex-col">
          <div
            className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] bg-white sticky top-0 z-[1]"
            onClick={handleHeaderClick}
            style={{ cursor: isMobile ? "pointer" : "default" }}
          >
            {title && <h3 className="text-[18px] font-semibold m-0 text-[#333]">{title}</h3>}
            {!hideCloseButton && !isMobile && (
              <button
                className="bg-none border-none cursor-pointer p-2 rounded text-[#666] flex items-center justify-center hover:bg-[#f5f5f5] hover:text-[#333]"
                onClick={onClose}
                aria-label="Закрыть"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          <div
            className={cx(
              "flex-1 overflow-y-auto p-5",
              isMobile && isCollapsed && "hidden",
            )}
          >
            {children}
          </div>

          {footer && (
            <div
              className={cx(
                "px-5 py-4 bg-white sticky bottom-0",
                isMobile && isCollapsed ? "border-none rounded-t-2xl cursor-pointer" : "border-t border-[#f0f0f0]",
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
