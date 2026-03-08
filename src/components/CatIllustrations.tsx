// Mofusand-style Golden British Shorthair illustrations
// Blob-like bodies, big round dark eyes with highlights, tiny nose, no neck, stubby paws

export function CatSitting({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      {/* Body - bean/blob shape */}
      <ellipse cx="60" cy="78" rx="30" ry="28" fill="#E8C872" />
      {/* Head - big round, no neck */}
      <circle cx="60" cy="42" r="28" fill="#E8C872" />
      {/* Ears - small rounded triangles */}
      <path d="M38 22 Q36 8 46 18" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M40 20 Q39 12 45 18" fill="#F5B8C4" />
      <path d="M82 22 Q84 8 74 18" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M80 20 Q81 12 75 18" fill="#F5B8C4" />
      {/* Eyes - big, round, dark with highlight */}
      <circle cx="48" cy="42" r="6.5" fill="#1A1008" />
      <circle cx="72" cy="42" r="6.5" fill="#1A1008" />
      <circle cx="51" cy="39" r="2.2" fill="white" />
      <circle cx="75" cy="39" r="2.2" fill="white" />
      <circle cx="47" cy="44" r="1" fill="white" opacity="0.5" />
      <circle cx="71" cy="44" r="1" fill="white" opacity="0.5" />
      {/* Nose - tiny triangle */}
      <path d="M58 50 L60 53 L62 50Z" fill="#F5A0B0" />
      {/* Mouth - tiny W shape */}
      <path d="M57 54 Q58.5 56 60 54 Q61.5 56 63 54" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="40" cy="50" r="4.5" fill="#F5C4C4" opacity="0.35" />
      <circle cx="80" cy="50" r="4.5" fill="#F5C4C4" opacity="0.35" />
      {/* Stubby front paws */}
      <ellipse cx="44" cy="98" rx="9" ry="6" fill="#E8C872" />
      <ellipse cx="76" cy="98" rx="9" ry="6" fill="#E8C872" />
      {/* Paw beans */}
      <circle cx="42" cy="99" r="2" fill="#F0D89A" />
      <circle cx="46" cy="100" r="1.5" fill="#F0D89A" />
      <circle cx="74" cy="99" r="2" fill="#F0D89A" />
      <circle cx="78" cy="100" r="1.5" fill="#F0D89A" />
      {/* Tail - short curved */}
      <path d="M90 80 Q98 70 94 58" stroke="#E8C872" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Tabby stripe hints */}
      <path d="M50 28 Q60 24 70 28" stroke="#D4A843" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
      <path d="M48 32 Q60 28 72 32" stroke="#D4A843" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

export function CatSleeping({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 80" fill="none" className={className}>
      {/* Body - big round blob curled up */}
      <ellipse cx="75" cy="52" rx="48" ry="24" fill="#E8C872" />
      {/* Head resting on body */}
      <circle cx="38" cy="42" r="24" fill="#E8C872" />
      {/* Ears */}
      <path d="M20 26 Q17 12 28 22" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M22 24 Q20 15 27 22" fill="#F5B8C4" />
      <path d="M56 26 Q59 12 48 22" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M54 24 Q56 15 49 22" fill="#F5B8C4" />
      {/* Closed eyes - happy arcs */}
      <path d="M27 40 Q32 35 37 40" stroke="#1A1008" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M39 40 Q44 35 49 40" stroke="#1A1008" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M36 46 L38 49 L40 46Z" fill="#F5A0B0" />
      {/* Tiny smile */}
      <path d="M36 50 Q38 52 40 50" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="24" cy="47" r="3.5" fill="#F5C4C4" opacity="0.35" />
      <circle cx="52" cy="47" r="3.5" fill="#F5C4C4" opacity="0.35" />
      {/* Front paw peeking out */}
      <ellipse cx="58" cy="60" rx="8" ry="5" fill="#E8C872" />
      <circle cx="56" cy="61" r="1.5" fill="#F0D89A" />
      <circle cx="59" cy="62" r="1.2" fill="#F0D89A" />
      {/* Tail curled around */}
      <path d="M118 48 Q128 35 120 22" stroke="#E8C872" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* Zzz */}
      <text x="60" y="22" fontSize="11" fill="#D4A843" opacity="0.5" fontWeight="bold" fontFamily="sans-serif">z</text>
      <text x="69" y="14" fontSize="14" fill="#D4A843" opacity="0.35" fontWeight="bold" fontFamily="sans-serif">z</text>
      <text x="80" y="6" fontSize="17" fill="#D4A843" opacity="0.25" fontWeight="bold" fontFamily="sans-serif">z</text>
    </svg>
  );
}

