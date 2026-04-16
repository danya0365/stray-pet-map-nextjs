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

  async getProfiles(): Promise<AuthProfile[]> {
    const user = await this.getUser();
    if (!user) return [];

    // Fetch ALL profiles for this user (not just active ones)
    // so the switcher can show all available profiles
    const { data: profilesData, error } = await this.supabase
      .from("profiles")
      .select("id, auth_id, username, full_name, avatar_url, bio")
      .eq("auth_id", user.id)
      .order("created_at", { ascending: true });

    if (error || !profilesData) return [];

    // Get roles for all profiles
    const profilesWithRoles = await Promise.all(
      profilesData.map(async (profile) => {
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
      }),
    );

    return profilesWithRoles;
  }

  async switchProfile(profileId: string): Promise<AuthProfile | null> {
    const user = await this.getUser();
    if (!user) return null;

    // 1. Call RPC to set active profile (like live-learning pattern)
    const { data: success, error: rpcError } = await this.supabase.rpc(
      "set_profile_active",
      {
        profile_id: profileId,
      },
    );

    if (rpcError || !success) {
      console.error("Failed to switch profile via RPC:", rpcError);
      // Fallback: continue without RPC if it doesn't exist
    }

    // 2. Get the profile data
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("id, auth_id, username, full_name, avatar_url, bio")
      .eq("id", profileId)
      .eq("auth_id", user.id)
      .eq("is_active", true)
      .single();

    if (profileError || !profile) return null;

    // 3. Get role for the profile
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
}
