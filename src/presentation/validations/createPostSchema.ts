import { z } from "zod/v4";

export const createPostSchema = z.object({
  title: z
    .string({
      error: "กรุณากรอกชื่อเรื่อง",
    })
    .min(5, "ชื่อเรื่องต้องมีอย่างน้อย 5 ตัวอักษร")
    .max(100, "ชื่อเรื่องต้องไม่เกิน 100 ตัวอักษร"),

  description: z
    .string()
    .max(2000, "รายละเอียดต้องไม่เกิน 2000 ตัวอักษร")
    .optional(),

  petTypeId: z
    .string({
      error: "กรุณาเลือกชนิดสัตว์",
    })
    .min(1, "กรุณาเลือกชนิดสัตว์"),

  breed: z.string().max(100, "พันธุ์ต้องไม่เกิน 100 ตัวอักษร").optional(),

  color: z.string().max(100, "สีต้องไม่เกิน 100 ตัวอักษร").optional(),

  gender: z.enum(["male", "female", "unknown"], {
    error: "กรุณาเลือกเพศ",
  }),

  estimatedAge: z.string().max(50, "อายุต้องไม่เกิน 50 ตัวอักษร").optional(),

  isVaccinated: z.boolean().nullable().optional(),
  isNeutered: z.boolean().nullable().optional(),

  purpose: z.enum(["lost_pet", "rehome_pet", "community_cat"], {
    error: "กรุณาเลือกจุดประสงค์โพสต์",
  }),

  latitude: z.number({
    error: "กรุณาเลือกตำแหน่งบนแผนที่",
  }),
  longitude: z.number({
    error: "กรุณาเลือกตำแหน่งบนแผนที่",
  }),
  address: z.string().optional(),
  province: z.string().optional(),

  thumbnailUrl: z.string().optional(),
});

export type CreatePostFormValues = z.infer<typeof createPostSchema>;
