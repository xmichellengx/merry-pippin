import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
      <Image src="/loading-home.webp" alt="" width={150} height={150} className="opacity-60 mb-4" />
      <h2 className="text-lg font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-muted mb-6">&quot;Not all those who wander are lost&quot; &mdash; but this page is!</p>
      <Link href="/" className="px-6 py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md">
        Back to the Shire
      </Link>
    </div>
  );
}
