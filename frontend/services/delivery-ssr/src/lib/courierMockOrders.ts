export type CourierWorkStatus = "none" | "searching" | "on_order";

export type CourierOrderRow = {
  id: string;
  number: string;
  completedAt: string;
  route: string;
  amountRub: number;
};

const SEED: CourierOrderRow[] = [
  {
    id: "c1",
    number: "JM-8821",
    completedAt: "2026-05-01T18:40:00.000Z",
    route: "Тверская → Патриаршие",
    amountRub: 420,
  },
  {
    id: "c2",
    number: "JM-8810",
    completedAt: "2026-05-01T16:05:00.000Z",
    route: "Смоленская → Арбат",
    amountRub: 310,
  },
  {
    id: "c3",
    number: "JM-8799",
    completedAt: "2026-04-30T21:12:00.000Z",
    route: "Китай-город → Таганская",
    amountRub: 550,
  },
  {
    id: "c4",
    number: "JM-8788",
    completedAt: "2026-04-30T12:00:00.000Z",
    route: "Белорусская → Савёловский",
    amountRub: 380,
  },
  {
    id: "c5",
    number: "JM-8777",
    completedAt: "2026-04-29T19:30:00.000Z",
    route: "Курская → Рижская",
    amountRub: 610,
  },
  {
    id: "c6",
    number: "JM-8766",
    completedAt: "2026-04-29T10:15:00.000Z",
    route: "ВДНХ → Алексеевская",
    amountRub: 290,
  },
  {
    id: "c7",
    number: "JM-8755",
    completedAt: "2026-04-28T17:45:00.000Z",
    route: "Киевская → Фили",
    amountRub: 440,
  },
  {
    id: "c8",
    number: "JM-8744",
    completedAt: "2026-04-28T08:50:00.000Z",
    route: "Технопарк → Стрешнево",
    amountRub: 330,
  },
];

export function getCourierOrdersSlice(start: number, count: number): CourierOrderRow[] {
  return SEED.slice(start, start + count);
}

export const COURIER_ORDER_TOTAL = SEED.length;
