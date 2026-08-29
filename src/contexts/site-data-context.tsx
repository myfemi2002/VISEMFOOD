import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackSiteMeta,
  fallbackTrayPackages,
  fetchPublicCatalog,
  type Category,
  type Product,
  type SiteMeta,
  type TrayPackage,
} from "@/lib/visemfood-api";

type SiteDataContextValue = {
  siteMeta: SiteMeta;
  categories: Category[];
  products: Product[];
  trayPackages: TrayPackage[];
  isLoading: boolean;
  hasLiveData: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [siteMeta, setSiteMeta] = useState<SiteMeta>(fallbackSiteMeta);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [trayPackages, setTrayPackages] = useState<TrayPackage[]>(fallbackTrayPackages);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiveData, setHasLiveData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const next = await fetchPublicCatalog();
      setSiteMeta(next.siteMeta);
      setCategories(next.categories);
      setProducts(next.products);
      setTrayPackages(next.trayPackages);
      setHasLiveData(true);
      setError(null);
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Unable to refresh the latest VISEMFOOD catalog right now."));
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
      trayPackages,
      isLoading,
      hasLiveData,
      error,
      refresh,
    }),
    [categories, error, hasLiveData, isLoading, products, siteMeta, trayPackages],
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
