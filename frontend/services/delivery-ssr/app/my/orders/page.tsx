"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { MiddleColumn } from "@jet-meal/ui-lib/src/components/MiddleColumn/MiddleColumn";
import { Tag } from "@jet-meal/ui-lib/src/components/Tag/Tag";
import {
  Paragraph,
  Title,
} from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { useJetMealDevMock } from "@jet-meal/ui-lib/src/context/JetMealDevMockContext";
import { useMemo } from "react";
import { DevOrdersHydrateSkeleton } from "../../../src/components/DevOrdersHydrateSkeleton/DevOrdersHydrateSkeleton";
import { jetMealDevOrdersToDemoListItems } from "../../../src/lib/deliveryOrderMock";

export default function MyOrdersPage() {
  const dev = useJetMealDevMock();
  const rows = useMemo(
    () => jetMealDevOrdersToDemoListItems(dev.orders),
    [dev.orders],
  );

  const showHydrateSkeleton = dev.isDev && !dev.hydrated;

  return (
    <main className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0">
      <MiddleColumn
        verticalAlign="top"
        maxWidthPx={640}
        className="min-h-0 flex-1"
      >
        <Title level={2} className="!mt-0 !mb-2">
          Мои заказы
        </Title>
        <Paragraph type="secondary" className="!mb-6">
          История и статусы заказов. В development список совпадает с dev-моками
          ресторана (<code className="text-xs">jet-meal-dev:orders-v1</code>).
        </Paragraph>
        {showHydrateSkeleton ? (
          <DevOrdersHydrateSkeleton />
        ) : rows.length === 0 ? (
          <Paragraph type="secondary">Пока нет заказов.</Paragraph>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-xl px-[18px] py-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] [background:var(--ant-color-bg-container,#fff)]"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-base font-semibold">{row.number}</span>
                  <Tag
                    color={
                      row.stateLabel === "В пути" ? "processing" : "success"
                    }
                  >
                    {row.stateLabel}
                  </Tag>
                </div>
                <p className="m-0 mb-2 text-sm [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
                  {row.summary}
                </p>
                <Button
                  type="link"
                  href={`/my/order/${row.id}`}
                  className="!h-auto !p-0"
                >
                  Подробнее
                </Button>
              </li>
            ))}
          </ul>
        )}
      </MiddleColumn>
    </main>
  );
}
