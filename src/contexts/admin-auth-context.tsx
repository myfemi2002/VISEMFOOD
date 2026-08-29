import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchCurrentAdminUser,
  loginAdmin,
  logoutAdmin,
  type AdminUser,
} from "@/lib/visemfood-api";

type LoginResult =
  | { ok: true }
  | { ok: false; error: string; status?: number };

type AdminAuthContextValue = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  demoCredentials: {
    email: string;
    password: string;
  };
  login: (credentials: { email: string; password: string }) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const DEMO_CREDENTIALS = {
  email: "admin@visemfood.test",
  password: "Password12345",
} as const;

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      try {
        const nextUser = await fetchCurrentAdminUser();

        if (!cancelled) {
          setUser(nextUser);
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiError && [401, 419].includes(error.status)) {
            setUser(null);
          } else {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrated,
      demoCredentials: DEMO_CREDENTIALS,
      login: async ({ email, password }) => {
        try {
          const result = await loginAdmin({
            email: email.trim().toLowerCase(),
            password,
          });
          setUser(result.user);
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to sign in right now. Please try again shortly.",
            status: error instanceof ApiError ? error.status : undefined,
          };
        }
      },
      logout: async () => {
        try {
          await logoutAdmin();
        } catch {}

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
