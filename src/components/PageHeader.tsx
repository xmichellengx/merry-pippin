"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-golden-400 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} className="text-golden-700" />
        </Link>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      {action}
    </div>
  );
}
