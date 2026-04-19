/**
 * AuthPresenter
 * Handles business logic for authentication
 * Receives repository via dependency injection
 * Following Clean Architecture pattern
 */

import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { Session, User } from "@supabase/supabase-js";

// ============================================================
// VIEW MODEL (For UI Components)
// ============================================================

export interface AuthViewModel {
  user: User | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
}

// ============================================================
// RESULT TYPES (For API Routes)
// ============================================================

export interface LoginResult {
  success: boolean;
  user?: User | null;
  accessToken?: string;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: User | null;
  error?: string;
}

export interface LogoutResult {
  success: boolean;
  error?: string;
}

export interface SessionResult {
  success: boolean;
  session?: Session | null;
  error?: string;
}

export interface MeResult {
  success: boolean;
  user?: User | null;
  profile?: AuthProfile | null;
  error?: string;
}

export interface GetProfilesResult {
  success: boolean;
  profiles?: AuthProfile[];
  error?: string;
}

export interface SwitchProfileResult {
  success: boolean;
  profile?: AuthProfile | null;
  error?: string;
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

  // ============================================================
  // AUTH ACTIONS (Unified for UI & API)
  // ============================================================

  /**
   * Sign in with email and password
   * Used by /api/auth/login POST route and UI components
   */
  async signIn(email: string, password: string): Promise<LoginResult> {
    try {
      if (!email || !password) {
        return { success: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" };
      }

      const { user, error } = await this.authRepository.signInWithPassword(
        email,
        password,
      );

      if (error) {
        const message =
          error === "Invalid login credentials"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : error;
        return { success: false, error: message };
      }

      // Get session for access token
      const session = await this.authRepository.getSession();

      return {
        success: true,
        user,
        accessToken: session?.access_token,
      };
    } catch (error) {
      console.error("Error signing in:", error);
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sign up with email and password
   * Used by /api/auth/register POST route and UI components
   */
  async signUp(
    email: string,
    password: string,
    metadata?: { full_name?: string; username?: string },
  ): Promise<RegisterResult> {
    try {
      if (!email || !password) {
        return { success: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" };
      }

      const { user, error } = await this.authRepository.signUp(
        email,
        password,
        metadata,
      );

      if (error) {
        const message =
          error === "User already registered" ? "อีเมลนี้ถูกใช้งานแล้ว" : error;
        return { success: false, error: message };
      }

      return { success: true, user };
    } catch (error) {
      console.error("Error signing up:", error);
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sign out
   * Used by /api/auth/logout POST route and UI components
   */
  async signOut(): Promise<LogoutResult> {
    try {
      await this.authRepository.signOut();
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get current session
   * Used by /api/auth/session GET route
   */
  async getSession(): Promise<SessionResult> {
    try {
      const session = await this.authRepository.getSession();
      return { success: true, session };
    } catch (error) {
      console.error("Error getting session:", error);
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get current user and profile
   * Used by /api/auth/me GET route
   */
  async getCurrentUser(): Promise<MeResult> {
    try {
      const user = await this.authRepository.getUser();

      if (!user) {
        return { success: true, user: null, profile: null };
      }

      const profile = await this.authRepository.getProfile();

      return { success: true, user, profile };
    } catch (error) {
      console.error("Error getting current user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get all profiles for current user
   * Used by /api/auth/profiles GET route
   */
  async getProfiles(): Promise<GetProfilesResult> {
    try {
      const profiles = await this.authRepository.getProfiles();
      return { success: true, profiles };
    } catch (error) {
      console.error("Error getting profiles:", error);
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Switch to a different profile
   * Used by /api/auth/switch-profile POST route
   */
  async switchProfile(profileId: string): Promise<SwitchProfileResult> {
    try {
      // Check if user is authenticated
      const user = await this.authRepository.getUser();
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }

      if (!profileId) {
        return { success: false, error: "Profile ID is required" };
      }

      const profile = await this.authRepository.switchProfile(profileId);

      if (!profile) {
        return {
          success: false,
          error: "Profile not found or access denied",
        };
      }

      return { success: true, profile };
    } catch (error) {
      console.error("Error switching profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      return { success: false, error: errorMessage };
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
