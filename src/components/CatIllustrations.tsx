// Cute Golden British Shorthair 2D illustrations
// Round chubby face, small ears, big round eyes, golden/amber coat, stocky body

export function CatSitting({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      {/* Body */}
      <ellipse cx="60" cy="85" rx="28" ry="22" fill="#E8B86D" />
      <ellipse cx="60" cy="85" rx="24" ry="18" fill="#F0C87A" />
      {/* Chest fluff */}
      <ellipse cx="60" cy="78" rx="14" ry="10" fill="#F5DBA3" />
      {/* Head */}
      <circle cx="60" cy="48" r="26" fill="#E8B86D" />
      <circle cx="60" cy="48" r="23" fill="#F0C87A" />
      {/* Left ear */}
      <path d="M38 30 L42 12 L52 28Z" fill="#E8B86D" />
      <path d="M40 28 L43 16 L50 27Z" fill="#F5B8C4" />
      {/* Right ear */}
      <path d="M82 30 L78 12 L68 28Z" fill="#E8B86D" />
      <path d="M80 28 L77 16 L70 27Z" fill="#F5B8C4" />
      {/* Eyes */}
      <circle cx="50" cy="45" r="6" fill="white" />
      <circle cx="70" cy="45" r="6" fill="white" />
      <circle cx="51" cy="44" r="4" fill="#D4853C" />
      <circle cx="71" cy="44" r="4" fill="#D4853C" />
      <circle cx="52" cy="43" r="1.5" fill="white" />
      <circle cx="72" cy="43" r="1.5" fill="white" />
      <circle cx="51" cy="44" r="2" fill="#2D1B0E" />
      <circle cx="71" cy="44" r="2" fill="#2D1B0E" />
      <circle cx="52" cy="43" r="0.8" fill="white" />
      <circle cx="72" cy="43" r="0.8" fill="white" />
      {/* Nose */}
      <ellipse cx="60" cy="52" rx="3" ry="2" fill="#F5A0B0" />
      {/* Mouth */}
      <path d="M57 54 Q60 57 63 54" stroke="#C68A5B" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="35" y1="50" x2="47" y2="51" stroke="#D4A96A" strokeWidth="0.8" />
      <line x1="35" y1="53" x2="47" y2="53" stroke="#D4A96A" strokeWidth="0.8" />
      <line x1="85" y1="50" x2="73" y2="51" stroke="#D4A96A" strokeWidth="0.8" />
      <line x1="85" y1="53" x2="73" y2="53" stroke="#D4A96A" strokeWidth="0.8" />
      {/* Front paws */}
      <ellipse cx="48" cy="100" rx="8" ry="5" fill="#E8B86D" />
      <ellipse cx="72" cy="100" rx="8" ry="5" fill="#E8B86D" />
      <ellipse cx="48" cy="100" rx="6" ry="3.5" fill="#F0C87A" />
      <ellipse cx="72" cy="100" rx="6" ry="3.5" fill="#F0C87A" />
      {/* Tail */}
      <path d="M88 85 Q100 75 95 60" stroke="#E8B86D" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M88 85 Q100 75 95 60" stroke="#F0C87A" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="42" cy="53" r="4" fill="#F5C4C4" opacity="0.4" />
      <circle cx="78" cy="53" r="4" fill="#F5C4C4" opacity="0.4" />
    </svg>
  );
}

