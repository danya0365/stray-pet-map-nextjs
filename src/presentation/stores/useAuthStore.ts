import type { AuthProfile } from "@/application/repositories/IAuthRepository";
import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  profile: AuthProfile | null;
  profiles: AuthProfile[];
  isLoading: boolean;
  isInitialized: boolean;
  isSwitchingProfile: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setProfiles: (profiles: AuthProfile[]) => void;
  switchProfile: (profileId: string) => void;
  setLoading: (loading: boolean) => void;
  setSwitchingProfile: (switching: boolean) => void;
  setInitialized: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  profiles: [],
  isLoading: true,
  isInitialized: false,
  isSwitchingProfile: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setProfiles: (profiles) => set({ profiles }),
  switchProfile: (profileId) =>
    set((state) => {
      const newProfile = state.profiles.find((p) => p.id === profileId);
      if (newProfile) {
        return { profile: newProfile };
      }
      return state;
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setSwitchingProfile: (isSwitchingProfile) => set({ isSwitchingProfile }),
  setInitialized: () => set({ isInitialized: true, isLoading: false }),
  reset: () =>
    set({
      user: null,
      profile: null,
      profiles: [],
      isLoading: false,
      isSwitchingProfile: false,
    }),
}));
