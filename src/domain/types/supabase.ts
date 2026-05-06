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
      comment_gamification_log: {
        Row: {
          action: string
          comment_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          points_awarded: number
          profile_id: string
        }
        Insert: {
          action: string
          comment_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points_awarded?: number
          profile_id: string
        }
        Update: {
          action?: string
          comment_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points_awarded?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_gamification_log_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_gamification_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          profile_id: string
          reaction_type: Database["public"]["Enums"]["comment_reaction_type"]
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          profile_id: string
          reaction_type?: Database["public"]["Enums"]["comment_reaction_type"]
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          reaction_type?: Database["public"]["Enums"]["comment_reaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          deleted_reason: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          like_count: number
          parent_comment_id: string | null
          pet_post_id: string
          profile_id: string
          reply_count: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_reason?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          like_count?: number
          parent_comment_id?: string | null
          pet_post_id: string
          profile_id: string
          reply_count?: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_reason?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          like_count?: number
          parent_comment_id?: string | null
          pet_post_id?: string
          profile_id?: string
          reply_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          donor_email: string | null
          donor_id: string | null
          donor_name: string
          id: string
          is_anonymous: boolean | null
          message: string | null
          payment_method: string
          payment_status: string
          pet_post_id: string | null
          points_awarded: number
          show_on_leaderboard: boolean | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method: string
          payment_status?: string
          pet_post_id?: string | null
          points_awarded?: number
          show_on_leaderboard?: boolean | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          target_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string
          payment_status?: string
          pet_post_id?: string | null
          points_awarded?: number
          show_on_leaderboard?: boolean | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
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
      pet_post_funding_goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          is_active: boolean
          pet_post_id: string
          target_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          goal_type: string
          id?: string
          is_active?: boolean
          pet_post_id: string
          target_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean
          pet_post_id?: string
          target_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_post_funding_goals_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_post_likes: {
        Row: {
          created_at: string
          id: string
          pet_post_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pet_post_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pet_post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_post_likes_pet_post_id_fkey"
            columns: ["pet_post_id"]
            isOneToOne: false
            referencedRelation: "pet_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_post_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          like_count: number
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
          like_count?: number
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
          like_count?: number
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
          experience_points: number
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          last_login: string | null
          last_points_update: string | null
          level: number
          login_count: number
          phone: string | null
          preferences: Json
          privacy_settings: Json
          social_links: Json | null
          total_points: number
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
          experience_points?: number
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          last_points_update?: string | null
          level?: number
          login_count?: number
          phone?: string | null
          preferences?: Json
          privacy_settings?: Json
          social_links?: Json | null
          total_points?: number
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
          experience_points?: number
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          last_points_update?: string | null
          level?: number
          login_count?: number
          phone?: string | null
          preferences?: Json
          privacy_settings?: Json
          social_links?: Json | null
          total_points?: number
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
      user_comment_stats: {
        Row: {
          avg_reply_depth: number
          current_comment_streak: number
          helpful_comments: number
          last_comment_date: string | null
          longest_comment_streak: number
          profile_id: string
          total_comments: number
          total_helpful_received: number
          total_likes_given: number
          total_likes_received: number
          total_received_replies: number
          total_replies: number
          updated_at: string
        }
        Insert: {
          avg_reply_depth?: number
          current_comment_streak?: number
          helpful_comments?: number
          last_comment_date?: string | null
          longest_comment_streak?: number
          profile_id: string
          total_comments?: number
          total_helpful_received?: number
          total_likes_given?: number
          total_likes_received?: number
          total_received_replies?: number
          total_replies?: number
          updated_at?: string
        }
        Update: {
          avg_reply_depth?: number
          current_comment_streak?: number
          helpful_comments?: number
          last_comment_date?: string | null
          longest_comment_streak?: number
          profile_id?: string
          total_comments?: number
          total_helpful_received?: number
          total_likes_given?: number
          total_likes_received?: number
          total_received_replies?: number
          total_replies?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_comment_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      activity_feed_items: {
        Row: {
          actor_avatar: string | null
          actor_id: string | null
          actor_level: number | null
          actor_name: string | null
          comment_content: string | null
          comment_id: string | null
          id: string | null
          occurred_at: string | null
          parent_comment_id: string | null
          post_id: string | null
          post_outcome: string | null
          post_purpose: string | null
          post_status: string | null
          post_thumbnail: string | null
          post_title: string | null
          type: string | null
        }
        Relationships: []
      }
      comment_leaderboard_alltime: {
        Row: {
          avatar_url: string | null
          comments_count: number | null
          full_name: string | null
          likes_received: number | null
          profile_id: string | null
          profile_level: number | null
          replies_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_leaderboard_monthly: {
        Row: {
          avatar_url: string | null
          comments_count: number | null
          full_name: string | null
          likes_received: number | null
          profile_id: string | null
          profile_level: number | null
          replies_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_leaderboard_weekly: {
        Row: {
          avatar_url: string | null
          comments_count: number | null
          full_name: string | null
          likes_received: number | null
          profile_id: string | null
          profile_level: number | null
          replies_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reaction_counts: {
        Row: {
          comment_id: string | null
          count: number | null
          reaction_type:
            | Database["public"]["Enums"]["comment_reaction_type"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_threads: {
        Row: {
          author_avatar: string | null
          author_level: number | null
          author_name: string | null
          content: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_reason: string | null
          depth: number | null
          edited_at: string | null
          id: string | null
          is_deleted: boolean | null
          is_edited: boolean | null
          like_count: number | null
          parent_comment_id: string | null
          path: string[] | null
          pet_post_id: string | null
          profile_id: string | null
          reply_count: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      donation_leaderboard: {
        Row: {
          donation_count: number | null
          donor_avatar: string | null
          donor_id: string | null
          donor_name: string | null
          is_visible: boolean | null
          last_donation_at: string | null
          level: number | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_leaderboard_alltime: {
        Row: {
          avatar_url: string | null
          donation_count: number | null
          donor_id: string | null
          donor_name: string | null
          level: number | null
          total_amount: number | null
        }
        Relationships: []
      }
      donation_leaderboard_weekly: {
        Row: {
          avatar_url: string | null
          donation_count: number | null
          donor_id: string | null
          donor_name: string | null
          last_donation_at: string | null
          level: number | null
          total_amount: number | null
        }
        Relationships: []
      }
      donation_stats: {
        Row: {
          monthly_donations: number | null
          monthly_raised: number | null
          total_donations: number | null
          total_raised: number | null
          unique_donors: number | null
          weekly_donations: number | null
          weekly_raised: number | null
        }
        Relationships: []
      }
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
      roadmap_stats: {
        Row: {
          total_raised: number | null
          unique_donors: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_comment_points: {
        Args: {
          p_action: string
          p_comment_id?: string
          p_metadata?: Json
          p_points?: number
          p_profile_id: string
        }
        Returns: number
      }
      calculate_level_from_points: { Args: { points: number }; Returns: number }
      check_and_award_badges: {
        Args: { target_profile_id: string }
        Returns: {
          badge_name: string
          badge_tier: string
        }[]
      }
      check_and_award_comment_badges: {
        Args: { p_profile_id: string }
        Returns: {
          badge_name: string
          badge_tier: string
        }[]
      }
      check_and_update_comment_streak: {
        Args: { p_profile_id: string }
        Returns: undefined
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
          experience_points: number
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          last_login: string | null
          last_points_update: string | null
          level: number
          login_count: number
          phone: string | null
          preferences: Json
          privacy_settings: Json
          social_links: Json | null
          total_points: number
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
      get_comment_depth: { Args: { p_comment_id: string }; Returns: number }
      get_comment_thread: {
        Args: { p_max_depth?: number; p_pet_post_id: string }
        Returns: {
          content: string
          created_at: string
          deleted_at: string
          deleted_reason: string
          depth: number
          edited_at: string
          id: string
          is_deleted: boolean
          is_edited: boolean
          like_count: number
          parent_comment_id: string
          pet_post_id: string
          profile_id: string
          reply_count: number
          updated_at: string
        }[]
      }
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
      get_user_donation_stats: {
        Args: { user_uuid: string }
        Returns: {
          donation_count: number
          total_donated: number
          total_points: number
        }[]
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
          experience_points: number
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          last_login: string | null
          last_points_update: string | null
          level: number
          login_count: number
          phone: string | null
          preferences: Json
          privacy_settings: Json
          social_links: Json | null
          total_points: number
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
      refresh_activity_feed: { Args: never; Returns: undefined }
      set_profile_active: { Args: { profile_id: string }; Returns: boolean }
      set_profile_role: {
        Args: {
          new_role: Database["public"]["Enums"]["profile_role"]
          target_profile_id: string
        }
        Returns: boolean
      }
      sync_profile_gamification: {
        Args: { p_profile_id: string }
        Returns: {
          new_level: number
          new_points: number
          old_level: number
          old_points: number
          profile_id: string
        }[]
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
        | "first_comment"
        | "active_commenter"
        | "helpful_responder"
        | "community_connector"
        | "comment_streak"
        | "liked_commenter"
      comment_reaction_type: "like" | "helpful" | "insightful" | "heart"
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
        "first_comment",
        "active_commenter",
        "helpful_responder",
        "community_connector",
        "comment_streak",
        "liked_commenter",
      ],
      comment_reaction_type: ["like", "helpful", "insightful", "heart"],
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

