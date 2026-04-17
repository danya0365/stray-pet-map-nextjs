"use client";

import type { Badge, BadgeProgress } from "@/domain/entities/badge";
import type { PetPost } from "@/domain/entities/pet-post";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProfilePresenter, ProfileViewModel } from "./ProfilePresenter";
import { createClientProfilePresenter } from "./ProfilePresenterClientFactory";

export interface ProfilePresenterState {
  viewModel: ProfileViewModel | null;
  loading: boolean;
  error: string | null;
  isSwitchingProfile: boolean;
  isDeletingPost: string | null;
}

export interface ProfilePresenterActions {
  loadData: () => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  fetchBadges: (profileId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<boolean>;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for Profile presenter
 * ✅ Uses Zustand useAuthStore internally for shared state across the app
 * ✅ Navbar and ProfileView share the same data source
 */
export function useProfilePresenter(
  initialViewModel?: ProfileViewModel,
  presenterOverride?: ProfilePresenter,
): [ProfilePresenterState, ProfilePresenterActions] {
  // ✅ Use Zustand store for shared state (used by Navbar too)
  const {
    user,
    profile,
    profiles,
    isLoading,
    isSwitchingProfile,
    setUser,
    setProfile,
    setProfiles,
    setSwitchingProfile,
  } = useAuthStore();

  // ✅ Create presenter inside hook with useMemo
  const presenter = useMemo(
    () => presenterOverride ?? createClientProfilePresenter(),
    [presenterOverride],
  );

  // ✅ Track mounted state for memory leak protection
  const isMountedRef = useRef(true);

  // ✅ AbortController ref for canceling ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Badges state (local state, not in Zustand)
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);

  // Posts state (local state for client-side updates)
  const [posts, setPosts] = useState<PetPost[]>(initialViewModel?.posts || []);
  const [isDeletingPost, setIsDeletingPost] = useState<string | null>(null);

  // Update posts when initialViewModel changes
  useEffect(() => {
    if (initialViewModel?.posts) {
      setPosts(initialViewModel.posts);
    }
  }, [initialViewModel?.posts]);

  // Build viewModel from Zustand store
  // ✅ Profiles are already sorted by createdAt at repository level
  const viewModel: ProfileViewModel | null = useMemo(() => {
    if (!user) return null;
    return {
      user,
      profile,
      profiles: profiles || [],
      hasMultipleProfiles: (profiles || []).length > 1,
      badges: badges || [],
      totalBadges: badges?.length || 0,
      badgeProgress: badgeProgress || [],
      posts: posts || [],
      totalPosts: posts?.length || 0,
      stats: {
        posts: posts?.length || 0,
        helped:
          posts?.filter(
            (p) => p.outcome === "rehomed" || p.outcome === "owner_found",
          ).length || 0,
        points: 0, // TODO: Get from gamification system when implemented
      },
    };
  }, [user, profile, profiles, badges, badgeProgress, posts]);

  const loading = isLoading;

  // Sync initialViewModel to Zustand on mount if provided
  // Data already sorted by created_at from DB query
  useEffect(() => {
    if (initialViewModel && !user) {
      if (initialViewModel.user) setUser(initialViewModel.user);
      if (initialViewModel.profile) setProfile(initialViewModel.profile);
      if (initialViewModel.profiles) setProfiles(initialViewModel.profiles);
    }
  }, []); // Run once on mount

  /**
   * Load data from presenter
   */
  const loadData = useCallback(async () => {
    // ✅ Cancel any previous pending request
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setError(null);

    try {
      const newViewModel = await presenter.getViewModel();
      if (isMountedRef.current) {
        // Update Zustand store with fetched data
        // Data already sorted by created_at from DB query
        if (newViewModel.user) setUser(newViewModel.user);
        if (newViewModel.profile) setProfile(newViewModel.profile);
        if (newViewModel.profiles) setProfiles(newViewModel.profiles);
        // Update local badges state
        setBadges(newViewModel.badges || []);
        setBadgeProgress(newViewModel.badgeProgress || []);
      }
    } catch (err) {
      // ✅ Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") return;

      if (isMountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error loading profile data:", err);
      }
    }
  }, [presenter, setUser, setProfile, setProfiles]);

  /**
   * Switch to a different profile
   */
  const switchProfile = useCallback(
    async (profileId: string) => {
      if (isSwitchingProfile) return;

      setSwitchingProfile(true);
      setError(null);

      try {
        const newProfile = await presenter.switchProfile(profileId);
        if (isMountedRef.current && newProfile) {
          // Update Zustand store with new profile
          setProfile(newProfile);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          setError(errorMessage);
          console.error("Error switching profile:", err);
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setSwitchingProfile(false);
        }
      }
    },
    [isSwitchingProfile, presenter, setProfile, setSwitchingProfile],
  );

  /**
   * Refresh profiles list
   */
  const refreshProfiles = useCallback(async () => {
    try {
      const newProfiles = await presenter.getProfiles();
      if (isMountedRef.current) {
        // Data already sorted by created_at from DB query
        setProfiles(newProfiles);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Error refreshing profiles:", err);
      }
    }
  }, [presenter, setProfiles]);

  /**
   * Fetch badges for a specific profile
   */
  const fetchBadges = useCallback(
    async (profileId: string) => {
      try {
        const [newBadges, newProgress] = await Promise.all([
          presenter.getBadges(profileId),
          presenter.getBadgeProgress(profileId),
        ]);
        if (isMountedRef.current) {
          setBadges(newBadges || []);
          setBadgeProgress(newProgress || []);
        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error("Error fetching badges:", err);
        }
      }
    },
    [presenter],
  );

  /**
   * Delete a pet post
   */
  const deletePost = useCallback(
    async (postId: string) => {
      setIsDeletingPost(postId);
      setError(null);

      try {
        const success = await presenter.deletePost(postId);
        if (isMountedRef.current && success) {
          // Remove post from local state
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }
        return success;
      } catch (err) {
        if (isMountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to delete post";
          setError(errorMessage);
          console.error("Error deleting post:", err);
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsDeletingPost(null);
        }
      }
    },
    [presenter],
  );

  // Load data on mount if no user data in store
  useEffect(() => {
    if (!user && !initialViewModel) {
      loadData();
    }
  }, [loadData, user, initialViewModel]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return [
    {
      viewModel,
      loading,
      error,
      isSwitchingProfile,
      isDeletingPost,
    },
    {
      loadData,
      switchProfile,
      refreshProfiles,
      fetchBadges,
      deletePost,
      setError,
    },
  ];
}
