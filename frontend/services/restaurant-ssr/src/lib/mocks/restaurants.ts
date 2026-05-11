import type { Restaurant } from "../../types/restaurant";
import { OWNED_RESTAURANT_ID } from "./ownedRestaurantId";

/** 1 фастфуд, 2 пиццерии, 2 кафе — для dev-каталога и моков GraphQL. */
export const mockRestaurants: Restaurant[] = [
  {
    id: OWNED_RESTAURANT_ID,
    name: "Ресторан наш",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/1677ff/white?text=Ресторан+наш",
      ],
      rating: 4.8,
      description: "Ваше заведение в Jet Meal — редактируйте карточку и меню в кабинете.",
      deliveryTimeLabel: "20–35 мин",
      cuisineTags: ["Свой бренд"],
      city: "Москва",
      address: "ул. Примерная, 1",
      bookHref: "https://example.com/book/nash",
      bookingPhone: "+7 (495) 000-00-00",
    },
  },
  {
    id: "burg",
    name: "Бургер-плейс",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/e74c3c/white?text=Бургер-плейс",
      ],
      rating: 4.6,
      description: "Фастфуд: бургеры, картофель, напитки и комбо — большое меню на любой вкус",
      deliveryTimeLabel: "25–40 мин",
      cuisineTags: ["Фастфуд", "Бургеры"],
      city: "Москва",
      address: "ул. Большая, 12",
      bookHref: "https://example.com/book/burg",
      deliveryHref: "https://example.com/delivery/burg",
      bookingPhone: "+7 (495) 200-01-01",
    },
  },
  {
    id: "piz1",
    name: "Пицца 33",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/c0392b/white?text=Пицца+33",
      ],
      rating: 4.5,
      description: "Пицца на тонком тесте, паста и закуски",
      deliveryTimeLabel: "35–50 мин",
      cuisineTags: ["Пицца", "Итальянская"],
      city: "Москва",
      address: "Невский пр., 44",
      bookHref: "https://example.com/book/piz1",
      bookingPhone: "+7 (812) 300-02-02",
    },
  },
  {
    id: "piz2",
    name: "Сицилия Fire",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/d35400/white?text=Сицилия+Fire",
      ],
      rating: 4.4,
      description: "Неаполитанская пицца и острые топпинги",
      deliveryTimeLabel: "30–45 мин",
      cuisineTags: ["Пицца", "Острое"],
      city: "Москва",
      address: "ул. Садовая, 88",
      bookHref: "https://example.com/book/piz2",
      bookingPhone: "+7 (495) 200-03-03",
    },
  },
  {
    id: "cafe1",
    name: "Тост и кофе",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/8e44ad/white?text=Тост+и+кофе",
      ],
      rating: 4.7,
      description: "Завтраки, сэндвичи и авторский кофе",
      deliveryTimeLabel: "20–35 мин",
      cuisineTags: ["Кафе", "Завтраки"],
      city: "Москва",
      address: "ул. Покровка, 3",
      bookHref: "https://example.com/book/cafe1",
      bookingPhone: "+7 (495) 200-04-04",
    },
  },
  {
    id: "cafe2",
    name: "Гости лавки",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/16a085/white?text=Гости+лавки",
      ],
      rating: 4.3,
      description: "Домашние пироги, супы дня и чай",
      deliveryTimeLabel: "40–55 мин",
      cuisineTags: ["Кафе", "Домашняя"],
      city: "Санкт-Петербург",
      address: "Канал Грибоедова, 15",
      bookHref: "https://example.com/book/cafe2",
      bookingPhone: "+7 (812) 300-05-05",
    },
  },
];
