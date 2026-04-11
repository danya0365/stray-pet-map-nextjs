"use client";

import { LocationPickerModal } from "@/presentation/components/search/LocationPickerModal";
import { cn } from "@/presentation/lib/cn";
import {
  createPostSchema,
  type CreatePostFormValues,
} from "@/presentation/validations/createPostSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  PawPrint,
  Scissors,
  SkipForward,
  Syringe,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// ── Constants ──────────────────────────────────────────

const STEPS = [
  { id: 1, label: "จุดประสงค์", icon: "📷" },
  { id: 2, label: "ตำแหน่ง", icon: "�" },
  { id: 3, label: "ข้อมูลหลัก", icon: "�" },
  { id: 4, label: "เพิ่มเติม", icon: "💊" },
] as const;

const TOTAL_STEPS = STEPS.length;

const PET_TYPES = [
  { id: "type-dog", label: "สุนัข", icon: "🐕", desc: "น้องหมา" },
  { id: "type-cat", label: "แมว", icon: "🐈", desc: "น้องแมว" },
];

const GENDER_OPTIONS = [
  { value: "male" as const, label: "ผู้", icon: "♂️" },
  { value: "female" as const, label: "เมีย", icon: "♀️" },
  { value: "unknown" as const, label: "ไม่ทราบ", icon: "❓" },
];

const STATUS_OPTIONS = [
  {
    value: "available" as const,
    label: "น้องหาบ้าน",
    desc: "น้องพร้อมมีเจ้าของใหม่",
    icon: "🏠",
  },
  {
    value: "missing" as const,
    label: "ตามหาน้อง",
    desc: "น้องหายไป ช่วยตามหา",
    icon: "🔍",
  },
];

const BREED_SUGGESTIONS: Record<string, string[]> = {
  "type-dog": [
    "ไทยหลังอาน",
    "ชิวาวา",
    "ปอมเมอเรเนียน",
    "พุดเดิ้ล",
    "บางแก้ว",
    "ชิสุ",
    "บีเกิล",
    "พันทาง",
  ],
  "type-cat": [
    "วิเชียรมาศ",
    "เปอร์เซีย",
    "สก็อตติชโฟลด์",
    "อเมริกันชอร์ตแฮร์",
    "บริติชชอร์ตแฮร์",
    "แร็กดอลล์",
    "เมนคูน",
    "พันทาง",
  ],
};

const COLOR_SUGGESTIONS = [
  "ขาว",
  "ดำ",
  "น้ำตาล",
  "ส้ม",
  "เทา",
  "ครีม",
  "ดำ-ขาว",
  "น้ำตาล-ขาว",
  "สามสี",
  "ลายเสือ",
];

const AGE_SUGGESTIONS = [
  "ไม่ถึง 1 เดือน",
  "1-3 เดือน",
  "3-6 เดือน",
  "6-12 เดือน",
  "1-2 ปี",
  "2-5 ปี",
  "มากกว่า 5 ปี",
  "ไม่แน่ใจ",
];

const DESCRIPTION_TEMPLATES = [
  "เจอน้องเดินอยู่ริมถนน ดูสุขภาพดี",
  "น้องเชื่อง คนเลี้ยงมาก่อน",
  "ดูผอม ต้องการอาหารและที่พัก",
  "น้องขี้กลัว เข้าหาคนยาก",
  "น้องร่าเริง ชอบเล่นกับคน",
  "พบน้องบาดเจ็บเล็กน้อย",
];

function buildTitleSuggestions(
  petTypeId: string | undefined,
  status: string | undefined,
  address: string | null,
): string[] {
  const petLabel = PET_TYPES.find((p) => p.id === petTypeId)?.label ?? "น้อง";
  const shortAddress = address
    ? address.split(",").slice(0, 2).join(",").trim()
    : null;

  const suggestions: string[] = [];

  if (status === "available") {
    suggestions.push(
      `${petLabel}รอรับเลี้ยง${shortAddress ? ` พบที่${shortAddress}` : ""}`,
    );
    if (shortAddress) {
      suggestions.push(`พบ${petLabel}จร ${shortAddress}`);
    }
    suggestions.push(`${petLabel}น่ารัก หาบ้านให้หน่อย`);
  } else if (status === "missing") {
    suggestions.push(
      `ตามหา${petLabel}${shortAddress ? ` หายจาก${shortAddress}` : ""}`,
    );
    if (shortAddress) {
      suggestions.push(`ใครเจอ${petLabel} แถว${shortAddress} ช่วยแจ้งด้วย`);
    }
    suggestions.push(`${petLabel}หาย ช่วยตามหาด้วยค่ะ`);
  }

  return suggestions;
}

