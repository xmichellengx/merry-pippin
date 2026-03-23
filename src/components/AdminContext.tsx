"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type AdminContextType = {
  isAdmin: boolean;
  showPinModal: boolean;
  setShowPinModal: (show: boolean) => void;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  showPinModal: false,
  setShowPinModal: () => {},
  login: async () => false,
  logout: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

const ADMIN_KEY = "paw-palace-admin";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return localStorage.getItem(ADMIN_KEY) === "true"; } catch { return false; }
  });
  const [showPinModal, setShowPinModal] = useState(false);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setShowPinModal(false);
        localStorage.setItem(ADMIN_KEY, "true");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_KEY);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, showPinModal, setShowPinModal, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
