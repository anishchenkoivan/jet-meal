import type { Restaurant } from "../../types/restaurant";

export const mockRestaurants: Restaurant[] = [
  {
    id: "rest1",
    name: "Украинская хата",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/ff6b6b/white?text=Украинская+хата"],
      rating: 4.5,
      description: "Традиционная украинская кухня в уютной атмосфере",
      deliveryTimeLabel: "35–50 мин",
      cuisineTags: ["Украинская", "Домашняя"],
      city: "Москва",
      address: "ул. Тверская, 15",
      bookHref: "https://example.com/book/rest1",
      deliveryHref: "https://example.com/delivery/rest1",
      bookingPhone: "+7 (495) 100-10-01",
    }
  },
  {
    id: "rest2", 
    name: "Сибирские просторы",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/4ecdc4/white?text=Сибирские+просторы"],
      rating: 4.2,
      description: "Сибирская кухня в центре города",
      deliveryTimeLabel: "40–55 мин",
      cuisineTags: ["Сибирская", "Гриль"],
      city: "Москва",
      address: "пр. Мира, 25",
      bookHref: "https://example.com/book/rest2",
      bookingPhone: "+7 (495) 100-10-02",
    }
  },
  {
    id: "rest3",
    name: "Токио",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/45b7d1/white?text=Токио"],
      rating: 4.7,
      description: "Аутентичная японская кухня и свежие суши",
      deliveryTimeLabel: "25–40 мин",
      cuisineTags: ["Японская", "Суши"],
      city: "Москва", 
      address: "ул. Арбат, 8",
      bookHref: "https://example.com/book/rest3",
      deliveryHref: "https://example.com/delivery/rest3",
      bookingPhone: "+7 (495) 100-10-03",
    }
  },
  {
    id: "rest4",
    name: "Италия",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/f39c12/white?text=Италия"],
      rating: 4.4,
      description: "Настоящая итальянская пицца и паста",
      deliveryTimeLabel: "30–45 мин",
      cuisineTags: ["Итальянская", "Пицца"],
      city: "Москва",
      address: "Красная площадь, 1",
      bookHref: "https://example.com/book/rest4",
      deliveryHref: "https://example.com/delivery/rest4",
      bookingPhone: "+7 (495) 100-10-04",
    }
  }
];