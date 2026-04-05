import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./Header";

const meta = {
  title: "ui-lib/Header",
  component: Header,
  args: {
    tabs: [
      { key: "home", label: "Главная", href: "#" },
      { key: "restaurants", label: "Рестораны", href: "#" },
    ],
    selectedKey: "home",
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
