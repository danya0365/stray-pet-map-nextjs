import type { AuthProfile } from "@/application/repositories/IAuthRepository";
import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: () => set({ isInitialized: true, isLoading: false }),
  reset: () => set({ user: null, profile: null, isLoading: false }),
}));
