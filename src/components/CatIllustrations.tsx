// Cat illustrations using AI-generated Mofusand/Pusheen-style images
import Image from "next/image";

function CatImage({
  src,
  alt,
  size,
  className,
}: {
  src: string;
  alt: string;
  size: number;
  className: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

export function CatSitting({ size = 120, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-sitting.webp" alt="Cat sitting" size={size} className={className} />;
}

export function CatSleeping({ size = 120, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-sleeping.webp" alt="Cat sleeping" size={size} className={className} />;
}

export function CatWaving({ size = 120, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-waving.webp" alt="Cat waving" size={size} className={className} />;
}

export function CatEating({ size = 100, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-eating.webp" alt="Cat eating" size={size} className={className} />;
}

export function CatWithHeart({ size = 80, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-with-heart.webp" alt="Cat with heart" size={size} className={className} />;
}

export function TwoCatsSitting({ size = 200, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/two-cats-sitting.webp" alt="Two cats sitting together" size={size} className={className} />;
}

export function CatOnScale({ size = 100, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-on-scale.webp" alt="Cat on scale" size={size} className={className} />;
}

export function CatWithCamera({ size = 100, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-with-camera.webp" alt="Cat with camera" size={size} className={className} />;
}

export function TwoCatsSilhouette({ size = 140, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/two-cats-silhouette.webp" alt="Two cats silhouette" size={size} className={className} />;
}
