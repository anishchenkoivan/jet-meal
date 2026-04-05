import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Typography } from "antd";
import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { Logo } from "../../components/Logo/Logo";
import { PageLayout } from "./PageLayout";

const topBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "0 24px",
  background: "#fff",
  borderBottom: "1px solid #f0f0f0",
  minHeight: 64,
} as const;

const meta = {
  title: "ui-lib/PageLayout",
  component: PageLayout,
} satisfies Meta<typeof PageLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTopBar: Story = {
  args: {
    top: (
      <div style={topBarStyle}>
        <Logo />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Header
            tabs={[
              { key: "a", label: "Раздел A", href: "#" },
              { key: "b", label: "Раздел B", href: "#" },
            ]}
            selectedKey="a"
          />
        </div>
      </div>
    ),
    children: <Typography.Title level={4}>Контент</Typography.Title>,
    footer: <Footer />,
  },
};
