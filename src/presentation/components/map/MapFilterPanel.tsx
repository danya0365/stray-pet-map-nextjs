"use client";

import type { PetPostFilters } from "@/application/repositories/IPetPostRepository";
import type {
  PetGender,
  PetPostPurpose,
  PetPostStatus,
  PetType,
} from "@/domain/entities/pet-post";
import { Badge } from "@/presentation/components/ui";
import { cn } from "@/presentation/lib/cn";
import { ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useState } from "react";

const purposeOptions: {
  value: PetPostPurpose;
  label: string;
  variant: "danger" | "success" | "primary";
  icon: string;
}[] = [
  { value: "lost_pet", label: "ตามหาเจ้าของ", variant: "danger", icon: "🚨" },
  { value: "rehome_pet", label: "หาบ้านใหม่", variant: "success", icon: "🏠" },
  { value: "community_cat", label: "แมวชุมชน", variant: "primary", icon: "🐱" },
];

const statusOptions: {
  value: PetPostStatus;
  label: string;
  variant: "success" | "warning" | "danger";
}[] = [
  { value: "available", label: "น้องหาบ้าน", variant: "success" },
  { value: "pending", label: "มีคนสนใจ", variant: "warning" },
  { value: "missing", label: "ตามหาน้อง", variant: "danger" },
];

const genderOptions: { value: PetGender; label: string }[] = [
  { value: "male", label: "ผู้" },
  { value: "female", label: "เมีย" },
  { value: "unknown", label: "ไม่ทราบ" },
];

interface MapFilterPanelProps {
  filters: PetPostFilters;
  onFiltersChange: (filters: PetPostFilters) => void;
  resultCount?: number;
  petTypes?: PetType[];
}

export function MapFilterPanel({
  filters,
  onFiltersChange,
  resultCount,
  petTypes,
}: MapFilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  const togglePurpose = useCallback(
    (purpose: PetPostPurpose) => {
      const current = filters.purpose
        ? Array.isArray(filters.purpose)
          ? filters.purpose
          : [filters.purpose]
        : [];
      const next = current.includes(purpose)
        ? current.filter((p) => p !== purpose)
        : [...current, purpose];
      onFiltersChange({
        ...filters,
        purpose: next.length > 0 ? next : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  const toggleStatus = useCallback(
    (status: PetPostStatus) => {
      const current = filters.status
        ? Array.isArray(filters.status)
          ? filters.status
          : [filters.status]
        : [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      onFiltersChange({
        ...filters,
        status: next.length > 0 ? next : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  const setPetType = useCallback(
    (petTypeId: string | undefined) => {
      onFiltersChange({ ...filters, petTypeId });
    },
    [filters, onFiltersChange],
  );

  const setGender = useCallback(
    (gender: PetGender | undefined) => {
      onFiltersChange({ ...filters, gender });
    },
    [filters, onFiltersChange],
  );

  const setBreed = useCallback(
    (breed: string) => {
      onFiltersChange({ ...filters, breed: breed || undefined });
    },
    [filters, onFiltersChange],
  );

  const setColor = useCallback(
    (color: string) => {
      onFiltersChange({ ...filters, color: color || undefined });
    },
    [filters, onFiltersChange],
  );

  const clearAll = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.purpose ||
    filters.status ||
    filters.petTypeId ||
    filters.gender ||
    filters.breed ||
    filters.color;

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Toggle Bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-foreground/50" />
          <span className="text-sm font-medium text-foreground/70">
            แผนที่สัตว์จร
          </span>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
            showFilters
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground/60 hover:bg-muted",
          )}
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          ตัวกรอง
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              showFilters && "rotate-180",
            )}
          />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-foreground/5"
            aria-label="ล้างตัวกรอง"
            type="button"
          >
            <X className="h-4 w-4 text-foreground/50" />
          </button>
        )}

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="shrink-0 text-xs text-foreground/40">
            {resultCount} ตัว
          </span>
        )}
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card p-4 shadow-sm">
          {/* Purpose */}
          <div>
            <p className="mb-2 text-xs font-medium text-foreground/50">
              🎯 จุดประสงค์
            </p>
            <div className="flex flex-wrap gap-1.5">
              {purposeOptions.map((opt) => {
                const isActive = filters.purpose
                  ? Array.isArray(filters.purpose)
                    ? filters.purpose.includes(opt.value)
                    : filters.purpose === opt.value
                  : false;
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePurpose(opt.value)}
                    type="button"
                  >
                    <Badge
                      variant={isActive ? opt.variant : "default"}
                      size="md"
                      className="cursor-pointer transition-colors"
                    >
                      {opt.icon} {opt.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-medium text-foreground/50">
              📊 สถานะ
            </p>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((opt) => {
                const isActive = filters.status
                  ? Array.isArray(filters.status)
                    ? filters.status.includes(opt.value)
                    : filters.status === opt.value
                  : false;
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleStatus(opt.value)}
                    type="button"
                  >
                    <Badge
                      variant={isActive ? opt.variant : "default"}
                      size="md"
                      className="cursor-pointer transition-colors"
                    >
                      {opt.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pet Type & Gender - Side by Side */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Pet Type */}
            {petTypes && petTypes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-foreground/50">
                  🐕 ชนิดสัตว์
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPetType(undefined)}
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                      !filters.petTypeId
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground/50 hover:bg-muted",
                    )}
                    type="button"
                  >
                    ทั้งหมด
                  </button>
                  {petTypes.map((pt) => (
                    <button
                      key={pt.id}
                      onClick={() => setPetType(pt.id)}
                      className={cn(
                        "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                        filters.petTypeId === pt.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground/50 hover:bg-muted",
                      )}
                      type="button"
                    >
                      {pt.icon} {pt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gender */}
            <div>
              <p className="mb-2 text-xs font-medium text-foreground/50">
                ♂♀ เพศ
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setGender(undefined)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                    !filters.gender
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground/50 hover:bg-muted",
                  )}
                  type="button"
                >
                  ทั้งหมด
                </button>
                {genderOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGender(opt.value)}
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                      filters.gender === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground/50 hover:bg-muted",
                    )}
                    type="button"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breed & Color */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-foreground/50">
                สายพันธุ์
              </p>
              <input
                type="text"
                value={filters.breed || ""}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="เช่น ไทย, เปอร์เซีย, ชิวาวา..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-foreground/50">สี</p>
              <input
                type="text"
                value={filters.color || ""}
                onChange={(e) => setColor(e.target.value)}
                placeholder="เช่น ส้ม, ดำ, ขาว, ลาย..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="self-start text-xs font-medium text-primary hover:underline"
              type="button"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  );
}
