"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationState {
  location: LocationData | null;
  setLocation: (location: LocationData | null) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => set({ location }),
      clearLocation: () => set({ location: null }),
    }),
    {
      name: "stray-pet-map-location",
    },
  ),
);