export function CatWaving({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      {/* Body blob */}
      <ellipse cx="60" cy="82" rx="28" ry="26" fill="#E8C872" />
      {/* Head */}
      <circle cx="60" cy="42" r="26" fill="#E8C872" />
      {/* Ears */}
      <path d="M39 22 Q36 8 47 18" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M41 20 Q39 12 46 18" fill="#F5B8C4" />
      <path d="M81 22 Q84 8 73 18" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M79 20 Q81 12 74 18" fill="#F5B8C4" />
      {/* Eyes - sparkly */}
      <circle cx="48" cy="42" r="6" fill="#1A1008" />
      <circle cx="72" cy="42" r="6" fill="#1A1008" />
      <circle cx="51" cy="39" r="2" fill="white" />
      <circle cx="75" cy="39" r="2" fill="white" />
      <circle cx="47" cy="44" r="1" fill="white" opacity="0.4" />
      <circle cx="71" cy="44" r="1" fill="white" opacity="0.4" />
      {/* Nose */}
      <path d="M58 50 L60 53 L62 50Z" fill="#F5A0B0" />
      {/* Open happy mouth */}
      <ellipse cx="60" cy="56" rx="4" ry="2.5" fill="#C68A5B" opacity="0.3" />
      <path d="M56 55 Q60 60 64 55" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="40" cy="50" r="4" fill="#F5C4C4" opacity="0.35" />
      <circle cx="80" cy="50" r="4" fill="#F5C4C4" opacity="0.35" />
      {/* Waving paw (right, raised) */}
      <path d="M86 72 Q95 58 90 45" stroke="#E8C872" strokeWidth="12" fill="none" strokeLinecap="round" />
      <ellipse cx="90" cy="43" rx="6" ry="5" fill="#E8C872" />
      {/* Paw beans on waving paw */}
      <circle cx="88" cy="42" r="1.5" fill="#F5B8C4" />
      <circle cx="91" cy="40" r="1.2" fill="#F5B8C4" />
      <circle cx="93" cy="43" r="1.2" fill="#F5B8C4" />
      {/* Left paw */}
      <ellipse cx="44" cy="102" rx="9" ry="6" fill="#E8C872" />
      {/* Tail */}
      <path d="M34 85 Q22 75 26 60" stroke="#E8C872" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Sparkles around waving paw */}
      <path d="M100 38 L102 34 L104 38 L108 36 L104 40 L102 44 L100 40 L96 36Z" fill="#F5C67E" opacity="0.5" />
    </svg>
  );
}

export function CatEating({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Bowl */}
      <ellipse cx="50" cy="82" rx="24" ry="7" fill="#D97A1E" />
      <path d="M26 78 Q26 89 50 89 Q74 89 74 78" fill="#E8932B" />
      <ellipse cx="50" cy="78" rx="24" ry="7" fill="#F0C87A" />
      <ellipse cx="50" cy="78" rx="17" ry="4.5" fill="#8B6914" opacity="0.5" />
      {/* Body leaning into bowl */}
      <ellipse cx="50" cy="60" rx="22" ry="18" fill="#E8C872" />
      {/* Head (big, tilted down) */}
      <circle cx="50" cy="36" r="22" fill="#E8C872" />
      {/* Ears */}
      <path d="M33 18 Q30 4 41 14" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M35 16 Q33 8 40 14" fill="#F5B8C4" />
      <path d="M67 18 Q70 4 59 14" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M65 16 Q67 8 60 14" fill="#F5B8C4" />
      {/* Happy closed eyes (eating bliss) */}
      <path d="M38 34 Q43 29 48 34" stroke="#1A1008" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M52 34 Q57 29 62 34" stroke="#1A1008" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M48 40 L50 43 L52 40Z" fill="#F5A0B0" />
      {/* Nom nom mouth */}
      <path d="M46 44 Q50 48 54 44" stroke="#C68A5B" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="34" cy="40" r="3.5" fill="#F5C4C4" opacity="0.4" />
      <circle cx="66" cy="40" r="3.5" fill="#F5C4C4" opacity="0.4" />
      {/* Stubby paws beside bowl */}
      <ellipse cx="34" cy="76" rx="6" ry="4" fill="#E8C872" />
      <ellipse cx="66" cy="76" rx="6" ry="4" fill="#E8C872" />
      {/* Tail up happily */}
      <path d="M72 58 Q84 48 80 34" stroke="#E8C872" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* Small heart - food is yummy */}
      <path d="M78 24 C78 22 76 21 75 23 C74 21 72 22 72 24 C72 27 75 29 75 29 C75 29 78 27 78 24Z" fill="#F5A0B0" opacity="0.6" />
    </svg>
  );
}

