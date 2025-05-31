// Static model data commented out to test OpenRouter integration
// All model data will now come from OpenRouter API

/*
import anthropicModelsFromJson from "./anthropic/anthropic_models.json";
import openAiModelsFromJson from "./openai/openai_models.json";
import googleModelsFromJson from "./google/google_models.json";
import fireworksModelsFromJson from "./fireworks/fireworks_models.json";
import deepinfraModelsFromJson from "./deepinfra/deepinfra_models.json";
import mistralModelsFromJson from "./mistral/mistral_models.json";
import cohereModelsFromJson from "./cohere/cohere_models.json";
import groqModelsFromJson from "./groq/groq_models.json";
import perplexityModelsFromJson from "./perplexity/perplexity_models.json";
import deepseekModelsFromJson from "./deepseek/deepseek_models.json";
import cloudflareModelsFromJson from "./cloudflare/cloudflare_models.json";
import awsModelsFromJson from "./aws/aws_models.json";
import replicateModelsFromJson from "./replicate/replicate_models.json";
import xaiModelsFromJson from "./xai/xai_models.json";
import microsoftModelsFromJson from "./microsoft/microsoft_models.json";
import alibabaCloudModelsFromJson from "./alibaba/alibaba_cloud_models.json"; // Corrected path
*/

// Define a more structured type for raw JSON input to mappers
interface RawModelInput {
  name?: string;
  provider?: string;
  costPer1kTokens?: { input?: number | string; output?: number | string };
  inputCost?: number | string;
  outputCost?: number | string;
  category?: string;
  contextWindow?: string | number;
  score?: number;
  license?: string;
  parameters?: string;
  speed?: number;
  reasoning?: number;
  coding?: number;
  creative?: number;
  multimodal?: boolean;
  languages?: number;
  avgTokensPerWord?: number;
  avgCharsPerToken?: number;
  description?: string;
  outputLimit?: number;
  imageTokens?: { small: number; large: number };
  imageTokenizationMode?: string; // More permissive type
  videoTokensPerSecond?: number;
  audioTokensPerSecond?: number;
  tokenizerType?: string;
}

// --- Interfaces for your Application ---
export interface ModelPricing {
  name: string;
  provider: string;
  inputCost: number; // per 1K tokens
  outputCost: number; // per 1K tokens
  category: string;
  contextWindow?: string;
  score?: number; // Optional, as not all JSON data has this
  license?: string;
}

// --- Interfaces for ModelComparison ---
export interface ModelData {
  name: string;
  provider: string;
  parameters: string;
  contextWindow: number; // Number
  inputCost: number; // per 1K tokens
  outputCost: number; // per 1K tokens
  speed: number; // tokens/second (relative score, e.g. out of 150)
  reasoning: number; // score out of 100
  coding: number; // score out of 100
  creative: number; // score out of 100
  multimodal: boolean;
  languages: number; // number of languages supported
  category: string;
  license?: string;
}

// --- Interfaces for TokenCalculator ---
export interface TokenizerInfo {
  name: string;
  provider: string;
  avgTokensPerWord: number;
  avgCharsPerToken: number;
  description: string;
  contextWindow: number; // Number
  outputLimit: number;
  imageTokens?: {
    small: number;
    large: number;
  };
  imageTokenizationMode?: "fixed" | "formula" | "none";
  videoTokensPerSecond?: number;
  audioTokensPerSecond?: number;
  tokenizerType: string;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  license?: string;
}

