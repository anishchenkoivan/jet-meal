import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Typography } from "antd";
import { NavListBlock } from "./NavListBlock";

const meta = {
  title: "ui-lib/NavListBlock",
  component: NavListBlock,
} satisfies Meta<typeof NavListBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DesktopAside: Story = {
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
  args: {
    asideTitle: "Разделы",
    asideBody: <Typography.Text>Боковая навигация</Typography.Text>,
    children: <Typography.Title level={4}>Контент</Typography.Title>,
  },
};

export const MobileBar: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  args: {
    asideTitle: "Разделы",
    asideBody: <Typography.Text>Содержимое панели</Typography.Text>,
    children: <p>Основной контент страницы</p>,
  },
};
