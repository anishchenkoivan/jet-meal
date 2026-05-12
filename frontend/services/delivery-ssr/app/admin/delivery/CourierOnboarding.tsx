"use client";

import { CourierSignupForm } from "@jet-meal/ui-lib/src/components/CourierSignupForm/CourierSignupForm";
import { useRouter } from "next/navigation";
import { registerCourierProfile } from "./actions";

export function CourierOnboarding() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-[720px] mx-auto">
      <CourierSignupForm
        onComplete={async () => {
          await registerCourierProfile();
          router.refresh();
        }}
      />
    </div>
  );
}
