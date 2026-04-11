"use client";

import type { NearByFilter } from "@/application/repositories/IPetPostRepository";
import { cn } from "@/presentation/lib/cn";
import { useLocationStore } from "@/presentation/stores/useLocationStore";
import { Crosshair, MapPin, PenLine, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { LocationPickerModal } from "./LocationPickerModal";

const RADIUS_OPTIONS = [1, 3, 5, 10, 20, 50];

interface NearBySectionProps {
  nearBy: NearByFilter | undefined;
  onChange: (nearBy: NearByFilter | undefined) => void;
}

export function NearBySection({ nearBy, onChange }: NearBySectionProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const { location: savedLocation, setLocation: saveLocation } =
    useLocationStore();

  const handleLocationConfirm = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setAddress(location.address);
      setShowPicker(false);
      saveLocation(location);
      onChange({
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: nearBy?.radiusKm ?? 5,
      });
    },
    [nearBy, onChange, saveLocation],
  );

  const handleUseSavedLocation = useCallback(() => {
    if (!savedLocation) return;
    setAddress(savedLocation.address);
    onChange({
      latitude: savedLocation.latitude,
      longitude: savedLocation.longitude,
      radiusKm: nearBy?.radiusKm ?? 5,
    });
  }, [savedLocation, nearBy, onChange]);

  const setRadius = useCallback(
    (radiusKm: number) => {
      if (!nearBy) return;
      onChange({ ...nearBy, radiusKm });
    },
    [nearBy, onChange],
  );

  const clearNearBy = useCallback(() => {
    onChange(undefined);
    setAddress(null);
  }, [onChange]);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">ค้นหารอบๆ ฉัน</span>
          </div>

          {nearBy && (
            <button
              onClick={clearNearBy}
              className="text-xs text-primary hover:underline"
              type="button"
            >
              ปิด
            </button>
          )}
        </div>

        {!nearBy ? (
          <div className="flex flex-col gap-2">
            {/* Saved location quick-use */}
            {savedLocation && (
              <button
                onClick={handleUseSavedLocation}
                className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted"
                type="button"
              >
                <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    ใช้ตำแหน่งล่าสุด
                  </p>
                  <p className="truncate text-[10px] text-foreground/50">
                    {savedLocation.address}
                  </p>
                </div>
              </button>
            )}

            {/* Pick new location */}
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              type="button"
            >
              <Crosshair className="h-4 w-4" />
              {savedLocation ? "เลือกตำแหน่งใหม่" : "เลือกตำแหน่ง"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Location info */}
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {address ||
                      `${nearBy.latitude.toFixed(4)}, ${nearBy.longitude.toFixed(4)}`}
                  </p>
                  <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">
                    รัศมี {nearBy.radiusKm} กม.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPicker(true)}
                className="rounded-md p-1 text-emerald-600 transition-colors hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                type="button"
                title="เปลี่ยนตำแหน่ง"
              >
                <PenLine className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Radius picker */}
            <div>
              <p className="mb-2 text-xs text-foreground/50">เลือกรัศมี</p>
              <div className="flex flex-wrap gap-1.5">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                      nearBy.radiusKm === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground/50 hover:bg-muted",
                    )}
                    type="button"
                  >
                    {r} กม.
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={handleLocationConfirm}
        initialLocation={
          nearBy
            ? { latitude: nearBy.latitude, longitude: nearBy.longitude }
            : savedLocation
              ? {
                  latitude: savedLocation.latitude,
                  longitude: savedLocation.longitude,
                }
              : undefined
        }
      />
    </>
  );
}