export function CatSleeping({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 80" fill="none" className={className}>
      {/* Body - curled up */}
      <ellipse cx="70" cy="55" rx="45" ry="22" fill="#E8B86D" />
      <ellipse cx="70" cy="55" rx="40" ry="18" fill="#F0C87A" />
      {/* Head resting */}
      <circle cx="35" cy="45" r="20" fill="#E8B86D" />
      <circle cx="35" cy="45" r="17" fill="#F0C87A" />
      {/* Left ear */}
      <path d="M20 30 L22 18 L30 28Z" fill="#E8B86D" />
      <path d="M22 29 L23 21 L28 27Z" fill="#F5B8C4" />
      {/* Right ear */}
      <path d="M50 30 L48 18 L40 28Z" fill="#E8B86D" />
      <path d="M48 29 L47 21 L42 27Z" fill="#F5B8C4" />
      {/* Closed eyes - happy sleeping */}
      <path d="M27 42 Q30 39 33 42" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M37 42 Q40 39 43 42" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="35" cy="48" rx="2.5" ry="1.5" fill="#F5A0B0" />
      {/* Mouth */}
      <path d="M33 50 Q35 52 37 50" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="25" cy="48" r="3" fill="#F5C4C4" opacity="0.4" />
      <circle cx="45" cy="48" r="3" fill="#F5C4C4" opacity="0.4" />
      {/* Front paw tucked */}
      <ellipse cx="50" cy="62" rx="7" ry="4" fill="#E8B86D" />
      <ellipse cx="50" cy="62" rx="5" ry="3" fill="#F0C87A" />
      {/* Tail curled around */}
      <path d="M115 55 Q125 40 115 30 Q108 25 105 35" stroke="#E8B86D" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M115 55 Q125 40 115 30 Q108 25 105 35" stroke="#F0C87A" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Zzz */}
      <text x="55" y="25" fontSize="10" fill="#D4A96A" opacity="0.6" fontWeight="bold">z</text>
      <text x="63" y="18" fontSize="12" fill="#D4A96A" opacity="0.4" fontWeight="bold">z</text>
      <text x="73" y="10" fontSize="14" fill="#D4A96A" opacity="0.3" fontWeight="bold">z</text>
    </svg>
  );
}

export function CatWaving({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      {/* Body */}
      <ellipse cx="60" cy="88" rx="26" ry="20" fill="#E8B86D" />
      <ellipse cx="60" cy="88" rx="22" ry="16" fill="#F0C87A" />
      {/* Chest fluff */}
      <ellipse cx="60" cy="82" rx="12" ry="9" fill="#F5DBA3" />
      {/* Head */}
      <circle cx="60" cy="48" r="24" fill="#E8B86D" />
      <circle cx="60" cy="48" r="21" fill="#F0C87A" />
      {/* Left ear */}
      <path d="M40 30 L43 14 L52 28Z" fill="#E8B86D" />
      <path d="M42 28 L44 18 L50 27Z" fill="#F5B8C4" />
      {/* Right ear */}
      <path d="M80 30 L77 14 L68 28Z" fill="#E8B86D" />
      <path d="M78 28 L76 18 L70 27Z" fill="#F5B8C4" />
      {/* Eyes - happy */}
      <circle cx="50" cy="45" r="5.5" fill="white" />
      <circle cx="70" cy="45" r="5.5" fill="white" />
      <circle cx="51" cy="44" r="3.5" fill="#D4853C" />
      <circle cx="71" cy="44" r="3.5" fill="#D4853C" />
      <circle cx="51" cy="44" r="1.8" fill="#2D1B0E" />
      <circle cx="71" cy="44" r="1.8" fill="#2D1B0E" />
      <circle cx="52" cy="43" r="0.7" fill="white" />
      <circle cx="72" cy="43" r="0.7" fill="white" />
      {/* Nose */}
      <ellipse cx="60" cy="51" rx="2.5" ry="1.8" fill="#F5A0B0" />
      {/* Happy mouth */}
      <path d="M56 53 Q60 57 64 53" stroke="#C68A5B" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="37" y1="49" x2="47" y2="50" stroke="#D4A96A" strokeWidth="0.7" />
      <line x1="37" y1="52" x2="47" y2="52" stroke="#D4A96A" strokeWidth="0.7" />
      <line x1="83" y1="49" x2="73" y2="50" stroke="#D4A96A" strokeWidth="0.7" />
      <line x1="83" y1="52" x2="73" y2="52" stroke="#D4A96A" strokeWidth="0.7" />
      {/* Waving paw (right, raised) */}
      <path d="M82 75 Q90 62 85 52" stroke="#E8B86D" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M82 75 Q90 62 85 52" stroke="#F0C87A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="85" cy="50" rx="5" ry="4" fill="#F0C87A" transform="rotate(-15 85 50)" />
      {/* Left paw */}
      <ellipse cx="46" cy="102" rx="7" ry="4.5" fill="#E8B86D" />
      <ellipse cx="46" cy="102" rx="5.5" ry="3" fill="#F0C87A" />
      {/* Tail */}
      <path d="M35 90 Q22 80 25 65" stroke="#E8B86D" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M35 90 Q22 80 25 65" stroke="#F0C87A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="42" cy="52" r="3.5" fill="#F5C4C4" opacity="0.4" />
      <circle cx="78" cy="52" r="3.5" fill="#F5C4C4" opacity="0.4" />
    </svg>
  );
}