export function CatWithHeart({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Body blob */}
      <ellipse cx="40" cy="54" rx="20" ry="18" fill="#E8C872" />
      {/* Head */}
      <circle cx="40" cy="28" r="18" fill="#E8C872" />
      {/* Ears */}
      <path d="M26 14 Q23 2 33 11" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M28 13 Q26 6 32 11" fill="#F5B8C4" />
      <path d="M54 14 Q57 2 47 11" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M52 13 Q54 6 48 11" fill="#F5B8C4" />
      {/* Big sparkly eyes */}
      <circle cx="33" cy="28" r="5" fill="#1A1008" />
      <circle cx="47" cy="28" r="5" fill="#1A1008" />
      <circle cx="35" cy="26" r="1.8" fill="white" />
      <circle cx="49" cy="26" r="1.8" fill="white" />
      <circle cx="32" cy="30" r="0.8" fill="white" opacity="0.4" />
      <circle cx="46" cy="30" r="0.8" fill="white" opacity="0.4" />
      {/* Nose */}
      <path d="M39 34 L40 36 L41 34Z" fill="#F5A0B0" />
      {/* Mouth */}
      <path d="M38 37 Q40 39 42 37" stroke="#C68A5B" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="27" cy="33" r="3" fill="#F5C4C4" opacity="0.35" />
      <circle cx="53" cy="33" r="3" fill="#F5C4C4" opacity="0.35" />
      {/* Heart floating above */}
      <path d="M62 10 C62 6 58 4 56 8 C54 4 50 6 50 10 C50 15 56 19 56 19 C56 19 62 15 62 10Z" fill="#F5A0B0" opacity="0.7" />
      {/* Small sparkles near heart */}
      <circle cx="64" cy="6" r="1" fill="#F5C67E" opacity="0.5" />
      <circle cx="48" cy="5" r="0.8" fill="#F5C67E" opacity="0.4" />
      {/* Stubby paws */}
      <ellipse cx="32" cy="68" rx="7" ry="4.5" fill="#E8C872" />
      <ellipse cx="48" cy="68" rx="7" ry="4.5" fill="#E8C872" />
      {/* Tail */}
      <path d="M60 54 Q68 45 65 35" stroke="#E8C872" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function TwoCatsSitting({ size = 200, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 200 120" fill="none" className={className}>
      {/* Cat 1 (Merry - left, slightly bigger) */}
      {/* Body blob */}
      <ellipse cx="65" cy="85" rx="26" ry="24" fill="#E8C872" />
      {/* Head */}
      <circle cx="65" cy="48" r="24" fill="#E8C872" />
      {/* Ears */}
      <path d="M46 32 Q43 18 54 28" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M48 30 Q46 22 53 28" fill="#F5B8C4" />
      <path d="M84 32 Q87 18 76 28" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M82 30 Q84 22 77 28" fill="#F5B8C4" />
      {/* Merry eyes */}
      <circle cx="55" cy="48" r="5.5" fill="#1A1008" />
      <circle cx="75" cy="48" r="5.5" fill="#1A1008" />
      <circle cx="57" cy="45" r="1.8" fill="white" />
      <circle cx="77" cy="45" r="1.8" fill="white" />
      <circle cx="54" cy="50" r="0.8" fill="white" opacity="0.4" />
      <circle cx="74" cy="50" r="0.8" fill="white" opacity="0.4" />
      {/* Merry nose & mouth */}
      <path d="M63 55 L65 58 L67 55Z" fill="#F5A0B0" />
      <path d="M62 59 Q63.5 61 65 59 Q66.5 61 68 59" stroke="#C68A5B" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      {/* Merry blush */}
      <circle cx="47" cy="55" r="3.5" fill="#F5C4C4" opacity="0.3" />
      <circle cx="83" cy="55" r="3.5" fill="#F5C4C4" opacity="0.3" />
      {/* Merry paws */}
      <ellipse cx="52" cy="104" rx="8" ry="5" fill="#E8C872" />
      <ellipse cx="78" cy="104" rx="8" ry="5" fill="#E8C872" />
      {/* Merry tail */}
      <path d="M40 88 Q28 78 32 62" stroke="#E8C872" strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* Cat 2 (Pippin - right, slightly smaller, slightly different gold) */}
      {/* Body blob */}
      <ellipse cx="138" cy="88" rx="24" ry="22" fill="#DDB560" />
      {/* Head */}
      <circle cx="138" cy="52" r="22" fill="#DDB560" />
      {/* Ears */}
      <path d="M121 36 Q118 22 129 32" fill="#DDB560" stroke="#C9A040" strokeWidth="1" />
      <path d="M123 34 Q121 26 128 32" fill="#F5B8C4" />
      <path d="M155 36 Q158 22 147 32" fill="#DDB560" stroke="#C9A040" strokeWidth="1" />
      <path d="M153 34 Q155 26 148 32" fill="#F5B8C4" />
      {/* Pippin eyes */}
      <circle cx="130" cy="52" r="5" fill="#1A1008" />
      <circle cx="146" cy="52" r="5" fill="#1A1008" />
      <circle cx="132" cy="49" r="1.6" fill="white" />
      <circle cx="148" cy="49" r="1.6" fill="white" />
      <circle cx="129" cy="54" r="0.7" fill="white" opacity="0.4" />
      <circle cx="145" cy="54" r="0.7" fill="white" opacity="0.4" />
      {/* Pippin nose & mouth */}
      <path d="M136 58 L138 61 L140 58Z" fill="#F5A0B0" />
      <path d="M135 62 Q136.5 64 138 62 Q139.5 64 141 62" stroke="#C68A5B" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      {/* Pippin blush */}
      <circle cx="123" cy="58" r="3" fill="#F5C4C4" opacity="0.3" />
      <circle cx="153" cy="58" r="3" fill="#F5C4C4" opacity="0.3" />
      {/* Pippin paws */}
      <ellipse cx="128" cy="106" rx="7" ry="4.5" fill="#DDB560" />
      <ellipse cx="148" cy="106" rx="7" ry="4.5" fill="#DDB560" />
      {/* Pippin tail */}
      <path d="M160 88 Q172 78 168 64" stroke="#DDB560" strokeWidth="6.5" fill="none" strokeLinecap="round" />

      {/* Heart between them */}
      <path d="M105 40 C105 35 100 33 98 38 C96 33 91 35 91 40 C91 46 98 50 98 50 C98 50 105 46 105 40Z" fill="#F5A0B0" opacity="0.5" />
      {/* Sparkles */}
      <circle cx="88" cy="32" r="1.2" fill="#F5C67E" opacity="0.4" />
      <circle cx="108" cy="35" r="1" fill="#F5C67E" opacity="0.35" />
    </svg>
  );
}

