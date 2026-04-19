/**
 * ApiAuthRepository
 * Implements IAuthRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { Session, User } from "@supabase/supabase-js";

export class ApiAuthRepository implements IAuthRepository {
  private baseUrl = "/api/auth";

  async getSession(): Promise<Session | null> {
    const res = await fetch(`${this.baseUrl}/session`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.session ?? null;
  }

  async getUser(): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/me`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  }

  async getProfile(): Promise<AuthProfile | null> {
    const res = await fetch(`${this.baseUrl}/me`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile ?? null;
  }

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: string | null }> {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { user: null, error: data.error || "เข้าสู่ระบบไม่สำเร็จ" };
    }

    const data = await res.json();
    return { user: data.user ?? null, error: null };
  }

  async signUp(
    email: string,
    password: string,
    metadata?: { full_name?: string; username?: string },
  ): Promise<{ user: User | null; error: string | null }> {
    const res = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, ...metadata }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { user: null, error: data.error || "สมัครสมาชิกไม่สำเร็จ" };
    }

    const data = await res.json();
    return { user: data.user ?? null, error: null };
  }

  async signOut(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, { method: "POST" });
  }

  async getProfiles(): Promise<AuthProfile[]> {
    const res = await fetch(`${this.baseUrl}/profiles`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.profiles ?? [];
  }

  async switchProfile(profileId: string): Promise<AuthProfile | null> {
    const res = await fetch(`${this.baseUrl}/switch-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "สลับโปรไฟล์ไม่สำเร็จ");
    }

    const data = await res.json();
    return data.profile ?? null;
  }
}
