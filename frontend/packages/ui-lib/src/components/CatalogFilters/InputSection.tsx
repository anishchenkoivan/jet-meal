"use client";

import type { ChangeEvent } from "react";
import { Input } from "../Input/Input";
import { FilterSection } from "./FilterSection";

export type InputSectionProps = {
  id: string;
  title?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function InputSection({
  id,
  title,
  placeholder,
  value,
  onChange,
}: InputSectionProps) {
  return (
    <FilterSection id={id} title={title}>
      <Input
        allowClear
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
      />
    </FilterSection>
  );
}
