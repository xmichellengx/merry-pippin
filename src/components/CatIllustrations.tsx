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
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 200 150" fill="none" className={className}>
      {/* Left cat - slightly bigger (Merry) */}
      <ellipse cx="68" cy="100" rx="32" ry="28" fill="white" />
      <circle cx="68" cy="58" r="28" fill="white" />
      <path d="M44 38 Q40 18 54 32" fill="white" />
      <path d="M92 38 Q96 18 82 32" fill="white" />
      <ellipse cx="55" cy="108" rx="10" ry="6" fill="white" />
      <ellipse cx="81" cy="108" rx="10" ry="6" fill="white" />
      <path d="M98 95 Q110 80 105 65" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />

      {/* Right cat - slightly smaller (Pippin) */}
      <ellipse cx="142" cy="104" rx="28" ry="24" fill="white" />
      <circle cx="142" cy="66" r="24" fill="white" />
      <path d="M122 50 Q118 32 131 44" fill="white" />
      <path d="M162 50 Q166 32 153 44" fill="white" />
      <ellipse cx="131" cy="112" rx="9" ry="5" fill="white" />
      <ellipse cx="153" cy="112" rx="9" ry="5" fill="white" />
      <path d="M168 100 Q178 88 175 75" stroke="white" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}
