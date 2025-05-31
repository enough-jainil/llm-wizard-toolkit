// OpenRouter API client for fetching available models
// Based on: https://openrouter.ai/docs/api-reference/list-available-models

export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  architecture: {
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
  };
  top_provider: {
    is_moderated: boolean;
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    input_cache_read: string;
    input_cache_write: string;
    web_search: string;
    internal_reasoning: string;
  };
  context_length: number;
  hugging_face_id?: string;
  per_request_limits?: Record<string, any>;
  supported_parameters: string[];
}

export interface OpenRouterApiResponse {
  data: OpenRouterModel[];
}

// Convert OpenRouter model to our internal ModelPricing format
export interface ModelPricing {
  name: string;
  provider: string;
  inputCost: number;
  outputCost: number;
  category: string;
  contextWindow?: string;
  score?: number;
  license?: string;
}

// ModelData interface for ModelComparison component
export interface ModelData {
  name: string;
  provider: string;
  parameters: string;
  contextWindow: number;
  inputCost: number;
  outputCost: number;
  speed: number;
  reasoning: number;
  coding: number;
  creative: number;
  multimodal: boolean;
  languages: number;
  category: string;
  license?: string;
}

// Cache configuration
const CACHE_KEY = "openrouter_models";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

interface CachedData {
  models: OpenRouterModel[];
  timestamp: number;
}

// Extract provider name from model ID
const extractProvider = (modelId: string): string => {
  // OpenRouter model IDs typically follow the pattern: provider/model-name
  const parts = modelId.split("/");
  if (parts.length >= 2) {
    const provider = parts[0];
    // Map some common provider names to our format
    const providerMap: Record<string, string> = {
      openai: "OpenAI",
      anthropic: "Anthropic",
      google: "Google",
      "meta-llama": "Meta",
      mistralai: "Mistral",
      cohere: "Cohere",
      microsoft: "Microsoft",
      amazon: "AWS",
      deepseek: "DeepSeek",
      xai: "xAI",
      perplexity: "Perplexity",
      fireworks: "Fireworks",
      together: "Together",
      groq: "Groq",
    };
    return (
      providerMap[provider] ||
      provider.charAt(0).toUpperCase() + provider.slice(1)
    );
  }
  return "Unknown";
};

// Categorize models based on their characteristics
const categorizeModel = (model: OpenRouterModel): string => {
  const name = model.name.toLowerCase();
  const description = model.description.toLowerCase();

  // Check for flagship/premium models
  if (
    name.includes("gpt-4") ||
    name.includes("claude-3.5") ||
    name.includes("claude-3-opus") ||
    name.includes("gemini-2") ||
    name.includes("o1") ||
    description.includes("flagship")
  ) {
    return "flagship";
  }

  // Check for efficient/fast models
  if (
    name.includes("mini") ||
    name.includes("fast") ||
    name.includes("turbo") ||
    name.includes("flash") ||
    name.includes("haiku") ||
    description.includes("efficient")
  ) {
    return "efficient";
  }

  // Check for specialized models
  if (
    name.includes("code") ||
    name.includes("vision") ||
    name.includes("multimodal") ||
    description.includes("vision") ||
    description.includes("code")
  ) {
    return "specialized";
  }

  return "efficient"; // Default category
};

// Format context window for display
const formatContextWindow = (contextLength: number): string => {
  if (contextLength >= 1000000) {
    return `${(contextLength / 1000000).toFixed(1)}M`;
  } else if (contextLength >= 1000) {
    return `${(contextLength / 1000).toFixed(0)}K`;
  }
  return contextLength.toString();
};

// Estimate model parameters based on context window and model characteristics
const estimateParameters = (model: OpenRouterModel): string => {
  const name = model.name.toLowerCase();

  // Try to extract from name first
  if (name.includes("405b")) return "405B";
  if (name.includes("70b")) return "70B";
  if (name.includes("8b")) return "8B";
  if (name.includes("7b")) return "7B";
  if (name.includes("3b")) return "3B";
  if (name.includes("1b")) return "1B";

  // Estimate based on known models
  if (name.includes("gpt-4")) return "1.76T";
  if (name.includes("gpt-3.5")) return "175B";
  if (name.includes("claude-3.5") || name.includes("claude-3-opus"))
    return "~175B";
  if (name.includes("claude-3-sonnet")) return "~100B";
  if (name.includes("claude-3-haiku")) return "~20B";
  if (name.includes("gemini-2") || name.includes("gemini-1.5-pro"))
    return "~175B";
  if (name.includes("gemini-1.5-flash")) return "~8B";

  // Default estimate based on context window
  if (model.context_length >= 1000000) return "175B+";
  if (model.context_length >= 200000) return "70B-175B";
  if (model.context_length >= 32000) return "7B-70B";
  return "Unknown";
};

// Check if model supports multimodal input
const isMultimodal = (model: OpenRouterModel): boolean => {
  return (
    model.architecture.input_modalities.length > 1 ||
    model.architecture.input_modalities.includes("image") ||
    model.name.toLowerCase().includes("vision") ||
    model.description.toLowerCase().includes("vision") ||
    model.description.toLowerCase().includes("multimodal")
  );
};

// Estimate language support based on model characteristics
const estimateLanguageSupport = (model: OpenRouterModel): number => {
  const name = model.name.toLowerCase();

  // High language support models
  if (
    name.includes("gpt-4") ||
    name.includes("claude-3") ||
    name.includes("gemini")
  ) {
    return 100;
  }

  // Medium language support
  if (name.includes("llama") || name.includes("mistral")) {
    return 50;
  }

  // Default
  return 20;
};

