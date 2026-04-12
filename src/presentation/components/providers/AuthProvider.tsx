"use client";

import { createClient } from "@/infrastructure/supabase/client";
import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useEffect, useRef } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setInitialized, reset } = useAuthStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const supabase = createClient();
    const authRepo = new SupabaseAuthRepository(supabase);

    // Initial load
    const init = async () => {
      const user = await authRepo.getUser();
      if (user) {
        setUser(user);
        const profile = await authRepo.getProfile();
        setProfile(profile);
      }
      setInitialized();
    };

    init();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        const profile = await authRepo.getProfile();
        setProfile(profile);
      } else if (event === "SIGNED_OUT") {
        reset();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setInitialized, reset]);

  return <>{children}</>;
}
