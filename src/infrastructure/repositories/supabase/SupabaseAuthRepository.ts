import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { Database } from "@/domain/types/supabase";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return session;
  }

  async getProfile(): Promise<AuthProfile | null> {
    // Use RPC to get active profile
    const { data: profile, error } = await this.supabase
      .rpc("get_active_profile")
      .single();

    if (error || !profile) return null;

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
      createdAt: profile.created_at || undefined,
      level: profile.level ?? 1,
      totalPoints: profile.total_points ?? 0,
      experiencePoints: profile.experience_points ?? 0,
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
      .select(
        "id, auth_id, username, full_name, avatar_url, bio, created_at, level, total_points, experience_points",
      )
      .eq("auth_id", user.id);

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
          createdAt: profile.created_at || undefined,
          level: profile.level ?? 1,
          totalPoints: profile.total_points ?? 0,
          experiencePoints: profile.experience_points ?? 0,
        };
      }),
    );

    // ✅ Sort by role priority: admin > moderator > user, then by id
    const rolePriority: Record<string, number> = {
      admin: 0,
      moderator: 1,
      user: 2,
    };

    return profilesWithRoles.sort((a, b) => {
      const priorityA = rolePriority[a.role] ?? 2;
      const priorityB = rolePriority[b.role] ?? 2;

      // If same role, sort by id
      if (priorityA === priorityB) {
        return a.id.localeCompare(b.id);
      }

      return priorityA - priorityB;
    });
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
      .select(
        "id, auth_id, username, full_name, avatar_url, bio, created_at, level, total_points, experience_points",
      )
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
      createdAt: profile.created_at || undefined,
      level: profile.level ?? 1,
      totalPoints: profile.total_points ?? 0,
      experiencePoints: profile.experience_points ?? 0,
    };
  }

  async exchangeCodeForSession(
    code: string,
  ): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.exchangeCodeForSession(code);
    return { error: error?.message ?? null };
  }

  async updateProfile(data: {
    fullName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ profile: AuthProfile | null; error: string | null }> {
    const currentProfile = await this.getProfile();
    if (!currentProfile) {
      return { profile: null, error: "Profile not found" };
    }

    // Update profile
    const { error: updateError } = await this.supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        username: data.username,
        bio: data.bio,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentProfile.id);

    if (updateError) {
      return { profile: null, error: updateError.message };
    }

    // Return updated profile
    return { profile: await this.getProfile(), error: null };
  }

  async createProfile(data: {
    fullName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ profile: AuthProfile | null; error: string | null }> {
    const user = await this.getUser();
    if (!user) return { profile: null, error: "Not authenticated" };

    const { data: newProfile, error: insertError } = await this.supabase
      .from("profiles")
      .insert({
        auth_id: user.id,
        full_name: data.fullName,
        username: data.username,
        bio: data.bio,
        avatar_url: data.avatarUrl,
        is_active: false,
        level: 1,
        total_points: 0,
        experience_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        "id, auth_id, username, full_name, avatar_url, bio, created_at, level, total_points, experience_points",
      )
      .single();

    if (insertError || !newProfile) {
      return {
        profile: null,
        error: insertError?.message ?? "Failed to create profile",
      };
    }

    return {
      profile: {
        id: newProfile.id,
        authId: newProfile.auth_id,
        username: newProfile.username,
        fullName: newProfile.full_name,
        avatarUrl: newProfile.avatar_url,
        bio: newProfile.bio,
        role: "user",
        createdAt: newProfile.created_at || undefined,
        level: newProfile.level ?? 1,
        totalPoints: newProfile.total_points ?? 0,
        experiencePoints: newProfile.experience_points ?? 0,
      },
      error: null,
    };
  }

  async signInWithOAuth(
    provider: string,
  ): Promise<{ url: string | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: provider as "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    return {
      url: data?.url ?? null,
      error: error?.message ?? null,
    };
  }
}
