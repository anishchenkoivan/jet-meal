import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RestaurantsCatalogPage } from "./RestaurantsCatalogPage";

const meta = {
  title: "Catalog/RestaurantsCatalogPage",
  component: RestaurantsCatalogPage,
  parameters: { layout: "padded" },
} satisfies Meta<typeof RestaurantsCatalogPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const WithItems: Story = {
  args: {
    items: [
      { id: "1", name: "Уютная столовая", city: "Москва" },
      {
        id: "2",
        name: "Пицца на районе",
        city: "Санкт-Петербург",
        description: "Доставка 30 минут",
      },
    ],
  },
};
