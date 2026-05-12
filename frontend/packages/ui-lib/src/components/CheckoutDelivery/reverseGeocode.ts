/** Обратное геокодирование через Nominatim (OSM). Соблюдайте политику использования: не чаще 1 запрос/с с одного IP без договорённости. */
export async function reverseGeocodeDisplayName(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      "Accept-Language": "ru",
      "User-Agent": "JetMeal/1.0 (https://github.com/jet-meal)",
    },
  });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { display_name?: string };
  return typeof data.display_name === "string" ? data.display_name : null;
}
