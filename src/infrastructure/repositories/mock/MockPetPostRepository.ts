import type {
  IPetPostRepository,
  PetPostFilters,
  PetPostQuery,
  PetPostQueryResult,
} from "@/application/repositories/IPetPostRepository";
import type {
  CreatePetPostPayload,
  PetPost,
  PetPostStats,
  UpdatePetPostData,
} from "@/domain/entities/pet-post";
import dayjs from "dayjs";

const MOCK_PET_POSTS: PetPost[] = [
  {
    id: "pet-001",
    profileId: "user-001",
    petTypeId: "type-dog",
    petType: {
      id: "type-dog",
      name: "สุนัข",
      slug: "dog",
      icon: "🐕",
      sortOrder: 1,
      isActive: true,
    },
    title: "น้องหมาพันทาง ขนสีน้ำตาล พบที่ซอยสุขุมวิท 55",
    description:
      "น้องเป็นหมาพันทาง ขนสั้นสีน้ำตาล ดูสุขภาพดี เป็นมิตรกับคน ไม่กลัวคน พบเดินอยู่แถวซอยทองหล่อ",
    breed: "พันทาง",
    color: "น้ำตาล",
    gender: "male",
    estimatedAge: "ประมาณ 2 ปี",
    isVaccinated: null,
    isNeutered: null,
    latitude: 13.7337,
    longitude: 100.5784,
    address: "ซอยสุขุมวิท 55 (ทองหล่อ)",
    province: "กรุงเทพมหานคร",
    status: "available",
    thumbnailUrl: "https://placedog.net/400/300?id=1",
    isActive: true,
    createdAt: "2026-04-10T08:30:00.000Z",
    updatedAt: "2026-04-10T08:30:00.000Z",
  },
  {
    id: "pet-002",
    profileId: "user-002",
    petTypeId: "type-cat",
    petType: {
      id: "type-cat",
      name: "แมว",
      slug: "cat",
      icon: "🐈",
      sortOrder: 2,
      isActive: true,
    },
    title: "แมวส้ม ตัวอ้วน พบที่ตลาดจตุจักร",
    description:
      "แมวส้มตัวอ้วน ขนสั้น ดูเชื่องมาก ชอบมานอนหน้าร้านค้า คาดว่าเคยเลี้ยง",
    breed: "ส้มธรรมดา",
    color: "ส้ม",
    gender: "male",
    estimatedAge: "ประมาณ 3 ปี",
    isVaccinated: null,
    isNeutered: true,
    latitude: 13.7999,
    longitude: 100.55,
    address: "ตลาดจตุจักร",
    province: "กรุงเทพมหานคร",
    status: "available",
    thumbnailUrl: "https://placekitten.com/400/300",
    isActive: true,
    createdAt: "2026-04-09T14:00:00.000Z",
    updatedAt: "2026-04-09T14:00:00.000Z",
  },
  {
    id: "pet-003",
    profileId: "user-003",
    petTypeId: "type-dog",
    petType: {
      id: "type-dog",
      name: "สุนัข",
      slug: "dog",
      icon: "🐕",
      sortOrder: 1,
      isActive: true,
    },
    title: "ลูกหมา 3 ตัว ถูกทิ้งหน้าวัด",
    description:
      "ลูกหมาพันทาง 3 ตัว อายุประมาณ 2 เดือน ถูกทิ้งไว้ในกล่องหน้าวัด สุขภาพค่อนข้างอ่อนแอ ต้องการคนรับเลี้ยงด่วน",
    breed: "พันทาง",
    color: "ขาว-ดำ",
    gender: "unknown",
    estimatedAge: "ประมาณ 2 เดือน",
    isVaccinated: false,
    isNeutered: false,
    latitude: 13.7563,
    longitude: 100.5018,
    address: "วัดโพธิ์",
    province: "กรุงเทพมหานคร",
    status: "available",
    thumbnailUrl: "https://placedog.net/400/300?id=3",
    isActive: true,
    createdAt: "2026-04-08T10:00:00.000Z",
    updatedAt: "2026-04-08T10:00:00.000Z",
  },
  {
    id: "pet-004",
    profileId: "user-001",
    petTypeId: "type-cat",
    petType: {
      id: "type-cat",
      name: "แมว",
      slug: "cat",
      icon: "🐈",
      sortOrder: 2,
      isActive: true,
    },
    title: "แมวดำ หายจากบ้าน ย่านลาดพร้าว",
    description:
      "น้องแมวดำ ขนยาว มีปลอกคอสีแดง หายจากบ้านแถวลาดพร้าว 71 ใครพบเจอกรุณาติดต่อด้วยนะคะ",
    breed: "เปอร์เซีย ผสม",
    color: "ดำ",
    gender: "female",
    estimatedAge: "ประมาณ 1 ปี",
    isVaccinated: true,
    isNeutered: true,
    latitude: 13.818,
    longitude: 100.5614,
    address: "ลาดพร้าว 71",
    province: "กรุงเทพมหานคร",
    status: "missing",
    thumbnailUrl: "https://placekitten.com/401/300",
    isActive: true,
    createdAt: "2026-04-11T06:00:00.000Z",
    updatedAt: "2026-04-11T06:00:00.000Z",
  },
  {
    id: "pet-005",
    profileId: "user-004",
    petTypeId: "type-dog",
    petType: {
      id: "type-dog",
      name: "สุนัข",
      slug: "dog",
      icon: "🐕",
      sortOrder: 1,
      isActive: true,
    },
    title: "น้องบีเกิล พบวิ่งอยู่ในสวนรถไฟ",
    description:
      "น้องบีเกิล ดูแข็งแรง มีปลอกคอแต่ไม่มีป้ายชื่อ พบวิ่งเล่นอยู่ในสวนรถไฟ จตุจักร",
    breed: "บีเกิล",
    color: "น้ำตาล-ขาว",
    gender: "male",
    estimatedAge: "ประมาณ 4 ปี",
    isVaccinated: null,
    isNeutered: null,
    latitude: 13.803,
    longitude: 100.553,
    address: "สวนรถไฟ จตุจักร",
    province: "กรุงเทพมหานคร",
    status: "pending",
    thumbnailUrl: "https://placedog.net/400/300?id=5",
    isActive: true,
    createdAt: "2026-04-07T16:30:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "pet-006",
    profileId: "user-005",
    petTypeId: "type-cat",
    petType: {
      id: "type-cat",
      name: "แมว",
      slug: "cat",
      icon: "🐈",
      sortOrder: 2,
      isActive: true,
    },
    title: "แมวขาวมณี ถูกรับเลี้ยงแล้ว!",
    description:
      "น้องแมวขาวมณี สุดน่ารัก ได้บ้านใหม่แล้วค่ะ ขอบคุณทุกคนที่ช่วยแชร์",
    breed: "ขาวมณี",
    color: "ขาว",
    gender: "female",
    estimatedAge: "ประมาณ 6 เดือน",
    isVaccinated: true,
    isNeutered: false,
    latitude: 13.746,
    longitude: 100.534,
    address: "สยามพารากอน",
    province: "กรุงเทพมหานคร",
    status: "adopted",
    thumbnailUrl: "https://placekitten.com/402/300",
    isActive: true,
    createdAt: "2026-04-01T12:00:00.000Z",
    updatedAt: "2026-04-05T18:00:00.000Z",
  },
];

