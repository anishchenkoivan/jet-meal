import type {
  Restaurant,
  RestaurantContentBlock,
} from "../../types/restaurant";
import { OWNED_RESTAURANT_ID } from "./ownedRestaurantId";

function dish(
  id: string,
  title: string,
  priceRub: number,
  extra: string,
  hex = "e74c3c",
): RestaurantContentBlock {
  const q = encodeURIComponent(title.slice(0, 14));
  return {
    id,
    title,
    subtitle: `${priceRub} ₽`,
    extraText: extra,
    image: `https://via.placeholder.com/200x150/${hex}/white?text=${q}`,
  };
}

const burgBurgers: RestaurantContentBlock[] = [
  dish(
    "burg-b1",
    "Двойной чизбургер",
    420,
    "Две говяжьи котлеты, сыр чеддер, соус BBQ",
  ),
  dish(
    "burg-b2",
    "Чикен делюкс",
    390,
    "Куриная котлета в панировке, майонез, салат",
  ),
  dish("burg-b3", "Биг мясной", 450, "Тройная котлета, бекон, лук-шалот"),
  dish("burg-b4", "Вег-бургер", 340, "Котлета из нута, томаты, соус тартар"),
  dish("burg-b5", "Фишбургер", 360, "Филе трески, соус ремулад, салат айсберг"),
  dish("burg-b6", "Чили бургер", 410, "Острый соус халапеньо, халапеньо, сыр"),
  dish("burg-b7", "Гриль-чиз", 380, "Котлета на гриле, карамелизированный лук"),
  dish("burg-b8", "Классик", 290, "Котлета, маринованные огурцы, кетчуп"),
  dish(
    "burg-b9",
    "Сырная лавина",
    430,
    "Три вида сыра, грибы, трюфельный соус",
  ),
  dish("burg-b10", "Ранч бургер", 400, "Бекон, яйцо всмятку, соус ранч"),
  dish(
    "burg-b11",
    "Мини-слайдеры ×3",
    320,
    "Три маленьких бургера с разной начинкой",
  ),
  dish("burg-b12", "Барбекю XL", 470, "Копчёная грудинка, луковые кольца, BBQ"),
];

const burgSides: RestaurantContentBlock[] = [
  dish(
    "burg-s1",
    "Картофель фри",
    150,
    "Большая порция, соль по вкусу",
    "f39c12",
  ),
  dish(
    "burg-s2",
    "Картофель по-деревенски",
    170,
    "Дольки со шкуркой, розмарин",
    "f39c12",
  ),
  dish(
    "burg-s3",
    "Наггетсы 6 шт",
    220,
    "Куриные наггетсы, соус на выбор",
    "f39c12",
  ),
  dish("burg-s4", "Крылышки BBQ", 280, "6 шт, карамельный соус", "f39c12"),
  dish(
    "burg-s5",
    "Салат Цезарь",
    240,
    "Курица, пармезан, соус цезарь",
    "27ae60",
  ),
  dish(
    "burg-s6",
    "Луковые кольца",
    190,
    "В кляре, соус сладкий чили",
    "f39c12",
  ),
];

const burgDrinks: RestaurantContentBlock[] = [
  dish("burg-d1", "Кола 0,5", 120, "В стакане со льдом", "3498db"),
  dish(
    "burg-d2",
    "Молочный коктейль",
    210,
    "Ваниль / шоколад / клубника",
    "3498db",
  ),
  dish(
    "burg-d3",
    "Лимонад домашний",
    160,
    "Мята, лайм, газированная вода",
    "3498db",
  ),
  dish("burg-d4", "Айс-кофе", 180, "Холодный американо со льдом", "3498db"),
  dish("burg-d5", "Сок яблоко", 110, "0,33 л", "3498db"),
  dish("burg-d6", "Вода газированная", 90, "0,5 л", "3498db"),
];

const burgDesserts: RestaurantContentBlock[] = [
  dish("burg-z1", "Мороженое в рожке", 150, "Ваниль или шоколад", "9b59b6"),
  dish("burg-z2", "Чуррос с шоколадом", 220, "Тёплые чуррос, соус", "9b59b6"),
  dish("burg-z3", "Брауни", 190, "С кусочками шоколада", "9b59b6"),
];

