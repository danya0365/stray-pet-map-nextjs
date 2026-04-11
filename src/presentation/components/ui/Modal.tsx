"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTransition, animated } from "@react-spring/web";
import { X } from "lucide-react";
import { cn } from "@/presentation/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const transitions = useTransition(open, {
    from: { opacity: 0, transform: "scale(0.95)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.95)" },
    config: { tension: 300, friction: 22 },
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return transitions((style, show) =>
    show ? (
      <animated.div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        style={{ opacity: style.opacity }}
        onClick={handleOverlayClick}
      >
        <animated.div
          className={cn(
            "w-full max-w-lg rounded-2xl border border-border/40 bg-card p-6 shadow-xl",
            className
          )}
          style={{ transform: style.transform }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="ml-auto rounded-full p-1.5 transition-colors hover:bg-foreground/5"
              aria-label="ปิด"
            >
              <X className="h-5 w-5 text-foreground/50" />
            </button>
          </div>

          {/* Content */}
          {children}
        </animated.div>
      </animated.div>
    ) : null
  );
}