export class MockPetPostRepository implements IPetPostRepository {
  private items: PetPost[] = [...MOCK_PET_POSTS];

  // ============================================================
  // QUERY — single universal method
  // ============================================================

  async query(params: PetPostQuery): Promise<PetPostQueryResult> {
    await this.delay(100);

    let filtered = this.applyFilters([...this.items], params.filters);

    if (params.search) {
      filtered = this.applySearch(filtered, params.search);
    }

    filtered = this.applySort(
      filtered,
      params.sortBy ?? "createdAt",
      params.sortOrder ?? "desc",
    );

    const total = filtered.length;

    if (params.pagination.type === "cursor") {
      return this.applyCursorPagination(
        filtered,
        total,
        params.pagination.cursor,
        params.pagination.limit,
      );
    }

    return this.applyOffsetPagination(
      filtered,
      total,
      params.pagination.page,
      params.pagination.perPage,
    );
  }

  // ============================================================
  // SINGLE READ
  // ============================================================

  async getById(id: string): Promise<PetPost | null> {
    await this.delay(100);
    return this.items.find((item) => item.id === id) || null;
  }

  // ============================================================
  // WRITE
  // ============================================================

  async create(data: CreatePetPostPayload): Promise<PetPost> {
    await this.delay(200);

    const newItem: PetPost = {
      id: `pet-${dayjs().valueOf()}`,
      profileId: "mock-user",
      petTypeId: data.petTypeId,
      title: data.title,
      description: data.description || "",
      breed: data.breed || "",
      color: data.color || "",
      gender: data.gender,
      estimatedAge: data.estimatedAge || "",
      isVaccinated: data.isVaccinated ?? null,
      isNeutered: data.isNeutered ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || "",
      province: data.province || "",
      status: "available",
      thumbnailUrl: data.thumbnailUrl || "",
      isActive: true,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    };

    this.items.unshift(newItem);
    return newItem;
  }

