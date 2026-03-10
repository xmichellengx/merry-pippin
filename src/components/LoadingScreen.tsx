"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

export function LoadingScreen({
  image,
  width = 180,
  height = 180,
}: {
  image: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className="flex flex-col items-center pt-32 gap-3">
      <Image
        src={image}
        alt=""
        width={width}
        height={height}
        priority
        className="opacity-80"
      />
      <Loader2 size={28} className="text-golden-500 animate-spin" />
    </div>
  );
}
