"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

type ToastType = "error" | "success";
type Toast = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType) => void }>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-down ${
              toast.type === "error" ? "bg-[#FCEAE8] text-[#8B2E26] border border-[#E8B8B4]" : "bg-[#E8F0E4] text-[#3D6B3A] border border-[#C8DCC4]"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
