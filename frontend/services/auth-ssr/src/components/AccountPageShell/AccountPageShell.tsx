"use client";

import { MobileDrawer } from "@jet-meal/ui-lib/src/components/MobileDrawer/MobileDrawer";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./AccountPageShell.module.css";

const MOBILE_MAX_PX = 767;

export function AccountPageShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    setReady(true);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!ready) {
    return <div className={styles["desktopWrap"]}>{children}</div>;
  }

  if (mobile) {
    return (
      <MobileDrawer
        open
        autoFocus={false}
        onClose={() => router.push("/")}
        topOffsetPx={64}
        destroyOnClose={false}
        bodyClassName={styles["mobileDrawerBody"]}
      >
        <div className={styles["mobileInner"]}>{children}</div>
      </MobileDrawer>
    );
  }

  return <div className={styles["desktopWrap"]}>{children}</div>;
}
