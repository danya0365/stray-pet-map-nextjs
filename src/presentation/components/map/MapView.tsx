"use client";

import type { PetPost, PetPostStatus } from "@/domain/entities/pet-post";
import { Badge } from "@/presentation/components/ui";
import type { MapViewModel } from "@/presentation/presenters/map/MapPresenter";
import { useMapPresenter } from "@/presentation/presenters/map/useMapPresenter";
import { Filter, Loader2, X } from "lucide-react";
import { useCallback } from "react";
import { MapContainer } from "./MapContainer";
import { MarkerPopup } from "./MarkerPopup";
import { PetMarker } from "./PetMarker";

const statusFilters: {
  value: PetPostStatus;
  label: string;
  variant: "success" | "warning" | "danger";
}[] = [
  { value: "available", label: "น้องหาบ้าน", variant: "success" },
  { value: "pending", label: "มีคนสนใจ", variant: "warning" },
  { value: "missing", label: "ตามหาน้อง", variant: "danger" },
];

interface MapViewProps {
  initialViewModel?: MapViewModel;
}

export function MapView({ initialViewModel }: MapViewProps) {
  const [state, actions] = useMapPresenter(initialViewModel);
  const { viewModel, loading, error, selectedPost, filters } = state;

  const handleMarkerClick = useCallback(
    (post: PetPost) => {
      actions.selectPost(post);
    },
    [actions],
  );

  const handlePopupClose = useCallback(() => {
    actions.selectPost(null);
  }, [actions]);

  const toggleStatusFilter = useCallback(
    (status: PetPostStatus) => {
      const currentStatuses = filters.status
        ? Array.isArray(filters.status)
          ? filters.status
          : [filters.status]
        : [];

      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];

      actions.setFilters({
        ...filters,
        status: newStatuses.length > 0 ? newStatuses : undefined,
      });
    },
    [filters, actions],
  );

  const hasActiveFilters = filters.status !== undefined;

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      {/* Filter Bar */}
      <div className="absolute left-0 right-0 top-0 z-10 px-4 pt-4">
        <div className="mx-auto flex max-w-6xl items-center gap-2 rounded-xl border border-border/40 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-md">
          <Filter className="h-4 w-4 shrink-0 text-foreground/50" />

          <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
            {statusFilters.map((sf) => {
              const isActive = filters.status
                ? Array.isArray(filters.status)
                  ? filters.status.includes(sf.value)
                  : filters.status === sf.value
                : false;

              return (
                <button
                  key={sf.value}
                  onClick={() => toggleStatusFilter(sf.value)}
                  type="button"
                >
                  <Badge
                    variant={isActive ? sf.variant : "default"}
                    size="md"
                    className="cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {sf.label}
                  </Badge>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => actions.setFilters({})}
              className="shrink-0 rounded-full p-1 transition-colors hover:bg-foreground/5"
              aria-label="ล้างตัวกรอง"
              type="button"
            >
              <X className="h-4 w-4 text-foreground/50" />
            </button>
          )}

          {/* Stats */}
          {viewModel && (
            <span className="shrink-0 text-xs text-foreground/40">
              {viewModel.posts.length} ตัว
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        {loading && !viewModel && (
          <div className="flex h-full items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !viewModel && (
          <div className="flex h-full items-center justify-center bg-muted">
            <div className="text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => actions.loadData()}
                className="mt-2 text-sm text-primary hover:underline"
                type="button"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        )}

        {(viewModel || !loading) && (
          <MapContainer className="h-full w-full">
            {viewModel?.posts.map((post) => (
              <PetMarker
                key={post.id}
                post={post}
                isSelected={selectedPost?.id === post.id}
                onClick={handleMarkerClick}
              />
            ))}

            {selectedPost && (
              <MarkerPopup post={selectedPost} onClose={handlePopupClose} />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
