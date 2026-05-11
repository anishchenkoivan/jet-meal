"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { forwardGeocodeSuggestions, type GeocodeSuggestion } from "./forwardGeocode";
import type { CheckoutAddressModel } from "./useCheckoutAddress";
import { YandexMapPicker } from "./YandexMapPicker";

const DEBOUNCE_MS = 500;

export type CheckoutAddressEditorProps = {
  yandexMapsApiKey: string;
  model: CheckoutAddressModel;
  onCancel: () => void;
  onSave: () => void;
};

export function CheckoutAddressEditor({
  yandexMapsApiKey,
  model,
  onCancel,
  onSave,
}: CheckoutAddressEditorProps) {
  const [inputValue, setInputValue] = useState(model.addressLine);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync model → input when not actively searching
  useEffect(() => {
    if (!isSearching) {
      setInputValue(model.addressLine);
    }
  }, [model.addressLine, isSearching]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    if (!value.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const results = await forwardGeocodeSuggestions(value, ac.signal);
        if (!ac.signal.aborted) setSuggestions(results);
      } catch {
        // aborted or network
      } finally {
        if (!ac.signal.aborted) setLoadingSuggestions(false);
      }
    }, DEBOUNCE_MS);
  };

  const pickSuggestion = (s: GeocodeSuggestion) => {
    setInputValue(s.displayName);
    setSuggestions([]);
    setIsSearching(false);
    model.setMapCoordsAndGeocode(s.lat, s.lng, s.displayName);
  };

  const handleMapCoords = useCallback(
    (lat: number, lng: number) => {
      setSuggestions([]);
      setIsSearching(false);
      model.setMapCoordsAndGeocode(lat, lng);
    },
    [model],
  );

  const otherAddresses = model.addresses
    .filter((a) => a.id !== model.lastAddress?.id)
    .slice(0, 4);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-[1_1_auto] min-h-0 overflow-y-auto flex flex-col gap-3 pb-2">
        <div className="-mx-px">
          <YandexMapPicker
            apiKey={yandexMapsApiKey}
            latitude={model.mapLat}
            longitude={model.mapLng}
            onCoordinatesChange={handleMapCoords}
            className="w-full rounded-none! border-x-0!"
          />
        </div>

        <div className="relative px-0">
          <div className="relative">
            <input
              type="text"
              value={model.isGeocoding && !isSearching ? "" : inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                model.isGeocoding
                  ? "Определяем адрес..."
                  : model.addressLine || "Улица, дом, квартира"
              }
              className="w-full box-border h-10 px-3 text-sm [border:1px_solid_var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius,6px)] outline-none [color:var(--ant-color-text,rgba(0,0,0,0.88))] [background:var(--ant-color-bg-container,#fff)] focus:[border-color:var(--ant-color-primary,#1677ff)] focus:[box-shadow:0_0_0_2px_rgba(22,119,255,0.1)] placeholder:[color:var(--ant-color-text-placeholder,rgba(0,0,0,0.25))] transition-all"
            />
            {loadingSuggestions && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs [color:var(--ant-color-text-secondary)] animate-pulse">
                ...
              </span>
            )}
          </div>
          {suggestions.length > 0 && isSearching && (
            <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 m-0 p-0 list-none [background:var(--ant-color-bg-container,#fff)] border [border-color:var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius-lg,8px)] shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden max-h-[220px] overflow-y-auto">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-3 py-[10px] text-sm leading-[1.4] [color:var(--ant-color-text)] cursor-pointer hover:[background:var(--ant-color-fill-quaternary,#f5f5f5)] border-b last:border-b-0 [border-color:var(--ant-color-border-secondary,#f0f0f0)]"
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

        {otherAddresses.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="m-0 text-[12px] font-semibold uppercase tracking-wide [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
              Ранее заказывали сюда:
            </p>
            {otherAddresses.map((a) => (
              <button
                key={a.id}
                type="button"
                className="w-full text-left px-3 py-[10px] text-sm leading-[1.35] [color:var(--ant-color-text)] [background:var(--ant-color-fill-quaternary,#f5f5f5)] border border-transparent [border-radius:var(--ant-border-radius-lg,8px)] cursor-pointer hover:[background:var(--ant-color-fill-tertiary,rgba(0,0,0,0.04))] hover:[border-color:var(--ant-color-border-secondary,#f0f0f0)] transition-all"
                onClick={() => {
                  model.pickSaved(a);
                  setIsSearching(false);
                }}
              >
                <span className="block truncate">{a.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 pt-3 border-t [border-color:var(--ant-color-border-secondary,#f0f0f0)] flex flex-col gap-2">
        <button
          type="button"
          className="w-full h-10 [background:var(--ant-color-primary,#1677ff)] [color:#fff] text-sm font-semibold [border-radius:var(--ant-border-radius,6px)] border-none cursor-pointer hover:[background:var(--ant-color-primary-hover,#4096ff)] transition-colors"
          onClick={() => {
            model.persist();
            onSave();
          }}
        >
          Сохранить
        </button>
        <button
          type="button"
          className="w-full py-1 text-sm text-center text-[#ff4d4f] bg-transparent border-none cursor-pointer hover:underline"
          onClick={onCancel}
        >
          Отменить
        </button>
      </div>
    </div>
  );
}
