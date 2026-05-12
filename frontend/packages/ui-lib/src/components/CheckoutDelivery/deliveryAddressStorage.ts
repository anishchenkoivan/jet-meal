export type CheckoutSavedAddress = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  savedAt: string;
};

const ADDRESSES_KEY = "jet-meal.checkout.addresses.v1";
const LAST_ID_KEY = "jet-meal.checkout.lastAddressId.v1";

function safeParse(json: string | null): CheckoutSavedAddress[] {
  if (!json) {
    return [];
  }
  try {
    const v = JSON.parse(json) as unknown;
    if (!Array.isArray(v)) {
      return [];
    }
    return v.filter(
      (x): x is CheckoutSavedAddress =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as CheckoutSavedAddress).id === "string" &&
        typeof (x as CheckoutSavedAddress).label === "string" &&
        typeof (x as CheckoutSavedAddress).latitude === "number" &&
        typeof (x as CheckoutSavedAddress).longitude === "number",
    );
  } catch {
    return [];
  }
}

export function readSavedCheckoutAddresses(): CheckoutSavedAddress[] {
  if (typeof window === "undefined") {
    return [];
  }
  return safeParse(window.localStorage.getItem(ADDRESSES_KEY));
}

export function writeSavedCheckoutAddresses(list: CheckoutSavedAddress[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ADDRESSES_KEY, JSON.stringify(list));
}

export function readLastCheckoutAddressId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(LAST_ID_KEY);
}

export function writeLastCheckoutAddressId(id: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (id === null) {
    window.localStorage.removeItem(LAST_ID_KEY);
    return;
  }
  window.localStorage.setItem(LAST_ID_KEY, id);
}

export function upsertAddressAsLast(
  list: CheckoutSavedAddress[],
  entry: CheckoutSavedAddress,
): CheckoutSavedAddress[] {
  const without = list.filter((a) => a.id !== entry.id);
  const next = [entry, ...without];
  writeSavedCheckoutAddresses(next);
  writeLastCheckoutAddressId(entry.id);
  return next;
}
