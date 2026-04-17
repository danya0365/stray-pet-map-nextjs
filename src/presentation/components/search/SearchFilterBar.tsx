"use client";

import type { PetPostFilters } from "@/application/repositories/IPetPostRepository";
import type {
  PetGender,
  PetPostStatus,
  PetType,
} from "@/domain/entities/pet-post";
import { Badge } from "@/presentation/components/ui";
import { cn } from "@/presentation/lib/cn";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const statusOptions: {
  value: PetPostStatus;
  label: string;
  variant: "success" | "warning" | "danger" | "primary";
}[] = [
  { value: "available", label: "น้องหาบ้าน", variant: "success" },
  { value: "pending", label: "มีคนสนใจ", variant: "warning" },
  { value: "missing", label: "ตามหาน้อง", variant: "danger" },
  { value: "adopted", label: "มีบ้านแล้ว", variant: "primary" },
];

const fallbackPetTypeOptions = [
  { value: "type-dog", label: "🐕 สุนัข" },
  { value: "type-cat", label: "🐈 แมว" },
];

const genderOptions: { value: PetGender; label: string }[] = [
  { value: "male", label: "ผู้" },
  { value: "female", label: "เมีย" },
  { value: "unknown", label: "ไม่ทราบ" },
];

interface SearchFilterBarProps {
  filters: PetPostFilters;
  search: string;
  onSearchChange: (text: string) => void;
  onFiltersChange: (filters: PetPostFilters) => void;
  resultCount?: number;
  petTypes?: PetType[];
}

export function SearchFilterBar({
  filters,
  search,
  onSearchChange,
  onFiltersChange,
  resultCount,
  petTypes,
}: SearchFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 400);
    },
    [onSearchChange],
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
    setSearchInput("");
    onSearchChange("");
    onFiltersChange({});
  }, [onSearchChange, onFiltersChange]);

  const hasActiveFilters =
    search ||
    filters.status ||
    filters.petTypeId ||
    filters.gender ||
    filters.breed ||
    filters.color;

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="ค้นหาน้องหมา น้องแมว..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-primary"
          />
          {searchInput && (
            <button
              onClick={() => handleSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-foreground/5"
              type="button"
            >
              <X className="h-3.5 w-3.5 text-foreground/40" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
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
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card p-4">
          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-medium text-foreground/50">สถานะ</p>
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

          {/* Pet Type */}
          <div>
            <p className="mb-2 text-xs font-medium text-foreground/50">
              ชนิดสัตว์
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
              {(petTypes && petTypes.length > 0
                ? petTypes.map((pt) => ({
                    value: pt.id,
                    label: `${pt.icon} ${pt.name}`,
                  }))
                : fallbackPetTypeOptions
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPetType(opt.value)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                    filters.petTypeId === opt.value
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

          {/* Gender */}
          <div>
            <p className="mb-2 text-xs font-medium text-foreground/50">เพศ</p>
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

          {/* Clear */}
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

      {/* Result count */}
      {resultCount !== undefined && (
        <p className="text-xs text-foreground/40">พบ {resultCount} รายการ</p>
      )}
    </div>
  );
}
