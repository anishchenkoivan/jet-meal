export type JetMealDevPaymentProfile = {
  yandexLinked: boolean;
  sberLinked: boolean;
  cardSaved: boolean;
  yandexAccountId: string;
  sberAccountId: string;
};

export const defaultJetMealDevPaymentProfile: JetMealDevPaymentProfile = {
  yandexLinked: false,
  sberLinked: false,
  cardSaved: false,
  yandexAccountId: "",
  sberAccountId: "",
};
