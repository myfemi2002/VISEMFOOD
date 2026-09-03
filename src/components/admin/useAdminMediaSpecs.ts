import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { fetchAdminMediaSpecs, type MediaSpec } from "@/lib/visemfood-api";

export function useAdminMediaSpecs(enabled = true) {
  const [specs, setSpecs] = useState<Record<string, MediaSpec>>({});
  const [specError, setSpecError] = useState<string | null>(null);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(enabled);

  async function loadSpecs() {
    setIsLoadingSpecs(true);

    try {
      const nextSpecs = await fetchAdminMediaSpecs();
      setSpecs(nextSpecs);
      setSpecError(null);
    } catch (error) {
      setSpecError(getErrorMessage(error, "Media specifications are temporarily unavailable."));
    } finally {
      setIsLoadingSpecs(false);
    }
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadSpecs();
  }, [enabled]);

  return {
    specs,
    specError,
    isLoadingSpecs,
    loadSpecs,
  };
}