export function CatOnScale({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Scale base */}
      <rect x="18" y="80" rx="5" ry="5" width="64" height="8" fill="#D4A843" />
      <rect x="22" y="72" rx="6" ry="6" width="56" height="12" fill="#E8C87D" />
      {/* Scale display */}
      <rect x="36" y="75" rx="2" ry="2" width="28" height="6" fill="#B8E6B8" />
      <text x="50" y="80" fontSize="5" fill="#2E7D32" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">3.2kg</text>
      {/* Cat blob sitting on scale */}
      <ellipse cx="50" cy="58" rx="22" ry="16" fill="#E8C872" />
      {/* Head */}
      <circle cx="50" cy="32" r="20" fill="#E8C872" />
      {/* Ears */}
      <path d="M34 16 Q31 2 42 12" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M36 14 Q34 6 41 12" fill="#F5B8C4" />
      <path d="M66 16 Q69 2 58 12" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M64 14 Q66 6 59 12" fill="#F5B8C4" />
      {/* Eyes - looking down at scale, slightly worried */}
      <circle cx="42" cy="32" r="5.5" fill="#1A1008" />
      <circle cx="58" cy="32" r="5.5" fill="#1A1008" />
      <circle cx="44" cy="30" r="1.8" fill="white" />
      <circle cx="60" cy="30" r="1.8" fill="white" />
      {/* Looking down at display */}
      <circle cx="42" cy="35" r="0.8" fill="white" opacity="0.4" />
      <circle cx="58" cy="35" r="0.8" fill="white" opacity="0.4" />
      {/* Nose */}
      <path d="M48 39 L50 42 L52 39Z" fill="#F5A0B0" />
      {/* Mouth - tiny worried pout */}
      <path d="M47 43 Q50 45 53 43" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="35" cy="39" r="3" fill="#F5C4C4" opacity="0.35" />
      <circle cx="65" cy="39" r="3" fill="#F5C4C4" opacity="0.35" />
      {/* Stubby paws */}
      <ellipse cx="38" cy="70" rx="7" ry="4.5" fill="#E8C872" />
      <ellipse cx="62" cy="70" rx="7" ry="4.5" fill="#E8C872" />
      {/* Tail */}
      <path d="M72 56 Q82 46 78 34" stroke="#E8C872" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Sweat drop - oh no the weight */}
      <path d="M72 18 Q74 14 72 10" stroke="#87CEEB" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function CatWithCamera({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Body blob */}
      <ellipse cx="50" cy="65" rx="22" ry="18" fill="#E8C872" />
      {/* Head */}
      <circle cx="50" cy="34" r="20" fill="#E8C872" />
      {/* Ears */}
      <path d="M34 18 Q31 4 42 14" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M36 16 Q34 8 41 14" fill="#F5B8C4" />
      <path d="M66 18 Q69 4 58 14" fill="#E8C872" stroke="#D4A843" strokeWidth="1" />
      <path d="M64 16 Q66 8 59 14" fill="#F5B8C4" />
      {/* Eyes - one open, one winking */}
      <circle cx="42" cy="34" r="5" fill="#1A1008" />
      <circle cx="44" cy="31" r="1.7" fill="white" />
      <circle cx="41" cy="36" r="0.7" fill="white" opacity="0.4" />
      {/* Wink eye */}
      <path d="M54 33 Q58 29 62 33" stroke="#1A1008" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M48 40 L50 43 L52 40Z" fill="#F5A0B0" />
      {/* Tongue out - playful */}
      <path d="M48 44 Q50 46 52 44" stroke="#C68A5B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="46.5" rx="2.5" ry="1.8" fill="#F5A0B0" />
      {/* Blush */}
      <circle cx="35" cy="39" r="3" fill="#F5C4C4" opacity="0.35" />
      <circle cx="65" cy="39" r="3" fill="#F5C4C4" opacity="0.35" />
      {/* Camera held by both paws */}
      <rect x="32" y="58" rx="3" ry="3" width="18" height="13" fill="#555" />
      <circle cx="41" cy="64" r="4.5" fill="#333" />
      <circle cx="41" cy="64" r="2.8" fill="#6B8EAE" />
      <circle cx="40" cy="63" r="1" fill="white" opacity="0.4" />
      <rect x="35" y="55.5" rx="1.5" ry="1.5" width="10" height="3.5" fill="#444" />
      {/* Flash */}
      <circle cx="43" cy="56" r="1.2" fill="#FFE082" opacity="0.7" />
      {/* Paws holding camera */}
      <ellipse cx="30" cy="66" rx="6" ry="5" fill="#E8C872" />
      <ellipse cx="52" cy="66" rx="6" ry="5" fill="#E8C872" />
      {/* Tail up excitedly */}
      <path d="M72 62 Q82 50 78 36" stroke="#E8C872" strokeWidth="6.5" fill="none" strokeLinecap="round" />
      {/* Camera sparkle */}
      <path d="M24 54 L25 51 L26 54 L29 53 L26 56 L25 59 L24 56 L21 53Z" fill="#FFE082" opacity="0.4" />
    </svg>
  );
}
