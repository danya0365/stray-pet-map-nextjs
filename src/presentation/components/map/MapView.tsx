"use client";

import type { PetPost } from "@/domain/entities/pet-post";
import type { MapViewModel } from "@/presentation/presenters/map/MapPresenter";
import { useMapPresenter } from "@/presentation/presenters/map/useMapPresenter";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { MapContainer } from "./MapContainer";
import { MapFilterPanel } from "./MapFilterPanel";
import { MarkerPopup } from "./MarkerPopup";
import { PetMarker } from "./PetMarker";

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

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      actions.setFilters(newFilters);
    },
    [actions],
  );

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      {/* Filter Panel */}
      <div className="absolute left-0 right-0 top-0 z-10 px-4 pt-4">
        <div className="mx-auto max-w-6xl rounded-xl border border-border/40 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-md">
          <MapFilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            resultCount={viewModel?.posts.length}
            petTypes={viewModel?.petTypes}
          />
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
