export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      adoption_requests: {
        Row: {
          contact_line_id: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean
          message: string | null
          pet_post_id: string
          requester_profile_id: string
          status: Database["public"]["Enums"]["adoption_request_status"]
          updated_at: string | null
        }
        Insert: {
          contact_line_id?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          message?: string | null
          pet_post_id: string
          requester_profile_id: string
          status?: Database["public"]["Enums"]["adoption_request_status"]
          updated_at?: string | null
        }
        Update: {
          contact_line_id?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          message?: string | null
          pet_post_id?: string
          requester_profile_id?: string
          status?: Database["public"]["Enums"]["adoption_request_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adoption_requests_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_requests_requester_profile_id_fkey"
            columns: ["requester_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          pet_post_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pet_post_id: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pet_post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fb_scraped_posts: {
        Row: {
          animal_status: string | null
          animal_type: string | null
          author_name: string | null
          content: string | null
          created_at: string | null
          fb_post_id: string
          id: string
          image_urls: string[] | null
          is_processed: boolean | null
          latitude: number | null
          linked_pet_post_id: string | null
          location_text: string | null
          longitude: number | null
          posted_at: string | null
          scraped_at: string | null
          source_url: string | null
          storage_urls: string[] | null
          updated_at: string | null
        }
        Insert: {
          animal_status?: string | null
          animal_type?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          fb_post_id: string
          id?: string
          image_urls?: string[] | null
          is_processed?: boolean | null
          latitude?: number | null
          linked_pet_post_id?: string | null
          location_text?: string | null
          longitude?: number | null
          posted_at?: string | null
          scraped_at?: string | null
          source_url?: string | null
          storage_urls?: string[] | null
          updated_at?: string | null
        }
        Update: {
          animal_status?: string | null
          animal_type?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          fb_post_id?: string
          id?: string
          image_urls?: string[] | null
          is_processed?: boolean | null
          latitude?: number | null
          linked_pet_post_id?: string | null
          location_text?: string | null
          longitude?: number | null
          posted_at?: string | null
          scraped_at?: string | null
          source_url?: string | null
          storage_urls?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fb_scraped_posts_linked_pet_post_id_fkey"
            columns: ["linked_pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          pet_post_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          pet_post_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          pet_post_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pet_images_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_posts: {
        Row: {
          address: string | null
          breed: string | null
          color: string | null
          created_at: string | null
          description: string | null
          estimated_age: string | null
          gender: Database["public"]["Enums"]["pet_gender"]
          id: string
          is_active: boolean
          is_archived: boolean
          is_neutered: boolean | null
          is_vaccinated: boolean | null
          latitude: number
          longitude: number
          outcome: Database["public"]["Enums"]["pet_post_outcome"] | null
          pet_type_id: string | null
          profile_id: string
          province: string | null
          purpose: Database["public"]["Enums"]["pet_post_purpose"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["pet_post_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_age?: string | null
          gender?: Database["public"]["Enums"]["pet_gender"]
          id?: string
          is_active?: boolean
          is_archived?: boolean
          is_neutered?: boolean | null
          is_vaccinated?: boolean | null
          latitude: number
          longitude: number
          outcome?: Database["public"]["Enums"]["pet_post_outcome"] | null
          pet_type_id?: string | null
          profile_id: string
          province?: string | null
          purpose?: Database["public"]["Enums"]["pet_post_purpose"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["pet_post_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_age?: string | null
          gender?: Database["public"]["Enums"]["pet_gender"]
          id?: string
          is_active?: boolean
          is_archived?: boolean
          is_neutered?: boolean | null
          is_vaccinated?: boolean | null
          latitude?: number
          longitude?: number
          outcome?: Database["public"]["Enums"]["pet_post_outcome"] | null
          pet_type_id?: string | null
          profile_id?: string
          province?: string | null
          purpose?: Database["public"]["Enums"]["pet_post_purpose"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["pet_post_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_posts_pet_type_id_fkey"
            columns: ["pet_type_id"]
            isOneToOne: false
            referencedRelation: "pet_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_types: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_badges: {
        Row: {
          awarded_at: string
          color: string
          created_at: string
          description: string
          earned_value: number | null
          icon: string
          id: string
          name: string
          profile_id: string
          tier: Database["public"]["Enums"]["badge_tier"]
          type: Database["public"]["Enums"]["badge_type"]
        }
        Insert: {
          awarded_at?: string
          color: string
          created_at?: string
          description: string
          earned_value?: number | null
          icon: string
          id?: string
          name: string
          profile_id: string
          tier: Database["public"]["Enums"]["badge_tier"]
          type: Database["public"]["Enums"]["badge_type"]
        }
        Update: {
          awarded_at?: string
          color?: string
          created_at?: string
          description?: string
          earned_value?: number | null
          icon?: string
          id?: string
          name?: string
          profile_id?: string
          tier?: Database["public"]["Enums"]["badge_tier"]
          type?: Database["public"]["Enums"]["badge_type"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["profile_role"]
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          profile_id: string
          role?: Database["public"]["Enums"]["profile_role"]
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["profile_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          auth_id: string
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          last_login: string | null
          login_count: number
          phone: string | null
          preferences: Json
          privacy_settings: Json
          social_links: Json | null
          updated_at: string | null
          username: string | null
          verification_status: string
        }
        Insert: {
          address?: string | null
          auth_id: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          login_count?: number
          phone?: string | null
          preferences?: Json
          privacy_settings?: Json
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          verification_status?: string
        }
        Update: {
          address?: string | null
          auth_id?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          login_count?: number
          phone?: string | null
          preferences?: Json
          privacy_settings?: Json
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          pet_post_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_profile_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          pet_post_id: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_profile_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          pet_post_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_profile_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_profile_id_fkey"
            columns: ["reporter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profile_badge_counts: {
        Row: {
          avatar_url: string | null
          badge_count: number | null
          display_name: string | null
          last_awarded_at: string | null
          profile_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_post_stats: {
        Row: {
          community_cats: number | null
          found_owners: number | null
          lost_pet_posts: number | null
          profile_id: string | null
          rehome_posts: number | null
          successful_adoptions: number | null
          total_posts: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_and_award_badges: {
        Args: { target_profile_id: string }
        Returns: {
          badge_name: string
          badge_tier: string
        }[]
      }
      create_profile: {
        Args: { avatar_url?: string; full_name?: string; username: string }
        Returns: string
      }
      get_active_profile: {
        Args: never
        Returns: {
          address: string | null
          auth_id: string
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          last_login: string | null
          login_count: number
          phone: string | null
          preferences: Json
          privacy_settings: Json
          social_links: Json | null
          updated_at: string | null
          username: string | null
          verification_status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_active_profile_id: { Args: never; Returns: string }
      get_active_profile_role: {
        Args: never
        Returns: Database["public"]["Enums"]["profile_role"]
      }
      get_auth_user_by_id: { Args: { p_id: string }; Returns: Json }
      get_paginated_users: {
        Args: { p_limit?: number; p_page?: number }
        Returns: Json
      }
      get_private_url: {
        Args: { bucket: string; expires_in?: number; object_path: string }
        Returns: string
      }
      get_profile_role: {
        Args: { profile_id: string }
        Returns: Database["public"]["Enums"]["profile_role"]
      }
      get_user_profiles: {
        Args: never
        Returns: {
          address: string | null
          auth_id: string
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          last_login: string | null
          login_count: number
          phone: string | null
          preferences: Json
          privacy_settings: Json
          social_links: Json | null
          updated_at: string | null
          username: string | null
          verification_status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_moderator_or_admin: { Args: never; Returns: boolean }
      is_service_role: { Args: never; Returns: boolean }
      migrate_profile_roles: { Args: never; Returns: undefined }
      set_profile_active: { Args: { profile_id: string }; Returns: boolean }
      set_profile_role: {
        Args: {
          new_role: Database["public"]["Enums"]["profile_role"]
          target_profile_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      adoption_request_status: "pending" | "approved" | "rejected" | "cancelled"
      badge_tier: "bronze" | "silver" | "gold" | "platinum"
      badge_type:
        | "first_post"
        | "successful_adoption"
        | "pet_finder"
        | "rescue_hero"
        | "active_helper"
        | "super_helper"
        | "quick_responder"
        | "verified_rescuer"
      pet_gender: "male" | "female" | "unknown"
      pet_post_outcome:
        | "owner_found"
        | "rehomed"
        | "cancelled"
        | "expired"
        | "admin_closed"
      pet_post_purpose: "lost_pet" | "rehome_pet" | "community_cat"
      pet_post_status: "available" | "pending" | "adopted" | "missing"
      profile_role: "user" | "moderator" | "admin"
      report_reason:
        | "spam"
        | "fake_info"
        | "inappropriate"
        | "animal_abuse"
        | "other"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      adoption_request_status: ["pending", "approved", "rejected", "cancelled"],
      badge_tier: ["bronze", "silver", "gold", "platinum"],
      badge_type: [
        "first_post",
        "successful_adoption",
        "pet_finder",
        "rescue_hero",
        "active_helper",
        "super_helper",
        "quick_responder",
        "verified_rescuer",
      ],
      pet_gender: ["male", "female", "unknown"],
      pet_post_outcome: [
        "owner_found",
        "rehomed",
        "cancelled",
        "expired",
        "admin_closed",
      ],
      pet_post_purpose: ["lost_pet", "rehome_pet", "community_cat"],
      pet_post_status: ["available", "pending", "adopted", "missing"],
      profile_role: ["user", "moderator", "admin"],
      report_reason: [
        "spam",
        "fake_info",
        "inappropriate",
        "animal_abuse",
        "other",
      ],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
    },
  },
} as const