  async update(id: string, data: UpdatePetPostData): Promise<PetPost> {
    await this.delay(200);

    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("PetPost not found");
    }

    const updatedItem: PetPost = {
      ...this.items[index],
      ...data,
      updatedAt: dayjs().toISOString(),
    };

    this.items[index] = updatedItem;
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    await this.delay(200);
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }

  // ============================================================
  // STATS
  // ============================================================

  async getStats(filters?: PetPostFilters): Promise<PetPostStats> {
    await this.delay(100);

    const filtered = filters
      ? this.applyFilters([...this.items], filters)
      : this.items;

    const total = filtered.length;
    const available = filtered.filter((i) => i.status === "available").length;
    const adopted = filtered.filter((i) => i.status === "adopted").length;
    const missing = filtered.filter((i) => i.status === "missing").length;

    return {
      totalPosts: total,
      availablePosts: available,
      adoptedPosts: adopted,
      missingPosts: missing,
    };
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private applyFilters(items: PetPost[], filters?: PetPostFilters): PetPost[] {
    if (!filters) return items;

    return items.filter((item) => {
      if (filters.status) {
        const statuses = Array.isArray(filters.status)
          ? filters.status
          : [filters.status];
        if (!statuses.includes(item.status)) return false;
      }
      if (filters.petTypeId && item.petTypeId !== filters.petTypeId)
        return false;
      if (filters.gender && item.gender !== filters.gender) return false;
      if (filters.province && item.province !== filters.province) return false;
      if (
        filters.isVaccinated !== undefined &&
        item.isVaccinated !== filters.isVaccinated
      )
        return false;
      if (
        filters.isNeutered !== undefined &&
        item.isNeutered !== filters.isNeutered
      )
        return false;
      if (filters.profileId && item.profileId !== filters.profileId)
        return false;

      return true;
    });
  }

  private applySearch(items: PetPost[], search: string): PetPost[] {
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.breed.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q),
    );
  }

  private applySort(
    items: PetPost[],
    sortBy: string,
    sortOrder: string,
  ): PetPost[] {
    const direction = sortOrder === "asc" ? 1 : -1;

    return items.sort((a, b) => {
      const aVal = a[sortBy as keyof PetPost] ?? "";
      const bVal = b[sortBy as keyof PetPost] ?? "";
      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });
  }

  private applyOffsetPagination(
    items: PetPost[],
    total: number,
    page: number,
    perPage: number,
  ): PetPostQueryResult {
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      data: items.slice(start, end),
      total,
      page,
      perPage,
      hasMore: end < total,
    };
  }

  private applyCursorPagination(
    items: PetPost[],
    total: number,
    cursor: string | undefined,
    limit: number,
  ): PetPostQueryResult {
    let startIndex = 0;

    if (cursor) {
      const cursorIndex = items.findIndex((item) => item.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const sliced = items.slice(startIndex, startIndex + limit);
    const lastItem = sliced[sliced.length - 1];
    const hasMore = startIndex + limit < total;

    return {
      data: sliced,
      total,
      nextCursor: hasMore && lastItem ? lastItem.id : null,
      hasMore,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockPetPostRepository = new MockPetPostRepository();
