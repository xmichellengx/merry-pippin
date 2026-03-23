"use client";

import { useEffect, useRef, useId } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** "center" (default) or "bottom" for bottom-sheet style */
  position?: "center" | "bottom";
}

export default function Modal({ open, onClose, title, children, position = "center" }: ModalProps) {
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Keydown listener — uses ref so it never causes effect re-runs
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus management — only runs when modal opens/closes
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) focusable[0].focus();
      }, 50);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const isBottom = position === "bottom";

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 overlay z-[60] flex ${isBottom ? "items-end" : "items-center"} justify-center ${isBottom ? "" : "px-4"}`}
      onClick={() => onCloseRef.current()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={contentRef}
        className={`bg-white w-full ${isBottom ? "max-w-lg rounded-t-3xl animate-slide-up" : "max-w-sm rounded-2xl animate-scale-in"} p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto`}
        style={isBottom ? { paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" } : undefined}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-base font-bold">{title}</h2>
          <button onClick={() => onCloseRef.current()} aria-label="Close" className="w-8 h-8 rounded-full bg-golden-50 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-golden-400 focus-visible:ring-offset-2">
            <X size={16} className="text-muted" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
