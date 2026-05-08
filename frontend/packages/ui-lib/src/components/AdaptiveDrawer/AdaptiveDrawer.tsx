"use client";

import { CloseIcon } from "../Icons/Icons";
import cx from "classnames";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import styles from "./AdaptiveDrawer.module.css";

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
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
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
          styles['backdrop'],
          open && styles['visible'],
          isMobile && isCollapsed && styles['collapsed']
        )}
        onClick={handleBackdropClick}
      />

      {/* Desktop Drawer */}
      <div
        className={cx(
          styles['drawerDesktop'],
          open && styles['open'],
          className
        )}
        onClick={handleDrawerClick}
      >
        <div className={styles['drawerContent']}>
          {title && (
            <div className={styles['drawerHeader']}>
              <h3 className={styles['drawerTitle']}>{title}</h3>
              {!hideCloseButton && (
                <button
                  className={styles['drawerClose']}
                  onClick={onClose}
                  aria-label="Закрыть"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}
          
          <div className={styles['drawerBody']}>
            {children}
          </div>
          
          {footer && (
            <div className={styles['drawerFooter']}>
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={cx(
          styles['drawerMobile'],
          open && styles['open'],
          isCollapsed && styles['collapsed'],
          className
        )}
        onClick={handleDrawerClick}
      >
        <div className={styles['drawerContent']}>
          <div 
            className={styles['drawerHeader']}
            onClick={handleHeaderClick}
            style={{ cursor: isMobile ? 'pointer' : 'default' }}
          >
            {title && <h3 className={styles['drawerTitle']}>{title}</h3>}
            {!hideCloseButton && !isMobile && (
              <button
                className={styles['drawerClose']}
                onClick={onClose}
                aria-label="Закрыть"
              >
                <CloseIcon />
              </button>
            )}
          </div>
          
          <div className={styles['drawerBody']}>
            {children}
          </div>
          
          {footer && (
            <div className={styles['drawerFooter']}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}