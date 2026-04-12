import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  async getProfile(): Promise<AuthProfile | null> {
    const user = await this.getUser();
    if (!user) return null;

    const { data: profiles } = await this.supabase
      .from("profiles")
      .select("id, auth_id, username, full_name, avatar_url, bio")
      .eq("auth_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1);

    const profile = profiles?.[0] ?? null;
    if (!profile) return null;

    // Get role
    const { data: roleData } = await this.supabase
      .from("profile_roles")
      .select("role")
      .eq("profile_id", profile.id)
      .single();

    return {
      id: profile.id,
      authId: profile.auth_id,
      username: profile.username,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      role: (roleData?.role as AuthProfile["role"]) ?? "user",
    };
  }

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      error: error?.message ?? null,
    };
  }

  async signUp(
    email: string,
    password: string,
    metadata?: { full_name?: string; username?: string },
  ): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    return {
      user: data.user,
      error: error?.message ?? null,
    };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