/*
// --- Helper to parse context window string/number (e.g., "128K", "1M", 1000000) to number ---
const parseContextWindowToNumber = (
  cw?: string | number,
  defaultVal: number = 4096
): number => {
  if (typeof cw === "number") return cw;
  if (!cw) return defaultVal;
  const value = parseFloat(cw);
  const upperCw = cw.toUpperCase();
  if (upperCw.includes("M")) return Math.round(value * 1000000);
  if (upperCw.includes("K")) return Math.round(value * 1000);
  return Math.round(value);
};

// --- Helper to parse context window from number to string (e.g., 128000 -> "128K") ---
const formatContextWindow = (contextWindow: number): string => {
  if (contextWindow >= 1000000) {
    return `${(contextWindow / 1000000).toLocaleString()}M`;
  }
  if (contextWindow >= 1000) {
    return `${(contextWindow / 1000).toLocaleString()}K`;
  }
  return contextWindow.toLocaleString();
};

// --- Mapping Functions for each JSON structure ---

// Generic mapper for JSON structures that have 'costPer1kTokens' and 'contextWindow' as numbers
// Reverted to model: any for this specific mapper due to complex existing JSON structures
const mapJsonToModelPricing = (model: any): ModelPricing => ({
  name: model.name,
  provider: model.provider,
  inputCost: model.costPer1kTokens?.input || 0,
  outputCost: model.costPer1kTokens?.output || 0,
  category: model.category,
  contextWindow: model.contextWindow
    ? formatContextWindow(parseContextWindowToNumber(model.contextWindow))
    : undefined,
  score: model.reasoning, // Assuming 'reasoning' from modelData maps to 'score' for display
  license: model.license,
});

// --- Generic Mapper for ModelData (for ModelComparison) ---
const mapJsonToModelData = (model: RawModelInput): ModelData => {
  const inputCost = model.costPer1kTokens?.input ?? model.inputCost ?? 0;
  const outputCost = model.costPer1kTokens?.output ?? model.outputCost ?? 0;

  return {
    name: model.name || "Unknown Model",
    provider: model.provider || "Unknown Provider",
    parameters: model.parameters || "Unknown",
    contextWindow: parseContextWindowToNumber(model.contextWindow, 4096),
    inputCost:
      typeof inputCost === "string" ? parseFloat(inputCost) : inputCost,
    outputCost:
      typeof outputCost === "string" ? parseFloat(outputCost) : outputCost,
    speed: model.speed || 50,
    reasoning: model.reasoning || model.score || 70,
    coding: model.coding || 70,
    creative: model.creative || 70,
    multimodal: model.multimodal || false,
    languages: model.languages || 1,
    category: model.category || "efficient",
    license: model.license,
  };
};

// --- Generic Mapper for TokenizerInfo (for TokenCalculator) ---
const mapJsonToTokenizerInfo = (model: RawModelInput): TokenizerInfo => {
  const inputCost =
    model.costPer1kTokens?.input ?? model.inputCost ?? undefined;
  const outputCost =
    model.costPer1kTokens?.output ?? model.outputCost ?? undefined;
  let costPer1kTokens;
  if (inputCost !== undefined && outputCost !== undefined) {
    costPer1kTokens = {
      input: typeof inputCost === "string" ? parseFloat(inputCost) : inputCost,
      output:
        typeof outputCost === "string" ? parseFloat(outputCost) : outputCost,
    };
  }

  return {
    name: model.name || "Unknown Tokenizer",
    provider: model.provider || "Unknown Provider",
    avgTokensPerWord: model.avgTokensPerWord || 1.3,
    avgCharsPerToken: model.avgCharsPerToken || 4,
    description: model.description || model.name || "No description available.",
    contextWindow: parseContextWindowToNumber(model.contextWindow, 4096),
    outputLimit: model.outputLimit || 4096,
    imageTokens: model.imageTokens,
    imageTokenizationMode: model.imageTokenizationMode as
      | "fixed"
      | "formula"
      | "none"
      | undefined,
    videoTokensPerSecond: model.videoTokensPerSecond,
    audioTokensPerSecond: model.audioTokensPerSecond,
    tokenizerType: model.tokenizerType || "BPE",
    costPer1kTokens: costPer1kTokens,
    license: model.license,
  };
};

// --- Load and Map All Models ---
const allModelPricing: ModelPricing[] = [
  ...anthropicModelsFromJson.map(mapJsonToModelPricing),
  ...openAiModelsFromJson.map(mapJsonToModelPricing),
  // Add other providers using the generic mapper if their structure is compatible
  // If not, create a specific mapper like anthropic/openai or adjust the JSON structures
  ...googleModelsFromJson.map(mapJsonToModelPricing),
  ...fireworksModelsFromJson.map(mapJsonToModelPricing),
  ...deepinfraModelsFromJson.map(mapJsonToModelPricing),
  ...mistralModelsFromJson.map(mapJsonToModelPricing),
  ...cohereModelsFromJson.map(mapJsonToModelPricing),
  ...groqModelsFromJson.map(mapJsonToModelPricing),
  ...perplexityModelsFromJson.map(mapJsonToModelPricing),
  ...deepseekModelsFromJson.map(mapJsonToModelPricing),
  ...cloudflareModelsFromJson.map(mapJsonToModelPricing),
  ...awsModelsFromJson.map(mapJsonToModelPricing),
  ...replicateModelsFromJson.map(mapJsonToModelPricing),
  ...xaiModelsFromJson.map(mapJsonToModelPricing),
  ...microsoftModelsFromJson.map(mapJsonToModelPricing),
  ...alibabaCloudModelsFromJson.map(mapJsonToModelPricing),
];

export const modelPricingData = allModelPricing;

// --- Load, Map, and Deduplicate All Models for ModelComparison ---
const allRawModelComparisonData: ModelData[] = [
  ...anthropicModelsFromJson.map(mapJsonToModelData),
  ...openAiModelsFromJson.map(mapJsonToModelData),
  ...googleModelsFromJson.map(mapJsonToModelData),
  ...fireworksModelsFromJson.map(mapJsonToModelData),
  ...deepinfraModelsFromJson.map(mapJsonToModelData),
  ...mistralModelsFromJson.map(mapJsonToModelData),
  ...cohereModelsFromJson.map(mapJsonToModelData),
  ...groqModelsFromJson.map(mapJsonToModelData),
  ...perplexityModelsFromJson.map(mapJsonToModelData),
  ...deepseekModelsFromJson.map(mapJsonToModelData),
  ...cloudflareModelsFromJson.map(mapJsonToModelData),
  ...awsModelsFromJson.map(mapJsonToModelData),
  ...replicateModelsFromJson.map(mapJsonToModelData),
  ...xaiModelsFromJson.map(mapJsonToModelData),
  ...microsoftModelsFromJson.map(mapJsonToModelData),
  ...alibabaCloudModelsFromJson.map(mapJsonToModelData),
];

export const uniqueModelComparisonData = allRawModelComparisonData.reduce(
  (acc, current) => {
    const x = acc.find((item) => item.name === current.name);
    if (!x) {
      return acc.concat([current]);
    }
    const existingIsDefault =
      x.parameters === "Unknown" &&
      x.speed === 50 &&
      x.reasoning === 70 &&
      x.coding === 70 &&
      x.creative === 70;
    const currentIsDefault =
      current.parameters === "Unknown" &&
      current.speed === 50 &&
      current.reasoning === 70 &&
      current.coding === 70 &&
      current.creative === 70;

    if (existingIsDefault && !currentIsDefault) {
      acc.splice(
        acc.findIndex((item) => item.name === current.name),
        1
      );
      return acc.concat([current]);
    } else if (!existingIsDefault && currentIsDefault) {
      return acc;
    }
    // If both are default or both non-default, or if one has a more complete set of scores:
    // Prefer the one with more non-default scores if one is clearly a subset of the other's defaults.
    // For simplicity here, if names match and it's not clear one is "better default", keep first.
    // A more sophisticated merge could be done if needed.
    return acc;
  },
  [] as ModelData[]
);

// --- Load, Map, and Deduplicate All Models for TokenCalculator ---
const allRawTokenizerData: TokenizerInfo[] = [
  ...anthropicModelsFromJson.map(mapJsonToTokenizerInfo),
  ...openAiModelsFromJson.map(mapJsonToTokenizerInfo),
  ...googleModelsFromJson.map(mapJsonToTokenizerInfo),
  ...fireworksModelsFromJson.map(mapJsonToTokenizerInfo),
  ...deepinfraModelsFromJson.map(mapJsonToTokenizerInfo),
  ...mistralModelsFromJson.map(mapJsonToTokenizerInfo),
  ...cohereModelsFromJson.map(mapJsonToTokenizerInfo),
  ...groqModelsFromJson.map(mapJsonToTokenizerInfo),
  ...perplexityModelsFromJson.map(mapJsonToTokenizerInfo),
  ...deepseekModelsFromJson.map(mapJsonToTokenizerInfo),
  ...cloudflareModelsFromJson.map(mapJsonToTokenizerInfo),
  ...awsModelsFromJson.map(mapJsonToTokenizerInfo),
  ...replicateModelsFromJson.map(mapJsonToTokenizerInfo),
  ...xaiModelsFromJson.map(mapJsonToTokenizerInfo),
  ...microsoftModelsFromJson.map(mapJsonToTokenizerInfo),
  ...alibabaCloudModelsFromJson.map(mapJsonToTokenizerInfo),
];

// Simple deduplication by name for tokenizer data, keeping the first occurrence.
export const uniqueTokenizerData = allRawTokenizerData.reduce(
  (acc, current) => {
    const x = acc.find((item) => item.name === current.name);
    if (!x) {
      return acc.concat([current]);
    }
    return acc;
  },
  [] as TokenizerInfo[]
);
*/

// Empty exports to prevent breaking imports - all data now comes from OpenRouter
export const modelPricingData: ModelPricing[] = [];
export const uniqueModelComparisonData: ModelData[] = [];
export const uniqueTokenizerData: TokenizerInfo[] = [];
