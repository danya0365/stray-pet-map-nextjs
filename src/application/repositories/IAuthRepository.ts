import type { Session, User } from "@supabase/supabase-js";

export interface AuthProfile {
  id: string;
  authId: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: "user" | "moderator" | "admin";
  createdAt?: string; // For consistent sorting
  // Gamification fields
  level?: number;
  totalPoints?: number;
  experiencePoints?: number;
}

export interface IAuthRepository {
  getUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  getProfile(): Promise<AuthProfile | null>;
  getProfiles(): Promise<AuthProfile[]>;
  switchProfile(profileId: string): Promise<AuthProfile | null>;
  signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: string | null }>;
  signUp(
    email: string,
    password: string,
    metadata?: { full_name?: string; username?: string },
  ): Promise<{ user: User | null; error: string | null }>;
  signOut(): Promise<void>;
  /**
   * Exchange OAuth code for session
   * Used by /auth/callback route
   */
  exchangeCodeForSession(code: string): Promise<{ error: string | null }>;
  /**
   * Sign in with OAuth provider (Google, etc.)
   * Returns URL to redirect user to provider's auth page
   */
  signInWithOAuth(
    provider: string,
  ): Promise<{ url: string | null; error: string | null }>;
  /**
   * Update current profile
   */
  updateProfile(data: {
    fullName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ profile: AuthProfile | null; error: string | null }>;
}
