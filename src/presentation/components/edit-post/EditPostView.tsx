"use client";

import type {
  PetGender,
  PetPost,
  PetPostPurpose,
  PetPostStatus,
  PetType,
} from "@/domain/entities/pet-post";
import { cn } from "@/presentation/lib/cn";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditPostPresenter } from "./useEditPostPresenter";

interface EditPostViewProps {
  post: PetPost;
  petTypes: PetType[];
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-6 w-10 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-gray-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
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

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-base font-semibold">Basic Info</h2>
          <Input
            label="Title"
            value={form.title}
            onChange={(v: string) => setField("title", v)}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-base font-semibold">Pet Details</h2>
          <Select
            label="Pet Type"
            value={form.petTypeId}
            onChange={(v: string) => setField("petTypeId", v)}
            options={[
              { value: "", label: "Select type" },
              ...petTypes.map((pt) => ({
                value: pt.id,
                label: `${pt.icon} ${pt.name}`,
              })),
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Breed"
              value={form.breed}
              onChange={(v: string) => setField("breed", v)}
            />
            <Input
              label="Color"
              value={form.color}
              onChange={(v: string) => setField("color", v)}
            />
          </div>
          <Select
            label="Gender"
            value={form.gender}
            onChange={(v: string) => setField("gender", v as PetGender)}
            options={[
              { value: "unknown", label: "Unknown" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
          <Select
            label="Age"
            value={form.estimatedAge}
            onChange={(v: string) => setField("estimatedAge", v)}
            options={[
              { value: "", label: "Select age" },
              { value: "puppy", label: "Puppy (<1 yr)" },
              { value: "young", label: "Young (1-3 yrs)" },
              { value: "adult", label: "Adult (3-7 yrs)" },
              { value: "senior", label: "Senior (>7 yrs)" },
              { value: "unknown", label: "Unknown" },
            ]}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-base font-semibold">Status & Purpose</h2>
          <Select
            label="Purpose"
            value={form.purpose}
            onChange={(v: string) => setField("purpose", v as PetPostPurpose)}
            options={[
              { value: "lost_pet", label: "Lost Pet" },
              { value: "rehome_pet", label: "Rehome Pet" },
              { value: "community_cat", label: "Community Cat" },
            ]}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(v: string) => setField("status", v as PetPostStatus)}
            options={[
              { value: "available", label: "Available" },
              { value: "pending", label: "Pending" },
              { value: "adopted", label: "Adopted" },
              { value: "missing", label: "Missing" },
            ]}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-base font-semibold">Health</h2>
          <Toggle
            label="Vaccinated"
            checked={form.isVaccinated}
            onChange={(v: boolean) => setField("isVaccinated", v)}
          />
          <Toggle
            label="Neutered / Spayed"
            checked={form.isNeutered}
            onChange={(v: boolean) => setField("isNeutered", v)}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-base font-semibold">Location</h2>
          <Input
            label="Province"
            value={form.province}
            onChange={(v: string) => setField("province", v)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Latitude</label>
              <input
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Longitude</label>
              <input
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!hasChanges || submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/pets/${post.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
