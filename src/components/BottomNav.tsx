"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  Scale,
  UtensilsCrossed,
  Camera,
  X,
  Loader2,
} from "lucide-react";
import { useAdmin } from "./AdminContext";

const tabs = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/health", label: "Health", icon: Heart },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/photos", label: "Photos", icon: Camera },
];

function PawLocked({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Paw pads */}
      <ellipse cx="8.5" cy="7" rx="2.2" ry="2.8" fill="currentColor" opacity="0.5" transform="rotate(-15 8.5 7)" />
      <ellipse cx="15.5" cy="7" rx="2.2" ry="2.8" fill="currentColor" opacity="0.5" transform="rotate(15 15.5 7)" />
      <ellipse cx="5.5" cy="11.5" rx="1.8" ry="2.5" fill="currentColor" opacity="0.5" transform="rotate(-25 5.5 11.5)" />
      <ellipse cx="18.5" cy="11.5" rx="1.8" ry="2.5" fill="currentColor" opacity="0.5" transform="rotate(25 18.5 11.5)" />
      {/* Main pad */}
      <ellipse cx="12" cy="16" rx="4.5" ry="4" fill="currentColor" opacity="0.6" />
      {/* Lock keyhole */}
      <circle cx="12" cy="15.5" r="1.2" fill="white" opacity="0.8" />
      <rect x="11.4" y="15.5" width="1.2" height="2" rx="0.4" fill="white" opacity="0.8" />
    </svg>
  );
}

function PawUnlocked({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Paw pads */}
      <ellipse cx="8.5" cy="7" rx="2.2" ry="2.8" fill="currentColor" transform="rotate(-15 8.5 7)" />
      <ellipse cx="15.5" cy="7" rx="2.2" ry="2.8" fill="currentColor" transform="rotate(15 15.5 7)" />
      <ellipse cx="5.5" cy="11.5" rx="1.8" ry="2.5" fill="currentColor" transform="rotate(-25 5.5 11.5)" />
      <ellipse cx="18.5" cy="11.5" rx="1.8" ry="2.5" fill="currentColor" transform="rotate(25 18.5 11.5)" />
      {/* Main pad */}
      <ellipse cx="12" cy="16" rx="4.5" ry="4" fill="currentColor" />
      {/* Heart in center */}
      <path d="M12 14.5 C12 13.5 10.8 13 10.2 13.8 C9.6 13 8.4 13.5 8.4 14.5 C8.4 15.8 10.2 17 12 17.5 C13.8 17 15.6 15.8 15.6 14.5 C15.6 13.5 14.4 13 13.8 13.8 C13.2 13 12 13.5 12 14.5Z" fill="white" opacity="0.9" />
    </svg>
  );
}

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
            <h2 className="text-base font-bold">Meowmy Login</h2>
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
  const { isAdmin, showPinModal, setShowPinModal, logout } = useAdmin();

  return (
    <>
      {showPinModal && <PinModal />}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-card-border z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors ${
                  isActive
                    ? "text-golden-600"
                    : "text-muted"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "text-golden-500" : ""}
                />
                <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => isAdmin ? logout() : setShowPinModal(true)}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors ${
              isAdmin ? "text-golden-600" : "text-muted"
            }`}
          >
            {isAdmin ? (
              <PawUnlocked size={22} className="text-golden-500" />
            ) : (
              <PawLocked size={22} />
            )}
            <span className={`text-[10px] font-medium ${isAdmin ? "text-golden-600 font-semibold" : ""}`}>
              {isAdmin ? "Meowmy" : "Meowmy"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
