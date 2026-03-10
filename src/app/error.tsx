"use client";

import Image from "next/image";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
      <Image src="/loading-home.webp" alt="" width={150} height={150} className="opacity-60 mb-4" />
      <h2 className="text-lg font-bold mb-2">Something went wrong!</h2>
      <p className="text-sm text-muted mb-6">&quot;Even the very wise cannot see all ends.&quot; Let&apos;s try again.</p>
      <button onClick={reset} className="px-6 py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md">
        Try Again
      </button>
    </div>
  );
}
