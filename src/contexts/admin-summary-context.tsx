import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { fetchAdminDashboard, type AdminDashboard } from "@/lib/visemfood-api";

type AdminSummaryContextValue = {
  dashboard: AdminDashboard | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AdminSummaryContext = createContext<AdminSummaryContextValue | null>(null);

export function AdminSummaryProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!isAuthenticated) {
      setDashboard(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const next = await fetchAdminDashboard();
      setDashboard(next);
      setError(null);
    } catch (nextError) {
      setDashboard(null);
      setError(getErrorMessage(nextError, "Unable to load the admin dashboard summary right now."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [isAuthenticated]);

  const value = useMemo<AdminSummaryContextValue>(
    () => ({
      dashboard,
      isLoading,
      error,
      refresh,
    }),
    [dashboard, error, isLoading],
  );

  return <AdminSummaryContext.Provider value={value}>{children}</AdminSummaryContext.Provider>;
}

export function useAdminSummary() {
  const context = useContext(AdminSummaryContext);

  if (!context) {
    throw new Error("useAdminSummary must be used within AdminSummaryProvider");
  }

  return context;
}