// ── Main component ─────────────────────────────────────

export function CreatePostForm() {
  const [step, setStep] = useState(1);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success"
  >("idle");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      gender: "unknown",
      status: "available",
    },
  });

  const watchPetType = watch("petTypeId");
  const watchGender = watch("gender");
  const watchStatus = watch("status");
  const watchLat = watch("latitude");
  const watchIsVaccinated = watch("isVaccinated");
  const watchIsNeutered = watch("isNeutered");

  // ── Step navigation ────────────────────────────────

  const canGoNext = useCallback(async (): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(["status", "petTypeId"]);
      case 2:
        return await trigger(["latitude", "longitude"]);
      case 3:
        return await trigger(["title", "gender"]);
      case 4:
        return true;
      default:
        return true;
    }
  }, [step, trigger]);

  const goNext = useCallback(async () => {
    if (await canGoNext()) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
    }
  }, [canGoNext]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const skipToReview = useCallback(() => {
    setStep(TOTAL_STEPS + 1);
  }, []);

  // ── Handlers ───────────────────────────────────────

  const handleLocationConfirm = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setValue("latitude", location.latitude, { shouldValidate: true });
      setValue("longitude", location.longitude, { shouldValidate: true });
      setValue("address", location.address);
      setLocationAddress(location.address);
      setShowLocationPicker(false);
    },
    [setValue],
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setImagePreview(url);
        setValue("thumbnailUrl", url);
      };
      reader.readAsDataURL(file);
    },
    [setValue],
  );

  const onSubmit = useCallback(async (data: CreatePostFormValues) => {
    setSubmitState("submitting");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Create post data:", data);
    setSubmitState("success");
  }, []);

  // ── Success screen ─────────────────────────────────

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold">โพสต์สำเร็จ!</h2>
        <p className="mb-6 text-sm text-foreground/60">
          น้องของคุณถูกโพสต์เรียบร้อยแล้ว
        </p>
        <button
          onClick={() => {
            setSubmitState("idle");
            setStep(1);
          }}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          type="button"
        >
          โพสต์อีกตัว
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────

  const isReview = step > TOTAL_STEPS;

  return (
    <>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => s.id < step && setStep(s.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors",
                s.id === step
                  ? "text-primary"
                  : s.id < step
                    ? "cursor-pointer text-foreground/60 hover:text-primary"
                    : "cursor-default text-foreground/20",
              )}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${isReview ? 100 : ((step - 1) / TOTAL_STEPS) * 100}%`,
            }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-foreground/40">
          {isReview ? "ตรวจสอบข้อมูล" : `ขั้นตอนที่ ${step} จาก ${TOTAL_STEPS}`}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Step 1: Status + Photo + Pet Type ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <StepHeader
              title="เริ่มต้นโพสต์น้อง"
              subtitle="บอกเราก่อนว่าต้องการทำอะไร"
            />

            {/* Status — first question */}
            <div>
              <p className="mb-2 text-xs font-medium text-foreground/60">
                จุดประสงค์ *
              </p>
              <div className="flex flex-col gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("status", opt.value, { shouldValidate: true })
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
                      watchStatus === opt.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          watchStatus === opt.value
                            ? "text-primary"
                            : "text-foreground/70",
                        )}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-foreground/40">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo */}
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
                imagePreview
                  ? "border-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              {imagePreview ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full rounded-2xl object-cover sm:h-64"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                    <p className="text-sm font-medium text-white">เปลี่ยนรูป</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Camera className="h-10 w-10 text-foreground/20" />
                  <p className="text-sm font-medium text-foreground/50">
                    แตะเพื่อเลือกรูปน้อง
                  </p>
                  <p className="text-xs text-foreground/30">
                    ไม่บังคับ — เพิ่มทีหลังได้
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {/* Pet Type — big cards */}
            <div>
              <p className="mb-2 text-xs font-medium text-foreground/60">
                ชนิดสัตว์ *
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PET_TYPES.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() =>
                      setValue("petTypeId", pt.id, { shouldValidate: true })
                    }
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl border-2 py-6 transition-all",
                      watchPetType === pt.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/50",
                    )}
                  >
                    <span className="text-4xl">{pt.icon}</span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        watchPetType === pt.id
                          ? "text-primary"
                          : "text-foreground/60",
                      )}
                    >
                      {pt.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.petTypeId && (
                <ErrorText>{errors.petTypeId.message}</ErrorText>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <StepHeader
              title="น้องอยู่ตรงไหน?"
              subtitle="เลือกตำแหน่งที่พบน้องบนแผนที่"
            />

            {watchLat ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {locationAddress || "ตำแหน่งที่เลือก"}
                      </p>
                      <p className="text-xs text-foreground/40">
                        {watch("latitude")?.toFixed(4)},{" "}
                        {watch("longitude")?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    เปลี่ยน
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className={cn(
                  "flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 transition-colors",
                  errors.latitude
                    ? "border-red-400"
                    : "border-border hover:border-primary/40 hover:bg-muted/50",
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground/70">
                    แตะเพื่อเลือกตำแหน่ง
                  </p>
                  <p className="text-xs text-foreground/40">
                    ใช้ GPS หรือปักหมุดบนแผนที่
                  </p>
                </div>
              </button>
            )}
            {errors.latitude && (
              <ErrorText>{errors.latitude.message}</ErrorText>
            )}
          </div>
        )}

        {/* ── Step 3: Title + Gender (with auto-suggest) ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <StepHeader
              title="บอกเล่าเรื่องของน้อง"
              subtitle="เลือกชื่อเรื่องที่แนะนำ หรือแก้เองก็ได้"
            />

            {/* Title */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-foreground/60">
                ชื่อเรื่อง *
              </p>
              <input
                {...register("title")}
                placeholder="พิมพ์เอง หรือแตะเลือกด้านล่าง"
                className={cn(inputClass, errors.title && inputErrorClass)}
              />
              {errors.title && <ErrorText>{errors.title.message}</ErrorText>}

              {/* Auto-suggest titles */}
              {(() => {
                const suggestions = buildTitleSuggestions(
                  watchPetType,
                  watchStatus,
                  locationAddress,
                );
                if (suggestions.length === 0) return null;
                return (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <p className="text-[10px] font-medium text-foreground/40">
                      แนะนำ — แตะเลือกได้เลย
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setValue("title", s, { shouldValidate: true })
                          }
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs transition-colors",
                            watch("title") === s
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Gender */}
            <div>
              <p className="mb-2 text-xs font-medium text-foreground/60">
                เพศ *
              </p>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("gender", opt.value, { shouldValidate: true })
                    }
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 transition-all",
                      watchGender === opt.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        watchGender === opt.value
                          ? "text-primary"
                          : "text-foreground/60",
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Optional Details ── */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <StepHeader
              title="รายละเอียดเพิ่มเติม"
              subtitle="แตะเลือกจากตัวเลือก หรือพิมพ์เองก็ได้ — ข้ามได้เลย"
            />

            {/* Breed */}
            <SuggestField
              label="พันธุ์"
              placeholder="พิมพ์พันธุ์เอง..."
              suggestions={
                BREED_SUGGESTIONS[watchPetType] ?? BREED_SUGGESTIONS["type-dog"]
              }
              value={watch("breed") ?? ""}
              onChange={(v) => setValue("breed", v)}
            />

            {/* Color */}
            <SuggestField
              label="สี"
              placeholder="พิมพ์สีเอง..."
              suggestions={COLOR_SUGGESTIONS}
              value={watch("color") ?? ""}
              onChange={(v) => setValue("color", v)}
            />

            {/* Estimated Age */}
            <SuggestField
              label="อายุโดยประมาณ"
              placeholder="พิมพ์อายุเอง..."
              suggestions={AGE_SUGGESTIONS}
              value={watch("estimatedAge") ?? ""}
              onChange={(v) => setValue("estimatedAge", v)}
            />

            {/* Description */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-foreground/60">
                รายละเอียด
              </p>
              <textarea
                {...register("description")}
                placeholder="เล่าเรื่องของน้องให้ฟังหน่อย..."
                rows={3}
                className={cn(inputClass, "resize-none")}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DESCRIPTION_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => {
                      const current = watch("description") ?? "";
                      const next = current ? `${current} ${tpl}` : tpl;
                      setValue("description", next);
                    }}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/60 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Health toggles */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-foreground/60">สุขภาพ</p>
              <ToggleRow
                icon={Syringe}
                label="ฉีดวัคซีนแล้ว"
                value={watchIsVaccinated}
                onChange={(v) => setValue("isVaccinated", v)}
              />
              <ToggleRow
                icon={Scissors}
                label="ทำหมันแล้ว"
                value={watchIsNeutered}
                onChange={(v) => setValue("isNeutered", v)}
              />
            </div>
          </div>
        )}

        {/* ── Review ── */}
        {isReview && (
          <div className="flex flex-col gap-5">
            <StepHeader
              title="ตรวจสอบข้อมูล"
              subtitle="เช็คให้เรียบร้อยก่อนกดโพสต์"
            />

            <div className="flex flex-col gap-3">
              {/* Photo preview */}
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full rounded-xl object-cover"
                />
              )}

              <ReviewRow
                label="ชนิด"
                value={PET_TYPES.find((p) => p.id === watchPetType)?.label}
              />
              <ReviewRow label="ชื่อเรื่อง" value={watch("title")} />
              <ReviewRow
                label="จุดประสงค์"
                value={
                  STATUS_OPTIONS.find((s) => s.value === watchStatus)?.label
                }
              />
              <ReviewRow
                label="เพศ"
                value={
                  GENDER_OPTIONS.find((g) => g.value === watchGender)?.label
                }
              />
              <ReviewRow label="ตำแหน่ง" value={locationAddress} />
              {watch("breed") && (
                <ReviewRow label="พันธุ์" value={watch("breed")} />
              )}
              {watch("color") && (
                <ReviewRow label="สี" value={watch("color")} />
              )}
              {watch("estimatedAge") && (
                <ReviewRow label="อายุ" value={watch("estimatedAge")} />
              )}
              {watch("description") && (
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="mb-1 text-[10px] font-medium text-foreground/40">
                    รายละเอียด
                  </p>
                  <p className="text-sm text-foreground/80">
                    {watch("description")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div className="mt-8 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              ย้อนกลับ
            </button>
          )}

          <div className="flex-1" />

          {step === 4 && (
            <button
              type="button"
              onClick={skipToReview}
              className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/40 transition-colors hover:text-foreground/60"
            >
              <SkipForward className="h-4 w-4" />
              ข้ามไปรีวิว
            </button>
          )}

          {!isReview ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              ถัดไป
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitState === "submitting"}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitState === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังโพสต์...
                </>
              ) : (
                <>
                  <PawPrint className="h-4 w-4" />
                  โพสต์น้อง
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onConfirm={handleLocationConfirm}
      />
    </>
  );
}

// ── Shared sub-components ──────────────────────────────

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";
const inputErrorClass = "border-red-400 focus:border-red-500";

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-foreground/50">{subtitle}</p>
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3" />
      {children}
    </p>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
      <span className="text-xs text-foreground/40">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function SuggestField({
  label,
  placeholder,
  suggestions,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  suggestions: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const isSelected = (s: string) => value === s;

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-foreground/60">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(isSelected(s) ? "" : s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              isSelected(s)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: boolean | null | undefined;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-foreground/40" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex gap-1">
        {([true, false, null] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              value === v
                ? v === true
                  ? "bg-primary/10 text-primary"
                  : v === false
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-muted text-foreground"
                : "text-foreground/40 hover:bg-muted",
            )}
          >
            {v === true ? "ใช่" : v === false ? "ไม่" : "ไม่ทราบ"}
          </button>
        ))}
      </div>
    </div>
  );
}
