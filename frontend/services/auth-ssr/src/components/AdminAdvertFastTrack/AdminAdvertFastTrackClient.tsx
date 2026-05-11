"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { MiddleColumn } from "@jet-meal/ui-lib/src/components/MiddleColumn/MiddleColumn";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminAdvertFastTrackClient() {
  const router = useRouter();

  return (
    <MiddleColumn verticalAlign="top" maxWidthPx={520} className="py-6">
      <h1 className="m-0 mb-3 text-[1.35rem] font-bold [color:var(--jm-color-text,rgba(0,0,0,0.88))]">
        Быстрый старт рекламы
      </h1>
      <p className="m-0 text-sm leading-relaxed [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))]">
        Запустите рекламу своего ресторана и увеличьте пользовательские охваты.
        На странице рекламы — форматы, сроки и контакты менеджера.
      </p>
      <div className="mt-6 flex w-full flex-col gap-3">
        <Button type="primary" href="/admin/advert" block>
          Перейти к рекламе
        </Button>
        <button
          type="button"
          className="m-0 cursor-pointer border-none bg-transparent p-0 text-center text-sm [color:var(--jm-color-text-secondary,rgba(0,0,0,0.55))] hover:underline"
          onClick={() => router.back()}
        >
          Отмена
        </button>
      </div>
      <p className="mt-6 mb-0 text-xs [color:var(--jm-color-text-tertiary,rgba(0,0,0,0.45))]">
        <Link
          href="/admin/advert"
          className="[color:var(--jm-color-primary,#1677ff)] hover:underline"
        >
          Полный раздел рекламы
        </Link>
      </p>
    </MiddleColumn>
  );
}