// Convert OpenRouter model to our internal format
const convertToModelPricing = (model: OpenRouterModel): ModelPricing => {
  const inputCost = parseFloat(model.pricing.prompt) * 1000; // Convert to per 1K tokens
  const outputCost = parseFloat(model.pricing.completion) * 1000; // Convert to per 1K tokens

  return {
    name: model.name,
    provider: extractProvider(model.id),
    inputCost: inputCost,
    outputCost: outputCost,
    category: categorizeModel(model),
    contextWindow: formatContextWindow(model.context_length),
    score: undefined, // OpenRouter doesn't provide performance scores
    license: undefined, // OpenRouter doesn't provide license info in this format
  };
};

// Convert OpenRouter model to ModelData format for comparison
const convertToModelData = (model: OpenRouterModel): ModelData => {
  const inputCost = parseFloat(model.pricing.prompt) * 1000; // Convert to per 1K tokens
  const outputCost = parseFloat(model.pricing.completion) * 1000; // Convert to per 1K tokens

  return {
    name: model.name,
    provider: extractProvider(model.id),
    parameters: estimateParameters(model),
    contextWindow: model.context_length,
    inputCost: inputCost,
    outputCost: outputCost,
    speed: 75, // Default speed score - we don't have this data from OpenRouter
    reasoning: 75, // Default reasoning score
    coding: 75, // Default coding score
    creative: 75, // Default creative score
    multimodal: isMultimodal(model),
    languages: estimateLanguageSupport(model),
    category: categorizeModel(model),
    license: undefined, // OpenRouter doesn't provide license info
  };
};

// Check if cached data is still valid
const isCacheValid = (cachedData: CachedData): boolean => {
  return Date.now() - cachedData.timestamp < CACHE_DURATION;
};

// Get cached models from localStorage
const getCachedModels = (): OpenRouterModel[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    if (isCacheValid(data)) {
      return data.models;
    }

    // Cache is expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.warn("Failed to read cached OpenRouter models:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

// Cache models to localStorage
const cacheModels = (models: OpenRouterModel[]): void => {
  try {
    const data: CachedData = {
      models,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to cache OpenRouter models:", error);
  }
};

// Fetch models from OpenRouter API
export const fetchOpenRouterModels = async (): Promise<ModelPricing[]> => {
  // Check cache first
  const cachedModels = getCachedModels();
  if (cachedModels) {
    console.log("Using cached OpenRouter models");
    return cachedModels.map(convertToModelPricing);
  }

  try {
    console.log("Fetching fresh OpenRouter models...");
    const response = await fetch("https://openrouter.ai/api/v1/models");

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenRouterApiResponse = await response.json();

    // Filter out models with invalid pricing
    const validModels = data.data.filter((model) => {
      const prompt = parseFloat(model.pricing.prompt);
      const completion = parseFloat(model.pricing.completion);
      return (
        !isNaN(prompt) && !isNaN(completion) && (prompt > 0 || completion > 0)
      );
    });

    // Cache the models
    cacheModels(validModels);

    console.log(`Fetched ${validModels.length} valid models from OpenRouter`);
    return validModels.map(convertToModelPricing);
  } catch (error) {
    console.error("Failed to fetch OpenRouter models:", error);
    throw error;
  }
};

// Fetch models as ModelData for comparison
export const fetchOpenRouterModelData = async (): Promise<ModelData[]> => {
  // Check cache first
  const cachedModels = getCachedModels();
  if (cachedModels) {
    console.log("Using cached OpenRouter models for comparison");
    return cachedModels.map(convertToModelData);
  }

  try {
    console.log("Fetching fresh OpenRouter models for comparison...");
    const response = await fetch("https://openrouter.ai/api/v1/models");

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenRouterApiResponse = await response.json();

    // Filter out models with invalid pricing
    const validModels = data.data.filter((model) => {
      const prompt = parseFloat(model.pricing.prompt);
      const completion = parseFloat(model.pricing.completion);
      return (
        !isNaN(prompt) && !isNaN(completion) && (prompt > 0 || completion > 0)
      );
    });

    // Cache the models
    cacheModels(validModels);

    console.log(
      `Fetched ${validModels.length} valid models from OpenRouter for comparison`
    );
    return validModels.map(convertToModelData);
  } catch (error) {
    console.error("Failed to fetch OpenRouter models for comparison:", error);
    throw error;
  }
};

// Get OpenRouter models with error handling and fallback
export const getOpenRouterModels = async (): Promise<ModelPricing[]> => {
  try {
    return await fetchOpenRouterModels();
  } catch (error) {
    console.error("OpenRouter models unavailable:", error);
    // Return empty array instead of throwing, so the app continues to work
    return [];
  }
};

// Get OpenRouter model data with error handling and fallback
export const getOpenRouterModelData = async (): Promise<ModelData[]> => {
  try {
    return await fetchOpenRouterModelData();
  } catch (error) {
    console.error("OpenRouter model data unavailable:", error);
    // Return empty array instead of throwing, so the app continues to work
    return [];
  }
};

// Clear cached models (useful for manual refresh)
export const clearOpenRouterCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  console.log("OpenRouter model cache cleared");
};

// Get cache status information
export const getCacheStatus = (): {
  hasCachedData: boolean;
  isValid: boolean;
  timestamp?: number;
  timeUntilExpiry?: number;
} => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return { hasCachedData: false, isValid: false };
    }

    const data: CachedData = JSON.parse(cached);
    const isValid = isCacheValid(data);
    const timeUntilExpiry = isValid
      ? data.timestamp + CACHE_DURATION - Date.now()
      : 0;

    return {
      hasCachedData: true,
      isValid,
      timestamp: data.timestamp,
      timeUntilExpiry,
    };
  } catch (error) {
    return { hasCachedData: false, isValid: false };
  }
};
