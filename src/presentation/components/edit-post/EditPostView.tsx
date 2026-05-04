"use client";

/**
 * EditPostView
 * ✅ Redesigned to match CreatePostV2View styling
 * ✅ All colors use semantic tokens — no hardcoded Tailwind colors
 * ✅ Card-based sections with StepHeader, SuggestField, ToggleRow
 */

import type {
  PetGender,
  PetPost,
  PetPostPurpose,
  PetPostStatus,
  PetType,
} from "@/domain/entities/pet-post";
import { cn } from "@/presentation/lib/cn";
import { ArrowLeft, Save, Scissors, Syringe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditPostPresenter } from "./useEditPostPresenter";

// ── Constants (UI-only) ──────────────────────────────────

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

const GENDER_OPTIONS = [
  { value: "male" as const, label: "ผู้", icon: "♂️" },
  { value: "female" as const, label: "เมีย", icon: "♀️" },
  { value: "unknown" as const, label: "ไม่ทราบ", icon: "❓" },
];

const PURPOSE_OPTIONS = [
  { value: "lost_pet" as PetPostPurpose, label: "ตามหาน้อง" },
  { value: "rehome_pet" as PetPostPurpose, label: "น้องหาบ้าน" },
  { value: "community_cat" as PetPostPurpose, label: "น้องแมวจร" },
];

const STATUS_OPTIONS = [
  { value: "available" as PetPostStatus, label: "Available" },
  { value: "pending" as PetPostStatus, label: "Pending" },
  { value: "adopted" as PetPostStatus, label: "Adopted" },
  { value: "missing" as PetPostStatus, label: "Missing" },
];

// ── Shared styles ─────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

