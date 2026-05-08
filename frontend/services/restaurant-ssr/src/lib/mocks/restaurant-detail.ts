import type { Restaurant } from "../../types/restaurant";

export const mockRestaurantDetails: Record<string, Restaurant> = {
  "rest1": {
    id: "rest1",
    name: "Украинская хата",
    published: true,
    preview: {
      images: [
        "https://via.placeholder.com/800x400/ff6b6b/white?text=Украинская+хата+1",
        "https://via.placeholder.com/800x401/ff6b6b/white?text=Украинская+хата+2"
      ],
      rating: 4.5,
      description: "Традиционная украинская кухня в уютной атмосфере",
      city: "Москва",
      address: "ул. Тверская, 15",
      bookHref: "https://example.com/book/rest1",
      deliveryHref: "https://example.com/delivery/rest1"
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [
          {
            id: "first-courses",
            title: "Первые блюда",
            blocks: [
              {
                id: "dish-1",
                title: "Борщ украинский",
                subtitle: "450 ₽",
                extraText: "Традиционный украинский борщ со сметаной и зеленью",
                image: "https://via.placeholder.com/200x150/ff6b6b/white?text=Борщ"
              },
              {
                id: "dish-5", 
                title: "Солянка мясная",
                subtitle: "420 ₽",
                extraText: "Густая солянка с тремя видами мяса",
                image: "https://via.placeholder.com/200x151/ff6b6b/white?text=Солянка"
              }
            ]
          },
          {
            id: "main-courses",
            title: "Основные блюда", 
            blocks: [
              {
                id: "dish-6",
                title: "Котлеты по-киевски",
                subtitle: "650 ₽", 
                extraText: "Нежные котлеты с маслом и зеленью",
                image: "https://via.placeholder.com/200x152/ff6b6b/white?text=Котлеты"
              }
            ]
          }
        ]
      }
    ]
  },
  "rest2": {
    id: "rest2",
    name: "Сибирские просторы",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/4ecdc4/white?text=Сибирские+просторы"],
      rating: 4.2,
      description: "Сибирская кухня в центре города",
      city: "Москва",
      address: "пр. Мира, 25"
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню",
        divisions: [
          {
            id: "main-courses",
            title: "Основные блюда",
            blocks: [
              {
                id: "dish-2",
                title: "Пельмени домашние",
                subtitle: "380 ₽",
                extraText: "Сочные пельмени с мясом, подаются со сметаной",
                image: "https://via.placeholder.com/200x150/4ecdc4/white?text=Пельмени"
              }
            ]
          }
        ]
      }
    ]
  },
  "rest3": {
    id: "rest3",
    name: "Токио",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/45b7d1/white?text=Токио"],
      rating: 4.7,
      description: "Аутентичная японская кухня и свежие суши",
      city: "Москва",
      address: "ул. Арбат, 8"
    },
    mainSections: [
      {
        id: "menu", 
        title: "Меню",
        divisions: [
          {
            id: "sushi",
            title: "Суши и роллы",
            blocks: [
              {
                id: "dish-3",
                title: "Суши филадельфия",
                subtitle: "650 ₽",
                extraText: "Роллы с лососем, огурцом и сливочным сыром",
                image: "https://via.placeholder.com/200x150/45b7d1/white?text=Суши"
              }
            ]
          }
        ]
      }
    ]
  },
  "rest4": {
    id: "rest4", 
    name: "Италия",
    published: true,
    preview: {
      images: ["https://via.placeholder.com/800x400/f39c12/white?text=Италия"],
      rating: 4.4,
      description: "Настоящая итальянская пицца и паста",
      city: "Москва",
      address: "Красная площадь, 1"
    },
    mainSections: [
      {
        id: "menu",
        title: "Меню", 
        divisions: [
          {
            id: "pizza",
            title: "Пицца",
            blocks: [
              {
                id: "dish-4",
                title: "Пицца маргарита",
                subtitle: "520 ₽",
                extraText: "Классическая итальянская пицца с томатами и моцареллой",
                image: "https://via.placeholder.com/200x150/f39c12/white?text=Пицца"
              }
            ]
          }
        ]
      }
    ]
  }
};