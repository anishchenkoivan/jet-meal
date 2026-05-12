import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import {
  Paragraph,
  Title,
} from "@jet-meal/ui-lib/src/components/Typography/Typography";

export function OrderNotFoundView() {
  return (
    <div className="flex flex-col pb-2">
      <div className="[background:var(--ant-color-bg-container,#fff)] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Title level={3} className="!mt-0 !mb-4">
          Заказ не найден
        </Title>
        <Paragraph type="secondary">
          Проверьте ссылку или номер заказа. Если вы перешли из письма,
          запросите новое письмо в поддержке.
        </Paragraph>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button type="primary" href="/my/orders">
            К моим заказам
          </Button>
          <Button type="default" href="/">
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
