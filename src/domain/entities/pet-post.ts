export type PetGender = "male" | "female" | "unknown";
export type PetPostStatus = "available" | "pending" | "adopted" | "missing";

export interface PetType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PetPost {
  id: string;
  profileId: string;
  petTypeId: string | null;
  petType?: PetType;

  title: string;
  description: string;
  breed: string;
  color: string;
  gender: PetGender;
  estimatedAge: string;
  isVaccinated: boolean | null;
  isNeutered: boolean | null;

  latitude: number;
  longitude: number;
  address: string;
  province: string;

  status: PetPostStatus;
  thumbnailUrl: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PetPostStats {
  totalPosts: number;
  availablePosts: number;
  adoptedPosts: number;
  missingPosts: number;
}

export interface CreatePetPostData {
  ownerId: string;
  petTypeId: string;
  title: string;
  description?: string;
  breed?: string;
  color?: string;
  gender: PetGender;
  estimatedAge?: string;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  latitude: number;
  longitude: number;
  address?: string;
  province?: string;
  thumbnailUrl?: string;
}

export type CreatePetPostPayload = Omit<CreatePetPostData, "ownerId">;

export interface UpdatePetPostData {
  title?: string;
  description?: string;
  breed?: string;
  color?: string;
  gender?: PetGender;
  estimatedAge?: string;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  province?: string;
  status?: PetPostStatus;
  thumbnailUrl?: string;
  isActive?: boolean;
}
