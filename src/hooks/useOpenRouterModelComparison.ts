import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getOpenRouterModelData,
  clearOpenRouterCache,
  getCacheStatus,
} from "@/lib/openrouter";
import { uniqueModelComparisonData } from "../../models/modelDataConverter";
import type { ModelData } from "@/lib/openrouter";

interface UseOpenRouterModelComparisonReturn {
  models: ModelData[];
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

export const useOpenRouterModelComparison =
  (): UseOpenRouterModelComparisonReturn => {
    const [error, setError] = useState<string | null>(null);
    const [cacheStatus, setCacheStatus] = useState(getCacheStatus());

    // Fetch OpenRouter models using React Query
    const {
      data: openRouterModels = [],
      isLoading,
      refetch,
      error: queryError,
    } = useQuery({
      queryKey: ["openrouter-model-comparison"],
      queryFn: getOpenRouterModelData,
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
    const allModels: ModelData[] = [
      ...uniqueModelComparisonData, // Your existing static models
      ...openRouterModels, // Dynamic OpenRouter models
    ];

    // Remove duplicates based on model name (prefer static models over OpenRouter for existing models)
    const uniqueModels = allModels.reduce((acc, model) => {
      const existingModel = acc.find((m) => m.name === model.name);
      if (!existingModel) {
        acc.push(model);
      } else {
        // If we have a static model and an OpenRouter model with the same name,
        // prefer the one with more complete data (non-default values)
        const isExistingDefault =
          existingModel.parameters === "Unknown" &&
          existingModel.speed === 50 &&
          existingModel.reasoning === 70;

        const isCurrentDefault =
          model.parameters === "Unknown" &&
          model.speed === 75 &&
          model.reasoning === 75;

        // Replace if current model has better data
        if (isExistingDefault && !isCurrentDefault) {
          const index = acc.findIndex((m) => m.name === model.name);
          acc[index] = model;
        }
      }
      return acc;
    }, [] as ModelData[]);

    const refreshModels = () => {
      clearOpenRouterCache();
      setCacheStatus(getCacheStatus());
      refetch();
    };

    const clearCacheHandler = () => {
      clearOpenRouterCache();
      setCacheStatus(getCacheStatus());
    };

    return {
      models: uniqueModels,
      isLoading,
      error,
      hasOpenRouterModels: openRouterModels.length > 0,
      staticModelsCount: uniqueModelComparisonData.length,
      openRouterModelsCount: openRouterModels.length,
      totalModelsCount: uniqueModels.length,
      refreshModels,
      clearCache: clearCacheHandler,
      cacheStatus,
    };
  };
