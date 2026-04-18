"use client";

/**
 * CreatePostV2View
 * ✅ Pure View — no logic, only renders UI from presenter state
 * ✅ Semantic <form> with noValidate + preventDefault — SEO/a11y compliant
 * ✅ All buttons are type="button" — no accidental submits
 * ✅ No react-hook-form — uses plain state from presenter
 * ✅ Proper <label>, <fieldset>, <legend>, role, aria-* attributes
 */

import { LocationPickerModal } from "@/presentation/components/search/LocationPickerModal";
import { cn } from "@/presentation/lib/cn";
import type { CreatePostViewModel } from "@/presentation/presenters/create-post/CreatePostPresenter";
import { useCreatePostV2Presenter } from "@/presentation/presenters/create-post/useCreatePostV2Presenter";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  Info,
  Loader2,
  MapPin,
  PawPrint,
  Scissors,
  Sparkles,
  Syringe,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ── Constants (UI-only) ──────────────────────────────────

const STEPS = [
  { id: 1, label: "รูปภาพ", Icon: Camera },
  { id: 2, label: "ตำแหน่ง", Icon: MapPin },
  { id: 3, label: "ข้อมูลหลัก", Icon: ClipboardList },
  { id: 4, label: "เพิ่มเติม", Icon: Info },
] as const;

const TOTAL_STEPS = STEPS.length;

const GENDER_OPTIONS = [
  { value: "male" as const, label: "ผู้", icon: "♂️" },
  { value: "female" as const, label: "เมีย", icon: "♀️" },
  { value: "unknown" as const, label: "ไม่ทราบ", icon: "❓" },
];

const PURPOSE_OPTIONS = [
  {
    value: "community_cat" as const,
    label: "น้องแมวจร",
    desc: "หาบ้านให้น้องแมวจรที่พบตามสถานที่ต่างๆ",
    icon: "🐱",
  },
  {
    value: "lost_pet" as const,
    label: "ตามหาน้อง",
    desc: "โพสต์เพื่อให้ทุกคนช่วยกันตามหาและให้เบาะแส",
    icon: "🔍",
  },
  {
    value: "rehome_pet" as const,
    label: "น้องหาบ้าน",
    desc: "หาบ้านใหม่ให้น้องที่เจ้าของเดิมเลี้ยงไม่ไหว/ไม่สามารถดูแลต่อ",
    icon: "🏠",
  },
];

