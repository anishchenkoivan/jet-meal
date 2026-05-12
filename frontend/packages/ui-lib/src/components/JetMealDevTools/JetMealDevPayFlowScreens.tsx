"use client";

import type { ReactNode } from "react";
import { Button } from "../Button/Button";
import { MiddleColumn } from "../MiddleColumn/MiddleColumn";

export function PayCircleLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 py-8">
      <div
        className="h-[88px] w-[88px] rounded-full border-[5px] border-solid [border-color:var(--ant-color-border-secondary,#f0f0f0)] [border-top-color:var(--ant-color-primary,#1677ff)] animate-spin"
        aria-hidden
      />
      {label ? (
        <p className="m-0 text-center text-base font-medium [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
          {label}
        </p>
      ) : null}
    </div>
  );
}

export function PayCircleErrorIcon() {
  return (
    <div
      className="flex h-[88px] w-[88px] items-center justify-center rounded-full [background:var(--ant-color-error-bg,#fff2f0)] [color:var(--ant-color-error,#ff4d4f)]"
      aria-hidden
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function PayCircleSuccessIcon() {
  return (
    <div
      className="flex h-[88px] w-[88px] items-center justify-center rounded-full [background:var(--ant-color-success-bg,#f6ffed)] [color:var(--ant-color-success,#52c41a)]"
      aria-hidden
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function PayOutcomeLayout({
  icon,
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  actions: ReactNode;
}) {
  return (
    <MiddleColumn
      verticalAlign="center"
      maxWidthPx={640}
      className="h-full min-h-0 flex-1"
    >
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        {icon}
        <div className="flex max-w-[320px] flex-col gap-2">
          <h2 className="m-0 text-lg font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            {title}
          </h2>
          {description ? (
            <p className="m-0 text-sm leading-relaxed [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-2 flex w-full max-w-[320px] flex-col gap-2">
          {actions}
        </div>
      </div>
    </MiddleColumn>
  );
}

export function PayPrimaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button type="primary" size="large" block onClick={onClick}>
      {children}
    </Button>
  );
}
