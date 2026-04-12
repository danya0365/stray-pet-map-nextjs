import type { PetType } from "@/domain/entities/pet-post";

export interface IPetTypeRepository {
  getAll(): Promise<PetType[]>;
  getById(id: string): Promise<PetType | null>;
  getBySlug(slug: string): Promise<PetType | null>;
}
