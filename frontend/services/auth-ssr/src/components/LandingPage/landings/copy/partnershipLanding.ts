export const partnershipLandingMedia = {
  image:
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2000&q=80",
} as const;

export const partnershipLandingCopy = {
  title: "Сотрудничество с Jet Meal",
  intro: "Подключайте точку, курьерский сервис или рекламу — выберите кабинет:",
  outro: "",
  links: [
    { key: "restaurant", label: "Для ресторанов" },
    { key: "courier", label: "Для курьеров" },
    { key: "advert", label: "Реклама" },
  ] as const,
} as const;