export function CatEating({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Bowl */}
      <ellipse cx="50" cy="82" rx="22" ry="6" fill="#D4A96A" />
      <path d="M28 78 Q28 88 50 88 Q72 88 72 78" fill="#E8C87D" />
      <ellipse cx="50" cy="78" rx="22" ry="6" fill="#F0D89A" />
      {/* Food in bowl */}
      <ellipse cx="50" cy="78" rx="16" ry="4" fill="#8B6914" />
      {/* Body leaning forward */}
      <ellipse cx="50" cy="60" rx="20" ry="16" fill="#E8B86D" />
      <ellipse cx="50" cy="60" rx="17" ry="13" fill="#F0C87A" />
      {/* Head (tilted down eating) */}
      <circle cx="50" cy="40" r="18" fill="#E8B86D" />
      <circle cx="50" cy="40" r="15.5" fill="#F0C87A" />
      {/* Ears */}
      <path d="M35 26 L37 14 L44 24Z" fill="#E8B86D" />
      <path d="M37 25 L38 17 L42 24Z" fill="#F5B8C4" />
      <path d="M65 26 L63 14 L56 24Z" fill="#E8B86D" />
      <path d="M63 25 L62 17 L58 24Z" fill="#F5B8C4" />
      {/* Happy closed eyes */}
      <path d="M42 38 Q45 35 48 38" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M52 38 Q55 35 58 38" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="50" cy="43" rx="2" ry="1.5" fill="#F5A0B0" />
      {/* Blush */}
      <circle cx="38" cy="43" r="3" fill="#F5C4C4" opacity="0.4" />
      <circle cx="62" cy="43" r="3" fill="#F5C4C4" opacity="0.4" />
      {/* Paws beside bowl */}
      <ellipse cx="36" cy="76" rx="5" ry="3.5" fill="#F0C87A" />
      <ellipse cx="64" cy="76" rx="5" ry="3.5" fill="#F0C87A" />
      {/* Tail */}
      <path d="M70 60 Q82 50 78 38" stroke="#E8B86D" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M70 60 Q82 50 78 38" stroke="#F0C87A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CatWithHeart({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Body */}
      <ellipse cx="40" cy="58" rx="18" ry="14" fill="#E8B86D" />
      <ellipse cx="40" cy="58" rx="15" ry="11" fill="#F0C87A" />
      {/* Head */}
      <circle cx="40" cy="32" r="16" fill="#E8B86D" />
      <circle cx="40" cy="32" r="14" fill="#F0C87A" />
      {/* Ears */}
      <path d="M27 20 L29 10 L35 18Z" fill="#E8B86D" />
      <path d="M29 19 L30 13 L33 18Z" fill="#F5B8C4" />
      <path d="M53 20 L51 10 L45 18Z" fill="#E8B86D" />
      <path d="M51 19 L50 13 L47 18Z" fill="#F5B8C4" />
      {/* Eyes */}
      <circle cx="34" cy="30" r="3.5" fill="white" />
      <circle cx="46" cy="30" r="3.5" fill="white" />
      <circle cx="35" cy="29.5" r="2" fill="#D4853C" />
      <circle cx="47" cy="29.5" r="2" fill="#D4853C" />
      <circle cx="35" cy="29.5" r="1.2" fill="#2D1B0E" />
      <circle cx="47" cy="29.5" r="1.2" fill="#2D1B0E" />
      {/* Nose */}
      <ellipse cx="40" cy="34" rx="1.8" ry="1.2" fill="#F5A0B0" />
      {/* Mouth */}
      <path d="M38 36 Q40 38 42 36" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="30" cy="35" r="2.5" fill="#F5C4C4" opacity="0.4" />
      <circle cx="50" cy="35" r="2.5" fill="#F5C4C4" opacity="0.4" />
      {/* Heart floating */}
      <path d="M62 15 C62 12 58 10 56 13 C54 10 50 12 50 15 C50 20 56 23 56 23 C56 23 62 20 62 15Z" fill="#F5A0B0" opacity="0.8" />
      {/* Paws */}
      <ellipse cx="33" cy="68" rx="5" ry="3" fill="#F0C87A" />
      <ellipse cx="47" cy="68" rx="5" ry="3" fill="#F0C87A" />
      {/* Tail */}
      <path d="M58 58 Q65 50 62 42" stroke="#E8B86D" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M58 58 Q65 50 62 42" stroke="#F0C87A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function TwoCatsSitting({ size = 200, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 200 120" fill="none" className={className}>
      {/* Cat 1 (Merry - left, slightly bigger) */}
      <ellipse cx="65" cy="90" rx="24" ry="18" fill="#E8B86D" />
      <ellipse cx="65" cy="90" rx="20" ry="14" fill="#F0C87A" />
      <circle cx="65" cy="55" r="22" fill="#E8B86D" />
      <circle cx="65" cy="55" r="19" fill="#F0C87A" />
      {/* Merry ears */}
      <path d="M47 40 L49 24 L57 37Z" fill="#E8B86D" />
      <path d="M49 38 L50 28 L55 36Z" fill="#F5B8C4" />
      <path d="M83 40 L81 24 L73 37Z" fill="#E8B86D" />
      <path d="M81 38 L80 28 L75 36Z" fill="#F5B8C4" />
      {/* Merry eyes */}
      <circle cx="56" cy="52" r="4.5" fill="white" />
      <circle cx="74" cy="52" r="4.5" fill="white" />
      <circle cx="57" cy="51.5" r="3" fill="#D4853C" />
      <circle cx="75" cy="51.5" r="3" fill="#D4853C" />
      <circle cx="57" cy="51.5" r="1.5" fill="#2D1B0E" />
      <circle cx="75" cy="51.5" r="1.5" fill="#2D1B0E" />
      <circle cx="58" cy="50.5" r="0.6" fill="white" />
      <circle cx="76" cy="50.5" r="0.6" fill="white" />
      {/* Merry nose & mouth */}
      <ellipse cx="65" cy="58" rx="2.5" ry="1.8" fill="#F5A0B0" />
      <path d="M62 60 Q65 63 68 60" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Merry whiskers */}
      <line x1="42" y1="56" x2="52" y2="57" stroke="#D4A96A" strokeWidth="0.6" />
      <line x1="42" y1="59" x2="52" y2="59" stroke="#D4A96A" strokeWidth="0.6" />
      <line x1="88" y1="56" x2="78" y2="57" stroke="#D4A96A" strokeWidth="0.6" />
      <line x1="88" y1="59" x2="78" y2="59" stroke="#D4A96A" strokeWidth="0.6" />
      {/* Merry blush */}
      <circle cx="50" cy="59" r="3" fill="#F5C4C4" opacity="0.35" />
      <circle cx="80" cy="59" r="3" fill="#F5C4C4" opacity="0.35" />
      {/* Merry paws */}
      <ellipse cx="54" cy="104" rx="6" ry="3.5" fill="#F0C87A" />
      <ellipse cx="76" cy="104" rx="6" ry="3.5" fill="#F0C87A" />
      {/* Merry tail */}
      <path d="M42 92 Q30 82 33 68" stroke="#E8B86D" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M42 92 Q30 82 33 68" stroke="#F0C87A" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Cat 2 (Pippin - right, slightly smaller) */}
      <ellipse cx="135" cy="92" rx="22" ry="16" fill="#DBA85E" />
      <ellipse cx="135" cy="92" rx="18" ry="13" fill="#EDBE72" />
      <circle cx="135" cy="60" r="20" fill="#DBA85E" />
      <circle cx="135" cy="60" r="17" fill="#EDBE72" />
      {/* Pippin ears */}
      <path d="M119 46 L121 32 L128 44Z" fill="#DBA85E" />
      <path d="M121 44 L122 35 L126 43Z" fill="#F5B8C4" />
      <path d="M151 46 L149 32 L142 44Z" fill="#DBA85E" />
      <path d="M149 44 L148 35 L144 43Z" fill="#F5B8C4" />
      {/* Pippin eyes */}
      <circle cx="128" cy="57" r="4" fill="white" />
      <circle cx="142" cy="57" r="4" fill="white" />
      <circle cx="129" cy="56.5" r="2.8" fill="#C9792F" />
      <circle cx="143" cy="56.5" r="2.8" fill="#C9792F" />
      <circle cx="129" cy="56.5" r="1.4" fill="#2D1B0E" />
      <circle cx="143" cy="56.5" r="1.4" fill="#2D1B0E" />
      <circle cx="130" cy="55.5" r="0.5" fill="white" />
      <circle cx="144" cy="55.5" r="0.5" fill="white" />
      {/* Pippin nose & mouth */}
      <ellipse cx="135" cy="63" rx="2.2" ry="1.5" fill="#F5A0B0" />
      <path d="M133 65 Q135 67 137 65" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Pippin whiskers */}
      <line x1="115" y1="61" x2="124" y2="62" stroke="#D4A96A" strokeWidth="0.6" />
      <line x1="115" y1="64" x2="124" y2="64" stroke="#D4A96A" strokeWidth="0.6" />
      <line x1="155" y1="61" x2="146" y2="62" stroke="#D4A96A" strokeWidth="0.6" />
      <line x1="155" y1="64" x2="146" y2="64" stroke="#D4A96A" strokeWidth="0.6" />
      {/* Pippin blush */}
      <circle cx="123" cy="64" r="2.5" fill="#F5C4C4" opacity="0.35" />
      <circle cx="147" cy="64" r="2.5" fill="#F5C4C4" opacity="0.35" />
      {/* Pippin paws */}
      <ellipse cx="126" cy="104" rx="5.5" ry="3" fill="#EDBE72" />
      <ellipse cx="144" cy="104" rx="5.5" ry="3" fill="#EDBE72" />
      {/* Pippin tail */}
      <path d="M157 92 Q168 82 165 70" stroke="#DBA85E" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M157 92 Q168 82 165 70" stroke="#EDBE72" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Heart between them */}
      <path d="M103 48 C103 44 98 42 96 46 C94 42 89 44 89 48 C89 54 96 58 96 58 C96 58 103 54 103 48Z" fill="#F5A0B0" opacity="0.5" />
    </svg>
  );
}

