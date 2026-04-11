"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useRef, type ReactNode } from "react";
import {
  GeolocateControl,
  Map,
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";

const THAILAND_CENTER = { latitude: 13.7563, longitude: 100.5018 };
const DEFAULT_ZOOM = 11;
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

interface MapContainerProps {
  children?: ReactNode;
  initialCenter?: { latitude: number; longitude: number };
  initialZoom?: number;
  onMoveEnd?: (
    center: { latitude: number; longitude: number },
    zoom: number,
  ) => void;
  className?: string;
}

export function MapContainer({
  children,
  initialCenter = THAILAND_CENTER,
  initialZoom = DEFAULT_ZOOM,
  onMoveEnd,
  className,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  const handleMoveEnd = useCallback(
    (evt: ViewStateChangeEvent) => {
      if (onMoveEnd) {
        onMoveEnd(
          {
            latitude: evt.viewState.latitude,
            longitude: evt.viewState.longitude,
          },
          evt.viewState.zoom,
        );
      }
    },
    [onMoveEnd],
  );

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          zoom: initialZoom,
        }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        onMoveEnd={handleMoveEnd}
        attributionControl={false}
        maxZoom={18}
        minZoom={5}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" trackUserLocation />
        {children}
      </Map>
    </div>
  );
}
