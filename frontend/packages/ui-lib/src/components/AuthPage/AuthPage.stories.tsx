import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthPage } from "./AuthPage";

const meta = {
  title: "ui-lib/AuthPage",
  component: AuthPage,
} satisfies Meta<typeof AuthPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Вход",
    onSubmit: async () => {},
  },
};
