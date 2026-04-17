import type { IPublicProfileRepository } from "@/application/repositories/IPublicProfileRepository";
import type {
  PublicProfile,
  PublicProfileWithPosts,
  PublicProfileSummary,
} from "@/domain/entities/public-profile";
import type { PetPost } from "@/domain/entities/pet-post";

/**
 * ApiPublicProfileRepository
 * Client-side implementation สำหรับดึง public profile data
 * ✅ No authentication required
 * ✅ Calls public API endpoints
 */
export class ApiPublicProfileRepository implements IPublicProfileRepository {
  async getById(profileId: string): Promise<PublicProfile | null> {
    const res = await fetch(`/api/profiles/${profileId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch public profile");
    }

    const data = await res.json();
    return data.profile || null;
  }

  async getByIdWithPosts(
    profileId: string,
  ): Promise<PublicProfileWithPosts | null> {
    const [profileRes, postsRes] = await Promise.all([
      fetch(`/api/profiles/${profileId}`),
      fetch(`/api/profiles/${profileId}/posts`),
    ]);

    if (!profileRes.ok) {
      if (profileRes.status === 404) return null;
      throw new Error("Failed to fetch public profile");
    }

    const profileData = await profileRes.json();
    const postsData = postsRes.ok ? await postsRes.json() : { posts: [] };

    return {
      ...profileData.profile,
      posts: postsData.posts || [],
    };
  }

  async getPosts(
    profileId: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<{
    posts: PetPost[];
    total: number;
    hasMore: boolean;
  }> {
    const res = await fetch(
      `/api/profiles/${profileId}/posts?page=${page}&perPage=${perPage}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch profile posts");
    }

    const data = await res.json();
    return {
      posts: data.posts || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
    };
  }

  async getTopProfiles(limit: number = 10): Promise<PublicProfileSummary[]> {
    const res = await fetch(`/api/profiles/top?limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch top profiles");
    }

    const data = await res.json();
    return data.profiles || [];
  }

  async exists(profileId: string): Promise<boolean> {
    const res = await fetch(`/api/profiles/${profileId}/exists`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.exists || false;
  }
}
