"use client";

import { MessageSquare, Send, X } from "lucide-react";
import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  initialContent?: string;
  placeholder?: string;
  isSubmitting?: boolean;
  error?: string | null;
  replyToName?: string;
  variant?: "default" | "compact";
}

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = "",
  placeholder = "แสดงความคิดเห็น...",
  isSubmitting = false,
  error,
  replyToName,
  variant = "default",
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [charCount, setCharCount] = useState(initialContent.length);

  const MAX_LENGTH = 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    onSubmit(content.trim());
    setContent("");
    setCharCount(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_LENGTH) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };

  const isCompact = variant === "compact";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Reply indicator */}
      {replyToName && (
        <div className="mb-2 flex items-center gap-2 text-xs text-foreground/60">
          <MessageSquare className="h-3 w-3" />
          <span>ตอบกลับ {replyToName}</span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-auto rounded-full p-1 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="relative">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={isSubmitting}
          className={`w-full resize-none rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${
            isCompact ? "py-2 pr-10" : "py-3 pr-12"
          }`}
          rows={isCompact ? 2 : 3}
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className={`absolute rounded-lg bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-50 ${
            isCompact
              ? "bottom-1.5 right-1.5 p-1.5"
              : "bottom-2 right-2 p-2"
          }`}
        >
          <Send className={`${isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        </button>
      </div>

      {/* Character count */}
      <div className="mt-1 flex justify-end text-xs text-foreground/40">
        <span className={charCount > MAX_LENGTH * 0.9 ? "text-amber-500" : ""}>
          {charCount}/{MAX_LENGTH}
        </span>
      </div>
    </form>
  );
}
