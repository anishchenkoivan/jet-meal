import { Typography } from "antd";

export type FooterProps = {
  text?: string;
};

export function Footer({
  text = "© Jet Meal. Админ-панель.",
}: FooterProps) {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "24px 16px",
        background: "#fafafa",
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <Typography.Text type="secondary">{text}</Typography.Text>
    </footer>
  );
}
