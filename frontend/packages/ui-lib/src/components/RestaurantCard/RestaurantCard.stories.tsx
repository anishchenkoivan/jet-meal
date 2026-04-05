import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RestaurantCard } from "./RestaurantCard";

const meta = {
  title: "Catalog/RestaurantCard",
  component: RestaurantCard,
  parameters: { layout: "centered" },
} satisfies Meta<typeof RestaurantCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: { id: "1", name: "Кафе «Лето»", city: "Казань", description: "Завтраки и обеды" },
  },
};