// ── Sub-components ──────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-foreground/50">{subtitle}</p>
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
        className="mb-1.5 block text-sm font-medium text-foreground/60"
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
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-foreground/40" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex gap-1">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              value === v
                ? v === true
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
                : "text-foreground/40 hover:bg-muted",
            )}
          >
            {v === true ? "ใช่" : "ไม่"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main View ────────────────────────────────────────────

interface EditPostViewProps {
  post: PetPost;
  petTypes: PetType[];
}

export function EditPostView({ post, petTypes }: EditPostViewProps) {
  const router = useRouter();
  const [state, actions] = useEditPostPresenter(
    post,
    petTypes,
    (updatedPost) => {
      router.push(`/pets/${updatedPost.id}`);
      router.refresh();
    },
  );

  const { form, submitting, error } = state;
  const { setField, submit, hasChanges } = actions;

  const selectedPetTypeSlug =
    petTypes.find((p) => p.id === form.petTypeId)?.slug ?? "dog";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/pets/${post.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit Post</h1>
          <p className="text-sm text-muted-foreground">{post.title}</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-6"
      >
        {/* Basic Info */}
        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-4">
          <StepHeader
            title="ข้อมูลหลัก"
            subtitle="ชื่อเรื่องและรายละเอียดของโพสต์"
          />

          <div>
            <label
              htmlFor="edit-title"
              className="mb-1.5 block text-sm font-medium text-foreground/60"
            >
              ชื่อเรื่อง *
            </label>
            <input
              id="edit-title"
              name="title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="mb-1.5 block text-sm font-medium text-foreground/60"
            >
              รายละเอียด
            </label>
            <textarea
              id="edit-description"
              name="description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              className={cn(inputClass, "resize-none")}
            />
          </div>
        </fieldset>

        {/* Pet Details */}
        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-4">
          <StepHeader
            title="ข้อมูลสัตว์เลี้ยง"
            subtitle="ชนิด พันธุ์ สี เพศ และอายุ"
          />

          {/* Pet Type */}
          <div>
            <label
              htmlFor="edit-pet-type"
              className="mb-1.5 block text-sm font-medium text-foreground/60"
            >
              ชนิดสัตว์ *
            </label>
            <select
              id="edit-pet-type"
              name="petTypeId"
              value={form.petTypeId}
              onChange={(e) => setField("petTypeId", e.target.value)}
              className={inputClass}
            >
              <option value="">เลือกชนิด</option>
              {petTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.icon} {pt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Breed & Color */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SuggestField
              name="breed"
              label="พันธุ์"
              placeholder="พิมพ์พันธุ์เอง..."
              suggestions={
                BREED_SUGGESTIONS_BY_SLUG[selectedPetTypeSlug] ??
                BREED_SUGGESTIONS_BY_SLUG["dog"]
              }
              value={form.breed ?? ""}
              onChange={(v) => setField("breed", v)}
            />
            <SuggestField
              name="color"
              label="สี"
              placeholder="พิมพ์สีเอง..."
              suggestions={COLOR_SUGGESTIONS}
              value={form.color ?? ""}
              onChange={(v) => setField("color", v)}
            />
          </div>

          {/* Gender */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground/60">
              เพศ *
            </legend>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField("gender", opt.value as PetGender)}
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

          {/* Age */}
          <SuggestField
            name="estimatedAge"
            label="อายุโดยประมาณ"
            placeholder="พิมพ์อายุเอง..."
            suggestions={AGE_SUGGESTIONS}
            value={form.estimatedAge ?? ""}
            onChange={(v) => setField("estimatedAge", v)}
          />
        </fieldset>

        {/* Status & Purpose */}
        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-4">
          <StepHeader
            title="สถานะและจุดประสงค์"
            subtitle="อัปเดตสถานะและวัตถุประสงค์ของโพสต์"
          />

          <div>
            <label
              htmlFor="edit-purpose"
              className="mb-1.5 block text-sm font-medium text-foreground/60"
            >
              จุดประสงค์ *
            </label>
            <select
              id="edit-purpose"
              name="purpose"
              value={form.purpose}
              onChange={(e) =>
                setField("purpose", e.target.value as PetPostPurpose)
              }
              className={inputClass}
            >
              {PURPOSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="mb-1.5 block text-sm font-medium text-foreground/60"
            >
              สถานะ *
            </label>
            <select
              id="edit-status"
              name="status"
              value={form.status}
              onChange={(e) =>
                setField("status", e.target.value as PetPostStatus)
              }
              className={inputClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Health */}
        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-2">
          <StepHeader title="สุขภาพ" subtitle="ข้อมูลสุขภาพของน้อง" />
          <ToggleRow
            icon={Syringe}
            label="ฉีดวัคซีนแล้ว"
            value={form.isVaccinated}
            onChange={(v) => setField("isVaccinated", v)}
          />
          <ToggleRow
            icon={Scissors}
            label="ทำหมันแล้ว"
            value={form.isNeutered}
            onChange={(v) => setField("isNeutered", v)}
          />
        </fieldset>

        {/* Location */}
        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-4">
          <StepHeader title="ตำแหน่ง" subtitle="จังหวัดและพิกัด GPS" />

          <div>
            <label
              htmlFor="edit-province"
              className="mb-1.5 block text-sm font-medium text-foreground/60"
            >
              จังหวัด
            </label>
            <input
              id="edit-province"
              name="province"
              value={form.province ?? ""}
              onChange={(e) => setField("province", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-latitude"
                className="mb-1.5 block text-sm font-medium text-foreground/60"
              >
                Latitude
              </label>
              <input
                id="edit-latitude"
                name="latitude"
                type="number"
                step="any"
                value={form.latitude ?? ""}
                onChange={(e) =>
                  setField(
                    "latitude",
                    (e.target.value ? parseFloat(e.target.value) : null) as
                      | number
                      | null,
                  )
                }
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="edit-longitude"
                className="mb-1.5 block text-sm font-medium text-foreground/60"
              >
                Longitude
              </label>
              <input
                id="edit-longitude"
                name="longitude"
                type="number"
                step="any"
                value={form.longitude ?? ""}
                onChange={(e) =>
                  setField(
                    "longitude",
                    (e.target.value ? parseFloat(e.target.value) : null) as
                      | number
                      | null,
                  )
                }
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!hasChanges || submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
          <Link
            href={`/pets/${post.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