export function CatOnScale({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Scale base */}
      <rect x="20" y="78" rx="4" ry="4" width="60" height="8" fill="#D4A96A" />
      <rect x="25" y="72" rx="6" ry="6" width="50" height="10" fill="#E8C87D" />
      {/* Scale display */}
      <rect x="38" y="74" rx="2" ry="2" width="24" height="6" fill="#B8E6B8" />
      {/* Cat sitting on scale */}
      <ellipse cx="50" cy="62" rx="18" ry="12" fill="#E8B86D" />
      <ellipse cx="50" cy="62" rx="15" ry="9" fill="#F0C87A" />
      <circle cx="50" cy="38" r="16" fill="#E8B86D" />
      <circle cx="50" cy="38" r="13.5" fill="#F0C87A" />
      {/* Ears */}
      <path d="M37 26 L39 14 L45 24Z" fill="#E8B86D" />
      <path d="M39 25 L40 18 L43 24Z" fill="#F5B8C4" />
      <path d="M63 26 L61 14 L55 24Z" fill="#E8B86D" />
      <path d="M61 25 L60 18 L57 24Z" fill="#F5B8C4" />
      {/* Eyes - looking at scale number */}
      <circle cx="44" cy="36" r="3.5" fill="white" />
      <circle cx="56" cy="36" r="3.5" fill="white" />
      <circle cx="44.5" cy="37" r="2" fill="#D4853C" />
      <circle cx="56.5" cy="37" r="2" fill="#D4853C" />
      <circle cx="44.5" cy="37" r="1" fill="#2D1B0E" />
      <circle cx="56.5" cy="37" r="1" fill="#2D1B0E" />
      {/* Nose */}
      <ellipse cx="50" cy="41" rx="2" ry="1.3" fill="#F5A0B0" />
      {/* Mouth */}
      <path d="M48 43 Q50 45 52 43" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="39" cy="42" r="2.5" fill="#F5C4C4" opacity="0.4" />
      <circle cx="61" cy="42" r="2.5" fill="#F5C4C4" opacity="0.4" />
      {/* Paws */}
      <ellipse cx="42" cy="72" rx="5" ry="3" fill="#F0C87A" />
      <ellipse cx="58" cy="72" rx="5" ry="3" fill="#F0C87A" />
      {/* Tail */}
      <path d="M68 60 Q76 52 74 42" stroke="#E8B86D" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M68 60 Q76 52 74 42" stroke="#F0C87A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CatWithCamera({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Body */}
      <ellipse cx="50" cy="68" rx="20" ry="16" fill="#E8B86D" />
      <ellipse cx="50" cy="68" rx="17" ry="13" fill="#F0C87A" />
      {/* Head */}
      <circle cx="50" cy="38" r="18" fill="#E8B86D" />
      <circle cx="50" cy="38" r="15.5" fill="#F0C87A" />
      {/* Ears */}
      <path d="M35 24 L37 12 L44 22Z" fill="#E8B86D" />
      <path d="M37 23 L38 16 L42 22Z" fill="#F5B8C4" />
      <path d="M65 24 L63 12 L56 22Z" fill="#E8B86D" />
      <path d="M63 23 L62 16 L58 22Z" fill="#F5B8C4" />
      {/* Winking eyes */}
      <circle cx="43" cy="36" r="3.5" fill="white" />
      <circle cx="44" cy="35.5" r="2" fill="#D4853C" />
      <circle cx="44" cy="35.5" r="1" fill="#2D1B0E" />
      <path d="M54 35 Q57 32 60 35" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="50" cy="41" rx="2" ry="1.3" fill="#F5A0B0" />
      {/* Tongue out */}
      <path d="M48 43 Q50 45 52 43" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="45" rx="2" ry="1.5" fill="#F5A0B0" />
      {/* Blush */}
      <circle cx="38" cy="41" r="2.5" fill="#F5C4C4" opacity="0.4" />
      <circle cx="62" cy="41" r="2.5" fill="#F5C4C4" opacity="0.4" />
      {/* Camera held by paw */}
      <rect x="25" y="58" rx="3" ry="3" width="16" height="11" fill="#555" />
      <circle cx="33" cy="63" r="4" fill="#333" />
      <circle cx="33" cy="63" r="2.5" fill="#6B8EAE" />
      <rect x="28" y="56" rx="1" ry="1" width="8" height="3" fill="#444" />
      {/* Paw holding camera */}
      <ellipse cx="38" cy="66" rx="5" ry="4" fill="#F0C87A" />
      {/* Other paw */}
      <ellipse cx="60" cy="80" rx="5.5" ry="3" fill="#F0C87A" />
      {/* Tail */}
      <path d="M70 68 Q80 58 76 46" stroke="#E8B86D" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M70 68 Q80 58 76 46" stroke="#F0C87A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
