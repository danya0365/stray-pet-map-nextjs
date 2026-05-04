"use client";

import { cn } from "@/presentation/lib/cn";
import { User } from "lucide-react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: number;
  fill?: boolean;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

function isValidImageUrl(url: string | null | undefined): url is string {
  return Boolean(url && (url.startsWith("http") || url.startsWith("/")));
}

export function Avatar({
  src,
  alt = "",
  name,
  size,
  fill: fillProp,
  className,
  imageClassName,
  fallbackClassName,
}: AvatarProps) {
  const hasValidUrl = isValidImageUrl(src);
  const useFill = fillProp ?? !size;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-muted",
        useFill && "relative",
        className,
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      {hasValidUrl ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          fill={useFill}
          width={useFill ? undefined : size}
          height={useFill ? undefined : size}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center text-muted-foreground",
            fallbackClassName,
          )}
        >
          {name ? (
            <span className="font-medium leading-none">
              {name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="h-1/2 w-1/2" />
          )}
        </div>
      )}
    </div>
  );
}
