export type PetGender = "male" | "female" | "unknown";

// Purpose: จุดประสงค์โพสต์ที่ผู้ใช้เลือก (แยกจาก status ซึ่งเป็น internal state)
export type PetPostPurpose = "lost_pet" | "rehome_pet" | "community_cat";

export type PetPostStatus = "available" | "pending" | "adopted" | "missing";

// Outcome: ผลลัพธ์สุดท้ายเมื่อโพสต์จบ (เก็บเพื่อประวัติและ analytics)
export type PetPostOutcome =
  | "owner_found" // lost_pet: เจอเจ้าของเดิม
  | "rehomed" // มีบ้านใหม่ (ไม่ว่าจะ purpose อะไร)
  | "cancelled" // เจ้าของยกเลิกโพสต์เอง
  | "expired" // หมดอายุ (auto)
  | "admin_closed"; // แอดมินปิด

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

  purpose: PetPostPurpose; // จุดประสงค์โพสต์ที่ผู้ใช้เลือก
  status: PetPostStatus; // สถานะระบบ (เปลี่ยนอัตโนมัติ)
  outcome: PetPostOutcome | null; // ผลลัพธ์สุดท้าย (เมื่อโพสต์จบแล้ว)
  resolvedAt: string | null; // เวลาที่โพสต์จบ
  thumbnailUrl: string;

  isActive: boolean;
  isArchived: boolean; // ซ่อนจาก list หลักแต่ยังเข้าถึงได้
  createdAt: string;
  updatedAt: string;

  // Owner info (optional - populated by getByIdWithOwner)
  owner?: {
    profileId: string;
    displayName: string;
    avatarUrl?: string;
  };
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
  purpose?: PetPostPurpose; // จุดประสงค์โพสต์ (user เลือก)
  status?: PetPostStatus; // สถานะระบบ (optional, ถ้าไม่ระบุจะ set ตาม purpose)
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
  purpose?: PetPostPurpose;
  status?: PetPostStatus;
  outcome?: PetPostOutcome;
  resolvedAt?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  isArchived?: boolean;
}