const BREED_SUGGESTIONS_BY_SLUG: Record<string, string[]> = {
  dog: [
    "ไทยหลังอาน",
    "ชิวาวา",
    "ปอมเมอเรเนียน",
    "พุดเดิ้ล",
    "บางแก้ว",
    "ชิสุ",
    "บีเกิล",
    "พันทาง",
  ],
  cat: [
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

// ── Main View ────────────────────────────────────────────

interface CreatePostV2ViewProps {
  initialViewModel: CreatePostViewModel;
}

export function CreatePostV2View({ initialViewModel }: CreatePostV2ViewProps) {
  const router = useRouter();
  const [state, actions] = useCreatePostV2Presenter(initialViewModel);
  const {
    step,
    isReview,
    form,
    imagePreview,
    detecting,
    showLocationPicker,
    stepErrors,
    submitting,
    error: presenterError,
    createdPost,
    petTypes,
  } = state;

  // ── Success screen ──────────────────────────────────

  if (createdPost) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold">โพสต์สำเร็จ!</h2>
        <p className="mb-6 text-sm text-foreground/60">
          น้องของคุณถูกโพสต์เรียบร้อยแล้ว
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/pets/${createdPost.id}`)}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            ดูโพสต์
          </button>
          <button
            type="button"
            onClick={actions.resetForm}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted"
          >
            โพสต์อีกตัว
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────

  return (
    <>
      {/* ── Progress indicator ── */}
      <div className="mb-8">
        <nav
          aria-label="ขั้นตอนการสร้างโพสต์"
          className="mb-3 flex items-center justify-between"
        >
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => actions.goToStep(s.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-colors",
                s.id === step && !isReview
                  ? "text-primary"
                  : s.id < step || isReview
                    ? "cursor-pointer text-foreground/60 hover:text-primary"
                    : "cursor-default text-foreground/20",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  s.id === step && !isReview
                    ? "h-10 w-10 bg-primary/10 sm:h-8 sm:w-8"
                    : s.id < step || isReview
                      ? "h-10 w-10 bg-primary/5 sm:h-8 sm:w-8"
                      : "h-10 w-10 bg-muted sm:h-8 sm:w-8",
                )}
              >
                <s.Icon className="h-5 w-5 sm:h-4 sm:w-4" />
              </div>
              <span className="hidden text-xs font-medium sm:block">
                {s.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${isReview ? 100 : (step / TOTAL_STEPS) * 100}%`,
            }}
          />
        </div>

        <p className="mt-2 text-center text-sm font-medium text-primary sm:text-xs sm:font-normal sm:text-foreground/40">
          {isReview ? (
            "ตรวจสอบข้อมูล"
          ) : (
            <>
              <span className="sm:hidden">{STEPS[step - 1]?.label}</span>
              <span className="hidden sm:inline">
                ขั้นตอนที่ {step} จาก {TOTAL_STEPS}
              </span>
            </>
          )}
        </p>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        aria-label="ฟอร์มสร้างโพสต์น้อง"
        noValidate
      >
        {/* ── Error banner ── */}
        {presenterError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {presenterError}
          </div>
        )}

        {/* ── Step 1: Photo + Pet Type + Purpose ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <StepHeader
              title="เริ่มต้นโพสต์น้อง"
              subtitle="ใส่รูปน้องก่อน — ระบบจะช่วยระบุชนิดสัตว์ให้"
            />

            {/* Photo upload */}
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-foreground/60">
                รูปน้อง *
              </legend>
              <label
                htmlFor="pet-image"
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
                  imagePreview
                    ? "border-primary/30 bg-primary/5"
                    : stepErrors.image
                      ? "border-destructive hover:border-destructive/70"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                )}
              >
                {imagePreview ? (
                  <div className="relative w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="ตัวอย่างรูปสัตว์เลี้ยงที่อัพโหลด"
                      className="h-48 w-full rounded-2xl object-cover sm:h-64"
                    />
                    {detecting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/50">
                        <Sparkles className="h-6 w-6 animate-pulse text-amber-300" />
                        <p className="text-sm font-medium text-white">
                          กำลังวิเคราะห์รูปภาพ...
                        </p>
                      </div>
                    )}
                    {!detecting && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                        <p className="text-sm font-medium text-white">
                          เปลี่ยนรูป
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10">
                    <Camera className="h-10 w-10 text-foreground/20" />
                    <p className="text-sm font-medium text-foreground/50">
                      แตะเพื่อเลือกรูปน้อง
                    </p>
                    <p className="text-xs text-foreground/30">
                      จำเป็นต้องใส่รูป — ระบบจะช่วยระบุชนิดสัตว์
                    </p>
                  </div>
                )}
                <input
                  id="pet-image"
                  name="pet-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-invalid={!!stepErrors.image}
                  aria-describedby={
                    stepErrors.image ? "pet-image-error" : undefined
                  }
                  onChange={actions.handleImageChange}
                />
              </label>
              {stepErrors.image && (
                <ErrorText id="pet-image-error">{stepErrors.image}</ErrorText>
              )}
            </fieldset>

            {/* Pet type — show after image uploaded */}
            {imagePreview && !detecting && (
              <fieldset className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <legend className="mb-2 text-xs font-medium text-foreground/60">
                  ชนิดสัตว์ *
                </legend>
                <div
                  role="radiogroup"
                  aria-label="เลือกชนิดสัตว์"
                  aria-invalid={!!stepErrors.petTypeId}
                  aria-describedby={
                    stepErrors.petTypeId ? "pet-type-error" : undefined
                  }
                  className={cn(
                    "grid grid-cols-2 gap-3 rounded-xl p-1 transition-colors",
                    stepErrors.petTypeId &&
                      "bg-destructive/5 ring-1 ring-destructive/30",
                  )}
                >
                  {petTypes.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      role="radio"
                      aria-checked={form.petTypeId === pt.id}
                      onClick={() => actions.setField("petTypeId", pt.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border-2 py-6 transition-all",
                        form.petTypeId === pt.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : stepErrors.petTypeId
                            ? "border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5"
                            : "border-border hover:border-primary/30 hover:bg-muted/50",
                      )}
                    >
                      <span className="text-4xl">{pt.icon}</span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          form.petTypeId === pt.id
                            ? "text-primary"
                            : "text-foreground/60",
                        )}
                      >
                        {pt.name}
                      </span>
                    </button>
                  ))}
                </div>
                {stepErrors.petTypeId && (
                  <ErrorText id="pet-type-error">
                    {stepErrors.petTypeId}
                  </ErrorText>
                )}
              </fieldset>
            )}

            {/* Purpose — show after image uploaded */}
            {imagePreview && !detecting && (
              <fieldset className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <legend className="mb-2 text-xs font-medium text-foreground/60">
                  จุดประสงค์ *
                </legend>
                <div
                  role="radiogroup"
                  aria-label="เลือกจุดประสงค์"
                  aria-invalid={!!stepErrors.purpose}
                  aria-describedby={
                    stepErrors.purpose ? "purpose-error" : undefined
                  }
                  className="flex flex-col gap-2"
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={form.purpose === opt.value}
                      onClick={() => actions.setField("purpose", opt.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 bg-card px-4 py-3.5 text-left transition-all",
                        form.purpose === opt.value
                          ? "border-primary shadow-sm"
                          : stepErrors.purpose
                            ? "border-destructive/30 hover:border-destructive/50"
                            : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
                        {opt.icon}
                      </span>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            form.purpose === opt.value
                              ? "text-primary"
                              : "text-foreground/70",
                          )}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-foreground/50">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {stepErrors.purpose && (
                  <ErrorText id="purpose-error">{stepErrors.purpose}</ErrorText>
                )}
              </fieldset>
            )}
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <StepHeader
              title="น้องอยู่ตรงไหน?"
              subtitle="เลือกตำแหน่งที่พบน้องบนแผนที่"
            />

            {form.latitude != null ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {form.address || "ตำแหน่งที่เลือก"}
                    </p>
                    <p className="text-xs text-foreground/40">
                      {form.latitude?.toFixed(4)}, {form.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={actions.openLocationPicker}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  เปลี่ยน
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={actions.openLocationPicker}
                className={cn(
                  "flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 transition-colors",
                  stepErrors.location
                    ? "border-destructive"
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
            {stepErrors.location && (
              <ErrorText id="location-error">{stepErrors.location}</ErrorText>
            )}
          </div>
        )}

        {/* ── Step 3: Title + Gender ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <StepHeader
              title="บอกเล่าเรื่องของน้อง"
              subtitle="เลือกชื่อเรื่องที่แนะนำ หรือแก้เองก็ได้"
            />

            {/* Title */}
            <div>
              <label
                htmlFor="post-title"
                className="mb-1.5 block text-xs font-medium text-foreground/60"
              >
                ชื่อเรื่อง *
              </label>
              <input
                id="post-title"
                name="title"
                value={form.title}
                onChange={(e) => actions.setField("title", e.target.value)}
                placeholder="พิมพ์เอง หรือแตะเลือกด้านล่าง"
                aria-invalid={!!stepErrors.title}
                aria-describedby={stepErrors.title ? "title-error" : undefined}
                className={cn(inputClass, stepErrors.title && inputErrorClass)}
              />
              {stepErrors.title && (
                <ErrorText id="title-error">{stepErrors.title}</ErrorText>
              )}

              {/* Auto-suggest titles */}
              {(() => {
                const suggestions = actions.buildTitleSuggestions();
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
                          onClick={() => actions.setField("title", s)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs transition-colors",
                            form.title === s
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
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-foreground/60">
                เพศ *
              </legend>
              <div
                role="radiogroup"
                aria-label="เลือกเพศ"
                className="flex gap-2"
              >
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={form.gender === opt.value}
                    onClick={() => actions.setField("gender", opt.value)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 transition-all",
                      form.gender === opt.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        form.gender === opt.value
                          ? "text-primary"
                          : "text-foreground/60",
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
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
              name="breed"
              label="พันธุ์"
              placeholder="พิมพ์พันธุ์เอง..."
              suggestions={
                BREED_SUGGESTIONS_BY_SLUG[
                  petTypes.find((p) => p.id === form.petTypeId)?.slug ?? "dog"
                ] ?? BREED_SUGGESTIONS_BY_SLUG["dog"]
              }
              value={form.breed}
              onChange={(v) => actions.setField("breed", v)}
            />

            {/* Color */}
            <SuggestField
              name="color"
              label="สี"
              placeholder="พิมพ์สีเอง..."
              suggestions={COLOR_SUGGESTIONS}
              value={form.color}
              onChange={(v) => actions.setField("color", v)}
            />

            {/* Estimated Age */}
            <SuggestField
              name="estimatedAge"
              label="อายุโดยประมาณ"
              placeholder="พิมพ์อายุเอง..."
              suggestions={AGE_SUGGESTIONS}
              value={form.estimatedAge}
              onChange={(v) => actions.setField("estimatedAge", v)}
            />

            {/* Description */}
            <div>
              <label
                htmlFor="post-description"
                className="mb-1.5 block text-xs font-medium text-foreground/60"
              >
                รายละเอียด
              </label>
              <textarea
                id="post-description"
                name="description"
                value={form.description}
                onChange={(e) =>
                  actions.setField("description", e.target.value)
                }
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
                      const next = form.description
                        ? `${form.description} ${tpl}`
                        : tpl;
                      actions.setField("description", next);
                    }}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/60 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Health toggles */}
            <fieldset className="flex flex-col gap-2">
              <legend className="text-xs font-medium text-foreground/60">
                สุขภาพ
              </legend>
              <ToggleRow
                icon={Syringe}
                label="ฉีดวัคซีนแล้ว"
                value={form.isVaccinated}
                onChange={(v) => actions.setField("isVaccinated", v)}
              />
              <ToggleRow
                icon={Scissors}
                label="ทำหมันแล้ว"
                value={form.isNeutered}
                onChange={(v) => actions.setField("isNeutered", v)}
              />
            </fieldset>
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
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="ตัวอย่างรูปสัตว์เลี้ยงสำหรับตรวจสอบก่อนโพสต์"
                  className="h-40 w-full rounded-xl object-cover"
                />
              )}

              <ReviewRow
                label="ชนิด"
                value={petTypes.find((p) => p.id === form.petTypeId)?.name}
              />
              <ReviewRow label="ชื่อเรื่อง" value={form.title} />
              <ReviewRow
                label="จุดประสงค์"
                value={
                  PURPOSE_OPTIONS.find((s) => s.value === form.purpose)?.label
                }
              />
              <ReviewRow
                label="เพศ"
                value={
                  GENDER_OPTIONS.find((g) => g.value === form.gender)?.label
                }
              />
              <ReviewRow label="ตำแหน่ง" value={form.address} />
              {form.breed && <ReviewRow label="พันธุ์" value={form.breed} />}
              {form.color && <ReviewRow label="สี" value={form.color} />}
              {form.estimatedAge && (
                <ReviewRow label="อายุ" value={form.estimatedAge} />
              )}
              {form.description && (
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="mb-1 text-[10px] font-medium text-foreground/40">
                    รายละเอียด
                  </p>
                  <p className="text-sm text-foreground/80">
                    {form.description}
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
              onClick={actions.goBack}
              className="flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              ย้อนกลับ
            </button>
          )}

          <div className="flex-1" />

          {!isReview ? (
            <button
              type="button"
              onClick={actions.goNext}
              className="flex items-center gap-1 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {step === TOTAL_STEPS ? "ตรวจสอบ" : "ถัดไป"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={actions.submit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? (
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

      {/* ── Location picker modal ── */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={actions.closeLocationPicker}
        onConfirm={actions.handleLocationConfirm}
      />
    </>
  );
}

// ── Sub-components ───────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";
const inputErrorClass = "border-destructive focus:border-destructive";

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-foreground/50">{subtitle}</p>
    </div>
  );
}

function ErrorText({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
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
  name,
}: {
  label: string;
  placeholder: string;
  suggestions: string[];
  value: string;
  onChange: (v: string) => void;
  name?: string;
}) {
  const fieldId = name ?? label;
  const isSelected = (s: string) => value === s;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-xs font-medium text-foreground/60"
      >
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
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
                    ? "bg-destructive/10 text-destructive"
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
