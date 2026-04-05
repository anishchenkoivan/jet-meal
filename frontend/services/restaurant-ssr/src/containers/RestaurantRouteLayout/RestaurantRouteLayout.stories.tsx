import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Typography } from "antd";
import { RestaurantRouteLayout } from "./RestaurantRouteLayout";

const meta = {
  title: "containers/RestaurantRouteLayout",
  component: RestaurantRouteLayout,
} satisfies Meta<typeof RestaurantRouteLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Typography.Title level={4}>Restaurant content</Typography.Title>,
  },
};
