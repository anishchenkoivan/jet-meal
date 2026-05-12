"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  forwardGeocodeSuggestions,
  type GeocodeSuggestion,
} from "../CheckoutDelivery/forwardGeocode";
import { reverseGeocodeDisplayName } from "../CheckoutDelivery/reverseGeocode";
import { YandexMapPicker } from "../CheckoutDelivery/YandexMapPicker";

const DEBOUNCE_MS = 500;

// Берём только первые 2 части Nominatim display_name (улица, номер дома).
// Пример: "улица Ленина, 5, Москва, Россия" → "улица Ленина, 5"
function formatShortAddress(displayName: string): string {
  const parts = displayName
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.slice(0, 2).join(", ");
}

export type AddressPickerFieldProps = {
  yandexMapsApiKey: string;
  value?: string;
  onChange?: (address: string) => void;
  defaultLat?: number;
  defaultLng?: number;
  placeholder?: string;
};

const DEFAULT_LAT = 55.751244;
const DEFAULT_LNG = 37.618423;

/**
 * Поле ввода адреса с картой.
 * Переиспользуется в админке ресторана и на странице оформления заказа.
 * Без save/cancel, без истории адресов, без очистки при фокусе.
 */
export function AddressPickerField({
  yandexMapsApiKey,
  value = "",
  onChange,
  defaultLat = DEFAULT_LAT,
  defaultLng = DEFAULT_LNG,
  placeholder = "Улица, дом",
}: AddressPickerFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapLat, setMapLat] = useState(defaultLat);
  const [mapLng, setMapLng] = useState(defaultLng);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync external value → input when not in search mode
  useEffect(() => {
    if (!isSearching) {
      setInputValue(value);
    }
  }, [value, isSearching]);

  const handleInputChange = (next: string) => {
    setInputValue(next);
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    if (!next.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const results = await forwardGeocodeSuggestions(next, ac.signal);
        if (!ac.signal.aborted) {
          setSuggestions(
            results.map((s) => ({
              ...s,
              displayName: formatShortAddress(s.displayName),
            })),
          );
        }
      } catch {
        // aborted or network error
      } finally {
        if (!ac.signal.aborted) setLoadingSuggestions(false);
      }
    }, DEBOUNCE_MS);
  };

  const pickSuggestion = (s: GeocodeSuggestion) => {
    const short = formatShortAddress(s.displayName);
    setInputValue(short);
    setSuggestions([]);
    setIsSearching(false);
    setMapLat(s.lat);
    setMapLng(s.lng);
    onChange?.(short);
  };

  const handleMapCoords = useCallback(
    async (lat: number, lng: number) => {
      setSuggestions([]);
      setIsSearching(false);
      setMapLat(lat);
      setMapLng(lng);
      setIsGeocoding(true);
      try {
        const ac = new AbortController();
        abortRef.current = ac;
        const full = await reverseGeocodeDisplayName(lat, lng, ac.signal);
        if (full && !ac.signal.aborted) {
          const short = formatShortAddress(full);
          setInputValue(short);
          onChange?.(short);
        }
      } catch {
        // ignore
      } finally {
        setIsGeocoding(false);
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-3">
      <YandexMapPicker
        apiKey={yandexMapsApiKey}
        latitude={mapLat}
        longitude={mapLng}
        onCoordinatesChange={handleMapCoords}
      />

      <div className="relative">
        <input
          type="text"
          value={isGeocoding ? "" : inputValue}
          placeholder={isGeocoding ? "Определяем адрес…" : placeholder}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => {
            // Delay hide suggestions so click on suggestion registers first
            setTimeout(() => {
              setIsSearching(false);
              setSuggestions([]);
            }, 150);
          }}
          className="w-full box-border h-10 px-3 text-sm [border:1px_solid_var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius,6px)] outline-none [color:var(--ant-color-text,rgba(0,0,0,0.88))] [background:var(--ant-color-bg-container,#fff)] focus:[border-color:var(--ant-color-primary,#1677ff)] focus:[box-shadow:0_0_0_2px_rgba(22,119,255,0.1)] placeholder:[color:var(--ant-color-text-placeholder,rgba(0,0,0,0.25))] transition-all"
        />
        {loadingSuggestions && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs [color:var(--ant-color-text-secondary)] animate-pulse">
            …
          </span>
        )}
        {suggestions.length > 0 && isSearching && (
          <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 m-0 max-h-[220px] list-none overflow-y-auto overflow-hidden p-0 [background:var(--ant-color-bg-container,#fff)] border [border-color:var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius-lg,8px)] shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="cursor-pointer border-b px-3 py-[10px] text-sm leading-[1.4] last:border-b-0 [border-color:var(--ant-color-border-secondary,#f0f0f0)] [color:var(--ant-color-text)] hover:[background:var(--ant-color-fill-quaternary,#f5f5f5)]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickSuggestion(s);
                }}
              >
                {s.displayName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
