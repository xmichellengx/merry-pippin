"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type AdminContextType = {
  isAdmin: boolean;
  showPinModal: boolean;
  setShowPinModal: (show: boolean) => void;
  login: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  showPinModal: false,
  setShowPinModal: () => {},
  login: async () => false,
  logout: async () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    fetch("/api/admin/status", { credentials: "same-origin" })
      .then(r => r.json())
      .then(data => setIsAdmin(!!data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setShowPinModal(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    } catch {}
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, showPinModal, setShowPinModal, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
