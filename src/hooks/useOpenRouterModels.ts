import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getOpenRouterModels,
  clearOpenRouterCache,
  getCacheStatus,
} from "@/lib/openrouter";
import { modelPricingData } from "../../models/modelDataConverter";
import type { ModelPricing } from "@/lib/openrouter";

interface UseOpenRouterModelsReturn {
  models: ModelPricing[];
  isLoading: boolean;
  error: string | null;
  hasOpenRouterModels: boolean;
  staticModelsCount: number;
  openRouterModelsCount: number;
  totalModelsCount: number;
  refreshModels: () => void;
  clearCache: () => void;
  cacheStatus: {
    hasCachedData: boolean;
    isValid: boolean;
    timestamp?: number;
    timeUntilExpiry?: number;
  };
}

export const useOpenRouterModels = (): UseOpenRouterModelsReturn => {
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState(getCacheStatus());

  // Fetch OpenRouter models using React Query for better caching and error handling
  const {
    data: openRouterModels = [],
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["openrouter-models"],
    queryFn: getOpenRouterModels,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update cache status when models are fetched
  useEffect(() => {
    if (openRouterModels.length > 0) {
      setCacheStatus(getCacheStatus());
    }
  }, [openRouterModels]);

  // Handle errors
  useEffect(() => {
    if (queryError) {
      setError(`Failed to load OpenRouter models: ${queryError.message}`);
    } else {
      setError(null);
    }
  }, [queryError]);

  // Combine static models with OpenRouter models
  const allModels: ModelPricing[] = [
    ...modelPricingData, // Your existing static models
    ...openRouterModels, // Dynamic OpenRouter models
  ];

  // Remove duplicates based on model name (prefer static models over OpenRouter for existing models)
  const uniqueModels = allModels.reduce((acc, model) => {
    const existingModel = acc.find((m) => m.name === model.name);
    if (!existingModel) {
      acc.push(model);
    }
    return acc;
  }, [] as ModelPricing[]);

  const refreshModels = () => {
    clearOpenRouterCache();
    setCacheStatus(getCacheStatus());
    refetch();
  };

  const clearCache = () => {
    clearOpenRouterCache();
    setCacheStatus(getCacheStatus());
  };

  return {
    models: uniqueModels,
    isLoading,
    error,
    hasOpenRouterModels: openRouterModels.length > 0,
    staticModelsCount: modelPricingData.length,
    openRouterModelsCount: openRouterModels.length,
    totalModelsCount: uniqueModels.length,
    refreshModels,
    clearCache,
    cacheStatus,
  };
};
