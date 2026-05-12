"use client";

import { Button } from "antd";
import cx from "classnames";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      className={cx(
        "fixed left-0 right-0 bottom-0 z-[100] flex justify-center pointer-events-none opacity-0 translate-y-[110%] transition-[opacity,transform] [transition-duration:320ms] [transition-timing-function:ease,cubic-bezier(0.22,1,0.36,1)]",
        "[padding:14px_20px_calc(14px+env(safe-area-inset-bottom))]",
        visible && "pointer-events-auto opacity-100 translate-y-0",
      )}
      aria-label="Регистрация"
    >
      <div className="w-[min(440px,100%)] px-4 pt-[14px] pb-4 rounded-[20px] bg-white/[0.92] [backdrop-filter:blur(14px)] shadow-[0_16px_48px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.05)]">
        <p className="m-0 mb-2.5 px-1 text-[13px] leading-[1.45] text-center text-black/[0.52]">
          Сохраняйте адреса и смотрите историю заказов
        </p>
        <Button
          type="primary"
          size="large"
          className="w-full !h-[50px] !text-base !font-semibold !rounded-[14px] !border-none !shadow-[0_4px_14px_rgba(22,119,255,0.35)] hover:!shadow-[0_6px_20px_rgba(22,119,255,0.45)]"
          block
          onClick={() => router.push("/my?register=1")}
        >
          Создать аккаунт
        </Button>
      </div>
    </section>
  );
}
