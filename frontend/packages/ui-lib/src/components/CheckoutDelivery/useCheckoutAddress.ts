"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type CheckoutSavedAddress,
  readLastCheckoutAddressId,
  readSavedCheckoutAddresses,
  upsertAddressAsLast,
} from "./deliveryAddressStorage";
import { reverseGeocodeDisplayName } from "./reverseGeocode";

const genAddressId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `a_${Math.random().toString(36).slice(2, 11)}`;

const MOSCOW = { latitude: 55.751244, longitude: 37.618423 };

export type CheckoutAddressModel = {
  addressLine: string;
  setAddressLine: (v: string) => void;
  mapLat: number;
  mapLng: number;
  setMapCoords: (lat: number, lng: number) => void;
  geoCoords: { latitude: number; longitude: number } | null;
  geoLabel: string | null;
  addresses: CheckoutSavedAddress[];
  lastAddress: CheckoutSavedAddress | null;
  reload: () => void;
  seedForOpen: () => void;
  persist: () => void;
  onUseGeo: () => void;
  pickSaved: (a: CheckoutSavedAddress) => void;
  isGeocoding: boolean;
  setMapCoordsAndGeocode: (
    lat: number,
    lng: number,
    knownLabel?: string,
  ) => void;
};

export function useCheckoutAddress(): CheckoutAddressModel {
  const [addresses, setAddresses] = useState<CheckoutSavedAddress[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [geoLabel, setGeoLabel] = useState<string | null>(null);
  const [geoCoords, setGeoCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressLine, setAddressLine] = useState("");
  const [mapLat, setMapLat] = useState(MOSCOW.latitude);
  const [mapLng, setMapLng] = useState(MOSCOW.longitude);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geoAbortRef = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    setAddresses(readSavedCheckoutAddresses());
    setLastId(readLastCheckoutAddressId());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }
    const ac = new AbortController();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        let label: string | null = null;
        try {
          label = await reverseGeocodeDisplayName(
            latitude,
            longitude,
            ac.signal,
          );
        } catch {
          label = null;
        }
        if (ac.signal.aborted) {
          return;
        }
        setGeoCoords({ latitude, longitude });
        setGeoLabel(
          label ??
            `Координаты: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        );
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 120_000 },
    );
    return () => ac.abort();
  }, []);

  const lastAddress = useMemo(() => {
    if (!addresses.length) {
      return null;
    }
    const byLast = lastId ? addresses.find((a) => a.id === lastId) : null;
    return byLast ?? addresses[0];
  }, [addresses, lastId]);

  const seedForOpen = useCallback(() => {
    reload();
    if (lastAddress) {
      setAddressLine(lastAddress.label);
      setMapLat(lastAddress.latitude);
      setMapLng(lastAddress.longitude);
    } else if (geoCoords) {
      setAddressLine(geoLabel ?? "");
      setMapLat(geoCoords.latitude);
      setMapLng(geoCoords.longitude);
    } else {
      setAddressLine("");
      setMapLat(MOSCOW.latitude);
      setMapLng(MOSCOW.longitude);
    }
  }, [reload, lastAddress, geoCoords, geoLabel]);

  const persist = useCallback(() => {
    const label =
      addressLine.trim() ||
      geoLabel ||
      `Точка: ${mapLat.toFixed(5)}, ${mapLng.toFixed(5)}`;
    const entry: CheckoutSavedAddress = {
      id: genAddressId(),
      label,
      latitude: mapLat,
      longitude: mapLng,
      savedAt: new Date().toISOString(),
    };
    setAddresses((prev) => upsertAddressAsLast(prev, entry));
    setLastId(entry.id);
  }, [addressLine, geoLabel, mapLat, mapLng]);

  const onUseGeo = useCallback(() => {
    if (!geoCoords) {
      return;
    }
    setMapLat(geoCoords.latitude);
    setMapLng(geoCoords.longitude);
    if (geoLabel) {
      setAddressLine(geoLabel);
    }
  }, [geoCoords, geoLabel]);

  const pickSaved = useCallback((a: CheckoutSavedAddress) => {
    setMapLat(a.latitude);
    setMapLng(a.longitude);
    setAddressLine(a.label);
  }, []);

  const setMapCoords = useCallback((lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
  }, []);

  const setMapCoordsAndGeocode = useCallback(
    (lat: number, lng: number, knownLabel?: string) => {
      setMapLat(lat);
      setMapLng(lng);
      if (knownLabel !== undefined) {
        setAddressLine(knownLabel);
        return;
      }
      if (geoAbortRef.current) geoAbortRef.current.abort();
      const ac = new AbortController();
      geoAbortRef.current = ac;
      setIsGeocoding(true);
      reverseGeocodeDisplayName(lat, lng, ac.signal)
        .then((label) => {
          if (!ac.signal.aborted) {
            if (label) setAddressLine(label);
            setIsGeocoding(false);
          }
        })
        .catch(() => {
          if (!ac.signal.aborted) setIsGeocoding(false);
        });
    },
    [],
  );

  return {
    addressLine,
    setAddressLine,
    mapLat,
    mapLng,
    setMapCoords,
    geoCoords,
    geoLabel,
    addresses,
    lastAddress,
    reload,
    seedForOpen,
    persist,
    onUseGeo,
    pickSaved,
    isGeocoding,
    setMapCoordsAndGeocode,
  };
}
