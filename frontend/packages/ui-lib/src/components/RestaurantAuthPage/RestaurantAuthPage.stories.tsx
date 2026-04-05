import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RestaurantAuthForm } from "./RestaurantAuthPage";

const meta = {
  title: "components/RestaurantAuthForm",
  component: RestaurantAuthForm,
} satisfies Meta<typeof RestaurantAuthForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async () => {},
  },
};
