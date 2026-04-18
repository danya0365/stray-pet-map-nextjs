/**
 * AuthPresenter
 * Handles business logic for authentication
 * Receives repository via dependency injection
 */

import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { User } from "@supabase/supabase-js";

// ============================================================
// VIEW MODEL
// ============================================================

export interface AuthViewModel {
  user: User | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
}

// ============================================================
// PRESENTER
// ============================================================

export class AuthPresenter {
  constructor(private readonly authRepository: IAuthRepository) {}

  // ── View Model ───────────────────────────────────────────

  async getViewModel(): Promise<AuthViewModel> {
    try {
      const [user, profile] = await Promise.all([
        this.authRepository.getUser(),
        this.authRepository.getProfile(),
      ]);

      return {
        user,
        profile,
        isAuthenticated: !!user,
      };
    } catch (error) {
      console.error("Error getting auth view model:", error);
      return { user: null, profile: null, isAuthenticated: false };
    }
  }

  // ── Auth Actions ─────────────────────────────────────────

  async signIn(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { user, error } = await this.authRepository.signInWithPassword(
        email,
        password,
      );

      if (error || !user) {
        return { success: false, error: error || "เข้าสู่ระบบไม่สำเร็จ" };
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ";
      return { success: false, error: message };
    }
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const username = email.split("@")[0];
      const { user, error } = await this.authRepository.signUp(
        email,
        password,
        { full_name: fullName, username },
      );

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "สมัครสมาชิกไม่สำเร็จ";
      return { success: false, error: message };
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.authRepository.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // ── Getters ──────────────────────────────────────────────

  async getUser(): Promise<User | null> {
    try {
      return await this.authRepository.getUser();
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getProfile(): Promise<AuthProfile | null> {
    try {
      return await this.authRepository.getProfile();
    } catch (error) {
      console.error("Error getting profile:", error);
      return null;
    }
  }
}
