"use client";

import { Loader2, MapPin, Navigation, X } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useRef, useState } from "react";
import {
  Map,
  Marker,
  NavigationControl,
  type MapLayerMouseEvent,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";

interface SelectedLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: SelectedLocation) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const THAILAND_CENTER = { latitude: 13.7563, longitude: 100.5018 };

export function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
}: LocationPickerModalProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: initialLocation?.longitude ?? THAILAND_CENTER.longitude,
    latitude: initialLocation?.latitude ?? THAILAND_CENTER.latitude,
    zoom: initialLocation ? 14 : 11,
  });

  const [selected, setSelected] = useState<SelectedLocation | null>(
    initialLocation ? { ...initialLocation, address: "กำลังโหลด..." } : null,
  );
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=th`,
        );
        if (res.ok) {
          const data = await res.json();
          return (
            data.locality ||
            data.city ||
            data.principalSubdivision ||
            `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          );
        }
      } catch {
        // fallback
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    },
    [],
  );

  const handleMapClick = useCallback(
    async (e: MapLayerMouseEvent) => {
      const lat = e.lngLat.lat;
      const lng = e.lngLat.lng;

      setSelected({ latitude: lat, longitude: lng, address: "กำลังโหลด..." });

      const address = await reverseGeocode(lat, lng);
      setSelected({ latitude: lat, longitude: lng, address });
    },
    [reverseGeocode],
  );

  const handleUseCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError("เบราว์เซอร์ไม่รองรับ GPS");
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setViewState((prev) => ({ ...prev, latitude, longitude, zoom: 14 }));
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 1500,
        });

        setSelected({ latitude, longitude, address: "กำลังโหลด..." });
        const address = await reverseGeocode(latitude, longitude);
        setSelected({ latitude, longitude, address });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("กรุณาอนุญาตการเข้าถึงตำแหน่ง");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("ไม่สามารถระบุตำแหน่งได้");
            break;
          default:
            setGeoError("ระบุตำแหน่งไม่สำเร็จ");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [reverseGeocode]);

  const handleConfirm = useCallback(() => {
    if (selected) {
      onConfirm(selected);
    }
  }, [selected, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">เลือกตำแหน่ง</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors hover:bg-muted"
            type="button"
          >
            <X className="h-5 w-5 text-foreground/50" />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex flex-1 flex-col overflow-hidden md:flex-row"
          style={{ minHeight: 0 }}
        >
          {/* Left — Controls */}
          <div className="flex w-full flex-col gap-4 overflow-y-auto border-b border-border p-5 md:w-80 md:border-b-0 md:border-r">
            {/* GPS Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10 disabled:opacity-50"
              type="button"
            >
              {locating ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              ) : (
                <Navigation className="h-5 w-5 shrink-0 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium">ใช้ตำแหน่งปัจจุบัน</p>
                <p className="text-xs text-foreground/40">
                  ระบุจาก GPS อัตโนมัติ
                </p>
              </div>
            </button>

            {geoError && <p className="text-xs text-red-500">{geoError}</p>}

            {/* Instruction */}
            <div className="rounded-lg bg-muted/50 px-3 py-2.5">
              <p className="text-xs text-foreground/50">
                💡 หรือ <strong>แตะบนแผนที่</strong> เพื่อเลือกตำแหน่งเอง
              </p>
            </div>

            {/* Selected Location */}
            {selected && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-1 text-xs font-medium text-foreground/40">
                  ตำแหน่งที่เลือก
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{selected.address}</p>
                    <p className="mt-0.5 text-xs text-foreground/40">
                      {selected.latitude.toFixed(4)},{" "}
                      {selected.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Map */}
          <div className="flex-1" style={{ minHeight: "300px" }}>
            <Map
              ref={mapRef}
              {...viewState}
              onMove={(evt: ViewStateChangeEvent) =>
                setViewState(evt.viewState)
              }
              mapStyle={MAP_STYLE}
              style={{ width: "100%", height: "100%" }}
              onClick={handleMapClick}
              cursor="crosshair"
              attributionControl={false}
            >
              <NavigationControl position="bottom-right" />

              {selected && (
                <Marker
                  latitude={selected.latitude}
                  longitude={selected.longitude}
                  anchor="bottom"
                >
                  <MapPin
                    className="h-8 w-8 fill-primary text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />
                </Marker>
              )}
            </Map>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted"
            type="button"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            ยืนยันตำแหน่ง
          </button>
        </div>
      </div>
    </div>
  );
}
