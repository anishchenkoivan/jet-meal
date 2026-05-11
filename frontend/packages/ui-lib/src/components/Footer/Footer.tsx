export type FooterProps = {
  text?: string;
};

/** Без Typography/antd — одинаковый цвет на SSR и после гидрации. */
export function Footer({ text = "© Jet Meal. Админ-панель." }: FooterProps) {
  return (
    <footer className="m-0 text-center px-4 py-6 bg-[#fafafa] border-t border-[#f0f0f0] text-[rgba(0,0,0,0.45)] text-sm leading-[1.5715]">
      {text}
    </footer>
  );
}
