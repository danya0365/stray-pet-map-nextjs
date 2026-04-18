import type {
  IPetPostRepository,
  PetPostFilters,
  PetPostQuery,
  PetPostQueryResult,
} from "@/application/repositories/IPetPostRepository";
import type {
  CreatePetPostPayload,
  PetPost,
  PetPostOutcome,
  PetPostPurpose,
  PetPostStats,
  PetPostStatus,
  PetType,
  UpdatePetPostData,
} from "@/domain/entities/pet-post";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// ── Query Builder Type ─────────────────────────────────
// Use a generic type that accepts any Supabase query builder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

// ── DB row types ───────────────────────────────────────────

type PetPostRow = Database["public"]["Tables"]["pet_posts"]["Row"];
type PetTypeRow = Database["public"]["Tables"]["pet_types"]["Row"];

type PetPostWithType = PetPostRow & {
  pet_types: PetTypeRow | null;
};

// ── Repository ─────────────────────────────────────────────

export class SupabasePetPostRepository implements IPetPostRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  // ============================================================
  // QUERY
  // ============================================================

  async query(params: PetPostQuery): Promise<PetPostQueryResult> {
    console.log(
      "[SupabasePetPostRepository.query] params:",
      JSON.stringify(params, null, 2),
    );

    let q = this.supabase
      .from("pet_posts")
      .select("*, pet_types(*), profiles(id, full_name, avatar_url)", {
        count: "exact",
      })
      .eq("is_active", true);

    // ── Filters ──
    q = this.applyFilters(q, params.filters);
    console.log("[SupabasePetPostRepository.query] filters applied");

    // ── Search ──
    if (params.search) {
      q = q.or(
        `title.ilike.%${params.search}%,description.ilike.%${params.search}%,breed.ilike.%${params.search}%,address.ilike.%${params.search}%`,
      );
    }

    // ── Sort ──
    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";

    if (sortBy === "distance" && params.nearBy) {
      // Distance sort requires post-processing — fetch all then sort in JS
    } else {
      const column = this.toSnakeCase(sortBy);
      q = q.order(column, { ascending: sortOrder === "asc" });
    }

    // ── Pagination ──
    if (params.pagination.type === "offset") {
      const { page, perPage } = params.pagination;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      q = q.range(from, to);
    } else {
      // Cursor pagination
      const { cursor, limit } = params.pagination;
      if (cursor) {
        q = q.lt("id", cursor);
      }
      q = q.limit(limit);
    }

    const { data, error, count } = await q;
    if (error) {
      console.error("[SupabasePetPostRepository.query] Supabase error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    console.log(
      `[SupabasePetPostRepository.query] Success: ${data?.length ?? 0} rows, total: ${count ?? 0}`,
    );

    let posts = (
      data as Array<
        PetPostWithType & {
          profiles: {
            id: string;
            full_name: string | null;
            avatar_url: string | null;
          } | null;
        }
      >
    ).map((row) => this.mapToDomainWithOwner(row));
    const total = count ?? 0;

    // ── NearBy filter (post-processing) ──
    if (params.nearBy) {
      const { latitude, longitude, radiusKm } = params.nearBy;
      posts = posts.filter((p) => {
        const dist = this.haversineKm(
          latitude,
          longitude,
          p.latitude,
          p.longitude,
        );
        return dist <= radiusKm;
      });

      if (sortBy === "distance") {
        posts.sort((a, b) => {
          const distA = this.haversineKm(
            latitude,
            longitude,
            a.latitude,
            a.longitude,
          );
          const distB = this.haversineKm(
            latitude,
            longitude,
            b.latitude,
            b.longitude,
          );
          return sortOrder === "asc" ? distA - distB : distB - distA;
        });
      }
    }

    if (params.pagination.type === "offset") {
      return {
        data: posts,
        total,
        page: params.pagination.page,
        perPage: params.pagination.perPage,
        hasMore: params.pagination.page * params.pagination.perPage < total,
      };
    }

    // Cursor pagination result
    const lastItem = posts[posts.length - 1];
    return {
      data: posts,
      total,
      nextCursor: lastItem?.id ?? null,
      hasMore: posts.length === params.pagination.limit,
    };
  }

  // ============================================================
  // SINGLE READ
  // ============================================================

  async getById(id: string): Promise<PetPost | null> {
    const { data, error } = await this.supabase
      .from("pet_posts")
      .select("*, pet_types(*)")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return this.mapToDomain(data as PetPostWithType);
  }

  async getByIdWithOwner(id: string): Promise<PetPost | null> {
    const { data, error } = await this.supabase
      .from("pet_posts")
      .select("*, pet_types(*), profiles(id, full_name, avatar_url)")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    const post = this.mapToDomain(data as PetPostWithType);

    // Add owner info if profiles data exists
    if (data?.profiles) {
      const profile = data.profiles as {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      };
      post.owner = {
        profileId: profile.id,
        displayName: profile.full_name ?? "Anonymous",
        avatarUrl: profile.avatar_url ?? undefined,
      };
    }

    return post;
  }

  // ============================================================
  // WRITE
  // ============================================================

  async create(payload: CreatePetPostPayload): Promise<PetPost> {
    // Get current user's active profile ID
    const { data: profileData, error: profileError } = await this.supabase.rpc(
      "get_active_profile_id",
    );

    if (profileError || !profileData) {
      throw new Error("ไม่สามารถระบุตัวตนผู้ใช้ได้ กรุณาเข้าสู่ระบบ");
    }

    // Auto-determine status based on purpose (ถ้า user ไม่ระบุ status)
    const purpose = payload.purpose ?? "rehome_pet";
    const autoStatus = this.getStatusFromPurpose(purpose, payload.status);

    const { data, error } = await this.supabase
      .from("pet_posts")
      .insert({
        profile_id: profileData as string,
        pet_type_id: payload.petTypeId,
        title: payload.title,
        description: payload.description ?? "",
        breed: payload.breed ?? "",
        color: payload.color ?? "",
        gender: payload.gender,
        estimated_age: payload.estimatedAge ?? "",
        is_vaccinated: payload.isVaccinated ?? null,
        is_neutered: payload.isNeutered ?? null,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address ?? "",
        province: payload.province ?? "",
        purpose: purpose,
        status: autoStatus,
        thumbnail_url: payload.thumbnailUrl ?? "",
      })
      .select("*, pet_types(*)")
      .single();

    if (error) throw error;
    return this.mapToDomain(data as PetPostWithType);
  }

  // Auto-set status based on purpose
  private getStatusFromPurpose(
    purpose: PetPostPurpose,
    explicitStatus?: PetPostStatus,
  ): PetPostStatus {
    // ถ้า user ระบุ status เอง ใช้ค่านั้นเลย (สำหรับ admin หรือ update flow พิเศษ)
    if (explicitStatus) return explicitStatus;

    // ถ้าไม่ระบุ ให้ set ตาม purpose
    switch (purpose) {
      case "lost_pet":
        return "missing"; // ตามหาน้อง → สถานะ missing
      case "rehome_pet":
      case "community_cat":
        return "available"; // หาบ้าน → สถานะ available
      default:
        return "available";
    }
  }

  async update(id: string, updateData: UpdatePetPostData): Promise<PetPost> {
    type PetPostUpdate = Database["public"]["Tables"]["pet_posts"]["Update"];
    const payload: PetPostUpdate = {};

    if (updateData.title !== undefined) payload.title = updateData.title;
    if (updateData.description !== undefined)
      payload.description = updateData.description;
    if (updateData.breed !== undefined) payload.breed = updateData.breed;
    if (updateData.color !== undefined) payload.color = updateData.color;
    if (updateData.gender !== undefined) payload.gender = updateData.gender;
    if (updateData.estimatedAge !== undefined)
      payload.estimated_age = updateData.estimatedAge;
    if (updateData.isVaccinated !== undefined)
      payload.is_vaccinated = updateData.isVaccinated;
    if (updateData.isNeutered !== undefined)
      payload.is_neutered = updateData.isNeutered;
    if (updateData.latitude !== undefined)
      payload.latitude = updateData.latitude;
    if (updateData.longitude !== undefined)
      payload.longitude = updateData.longitude;
    if (updateData.address !== undefined) payload.address = updateData.address;
    if (updateData.province !== undefined)
      payload.province = updateData.province;
    if (updateData.purpose !== undefined) payload.purpose = updateData.purpose;
    if (updateData.status !== undefined) payload.status = updateData.status;
    if (updateData.outcome !== undefined) payload.outcome = updateData.outcome;
    if (updateData.resolvedAt !== undefined)
      payload.resolved_at = updateData.resolvedAt;
    if (updateData.thumbnailUrl !== undefined)
      payload.thumbnail_url = updateData.thumbnailUrl;
    if (updateData.isActive !== undefined)
      payload.is_active = updateData.isActive;
    if (updateData.isArchived !== undefined)
      payload.is_archived = updateData.isArchived;

    const { data, error } = await this.supabase
      .from("pet_posts")
      .update(payload)
      .eq("id", id)
      .select("*, pet_types(*)")
      .single();

    if (error) throw error;
    return this.mapToDomain(data as PetPostWithType);
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete
    const { error } = await this.supabase
      .from("pet_posts")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    return true;
  }

  // ============================================================
  // STATS
  // ============================================================

  async getStats(filters?: PetPostFilters): Promise<PetPostStats> {
    let q = this.supabase
      .from("pet_posts")
      .select("status", { count: "exact" })
      .eq("is_active", true);

    if (filters) {
      q = this.applyFilters(q, filters);
    }

    const { data, error } = await q;
    if (error) throw error;

    const rows = data ?? [];
    return {
      totalPosts: rows.length,
      availablePosts: rows.filter((r) => r.status === "available").length,
      adoptedPosts: rows.filter((r) => r.status === "adopted").length,
      missingPosts: rows.filter((r) => r.status === "missing").length,
    };
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private applyFilters(
    query: QueryBuilder,
    filters?: PetPostFilters,
  ): QueryBuilder {
    if (!filters) return query;

    if (filters.purpose) {
      const purposes = Array.isArray(filters.purpose)
        ? filters.purpose
        : [filters.purpose];
      query = query.in("purpose", purposes);
    }
    if (filters.status) {
      const statuses = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];
      query = query.in("status", statuses);
    }
    if (filters.outcome) {
      const outcomes = Array.isArray(filters.outcome)
        ? filters.outcome
        : [filters.outcome];
      query = query.in("outcome", outcomes);
    }
    if (filters.isArchived !== undefined) {
      query = query.eq("is_archived", filters.isArchived);
    }
    if (filters.petTypeId) {
      query = query.eq("pet_type_id", filters.petTypeId);
    }
    if (filters.gender) {
      query = query.eq("gender", filters.gender);
    }
    if (filters.province) {
      query = query.eq("province", filters.province);
    }
    if (filters.isVaccinated !== undefined) {
      query = query.eq("is_vaccinated", filters.isVaccinated);
    }
    if (filters.isNeutered !== undefined) {
      query = query.eq("is_neutered", filters.isNeutered);
    }
    if (filters.profileId) {
      query = query.eq("profile_id", filters.profileId);
    }
    if (filters.breed) {
      query = query.ilike("breed", `%${filters.breed}%`);
    }
    if (filters.color) {
      query = query.ilike("color", `%${filters.color}%`);
    }
    if (filters.estimatedAge) {
      query = query.eq("estimated_age", filters.estimatedAge);
    }

    return query;
  }

  private mapToDomain(row: PetPostWithType): PetPost {
    const petType: PetType | undefined = row.pet_types
      ? {
          id: row.pet_types.id,
          name: row.pet_types.name,
          slug: row.pet_types.slug,
          icon: row.pet_types.icon ?? "🐾",
          sortOrder: row.pet_types.sort_order,
          isActive: row.pet_types.is_active,
        }
      : undefined;

    return {
      id: row.id,
      profileId: row.profile_id,
      petTypeId: row.pet_type_id,
      petType,
      title: row.title,
      description: row.description ?? "",
      breed: row.breed ?? "",
      color: row.color ?? "",
      gender: row.gender,
      estimatedAge: row.estimated_age ?? "",
      isVaccinated: row.is_vaccinated,
      isNeutered: row.is_neutered,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address ?? "",
      province: row.province ?? "",
      purpose: row.purpose,
      status: row.status,
      outcome: row.outcome,
      resolvedAt: row.resolved_at,
      thumbnailUrl: row.thumbnail_url ?? "",
      isActive: row.is_active,
      isArchived: row.is_archived,
      createdAt: row.created_at ?? "",
      updatedAt: row.updated_at ?? "",
    };
  }

  private mapToDomainWithOwner(
    row: PetPostWithType & {
      profiles: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      } | null;
    },
  ): PetPost {
    const post = this.mapToDomain(row);

    // Add owner info if profiles data exists
    if (row.profiles) {
      post.owner = {
        profileId: row.profiles.id,
        displayName: row.profiles.full_name ?? "Anonymous",
        avatarUrl: row.profiles.avatar_url ?? undefined,
      };
    }

    return post;
  }

  private toSnakeCase(field: string): string {
    const map: Record<string, string> = {
      createdAt: "created_at",
      updatedAt: "updated_at",
      title: "title",
      distance: "created_at", // fallback — distance is handled in JS
      resolvedAt: "resolved_at",
      isArchived: "is_archived",
    };
    return map[field] ?? field;
  }

  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ดึงเรื่องราวความสำเร็จ (โพสต์ที่ outcome = owner_found หรือ rehomed)
  async getSuccessStories(limit = 6): Promise<PetPost[]> {
    const { data, error } = await this.supabase
      .from("pet_posts")
      .select("*, pet_types(*)")
      .in("outcome", ["owner_found", "rehomed"])
      .eq("is_archived", true)
      .not("resolved_at", "is", null)
      .order("resolved_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching success stories:", error);
      throw error;
    }

    return (data as PetPostWithType[]).map((row) => this.mapToDomain(row));
  }

  // ดึงโพสต์ที่หมดอายุ (สำหรับ auto-archive)
  async findExpiredPosts(
    expiryDays: number,
  ): Promise<{ id: string; createdAt: string }[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - expiryDays);

    const { data, error } = await this.supabase
      .from("pet_posts")
      .select("id, created_at")
      .is("outcome", null)
      .eq("is_archived", false)
      .lt("created_at", expiryDate.toISOString());

    if (error) {
      console.error("Error finding expired posts:", error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      createdAt: row.created_at ?? new Date().toISOString(),
    }));
  }

  // ดึงโพสต์ที่ใกล้หมดอายุ (สำหรับแจ้งเตือน)
  async findExpiringSoonPosts(
    expiryDays: number,
    warningDays: number,
  ): Promise<
    { id: string; title: string; createdAt: string; purpose: string }[]
  > {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - expiryDays);

    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() - (expiryDays - warningDays));

    const { data, error } = await this.supabase
      .from("pet_posts")
      .select("id, title, created_at, purpose")
      .is("outcome", null)
      .eq("is_archived", false)
      .gte("created_at", expiryDate.toISOString())
      .lt("created_at", warningDate.toISOString());

    if (error) {
      console.error("Error finding expiring soon posts:", error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at ?? new Date().toISOString(),
      purpose: row.purpose,
    }));
  }

  // ปิดโพสต์ (เมื่อหาเจ้าของเจอ/รับเลี้ยงแล้ว)
  async close(id: string, outcome: PetPostOutcome): Promise<PetPost> {
    const { data, error } = await this.supabase
      .from("pet_posts")
      .update({
        outcome,
        status:
          outcome === "rehomed" || outcome === "owner_found"
            ? "adopted"
            : "available",
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, pet_types(*)")
      .single();

    if (error) {
      console.error("Error closing post:", error);
      throw error;
    }

    return this.mapToDomain(data as PetPostWithType);
  }
}
