"use client";

/**
 * useAuthPresenter
 * Custom hook for Auth presenter state management
 * ✅ Uses presenter pattern with API repository injection
 */

import { useCallback, useMemo, useRef, useState } from "react";
import type { AuthPresenter, AuthViewModel } from "./AuthPresenter";
import { createClientAuthPresenter } from "./AuthPresenterClientFactory";

// ── State ────────────────────────────────────────────────

export interface AuthPresenterState {
  viewModel: AuthViewModel | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
}

// ── Actions ──────────────────────────────────────────────

export interface AuthPresenterActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// ── Hook ─────────────────────────────────────────────────

export function useAuthPresenter(
  presenterOverride?: AuthPresenter,
): [AuthPresenterState, AuthPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientAuthPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [viewModel] = useState<AuthViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const result = await presenter.signIn(email, password);

        if (isMountedRef.current) {
          if (result.success) {
            setIsSuccess(true);
            return true;
          } else {
            setError(result.error || "เข้าสู่ระบบไม่สำเร็จ");
            return false;
          }
        }
        return result.success;
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
          setError(message);
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const result = await presenter.signUp(email, password, {
          full_name: fullName,
        });

        if (isMountedRef.current) {
          if (result.success) {
            setIsSuccess(true);
            return true;
          } else {
            setError(result.error || "สมัครสมาชิกไม่สำเร็จ");
            return false;
          }
        }
        return result.success;
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ";
          setError(message);
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await presenter.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }, [presenter]);

  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await presenter.signInWithGoogle();

      if (isMountedRef.current) {
        if (result.success && result.url) {
          return result.url;
        } else {
          setError(result.error || "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
          return null;
        }
      }
      return result.success ? (result.url ?? null) : null;
    } catch (err) {
      if (isMountedRef.current) {
        const message =
          err instanceof Error
            ? err.message
            : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ";
        setError(message);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [presenter]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return [
    { viewModel, loading, error, isSuccess },
    { signIn, signInWithGoogle, signUp, signOut, clearError },
  ];
}
