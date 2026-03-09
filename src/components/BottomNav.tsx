"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { useAdmin } from "./AdminContext";

// ── Cute custom nav icons ──

function IconHome({ size = 24 }: { size?: number; active?: boolean }) {
  return (
    <Image
      src="/home-logo.png"
      alt="Home"
      width={size}
      height={size}
      className="w-full h-full"
      style={{ objectFit: "cover" }}
    />
  );
}

function IconHealth({ size = 24, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Heart */}
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.2 3 11.7 3.8 12 5C12.3 3.8 13.8 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z"
        fill={active ? "#F5A0B0" : "currentColor"}
        opacity={active ? 1 : 0.45}
      />
      {/* Cross / plus */}
      <rect x="10.5" y="8" width="3" height="8" rx="1" fill="white" opacity="0.85" />
      <rect x="8" y="10.5" width="8" height="3" rx="1" fill="white" opacity="0.85" />
      {/* Tiny sparkle */}
      {active && <>
        <circle cx="19" cy="5" r="1" fill="#F5C67E" opacity="0.7" />
        <circle cx="20.5" cy="3.5" r="0.5" fill="#F5C67E" opacity="0.5" />
      </>}
    </svg>
  );
}

function IconWeight({ size = 24, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Scale base */}
      <rect x="4" y="17" width="16" height="4" rx="2" fill={active ? "#E8932B" : "currentColor"} opacity={active ? 1 : 0.45} />
      {/* Scale top */}
      <rect x="6" y="13" width="12" height="5" rx="2.5" fill={active ? "#F0C87A" : "currentColor"} opacity={active ? 0.8 : 0.35} />
      {/* Display */}
      <rect x="9" y="14.5" width="6" height="2.5" rx="1" fill={active ? "#B8E6B8" : "white"} opacity="0.85" />
      {/* Cat sitting on scale */}
      <circle cx="12" cy="7.5" r="3.5" fill={active ? "#F0C87A" : "currentColor"} opacity={active ? 1 : 0.4} />
      {/* Cat ears */}
      <path d="M9 5.5L8 2.5L10.5 5" fill={active ? "#E8B86D" : "currentColor"} opacity={active ? 1 : 0.4} />
      <path d="M15 5.5L16 2.5L13.5 5" fill={active ? "#E8B86D" : "currentColor"} opacity={active ? 1 : 0.4} />
      {/* Ear pink */}
      <path d="M9.3 5L8.7 3.5L10.2 4.8" fill="#F5B8C4" opacity={active ? 0.7 : 0.3} />
      <path d="M14.7 5L15.3 3.5L13.8 4.8" fill="#F5B8C4" opacity={active ? 0.7 : 0.3} />
      {/* Eyes */}
      <circle cx="10.8" cy="7" r="0.6" fill={active ? "#2D1B0E" : "white"} opacity="0.8" />
      <circle cx="13.2" cy="7" r="0.6" fill={active ? "#2D1B0E" : "white"} opacity="0.8" />
      {/* Nose */}
      <ellipse cx="12" cy="8.2" rx="0.5" ry="0.35" fill="#F5A0B0" opacity={active ? 1 : 0.5} />
      {/* Body on scale */}
      <ellipse cx="12" cy="12" rx="3" ry="2" fill={active ? "#F0C87A" : "currentColor"} opacity={active ? 0.9 : 0.35} />
    </svg>
  );
}

function IconFood({ size = 24, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bowl */}
      <ellipse cx="12" cy="18" rx="8" ry="2.5" fill={active ? "#D97A1E" : "currentColor"} opacity={active ? 1 : 0.45} />
      <path d="M4 15.5Q4 20 12 20Q20 20 20 15.5" fill={active ? "#E8932B" : "currentColor"} opacity={active ? 0.9 : 0.4} />
      <ellipse cx="12" cy="15.5" rx="8" ry="2.5" fill={active ? "#F0C87A" : "currentColor"} opacity={active ? 0.8 : 0.35} />
      {/* Food in bowl */}
      <ellipse cx="12" cy="15.5" rx="5.5" ry="1.5" fill={active ? "#8B6914" : "currentColor"} opacity={active ? 0.6 : 0.2} />
      {/* Steam / yummy lines */}
      <path d="M9 11Q9.5 9.5 9 8" stroke={active ? "#E8932B" : "currentColor"} strokeWidth="1" strokeLinecap="round" opacity={active ? 0.5 : 0.25} />
      <path d="M12 10Q12.5 8.5 12 7" stroke={active ? "#E8932B" : "currentColor"} strokeWidth="1" strokeLinecap="round" opacity={active ? 0.5 : 0.25} />
      <path d="M15 11Q15.5 9.5 15 8" stroke={active ? "#E8932B" : "currentColor"} strokeWidth="1" strokeLinecap="round" opacity={active ? 0.5 : 0.25} />
      {/* Fish shape in food */}
      <ellipse cx="11" cy="15.3" rx="1.5" ry="0.7" fill={active ? "#F0C87A" : "white"} opacity="0.5" />
      <path d="M12.5 15.3L14 14.5L14 16.1Z" fill={active ? "#F0C87A" : "white"} opacity="0.4" />
    </svg>
  );
}

