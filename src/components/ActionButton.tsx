"use client";

import { Plus } from "lucide-react";

export function ActionButton({
  onClick,
  label,
  size = 18,
}: {
  onClick: () => void;
  label: string;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md focus-visible:ring-2 focus-visible:ring-golden-400 focus-visible:ring-offset-2"
    >
      <Plus size={size} className="text-white" />
    </button>
  );
}
