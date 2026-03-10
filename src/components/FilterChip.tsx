"use client";

export function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-golden-400 focus-visible:ring-offset-2 ${
        active ? "golden-gradient text-white" : "bg-golden-50 text-golden-700"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterChipDark({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-golden-400 focus-visible:ring-offset-2 ${
        active ? "bg-foreground text-white" : "bg-golden-50 text-foreground/70"
      }`}
    >
      {children}
    </button>
  );
}