function IconGroom({ size = 24, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Brush handle */}
      <rect x="10" y="2" width="4" height="10" rx="2" fill={active ? "#E8932B" : "currentColor"} opacity={active ? 1 : 0.45} />
      {/* Brush head */}
      <rect x="7" y="11" width="10" height="6" rx="2" fill={active ? "#F0C87A" : "currentColor"} opacity={active ? 0.9 : 0.4} />
      {/* Bristles */}
      <line x1="9" y1="17" x2="9" y2="20" stroke={active ? "#D97A1E" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" opacity={active ? 0.8 : 0.35} />
      <line x1="11" y1="17" x2="11" y2="21" stroke={active ? "#D97A1E" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" opacity={active ? 0.8 : 0.35} />
      <line x1="13" y1="17" x2="13" y2="21" stroke={active ? "#D97A1E" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" opacity={active ? 0.8 : 0.35} />
      <line x1="15" y1="17" x2="15" y2="20" stroke={active ? "#D97A1E" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" opacity={active ? 0.8 : 0.35} />
      {/* Sparkles when active */}
      {active && <>
        <circle cx="5" cy="8" r="0.8" fill="#F5C67E" opacity="0.7" />
        <circle cx="19" cy="6" r="0.6" fill="#F5C67E" opacity="0.5" />
        <circle cx="18" cy="10" r="0.5" fill="#F5C67E" opacity="0.6" />
      </>}
    </svg>
  );
}

function PawLocked({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="8.5" cy="7" rx="2.2" ry="2.8" fill="currentColor" opacity="0.5" transform="rotate(-15 8.5 7)" />
      <ellipse cx="15.5" cy="7" rx="2.2" ry="2.8" fill="currentColor" opacity="0.5" transform="rotate(15 15.5 7)" />
      <ellipse cx="5.5" cy="11.5" rx="1.8" ry="2.5" fill="currentColor" opacity="0.5" transform="rotate(-25 5.5 11.5)" />
      <ellipse cx="18.5" cy="11.5" rx="1.8" ry="2.5" fill="currentColor" opacity="0.5" transform="rotate(25 18.5 11.5)" />
      <ellipse cx="12" cy="16" rx="4.5" ry="4" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="15.5" r="1.2" fill="white" opacity="0.8" />
      <rect x="11.4" y="15.5" width="1.2" height="2" rx="0.4" fill="white" opacity="0.8" />
    </svg>
  );
}

// ── Tab config ──

const tabs = [
  { href: "/health", label: "Health", Icon: IconHealth },
  { href: "/weight", label: "Weight", Icon: IconWeight },
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/food", label: "Food", Icon: IconFood },
  { href: "/grooming", label: "Groom", Icon: IconGroom },
];

function PinModal() {
  const { login, setShowPinModal } = useAdmin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    setError(false);
    const success = await login(pin);
    if (!success) {
      setError(true);
      setPin("");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 overlay z-[60] flex items-end justify-center" onClick={() => setShowPinModal(false)}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8 space-y-4 animate-slide-up"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawLocked size={20} className="text-golden-600" />
            <h2 className="text-base font-bold">Meowmeee Login</h2>
          </div>
          <button onClick={() => setShowPinModal(false)} className="w-8 h-8 rounded-full bg-golden-50 flex items-center justify-center">
            <X size={16} className="text-muted" />
          </button>
        </div>
        <p className="text-xs text-muted">Enter your secret PIN to unlock editing.</p>
        <div>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            placeholder="PIN"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(false); }}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            autoFocus
            className={`text-center text-lg tracking-[0.5em] ${error ? "border-red-400 focus:ring-red-400" : ""}`}
          />
          {error && <p className="text-xs text-red-500 mt-1 text-center">Wrong PIN! Try again.</p>}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !pin}
          className="w-full py-3 rounded-xl golden-gradient text-white text-sm font-semibold shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Let Me In!"}
        </button>
      </div>
    </div>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { showPinModal } = useAdmin();

  return (
    <>
      {showPinModal && <PinModal />}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-card-border"
        style={{ background: "var(--card-bg)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const isHome = tab.href === "/";
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center ${isHome ? "w-13 h-13 -mt-5 rounded-full shadow-lg border-2 border-white overflow-hidden" : `w-14 py-0 rounded-lg transition-colors ${isActive ? "text-golden-600" : "text-muted"}`}`}
              >
                {isHome ? (
                  <tab.Icon size={52} active={true} />
                ) : (
                  <>
                    <tab.Icon size={26} active={isActive} />
                    <span className={`text-[9px] font-medium leading-none ${isActive ? "font-bold text-golden-600" : ""}`}>
                      {tab.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
