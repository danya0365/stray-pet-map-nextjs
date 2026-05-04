"use client";

import type { LucideIcon } from "lucide-react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  onIcon?: LucideIcon;
  onIconClass?: string;
  offIcon?: LucideIcon;
  offIconClass?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  onIcon: OnIcon,
  onIconClass,
  offIcon: OffIcon,
  offIconClass,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        {checked && OnIcon ? (
          <OnIcon className={`h-4 w-4 ${onIconClass ?? ""}`} />
        ) : OffIcon ? (
          <OffIcon className={`h-4 w-4 ${offIconClass ?? ""}`} />
        ) : null}
        <span>{label}</span>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-[2px]"}`}
        />
      </button>
    </div>
  );
}
