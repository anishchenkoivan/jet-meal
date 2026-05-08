export type FooterProps = {
  text?: string;
};

/** Без Typography/antd — одинаковый цвет на SSR и после гидрации. */
export function Footer({
  text = "© Jet Meal. Админ-панель.",
}: FooterProps) {
  return (
    <footer
      style={{
        margin: 0,
        textAlign: "center",
        padding: "24px 16px",
        background: "#fafafa",
        borderTop: "1px solid #f0f0f0",
        color: "rgba(0, 0, 0, 0.45)",
        fontSize: 14,
        lineHeight: 1.5715,
      }}
    >
      {text}
    </footer>
  );
}