const burgCombos: RestaurantContentBlock[] = [
  dish(
    "burg-c1",
    "Комбо «Обед»",
    520,
    "Бургер на выбор + картофель + напиток",
    "c0392b",
  ),
  dish(
    "burg-c2",
    "Комбо «Семья»",
    1290,
    "2 бургера XL + 2 картофеля + наггетсы + 2 колы",
    "c0392b",
  ),
  dish(
    "burg-c3",
    "Комбо «Детское»",
    360,
    "Мини-бургер, наггетсы, сок",
    "c0392b",
  ),
];

const piz1Blocks: RestaurantContentBlock[] = [
  dish("p1-1", "Маргарита", 490, "Томаты, моцарелла, базилик", "c0392b"),
  dish("p1-2", "Пепперони", 590, "Острая колбаса пепперони", "c0392b"),
  dish(
    "p1-3",
    "Четыре сыра",
    640,
    "Моцарелла, горгонзола, пармезан, чеддер",
    "c0392b",
  ),
  dish("p1-4", "Гавайская", 560, "Курица, ананас, сладкий соус", "c0392b"),
  dish("p1-5", "Карбонара пицца", 620, "Бекон, сливочный соус, яйцо", "c0392b"),
  dish("p1-6", "Барбекю", 610, "Говядина, лук, соус BBQ", "c0392b"),
  dish("p1-7", "Вегетарианская", 520, "Овощи гриль, песто", "27ae60"),
  dish("p1-8", "Диабло", 650, "Острый салями, халапеньо", "c0392b"),
  dish(
    "p1-9",
    "Кальцоне",
    540,
    "Закрытая пицца с ветчиной и грибами",
    "c0392b",
  ),
  dish("p1-10", "Грибная", 530, "Шампиньоны, трюфельное масло", "c0392b"),
];

const piz2Blocks: RestaurantContentBlock[] = [
  dish("p2-1", "Неаполь", 680, "Сан-марцано, буфала, базилик", "d35400"),
  dish("p2-2", "Диабла огонь", 640, "Острый салями, перец чили", "d35400"),
  dish("p2-3", "Капричоза", 590, "Ветчина, артишоки, оливки", "d35400"),
  dish("p2-4", "Прошутто", 720, "Прошутто, руккола, пармезан", "d35400"),
  dish("p2-5", "Трюфельная", 750, "Трюфельный крем, грибы", "d35400"),
  dish("p2-6", "Морская", 710, "Креветки, мидии, чеснок", "2980b9"),
  dish("p2-7", "Кватро формаджи", 670, "Четыре сыра с мёдом", "d35400"),
  dish("p2-8", "Пицца-фокачча", 480, "Оливковое масло, розмарин", "d35400"),
];

const cafe1Blocks: RestaurantContentBlock[] = [
  dish(
    "cf1-1",
    "Тост с лососем",
    420,
    "Слабосолёный лосось, крем-сыр",
    "8e44ad",
  ),
  dish("cf1-2", "Авокадо-тост", 380, "Хлеб из цельнозерновой муки", "8e44ad"),
  dish("cf1-3", "Бенедикт", 410, "Яйцо пашот, голландский соус", "8e44ad"),
  dish("cf1-4", "Капучино", 190, "Двойной эспрессо, молочная пена", "8e44ad"),
  dish("cf1-5", "Флэт уайт", 200, "Мягкий вкус, меньше пены", "8e44ad"),
  dish("cf1-6", "Раф ваниль", 230, "Сливки, ванильный сироп", "8e44ad"),
  dish("cf1-7", "Круассан масляный", 160, "Слоёное тесто, масло 82%", "8e44ad"),
  dish(
    "cf1-8",
    "Гранола йогурт",
    290,
    "Ягоды, мёд, греческий йогурт",
    "8e44ad",
  ),
];

const cafe2Blocks: RestaurantContentBlock[] = [
  dish("cf2-1", "Борщ домашний", 340, "Со сметаной и пампушками", "16a085"),
  dish("cf2-2", "Щи зелёные", 310, "Щавель, яйцо", "16a085"),
  dish("cf2-3", "Пирог с капустой", 220, "Кусок тёплого пирога", "16a085"),
  dish("cf2-4", "Пирог с мясом", 260, "Говядина с луком", "16a085"),
  dish("cf2-5", "Чай в чайнике", 180, "Иван-чай или чёрный", "16a085"),
  dish("cf2-6", "Компот сухофрукты", 150, "С корицей", "16a085"),
  dish("cf2-7", "Блинчики со сметаной", 240, "Три штуки", "16a085"),
];

