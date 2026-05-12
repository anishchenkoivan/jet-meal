import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DangerousButton } from "./DangerousButton";

const meta = {
  title: "ui-lib/DangerousButton",
  component: DangerousButton,
} satisfies Meta<typeof DangerousButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AsButton: Story = {
  args: {
    trigger: "button",
    buttonProps: { danger: true, type: "primary" },
    children: "Удалить навсегда",
    confirmText: "Удалить элемент без восстановления?",
    onConfirm: async () => {},
  },
};

export const AsLink: Story = {
  args: {
    trigger: "link",
    children: "Очистить данные",
    modalTitle: "Очистка",
    onConfirm: async () => {},
  },
};
