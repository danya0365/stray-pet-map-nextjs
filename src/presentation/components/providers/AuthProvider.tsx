"use client";

/**
 * AuthProvider
 * ✅ Uses ApiAuthRepository — no direct Supabase access from client
 * ✅ Fetches user + profile + all profiles on mount via presenter pattern
 */

import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useEffect, useRef } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setProfiles, setInitialized, reset } =
    useAuthStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      const authRepo = new ApiAuthRepository();
      const [user, profile, allProfiles] = await Promise.all([
        authRepo.getUser(),
        authRepo.getProfile(),
        authRepo.getProfiles(),
      ]);

      if (user) {
        setUser(user);
        setProfile(profile);
        setProfiles(allProfiles);
      } else {
        reset();
      }
      setInitialized();
    };

    init();
  }, [setUser, setProfile, setProfiles, setInitialized, reset]);

  return <>{children}</>;
}
