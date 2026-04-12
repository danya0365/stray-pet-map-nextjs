import type { User } from "@supabase/supabase-js";

export interface AuthProfile {
  id: string;
  authId: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: "user" | "moderator" | "admin";
}

export interface IAuthRepository {
  getUser(): Promise<User | null>;
  getProfile(): Promise<AuthProfile | null>;
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
}
