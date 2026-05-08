import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Col } from "antd";
import type { CatalogItem } from "../../types/catalogItem";
import { Card } from "../Card/Card";
import { Catalog } from "./Catalog";

const meta = {
  title: "ui-lib/Catalog",
  component: Catalog,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Catalog>;

export default meta;

type Story = StoryObj<typeof meta>;

const items: CatalogItem[] = [
  { id: "1", name: "А", city: "Москва" },
  { id: "2", name: "Б", city: "Казань", description: "Текст" },
];

export const Empty: Story = {
  args: {
    isEmpty: true,
    emptyDescription: undefined,
  },
};

export const WithCards: Story = {
  args: {
    isEmpty: false,
    emptyDescription: undefined,
  },
  render: (args) => (
    <Catalog {...args}>
      {items.map((item) => (
        <Col key={item.id} xs={24}>
          <Card item={item} />
        </Col>
      ))}
    </Catalog>
  ),
};
