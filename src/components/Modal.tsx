"use client";

import { useEffect, useRef, useCallback } from "react";
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
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
  }, [onClose]);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleKeyDown);
      // Focus first focusable element
      setTimeout(() => {
        const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) focusable[0].focus();
      }, 50);
      return () => document.removeEventListener("keydown", handleKeyDown);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  const isBottom = position === "bottom";

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 overlay z-[60] flex ${isBottom ? "items-end" : "items-center"} justify-center ${isBottom ? "" : "px-4"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        className={`bg-white w-full ${isBottom ? "max-w-lg rounded-t-3xl animate-slide-up" : "max-w-sm rounded-2xl"} p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto`}
        style={isBottom ? { paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" } : undefined}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-base font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-golden-50 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-golden-400 focus-visible:ring-offset-2">
            <X size={16} className="text-muted" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