const nashKitchen: RestaurantContentBlock[] = [
  dish("nash-k1", "Домашний борщ", 320, "Со сметаной и зеленью", "c0392b"),
  dish(
    "nash-k2",
    "Котлета по-киевски",
    410,
    "Сливочное масло, картофельное пюре",
    "c0392b",
  ),
  dish(
    "nash-k3",
    "Салат «Наш»",
    280,
    "Свежие овощи, заправка на выбор",
    "27ae60",
  ),
];

const nashDrinks: RestaurantContentBlock[] = [
  dish("nash-d1", "Морс клюква", 140, "0,4 л", "3498db"),
  dish("nash-d2", "Компот", 120, "Домашний, 0,3 л", "3498db"),
];

export const mockRestaurantDetails: Record<string, Restaurant> = {
  [OWNED_RESTAURANT_ID]: {
    id: OWNED_RESTAURANT_ID,
    name: "Ресторан наш",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/1677ff/white?text=Ресторан+наш+1",
        "https://via.placeholder.com/800x401/0958d9/white?text=Ресторан+наш+2",
      ],
      rating: 4.8,
      description:
        "Ваше заведение в Jet Meal — редактируйте карточку и меню в кабинете.",
      city: "Москва",
      address: "ул. Примерная, 1",
      bookHref: "https://example.com/book/nash",
      bookingPhone: "+7 (495) 000-00-00",
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [
          { id: "nash-hot", title: "Горячее", blocks: nashKitchen },
          { id: "nash-dr", title: "Напитки", blocks: nashDrinks },
        ],
      },
    ],
  },
  burg: {
    id: "burg",
    name: "Бургер-плейс",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/e74c3c/white?text=Бургер-плейс+1",
        "https://via.placeholder.com/800x401/e74c3c/white?text=Бургер-плейс+2",
      ],
      rating: 4.6,
      description: "Фастфуд: бургеры, картофель, напитки и комбо",
      city: "Москва",
      address: "ул. Большая, 12",
      bookHref: "https://example.com/book/burg",
      deliveryHref: "https://example.com/delivery/burg",
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [
          { id: "burgers", title: "Бургеры", blocks: burgBurgers },
          { id: "sides", title: "Картофель и закуски", blocks: burgSides },
          { id: "drinks", title: "Напитки", blocks: burgDrinks },
          { id: "desserts", title: "Десерты", blocks: burgDesserts },
          { id: "combos", title: "Комбо", blocks: burgCombos },
        ],
      },
    ],
  },
  piz1: {
    id: "piz1",
    name: "Пицца 33",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/c0392b/white?text=Пицца+33",
      ],
      rating: 4.5,
      description: "Пицца на тонком тесте, паста и закуски",
      city: "Москва",
      address: "ул. Тверская, 44",
      bookHref: "https://example.com/book/piz1",
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [{ id: "pizza", title: "Пицца", blocks: piz1Blocks }],
      },
    ],
  },
  piz2: {
    id: "piz2",
    name: "Сицилия Fire",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/d35400/white?text=Сицилия"],
      rating: 4.4,
      description: "Неаполитанская пицца и острые топпинги",
      city: "Москва",
      address: "ул. Садовая, 88",
      bookHref: "https://example.com/book/piz2",
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [{ id: "pizza", title: "Пицца", blocks: piz2Blocks }],
      },
    ],
  },
  cafe1: {
    id: "cafe1",
    name: "Тост и кофе",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/8e44ad/white?text=Тост+и+кофе",
      ],
      rating: 4.7,
      description: "Завтраки, сэндвичи и авторский кофе",
      city: "Москва",
      address: "ул. Покровка, 3",
      bookHref: "https://example.com/book/cafe1",
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [
          { id: "all", title: "Завтраки и напитки", blocks: cafe1Blocks },
        ],
      },
    ],
  },
  cafe2: {
    id: "cafe2",
    name: "Гости лавки",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/16a085/white?text=Гости+лавки",
      ],
      rating: 4.3,
      description: "Домашние пироги, супы дня и чай",
      city: "Санкт-Петербург",
      address: "Канал Грибоедова, 15",
      bookHref: "https://example.com/book/cafe2",
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [
          { id: "home", title: "Домашняя кухня", blocks: cafe2Blocks },
        ],
      },
    ],
  },
};
