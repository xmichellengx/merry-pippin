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
  return <CatImage src="/cat-sitting.png" alt="Cat sitting" size={size} className={className} />;
}

export function CatSleeping({ size = 120, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-sleeping.png" alt="Cat sleeping" size={size} className={className} />;
}

export function CatWaving({ size = 120, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-waving.png" alt="Cat waving" size={size} className={className} />;
}

export function CatEating({ size = 100, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-eating.png" alt="Cat eating" size={size} className={className} />;
}

export function CatWithHeart({ size = 80, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-with-heart.png" alt="Cat with heart" size={size} className={className} />;
}

export function TwoCatsSitting({ size = 200, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/two-cats-sitting.png" alt="Two cats sitting together" size={size} className={className} />;
}

export function CatOnScale({ size = 100, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-on-scale.png" alt="Cat on scale" size={size} className={className} />;
}

export function CatWithCamera({ size = 100, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/cat-with-camera.png" alt="Cat with camera" size={size} className={className} />;
}

export function TwoCatsSilhouette({ size = 140, className = "" }: { size?: number; className?: string }) {
  return <CatImage src="/two-cats-silhouette.png" alt="Two cats silhouette" size={size} className={className} />;
}
