import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CatalogItem } from "../../types/catalogItem";
import { Card } from "./Card";

const item: CatalogItem = {
  id: "1",
  name: "Пример заведения",
  city: "Москва",
  address: "ул. Примерная, 1",
  description: "Описание для сторибука.",
  rating: 4.5,
  images: ["https://picsum.photos/seed/card1/800/500"],
  bookHref: "#",
  deliveryHref: "#",
  detailHref: "#",
};

const meta = {
  title: "ui-lib/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { item },
};
