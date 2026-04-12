import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/domain/types/supabase";
import type { IPetTypeRepository } from "@/application/repositories/IPetTypeRepository";
import type { PetType } from "@/domain/entities/pet-post";

type PetTypeRow = Database["public"]["Tables"]["pet_types"]["Row"];

export class SupabasePetTypeRepository implements IPetTypeRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<PetType[]> {
    const { data, error } = await this.supabase
      .from("pet_types")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(this.mapToDomain);
  }

  async getById(id: string): Promise<PetType | null> {
    const { data, error } = await this.supabase
      .from("pet_types")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return this.mapToDomain(data);
  }

  async getBySlug(slug: string): Promise<PetType | null> {
    const { data, error } = await this.supabase
      .from("pet_types")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return this.mapToDomain(data);
  }

  private mapToDomain(row: PetTypeRow): PetType {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon ?? "🐾",
      sortOrder: row.sort_order,
      isActive: row.is_active,
    };
  }
}
