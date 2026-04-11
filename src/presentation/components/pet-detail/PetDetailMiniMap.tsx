"use client";

import { Marker } from "react-map-gl/maplibre";
import { MapContainer } from "@/presentation/components/map/MapContainer";

interface PetDetailMiniMapProps {
  latitude: number;
  longitude: number;
  icon?: string;
}

export function PetDetailMiniMap({
  latitude,
  longitude,
  icon = "🐾",
}: PetDetailMiniMapProps) {
  return (
    <MapContainer
      initialCenter={{ latitude, longitude }}
      initialZoom={15}
      className="h-64 w-full overflow-hidden rounded-xl"
    >
      <Marker latitude={latitude} longitude={longitude} anchor="bottom">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg">
          <span className="text-lg leading-none">{icon}</span>
        </div>
      </Marker>
    </MapContainer>
  );
}
