export type GeocodeSuggestion = {
  displayName: string;
  lat: number;
  lng: number;
};

export async function forwardGeocodeSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeSuggestion[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "0",
    limit: "5",
    "accept-language": "ru",
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { signal, headers: { "User-Agent": "jet-meal-app/1.0" } },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;
  return data.map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
