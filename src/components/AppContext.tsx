import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, SystemNotification, AnalyticsStats } from "../types";
import { User, SystemNotification } from "../types";
import { apiClient } from "../utils/apiClient";
export interface AppContextType {
  currentUser: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  register: (username: string, email: string) => Promise<boolean>;
  logout: () => void;
  notifications: SystemNotification[];
  refreshNotifications: () => void;
  markNotificationsAsRead: () => void;
  toast: {
    show: (msg: string, type?: "success" | "warning" | "error" | "info") => void;
  };
  triggerExpiryCheck: () => Promise<number>;
  activeToast: { msg: string; type: "success" | "warning" | "error" | "info" } | null;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("mediloop_user");
    const saved = localStorage.getItem("medialert_user");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activeToast, setActiveToast] = useState<{ msg: string; type: "success" | "warning" | "error" | "info" } | null>(null);
  const showToast = (msg: string, type: "success" | "warning" | "error" | "info" = "success") => {
    setActiveToast({ msg, type });
    setTimeout(() => {
      setActiveToast(prev => prev?.msg === msg ? null : prev);
    }, 4000);
  };
  const getBackendUrl = () => {
    // In our container environment, port 3000 serves both Backend & Frontend. We can use relative paths safely.
    return "";
  };
  const refreshNotifications = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${getBackendUrl()}/api/alerts?userId=${currentUser.id}`);
      const response = await apiClient.get<SystemNotification[]>(`/api/alerts?userId=${currentUser.id}`);
      if (response.ok) {
        const list = await response.json();
        setNotifications(list);
      }
    } catch (err) {
      console.error("Failed to sync notifications", err);
    }
  };
  const markNotificationsAsRead = async () => {
    if (!currentUser) return;
    try {
      await fetch(`${getBackendUrl()}/api/alerts/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      await apiClient.post("/api/alerts/mark-read", { userId: currentUser.id });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };
  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pass })
      });
      const response = await apiClient.post<any>("/api/auth/login", { username, password: pass });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("mediloop_user", JSON.stringify(data.user));
        localStorage.setItem("medialert_user", JSON.stringify(data.user));
        showToast(`Welcome back, ${data.user.username}!`, "success");
        return true;
      } else {
        const errData = await response.json();
        showToast(errData.error || "Authentication failed", "error");
        return false;
      }
    } catch (err) {
      showToast("Server connection error during login", "error");
      return false;
    }
  };
  const register = async (username: string, email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email })
      });
      const response = await apiClient.post<any>("/api/auth/register", { username, email });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("mediloop_user", JSON.stringify(data.user));
        showToast(`Profile created! Welcome to MediLoop, ${username}`, "success");
        localStorage.setItem("medialert_user", JSON.stringify(data.user));
        showToast(`Profile created! Welcome to MediAlert, ${username}`, "success");
        return true;
      } else {
        const errData = await response.json();
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("mediloop_user");
    localStorage.removeItem("medialert_user");
    setNotifications([]);
    showToast("Logged out successfully. Stay healthy!", "info");
  };
  const triggerExpiryCheck = async (): Promise<number> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/cron/check-expiry`, {
        method: "POST"
      });
      const response = await apiClient.post<any>("/api/cron/check-expiry");
      if (response.ok) {
        const data = await response.json();
        if (data.updatedCount > 0) {
    return 0;
  };
  useEffect(() => {
    if (currentUser) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);
  return (
    <AppContext.Provider value={{
      currentUser,
      login,
      register,
      logout,
      notifications,
      refreshNotifications,
      markNotificationsAsRead,
      toast: { show: showToast },
      triggerExpiryCheck,
      activeToast
    }}>
      {children}
      {/* Floating System Notification/Toast Alerts rendering */}
      {activeToast && (
        <div 
          id="system-toast-alert"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border text-sm font-sans animate-bounce-short transition-all duration-300 transform translate-y-0 text-white bg-slate-900 border-slate-800`}
        >
          {activeToast.type === "success" && <span className="text-emerald-400 font-bold">✓</span>}
          {activeToast.type === "warning" && <span className="text-yellow-400 font-bold">⚠</span>}
          {activeToast.type === "error" && <span className="text-red-400 font-bold">✗</span>}
          {activeToast.type === "info" && <span className="text-sky-400 font-bold">ℹ</span>}
          <p className="tracking-wide">{activeToast.msg}</p>
        </div>
      )}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
}
