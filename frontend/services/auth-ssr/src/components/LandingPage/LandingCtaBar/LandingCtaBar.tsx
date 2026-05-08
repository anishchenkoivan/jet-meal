"use client";

import { Button } from "antd";
import cx from "classnames";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./LandingCtaBar.module.css";

export function LandingCtaBar() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setVisible(y > 280);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className={cx(styles.ctaBar, visible && styles.ctaBarVisible)}
      aria-label="Регистрация"
    >
      <div className={cx(styles.ctaInner)}>
        <p className={styles.ctaHint}>Сохраняйте адреса и смотрите историю заказов</p>
        <Button
          type="primary"
          size="large"
          className={cx(styles.ctaButton)}
          block
          onClick={() => router.push("/my?register=1")}
        >
          Создать аккаунт
        </Button>
      </div>
    </section>
  );
}
