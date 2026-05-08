"use client";

import { useRouter } from "next/navigation";
import { CourierSignupForm } from "@jet-meal/ui-lib/src/components/CourierSignupForm/CourierSignupForm";
import { registerCourierProfile } from "./actions";
import styles from "./courierOnboarding.module.css";

export function CourierOnboarding() {
  const router = useRouter();

  return (
    <div className={styles["wrap"]}>
      <CourierSignupForm
        onComplete={async () => {
          await registerCourierProfile();
          router.refresh();
        }}
      />
    </div>
  );
}
