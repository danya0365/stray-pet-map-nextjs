"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

interface ShareUpdateButtonProps {
  url: string;
  text?: string;
}

export function ShareUpdateButton({ url, text }: ShareUpdateButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "StrayPetMap Update",
      text: text || "ติดตามอัปเดตล่าสุดจากชุมชน StrayPetMap",
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select and copy
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
      title={copied ? "Copied!" : "Share"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
      <span className="sr-only">Share</span>
    </button>
  );
}

export function ShareIconButton({ url, text }: ShareUpdateButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "StrayPetMap Update",
      text: text || "ติดตามอัปเดตล่าสุดจากชุมชน StrayPetMap",
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="group flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
      title={copied ? "Copied!" : "Share"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </button>
  );
}
