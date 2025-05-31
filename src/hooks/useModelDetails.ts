import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { OpenRouterModel, OpenRouterApiResponse } from "@/lib/openrouter";

interface UseModelDetailsReturn {
  models: OpenRouterModel[];
  isLoading: boolean;
  error: string | null;
  getModelById: (id: string) => OpenRouterModel | undefined;
  getModelsByProvider: (provider: string) => OpenRouterModel[];
  getModelsByCategory: (category: string) => OpenRouterModel[];
  getMultimodalModels: () => OpenRouterModel[];
  getFreeModels: () => OpenRouterModel[];
  refreshModels: () => void;
  totalCount: number;
  searchModels: (query: string) => OpenRouterModel[];
}

// Cache configuration
const CACHE_KEY = "openrouter_models_detailed";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedModelData {
  models: OpenRouterModel[];
  timestamp: number;
}

const getCachedModels = (): OpenRouterModel[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedModelData = JSON.parse(cached);
    const isValid = Date.now() - data.timestamp < CACHE_DURATION;

    if (isValid) {
      return data.models;
    }

    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.warn("Failed to read cached model details:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const cacheModels = (models: OpenRouterModel[]): void => {
  try {
    const data: CachedModelData = {
      models,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to cache model details:", error);
  }
};

const fetchDetailedModels = async (): Promise<OpenRouterModel[]> => {
  // Check cache first
  const cachedModels = getCachedModels();
  if (cachedModels) {
    console.log("Using cached detailed models");
    return cachedModels;
  }

  try {
    console.log("Fetching fresh detailed models from OpenRouter...");
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenRouterApiResponse = await response.json();

    // Validate and filter models
    const validModels = data.data.filter((model) => {
      // Basic validation
      if (!model.id || !model.name || !model.description) {
        return false;
      }

      // Ensure pricing information exists
      if (!model.pricing || typeof model.pricing.prompt === "undefined") {
        return false;
      }

      // Ensure architecture information exists
      if (!model.architecture || !model.architecture.input_modalities) {
        return false;
      }

      return true;
    });

    // Cache the valid models
    cacheModels(validModels);

    console.log(`Fetched ${validModels.length} valid detailed models`);
    return validModels;
  } catch (error) {
    console.error("Failed to fetch detailed models:", error);
    throw error;
  }
};

export const useModelDetails = (): UseModelDetailsReturn => {
  const [error, setError] = useState<string | null>(null);

  const {
    data: models = [],
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["openrouter-models-detailed"],
    queryFn: fetchDetailedModels,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle errors
  useEffect(() => {
    if (queryError) {
      setError(`Failed to load model details: ${queryError.message}`);
    } else {
      setError(null);
    }
  }, [queryError]);

  // Helper functions
  const getModelById = (id: string): OpenRouterModel | undefined => {
    return models.find((model) => model.id === id);
  };

  const getModelsByProvider = (provider: string): OpenRouterModel[] => {
    const providerLower = provider.toLowerCase();
    return models.filter(
      (model) =>
        model.id.toLowerCase().startsWith(providerLower + "/") ||
        model.name.toLowerCase().includes(providerLower)
    );
  };

  const getModelsByCategory = (category: string): OpenRouterModel[] => {
    const categoryLower = category.toLowerCase();
    return models.filter((model) => {
      const name = model.name.toLowerCase();
      const description = model.description.toLowerCase();

      switch (categoryLower) {
        case "flagship":
        case "premium":
          return (
            name.includes("gpt-4") ||
            name.includes("claude-3.5") ||
            name.includes("claude-3-opus") ||
            name.includes("gemini-2") ||
            name.includes("o1") ||
            description.includes("flagship")
          );
        case "efficient":
        case "budget":
          return (
            name.includes("mini") ||
            name.includes("fast") ||
            name.includes("turbo") ||
            name.includes("flash") ||
            name.includes("haiku") ||
            parseFloat(model.pricing.prompt) * 1000000 < 1
          );
        case "specialized":
          return (
            name.includes("code") ||
            name.includes("vision") ||
            name.includes("multimodal") ||
            model.architecture.input_modalities.includes("image")
          );
        case "free":
          return (
            parseFloat(model.pricing.prompt) === 0 &&
            parseFloat(model.pricing.completion) === 0
          );
        default:
          return false;
      }
    });
  };

  const getMultimodalModels = (): OpenRouterModel[] => {
    return models.filter(
      (model) =>
        model.architecture.input_modalities.length > 1 ||
        model.architecture.input_modalities.includes("image") ||
        model.name.toLowerCase().includes("vision")
    );
  };

  const getFreeModels = (): OpenRouterModel[] => {
    return models.filter(
      (model) =>
        parseFloat(model.pricing.prompt) === 0 &&
        parseFloat(model.pricing.completion) === 0
    );
  };

  const searchModels = (query: string): OpenRouterModel[] => {
    if (!query.trim()) return models;

    const queryLower = query.toLowerCase();
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(queryLower) ||
        model.id.toLowerCase().includes(queryLower) ||
        model.description.toLowerCase().includes(queryLower) ||
        (model.hugging_face_id &&
          model.hugging_face_id.toLowerCase().includes(queryLower))
    );
  };

  const refreshModels = () => {
    localStorage.removeItem(CACHE_KEY);
    refetch();
  };

  return {
    models,
    isLoading,
    error,
    getModelById,
    getModelsByProvider,
    getModelsByCategory,
    getMultimodalModels,
    getFreeModels,
    refreshModels,
    totalCount: models.length,
    searchModels,
  };
};
