import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AdminUser = {
  name: string;
  role: string;
  email: string;
  avatar: string;
};

type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

type AdminAuthContextValue = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  demoCredentials: {
    email: string;
    password: string;
  };
  login: (credentials: { email: string; password: string }) => LoginResult;
  logout: () => void;
};

const STORAGE_KEY = "visemfood-admin-session";

const DEMO_CREDENTIALS = {
  email: "admin@visemfood.com",
  password: "visemfood-admin",
} as const;

const DEMO_USER: AdminUser = {
  name: "Chef Femi",
  role: "Executive Chef & GM",
  email: DEMO_CREDENTIALS.email,
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBmGiASDgy8y7ji0e4tUa4YFbps2iyR-c876docx6UYPGkC5DDzhkDjJgE7N7Zb9YnCLwC2l5j7TNOhfW0Z1QqLF7kF5J5iRyME5zngh_2kDv5vhpM-aHpOPHmjHVhnT_-ha77bhFgrOg1qDt8M9NBJBAIwqW5BSlBak5pLxDC0-uZUgc5OZHtG4Vn0r6mgdILkgn96ui3dbfjj7hF3vTt_OQlUVvJoBZZzlU95bN1MR5YO-NDYJ15v",
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AdminUser | null;
      setUser(parsed?.email ? parsed : null);
    } catch {
      setUser(null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [isHydrated, user]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrated,
      demoCredentials: DEMO_CREDENTIALS,
      login: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (
          normalizedEmail !== DEMO_CREDENTIALS.email ||
          password !== DEMO_CREDENTIALS.password
        ) {
          return {
            ok: false,
            error: "Use the admin demo credentials shown below the form.",
          };
        }

        setUser(DEMO_USER);
        return { ok: true };
      },
      logout: () => {
        setUser(null);
      },
    }),
    [isHydrated, user],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
