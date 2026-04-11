"use client";

import { Marker } from "react-map-gl/maplibre";
import type { PetPost } from "@/domain/entities/pet-post";
import { cn } from "@/presentation/lib/cn";

const statusColor: Record<PetPost["status"], string> = {
  available: "bg-emerald-500",
  pending: "bg-amber-500",
  adopted: "bg-primary",
  missing: "bg-red-500",
};

interface PetMarkerProps {
  post: PetPost;
  isSelected?: boolean;
  onClick?: (post: PetPost) => void;
}

export function PetMarker({ post, isSelected, onClick }: PetMarkerProps) {
  return (
    <Marker
      latitude={post.latitude}
      longitude={post.longitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(post);
      }}
    >
      <button
        type="button"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform",
          statusColor[post.status],
          isSelected && "scale-125 ring-2 ring-primary ring-offset-2",
        )}
        aria-label={post.title}
      >
        <span className="text-base leading-none">
          {post.petType?.icon || "🐾"}
        </span>
      </button>
    </Marker>
  );
}
