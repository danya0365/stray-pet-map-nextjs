"use client";

/**
 * AuthProvider
 * ✅ Uses ApiAuthRepository — no direct Supabase access from client
 * ✅ Fetches user + profile on mount via presenter pattern
 */

import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useEffect, useRef } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setInitialized, reset } = useAuthStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      const authRepo = new ApiAuthRepository();
      const [user, profile] = await Promise.all([
        authRepo.getUser(),
        authRepo.getProfile(),
      ]);

      if (user) {
        setUser(user);
        setProfile(profile);
      } else {
        reset();
      }
      setInitialized();
    };

    init();
  }, [setUser, setProfile, setInitialized, reset]);

  return <>{children}</>;
}
