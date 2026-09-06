import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import {
  emptySiteMeta,
  fallbackCategories,
  fallbackProducts,
  fallbackSiteMeta,
  fetchPublicCatalog,
  type Category,
  type Product,
  type SiteMeta,
} from "@/lib/visemfood-api";
import { ENABLE_MOCK_FALLBACK } from "@/lib/runtime-config";

type SiteDataStatus = "loading" | "ready" | "error";

type SiteDataContextValue = {
  siteMeta: SiteMeta;
  categories: Category[];
  products: Product[];
  status: SiteDataStatus;
  isLoading: boolean;
  hasLiveData: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [siteMeta, setSiteMeta] = useState<SiteMeta>(ENABLE_MOCK_FALLBACK ? fallbackSiteMeta : emptySiteMeta);
  const [categories, setCategories] = useState<Category[]>(ENABLE_MOCK_FALLBACK ? fallbackCategories : []);
  const [products, setProducts] = useState<Product[]>(ENABLE_MOCK_FALLBACK ? fallbackProducts : []);
  const [status, setStatus] = useState<SiteDataStatus>("loading");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiveData, setHasLiveData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);

    try {
      const next = await fetchPublicCatalog();
      setSiteMeta(next.siteMeta);
      setCategories(next.categories);
      setProducts(next.products);
      setHasLiveData(true);
      setError(null);
      setStatus("ready");
    } catch (nextError) {
      if (!ENABLE_MOCK_FALLBACK) {
        setSiteMeta(emptySiteMeta);
        setCategories([]);
        setProducts([]);
      }

      setHasLiveData(false);
      setError(getErrorMessage(nextError, "Unable to refresh the latest VISEMFOOD catalog right now."));
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<SiteDataContextValue>(
    () => ({
      siteMeta,
      categories,
      products,
      status,
      isLoading,
      hasLiveData,
      error,
      refresh,
    }),
    [categories, error, hasLiveData, isLoading, products, siteMeta, status],
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const context = useContext(SiteDataContext);

  if (!context) {
    throw new Error("useSiteData must be used within SiteDataProvider");
  }

  return context;
}
