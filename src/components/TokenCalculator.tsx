import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Hash,
  FileText,
  Download,
  Upload,
  Image,
  Video,
  AudioLines,
  Calculator,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { get_encoding, encoding_for_model, Tiktoken } from "tiktoken";

interface TokenizerInfo {
  name: string;
  provider: string;
  avgTokensPerWord: number;
  avgCharsPerToken: number;
  description: string;
  contextWindow: number;
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
}

interface AnalysisEntry {
  id: number;
  text: string; // truncated
  tokenizer: string;
  multimodal: {
    imageCount: number;
    imageSizeCategory: "small" | "large";
    videoDurationSeconds: number;
    audioDurationSeconds: number;
  };
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  estimatedTokens: number;
  tokenDensity: string;
  breakdown: {
    textTokens: number;
    imageTokens: number;
    videoTokens: number;
    audioTokens: number;
  };
  contextUsagePercent: string;
  estimatedCost: number;
  timestamp: string;
}

// Helper to convert context window string (e.g., "128K", "1M") to number
const parseContextWindow = (cw: string | undefined): number => {
  if (!cw) return 4096; // Default if undefined
  const value = parseFloat(cw);
  if (cw.toUpperCase().includes("M")) return value * 1000000;
  if (cw.toUpperCase().includes("K")) return value * 1000;
  return value;
};

const tokenizers: TokenizerInfo[] = [
  // OpenAI Models from PriceCalculator.tsx
  {
    name: "GPT-4o",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description:
      "OpenAI's most advanced model. Variant: GPT-4o. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 16384, // increased for GPT-4o
    imageTokens: { small: 85, large: 170 }, // Standard for o200k_base vision
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 0, // Placeholder, OpenAI vision models typically don't charge per second for video yet
    audioTokensPerSecond: 0, // Placeholder
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.005, output: 0.02 },
  },
  {
    name: "GPT-4o (2024-08-06)",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description:
      "OpenAI's most advanced model. Variant: GPT-4o (2024-08-06). Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 16384,
    imageTokens: { small: 85, large: 170 },
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.0025, output: 0.01 },
  },
  {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description:
      "OpenAI's efficient and fast GPT-4o variant. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 16384,
    imageTokens: { small: 85, large: 170 }, // Assuming same image capabilities as full GPT-4o
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
  },
  {
    name: "GPT-4o (2024-05-13)",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description:
      "OpenAI's most advanced model. Variant: GPT-4o (2024-05-13). Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 16384,
    imageTokens: { small: 85, large: 170 },
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.005, output: 0.015 },
  },
  {
    name: "GPT-4 Turbo (2024-04-09)",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI's powerful and fast GPT-4 Turbo. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 4096, // Standard for older Turbo
    imageTokens: { small: 85, large: 170 }, // GPT-4 Turbo has vision
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken cl100k_base)",
    costPer1kTokens: { input: 0.01, output: 0.03 },
  },
  {
    name: "GPT-4",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI's foundational GPT-4 model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokens: { small: 85, large: 170 }, // GPT-4 has vision
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken cl100k_base)",
    costPer1kTokens: { input: 0.03, output: 0.06 },
  },
  {
    name: "GPT-4-32K",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description:
      "OpenAI's GPT-4 model with a larger context window. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096,
    imageTokens: { small: 85, large: 170 }, // GPT-4 has vision
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken cl100k_base)",
    costPer1kTokens: { input: 0.06, output: 0.12 },
  },
  {
    name: "GPT-3.5 Turbo (0125)",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI's efficient GPT-3.5 Turbo. Costs per 1K tokens.",
    contextWindow: parseContextWindow("16K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken cl100k_base)",
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
  },
  {
    name: "GPT-3.5 Turbo Instruct",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI's instruct-tuned GPT-3.5 model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken cl100k_base)",
    costPer1kTokens: { input: 0.0015, output: 0.002 },
  },
  {
    name: "GPT-4.1",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI's GPT-4.1 model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 16384, // Assuming larger output for 1M context
    imageTokenizationMode: "fixed", // Assuming vision capabilities
    imageTokens: { small: 85, large: 170 },
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)", // Likely new encoding
    costPer1kTokens: { input: 0.5, output: 0.008 },
  },
  {
    name: "GPT-4.1 mini",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI's efficient GPT-4.1 mini. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 16384,
    imageTokenizationMode: "fixed", // Assuming vision capabilities
    imageTokens: { small: 85, large: 170 },
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.1, output: 0.0016 },
  },
  {
    name: "GPT-4.1 nano",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI's smallest GPT-4.1 nano. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 16384,
    imageTokenizationMode: "fixed", // Assuming vision capabilities
    imageTokens: { small: 85, large: 170 },
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.025, output: 0.0004 },
  },
  {
    name: "o3",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI o3 model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 16384, // Assuming similar to GPT-4o
    imageTokenizationMode: "fixed", // Assuming vision capabilities
    imageTokens: { small: 85, large: 170 },
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 2.5, output: 0.04 },
  },
  {
    name: "o4-mini",
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI o4-mini model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 16384,
    imageTokenizationMode: "fixed", // Assuming vision capabilities
    imageTokens: { small: 85, large: 170 },
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.275, output: 0.0044 },
  },
  {
    name: "GPT-o4-mini", // Distinct from o4-mini as per PriceCalculator
    provider: "OpenAI",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "OpenAI GPT-o4-mini model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 16384,
    imageTokenizationMode: "fixed", // Assuming vision capabilities
    imageTokens: { small: 85, large: 170 },
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (tiktoken o200k_base)",
    costPer1kTokens: { input: 0.3, output: 0.0024 },
  },

  // Anthropic Models from PriceCalculator.tsx
  {
    name: "Claude 3 Opus",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's most powerful model. Image tokens: (W * H) / 750. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.015, output: 0.075 },
  },
  {
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's balanced model. Image tokens: (W * H) / 750. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.003, output: 0.015 },
  },
  {
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's fastest model. Image tokens: (W * H) / 750. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
  },
  {
    name: "Claude 2.1",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's Claude 2.1 model. Image support via formula. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.008, output: 0.024 },
  },
  {
    name: "Claude 2.0",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's Claude 2.0 model. Image support via formula. Costs per 1K tokens.",
    contextWindow: parseContextWindow("100K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.008, output: 0.024 },
  },
  {
    name: "Claude Instant 1.2",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's fast and affordable model. Image support via formula. Costs per 1K tokens.",
    contextWindow: parseContextWindow("100K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.0008, output: 0.0024 },
  },
  {
    name: "Claude Opus 4",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's Claude Opus 4. Image support via formula. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.015, output: 0.075 },
  },
  {
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's Claude Sonnet 4. Image support via formula. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.003, output: 0.015 },
  },
  {
    name: "Claude Sonnet 3.7",
    provider: "Anthropic",
    avgTokensPerWord: 1.25,
    avgCharsPerToken: 3.2,
    description:
      "Anthropic's Claude Sonnet 3.7. Image support via formula. Costs per 1K tokens.",
    contextWindow: parseContextWindow("200K"),
    outputLimit: 4096,
    imageTokenizationMode: "formula",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword tokenizer",
    costPer1kTokens: { input: 0.003, output: 0.015 },
  },

  // Google Models from PriceCalculator.tsx
  {
    name: "Gemini 1.5 Pro",
    provider: "Google",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4,
    description: "Google's flagship Gemini 1.5 Pro model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 8192,
    imageTokens: { small: 258, large: 258 }, // Fixed token cost per image
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 263, // Placeholder based on Gemini 1.0 docs
    audioTokensPerSecond: 32, // Placeholder based on Gemini 1.0 docs
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.0035, output: 0.0105 },
  },
  {
    name: "Gemini 1.5 Flash",
    provider: "Google",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4,
    description:
      "Google's fast and efficient Gemini 1.5 Flash model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("2.8M"), // Note: PriceCalc had 2.8M, previous TC had 1M. Using 2.8M.
    outputLimit: 8192,
    imageTokens: { small: 258, large: 258 },
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 263, // Placeholder based on Gemini 1.0 docs
    audioTokensPerSecond: 32, // Placeholder based on Gemini 1.0 docs
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.00035, output: 0.00105 }, // Corrected from 0.000075 / 0.0003
  },
  {
    name: "Gemini Pro", // This is likely older Gemini 1.0 Pro
    provider: "Google",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4,
    description: "Google's Gemini Pro model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 2048, // Older Gemini Pro limit
    imageTokenizationMode: "none", // Older Gemini Pro (text) likely no direct image token charge
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
  },
  {
    name: "Gemini 2.5 Flash Preview", // This is a new name from PriceCalculator
    provider: "Google",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4,
    description: "Google's Gemini 2.5 Flash Preview. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 8192, // Assuming similar to other 1.5/2.5 models
    imageTokens: { small: 258, large: 258 }, // Assuming vision capabilities
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 263, // Assuming capabilities
    audioTokensPerSecond: 32, // Assuming capabilities
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
  },
  {
    name: "Gemini 2.5 Pro Preview", // This is a new name from PriceCalculator
    provider: "Google",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4,
    description: "Google's Gemini 2.5 Pro Preview. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 8192,
    imageTokens: { small: 258, large: 258 }, // Assuming vision capabilities
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 263, // Assuming capabilities
    audioTokensPerSecond: 32, // Assuming capabilities
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.00125, output: 0.01 },
  },
  {
    name: "Gemini 2.0 Flash", // This is a new name from PriceCalculator
    provider: "Google",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4,
    description: "Google's Gemini 2.0 Flash. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 8192,
    imageTokens: { small: 258, large: 258 }, // Assuming vision capabilities
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 263, // Assuming capabilities
    audioTokensPerSecond: 32, // Assuming capabilities
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.0001, output: 0.0004 },
  },
  {
    name: "Gemini 2.0 Flash-Lite", // This is a new name from PriceCalculator
    provider: "Google",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4,
    description: "Google's Gemini 2.0 Flash-Lite. Costs per 1K tokens.",
    contextWindow: parseContextWindow("1M"),
    outputLimit: 8192,
    imageTokens: { small: 258, large: 258 }, // Assuming vision capabilities
    imageTokenizationMode: "fixed",
    videoTokensPerSecond: 263, // Assuming capabilities
    audioTokensPerSecond: 32, // Assuming capabilities
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.000075, output: 0.0003 },
  },

  // Meta Llama Models (Fireworks, Deepinfra) from PriceCalculator.tsx
  {
    name: "Llama 3.1 405B Instruct",
    provider: "Fireworks",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 3.1 405B Instruct via Fireworks. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 4096, // Common Llama limit
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.003, output: 0.003 },
  },
  {
    name: "Llama 3.1 70B Instruct",
    provider: "Deepinfra",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 3.1 70B Instruct via Deepinfra. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.52, output: 0.75 },
  },
  {
    name: "Llama 3.1 8B Instruct",
    provider: "Deepinfra",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 3.1 8B Instruct via Deepinfra. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.09, output: 0.09 },
  },
  {
    name: "Llama 3 70B Instruct",
    provider: "Deepinfra", // Note: PriceCalculator lists other Llama 3 70B with Groq. This one is Deepinfra.
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 3 70B Instruct via Deepinfra. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.59, output: 0.79 },
  },
  {
    name: "Llama 3 8B Instruct",
    provider: "Deepinfra", // Note: PriceCalculator lists other Llama 3 8B with Groq. This one is Deepinfra.
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 3 8B Instruct via Deepinfra. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.08, output: 0.08 },
  },

  // Mistral Models from PriceCalculator.tsx
  {
    name: "Mistral Large",
    provider: "Mistral",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8, // General for SentencePiece based
    description: "Mistral Large model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096, // Or 8K, check official
    imageTokenizationMode: "none", // Mistral API has some vision but might be different models
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.008, output: 0.024 },
  },
  {
    name: "Mistral Medium",
    provider: "Mistral",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Mistral Medium model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.0027, output: 0.0081 },
  },
  {
    name: "Mistral Small",
    provider: "Mistral",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Mistral Small model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.002, output: 0.006 },
  },
  {
    name: "Mixtral 8x7B",
    provider: "Mistral", // PriceCalculator also has Groq version. This is the Mistral one.
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Mixtral 8x7B by Mistral. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.7, output: 0.7 }, // This cost looks high if per K tokens, might be M. Re-check. Assuming K for now.
  },
  {
    name: "Mistral 7B",
    provider: "Mistral", // PriceCalculator also has Cloudflare version. This is Mistral.
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Mistral 7B model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.25, output: 0.25 }, // This cost looks high if per K tokens. Re-check. Assuming K for now.
  },

  // Cohere Models from PriceCalculator.tsx
  {
    name: "Command R+",
    provider: "Cohere",
    avgTokensPerWord: 1.2, // Cohere tends to be efficient
    avgCharsPerToken: 3.5,
    description: "Cohere's Command R+ model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("128K"),
    outputLimit: 4096,
    imageTokenizationMode: "none", // Cohere has multimodal features, but pricing might vary.
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword (Cohere)",
    costPer1kTokens: { input: 0.003, output: 0.015 },
  },
  {
    name: "Command R",
    provider: "Cohere",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 3.5,
    description: "Cohere's Command R model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"), // PriceCalculator has 4K, Cohere docs say 128K. Using PriceCalc.
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword (Cohere)",
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
  },
  {
    name: "Command",
    provider: "Cohere",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 3.5,
    description: "Cohere's Command model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom subword (Cohere)",
    costPer1kTokens: { input: 0.0003, output: 0.0006 },
  },

  // Groq Models from PriceCalculator.tsx
  {
    name: "Llama 3 70B (Groq)",
    provider: "Groq",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 3 70B via Groq. High speed. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.59, output: 0.79 }, // High if K. Might be M.
  },
  {
    name: "Llama 3 8B (Groq)",
    provider: "Groq",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 3 8B via Groq. High speed. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.05, output: 0.1 },
  },
  {
    name: "Mixtral 8x7B (Groq)",
    provider: "Groq",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Mixtral 8x7B via Groq. High speed. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.27, output: 0.27 }, // High if K.
  },
  {
    name: "Gemma 7B (Groq)",
    provider: "Groq",
    avgTokensPerWord: 1.2,
    avgCharsPerToken: 4.0,
    description: "Gemma 7B via Groq. High speed. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "SentencePiece",
    costPer1kTokens: { input: 0.1, output: 0.1 },
  },

  // Perplexity Models from PriceCalculator.tsx
  {
    name: "PPLX 70B Online",
    provider: "Perplexity",
    avgTokensPerWord: 1.3, // General estimate
    avgCharsPerToken: 4,
    description: "PPLX 70B Online by Perplexity. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"),
    outputLimit: 4096, // Check official
    imageTokenizationMode: "none", // Typically text-focused
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom/Unknown", // Check official
    costPer1kTokens: { input: 1.0, output: 1.0 }, // This is very high if per K, assume M -> 0.001, 0.001. Sticking to PriceCalculator for now.
  },
  {
    name: "PPLX 7B Online",
    provider: "Perplexity",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "PPLX 7B Online by Perplexity. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom/Unknown",
    costPer1kTokens: { input: 0.2, output: 0.2 }, // High if K.
  },

  // DeepSeek Models from PriceCalculator.tsx
  {
    name: "DeepSeek V2",
    provider: "DeepSeek",
    avgTokensPerWord: 1.25, // Efficient like other modern tokenizers
    avgCharsPerToken: 3.5,
    description: "DeepSeek V2 model. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096, // Check official
    imageTokenizationMode: "none", // Or check if vision variant exists
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom (DeepSeek)",
    costPer1kTokens: { input: 0.00014, output: 0.00028 },
  },

  // Cloudflare Workers AI Models from PriceCalculator.tsx
  {
    name: "Llama 2 7B Chat (FP16)",
    provider: "Cloudflare",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 2 7B Chat (FP16) via Cloudflare. Costs per 1K tokens.",
    contextWindow: parseContextWindow("3K"),
    outputLimit: 2048, // Check official
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.00056, output: 0.00666 },
  },
  {
    name: "Llama 2 7B Chat (INT8)",
    provider: "Cloudflare",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 2 7B Chat (INT8) via Cloudflare. Costs per 1K tokens.",
    contextWindow: parseContextWindow("2K"),
    outputLimit: 2048,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.00016, output: 0.00024 },
  },
  {
    name: "Mistral 7B Instruct",
    provider: "Cloudflare", // Note: Mistral also offers their own 7B. This is Cloudflare's.
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Mistral 7B Instruct via Cloudflare. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.00011, output: 0.00019 },
  },

  // AWS Bedrock Models from PriceCalculator.tsx
  {
    name: "Jurassic-2 Ultra (AWS)",
    provider: "AWS",
    avgTokensPerWord: 1.4, // Older models might be less token efficient
    avgCharsPerToken: 4.2,
    description: "Jurassic-2 Ultra via AWS Bedrock. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"), // PriceCalc: 32K, AI21 docs: 8K. Using PriceCalc.
    outputLimit: 8192, // Check official
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom (AI21)",
    costPer1kTokens: { input: 0.0188, output: 0.0188 },
  },
  {
    name: "Jurassic-2 Mid (AWS)",
    provider: "AWS",
    avgTokensPerWord: 1.4,
    avgCharsPerToken: 4.2,
    description: "Jurassic-2 Mid via AWS Bedrock. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"), // PriceCalc: 32K, AI21 docs: 8K. Using PriceCalc.
    outputLimit: 8192,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom (AI21)",
    costPer1kTokens: { input: 0.0125, output: 0.0125 },
  },
  {
    name: "Titan Text Express (AWS)",
    provider: "AWS",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "Titan Text Express via AWS Bedrock. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"), // PriceCalc: 32K, AWS: 8K. Using PriceCalc.
    outputLimit: 8192, // Check official
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom (Amazon)",
    costPer1kTokens: { input: 0.0008, output: 0.0016 },
  },
  {
    name: "Titan Text Lite (AWS)",
    provider: "AWS",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 4,
    description: "Titan Text Lite via AWS Bedrock. Costs per 1K tokens.",
    contextWindow: parseContextWindow("32K"), // PriceCalc: 32K, AWS: 8K. Using PriceCalc.
    outputLimit: 8192,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "Custom (Amazon)",
    costPer1kTokens: { input: 0.0003, output: 0.0004 },
  },

  // Replicate Models from PriceCalculator.tsx
  {
    name: "Meta Llama 3 70B (Replicate)",
    provider: "Replicate",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Meta Llama 3 70B via Replicate. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.00065, output: 0.00275 },
  },
  {
    name: "Meta Llama 3 8B (Replicate)",
    provider: "Replicate",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Meta Llama 3 8B via Replicate. Costs per 1K tokens.",
    contextWindow: parseContextWindow("8K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.00005, output: 0.00025 },
  },
  {
    name: "Llama 2 70B (Replicate)",
    provider: "Replicate",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 2 70B via Replicate. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.00065, output: 0.00275 },
  },
  {
    name: "Llama 2 13B (Replicate)",
    provider: "Replicate",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 2 13B via Replicate. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.0001, output: 0.0005 },
  },
  {
    name: "Llama 2 7B (Replicate)",
    provider: "Replicate",
    avgTokensPerWord: 1.3,
    avgCharsPerToken: 3.8,
    description: "Llama 2 7B via Replicate. Costs per 1K tokens.",
    contextWindow: parseContextWindow("4K"),
    outputLimit: 4096,
    imageTokenizationMode: "none",
    videoTokensPerSecond: 0,
    audioTokensPerSecond: 0,
    tokenizerType: "BPE (SentencePiece)",
    costPer1kTokens: { input: 0.00005, output: 0.00025 },
  },
];

// Initialize o200k_base encoder for OpenAI models that use it (GPT-4o, GPT-4.1 variants, o3, o4-mini)
// We are doing this outside the component to avoid re-initializing on every render.
// Ensure this specific encoding name is correct for your models.
let o200kEncoder: Tiktoken | null = null;
try {
  o200kEncoder = encoding_for_model("gpt-4o"); // or get_encoding("o200k_base")
} catch (e) {
  console.error("Failed to initialize o200k_base tiktoken encoder:", e);
  // Fallback or error handling if encoder can't be initialized
}

const TokenCalculator = () => {
  const [text, setText] = useState("");
  const [selectedTokenizer, setSelectedTokenizer] = useState("GPT-4o"); // Initialize with a valid model name from the new list
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisEntry[]>([]);
  const [multimodalContent, setMultimodalContent] = useState({
    imageCount: 0,
    imageSizeCategory: "small" as "small" | "large",
    imageWidth: 1024,
    imageHeight: 1024,
    videoDurationSeconds: 0,
    audioDurationSeconds: 0,
  });
  const [expectedOutputWords, setExpectedOutputWords] = useState(0);

  const currentTokenizer = tokenizers.find((t) => t.name === selectedTokenizer);

  // Enhanced token calculation with provider-specific accuracy
  const metrics = useMemo(() => {
    const characters = text.length;
    const words = text.trim()
      ? text
          .trim()
          .split(/\W+/)
          .filter((w) => w.length > 0).length
      : 0;
    const sentences = text.trim()
      ? text.split(/[.!?]+/).filter((s) => s.trim()).length
      : 0;
    const paragraphs = text.trim()
      ? text.split(/\n\s*\n/).filter((p) => p.trim()).length
      : 0;

    if (!currentTokenizer)
      return {
        characters,
        words,
        sentences,
        paragraphs,
        estimatedTokens: 0,
        tokenDensity: "0",
        breakdown: {
          textTokens: 0,
          imageTokens: 0,
          videoTokens: 0,
          audioTokens: 0,
        },
        contextUsagePercent: "0",
        estimatedCost: 0,
      };

    // Provider-specific text tokenization
    let textTokens = 0;
    if (words > 0) {
      if (currentTokenizer.provider === "OpenAI" && o200kEncoder) {
        // Use tiktoken for OpenAI models
        try {
          textTokens = o200kEncoder.encode(text).length;
        } catch (error) {
          console.error("Error encoding text with tiktoken:", error);
          // Fallback to heuristic if tiktoken fails for some reason during encoding
          textTokens = Math.ceil(
            words * currentTokenizer.avgTokensPerWord * 0.95
          );
        }
      } else {
        // Improved heuristic for other providers
        const baseTokens = words * currentTokenizer.avgTokensPerWord;
        const charAdjustment = characters / currentTokenizer.avgCharsPerToken;
        let multiplier = 1;
        switch (currentTokenizer.provider) {
          case "Anthropic":
            multiplier = 0.9;
            break;
          case "Google":
            multiplier = 0.85;
            break;
          case "xAI":
            multiplier = 1.05;
            break;
        }
        textTokens = Math.ceil(
          (baseTokens * 0.7 + charAdjustment * 0.3) * multiplier
        );
      }

      // Character-based fallback for very short or non-standard text (applies if not OpenAI or if tiktoken failed)
      if (currentTokenizer.provider !== "OpenAI") {
        // Or if tiktoken failed, this path is taken.
        const charBasedTokens = Math.ceil(
          characters / currentTokenizer.avgCharsPerToken
        );
        textTokens = Math.max(textTokens, charBasedTokens);
      }
    }

    // Multimodal token calculations
    let imageTokens = 0;
    let videoTokens = 0;
    let audioTokens = 0;

    if (multimodalContent.imageCount > 0 && currentTokenizer) {
      if (
        currentTokenizer.provider === "Anthropic" &&
        currentTokenizer.imageTokenizationMode === "formula"
      ) {
        if (
          multimodalContent.imageWidth > 0 &&
          multimodalContent.imageHeight > 0
        ) {
          imageTokens =
            Math.ceil(
              (multimodalContent.imageWidth * multimodalContent.imageHeight) /
                750
            ) * multimodalContent.imageCount;
        }
      } else if (currentTokenizer.imageTokens) {
        const tokensPerImage =
          multimodalContent.imageSizeCategory === "small"
            ? currentTokenizer.imageTokens.small
            : currentTokenizer.imageTokens.large *
              (currentTokenizer.provider === "xAI"
                ? 1792 / currentTokenizer.imageTokens.large
                : 1);
        imageTokens = multimodalContent.imageCount * tokensPerImage;
      }
    }

    if (
      currentTokenizer.videoTokensPerSecond &&
      multimodalContent.videoDurationSeconds > 0
    ) {
      videoTokens =
        multimodalContent.videoDurationSeconds *
        currentTokenizer.videoTokensPerSecond;
    }

    if (
      currentTokenizer.audioTokensPerSecond &&
      multimodalContent.audioDurationSeconds > 0
    ) {
      audioTokens =
        multimodalContent.audioDurationSeconds *
        currentTokenizer.audioTokensPerSecond;
    }

    const estimatedTokens =
      textTokens + imageTokens + videoTokens + audioTokens;
    const contextUsagePercent = (
      (estimatedTokens / currentTokenizer.contextWindow) *
      100
    ).toFixed(1);

    // Cost estimation
    let estimatedCost = 0;
    if (currentTokenizer.costPer1kTokens) {
      const inputCost =
        (estimatedTokens / 1000) * currentTokenizer.costPer1kTokens.input;
      const outputTokensEstimate = Math.ceil(
        expectedOutputWords * currentTokenizer.avgTokensPerWord
      );
      const outputCost =
        (outputTokensEstimate / 1000) * currentTokenizer.costPer1kTokens.output;
      estimatedCost = inputCost + outputCost;
    }

    return {
      characters,
      words,
      sentences,
      paragraphs,
      estimatedTokens,
      tokenDensity: words > 0 ? (textTokens / words).toFixed(2) : "0",
      breakdown: {
        textTokens,
        imageTokens,
        videoTokens,
        audioTokens,
      },
      contextUsagePercent,
      estimatedCost,
    };
  }, [text, currentTokenizer, multimodalContent, expectedOutputWords]);

  const saveAnalysis = () => {
    if (
      !text.trim() &&
      !multimodalContent.imageCount &&
      !multimodalContent.videoDurationSeconds &&
      !multimodalContent.audioDurationSeconds
    )
      return;

    const analysis = {
      id: Date.now(),
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      tokenizer: selectedTokenizer,
      multimodal: multimodalContent,
      ...metrics,
      timestamp: new Date().toLocaleString(),
    };

    setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 9)]);
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return "bg-green-100 text-green-800";
      case "Anthropic":
        return "bg-orange-100 text-orange-800";
      case "Google":
        return "bg-blue-100 text-blue-800";
      case "xAI":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContextUsageColor = (usage: string) => {
    const percent = parseFloat(usage);
    if (percent < 50) return "text-green-600";
    if (percent < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const exportAnalysis = () => {
    const data = {
      text: text,
      tokenizer: selectedTokenizer,
      multimodal: multimodalContent,
      analysis: metrics,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `token-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickExamples = [
    "Hello, how are you today?",
    "The quick brown fox jumps over the lazy dog.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Write a Python function to calculate the Fibonacci sequence up to n terms.",
    "Explain quantum computing in simple terms that a high school student would understand.",
  ];

  // Effect to free the encoder when the component unmounts
  useEffect(() => {
    return () => {
      if (o200kEncoder && typeof o200kEncoder.free === "function") {
        o200kEncoder.free();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input and Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Enhanced Token Calculator
            </CardTitle>
            <CardDescription>
              Provider-specific tokenization with multimodal support and cost
              estimation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tokenizer Selection */}
            <div className="space-y-2">
              <Label htmlFor="tokenizer">AI Model / Tokenizer</Label>
              <Select
                value={selectedTokenizer}
                onValueChange={setSelectedTokenizer}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokenizers.map((tokenizer) => (
                    <SelectItem key={tokenizer.name} value={tokenizer.name}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span>{tokenizer.name}</span>
                          <Badge
                            className={getProviderColor(tokenizer.provider)}
                          >
                            {tokenizer.provider}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Enhanced Tokenizer Info */}
              {currentTokenizer && (
                <div className="text-xs text-gray-600 space-y-1 p-3 bg-gray-50 rounded-lg">
                  <p>
                    <strong>Description:</strong> {currentTokenizer.description}
                  </p>
                  <p>
                    <strong>Type:</strong> {currentTokenizer.tokenizerType}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <p>
                      <strong>Context:</strong>{" "}
                      {currentTokenizer.contextWindow.toLocaleString()} tokens
                    </p>
                    <p>
                      <strong>Output:</strong>{" "}
                      {currentTokenizer.outputLimit.toLocaleString()} tokens
                    </p>
                  </div>
                  {currentTokenizer.costPer1kTokens && (
                    <p>
                      <strong>Cost:</strong> $
                      {currentTokenizer.costPer1kTokens.input}/1k input, $
                      {currentTokenizer.costPer1kTokens.output}/1k output
                    </p>
                  )}
                  {currentTokenizer.costPer1kTokens && (
                    <p className="text-xs text-gray-500">
                      <strong>(Per 1M):</strong> $
                      {(currentTokenizer.costPer1kTokens.input * 1000).toFixed(
                        2
                      )}
                      /1M input, $
                      {(currentTokenizer.costPer1kTokens.output * 1000).toFixed(
                        2
                      )}
                      /1M output
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {currentTokenizer.imageTokens && (
                      <Badge variant="outline">
                        Images: {currentTokenizer.imageTokens.small}-
                        {currentTokenizer.imageTokens.large} tokens
                      </Badge>
                    )}
                    {currentTokenizer.videoTokensPerSecond ? (
                      <Badge variant="outline">
                        Video: {currentTokenizer.videoTokensPerSecond}/sec
                      </Badge>
                    ) : null}
                    {currentTokenizer.audioTokensPerSecond ? (
                      <Badge variant="outline">
                        Audio: {currentTokenizer.audioTokensPerSecond}/sec
                      </Badge>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Multimodal Content Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Images
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Count"
                  value={multimodalContent.imageCount || ""}
                  onChange={(e) =>
                    setMultimodalContent((prev) => ({
                      ...prev,
                      imageCount: parseInt(e.target.value) || 0,
                    }))
                  }
                  // Disabled if Anthropic has 0 width/height, or other providers have no imageToken support
                  disabled={
                    currentTokenizer?.provider === "Anthropic"
                      ? multimodalContent.imageWidth === 0 ||
                        multimodalContent.imageHeight === 0
                      : !currentTokenizer?.imageTokens
                  }
                />
                {currentTokenizer?.provider === "Anthropic" &&
                currentTokenizer.imageTokenizationMode === "formula" ? (
                  <div className="space-y-2 mt-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Width (px)"
                      value={multimodalContent.imageWidth || ""}
                      onChange={(e) =>
                        setMultimodalContent((prev) => ({
                          ...prev,
                          imageWidth: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Height (px)"
                      value={multimodalContent.imageHeight || ""}
                      onChange={(e) =>
                        setMultimodalContent((prev) => ({
                          ...prev,
                          imageHeight: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Min 200px edge. Tokens: (W*H)/750 per image.
                    </p>
                  </div>
                ) : currentTokenizer?.imageTokens ? (
                  <Select
                    value={multimodalContent.imageSizeCategory}
                    onValueChange={(value: "small" | "large") =>
                      setMultimodalContent((prev) => ({
                        ...prev,
                        imageSizeCategory: value,
                      }))
                    }
                    disabled={!currentTokenizer?.imageTokens}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (≤384px)</SelectItem>
                      <SelectItem value="large">Large ({">"}384px)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-gray-500">
                    Image sizing not applicable or supported.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video (seconds)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Duration"
                  value={multimodalContent.videoDurationSeconds || ""}
                  onChange={(e) =>
                    setMultimodalContent((prev) => ({
                      ...prev,
                      videoDurationSeconds: parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={!currentTokenizer?.videoTokensPerSecond}
                />
                {!currentTokenizer?.videoTokensPerSecond && (
                  <p className="text-xs text-gray-500">Not supported</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AudioLines className="w-4 h-4" />
                  Audio (seconds)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Duration"
                  value={multimodalContent.audioDurationSeconds || ""}
                  onChange={(e) =>
                    setMultimodalContent((prev) => ({
                      ...prev,
                      audioDurationSeconds: parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={!currentTokenizer?.audioTokensPerSecond}
                />
                {!currentTokenizer?.audioTokensPerSecond && (
                  <p className="text-xs text-gray-500">Not supported</p>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-input">Text Content</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportAnalysis}
                    disabled={!text.trim() && !multimodalContent.imageCount}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              <Textarea
                id="text-input"
                placeholder="Enter your text here to analyze tokens, characters, words, and more..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Quick Examples */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Examples</Label>
              <div className="flex flex-wrap gap-2">
                {quickExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-left justify-start text-xs h-auto p-2 max-w-48"
                    onClick={() => setText(example)}
                  >
                    {example.length > 40
                      ? example.substring(0, 40) + "..."
                      : example}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={saveAnalysis}
              disabled={!text.trim() && !multimodalContent.imageCount}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Metrics Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Provider-specific tokenization metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Token Count */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.estimatedTokens.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Total Tokens</div>
              {currentTokenizer && (
                <div
                  className={`text-xs mt-1 font-medium ${getContextUsageColor(
                    metrics.contextUsagePercent
                  )}`}
                >
                  {metrics.contextUsagePercent}% of context window
                </div>
              )}
              {currentTokenizer &&
                parseFloat(metrics.contextUsagePercent) > 90 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      Near context limit
                    </span>
                  </div>
                )}
            </div>

            {/* Cost Estimation */}
            {currentTokenizer?.costPer1kTokens &&
              (metrics.estimatedTokens > 0 || expectedOutputWords > 0) && (
                <div className="text-center p-3 bg-green-50 rounded-lg border">
                  <div className="text-lg font-semibold text-green-700">
                    ${metrics.estimatedCost.toFixed(4)}
                  </div>
                  <div className="text-xs text-green-600">
                    Estimated total cost (input + output)
                  </div>
                </div>
              )}

            {/* Expected Output Input */}
            {currentTokenizer?.costPer1kTokens &&
              currentTokenizer.costPer1kTokens.output > 0 && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <Label
                    htmlFor="expected-output-words"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <Calculator className="w-4 h-4 text-gray-600" />
                    Expected Output Words (for cost calc)
                  </Label>
                  <Input
                    id="expected-output-words"
                    type="number"
                    min="0"
                    placeholder="e.g., 500"
                    value={expectedOutputWords || ""}
                    onChange={(e) =>
                      setExpectedOutputWords(parseInt(e.target.value) || 0)
                    }
                  />
                  {expectedOutputWords > 0 &&
                    currentTokenizer.avgTokensPerWord && (
                      <p className="text-xs text-gray-500">
                        Estimating approx.{" "}
                        {Math.ceil(
                          expectedOutputWords *
                            currentTokenizer.avgTokensPerWord
                        )}{" "}
                        output tokens.
                      </p>
                    )}
                </div>
              )}

            {/* Token Breakdown */}
            {(metrics.breakdown.imageTokens > 0 ||
              metrics.breakdown.videoTokens > 0 ||
              metrics.breakdown.audioTokens > 0) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Token Breakdown</Label>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Text:</span>
                    <span className="font-medium">
                      {metrics.breakdown.textTokens.toLocaleString()}
                    </span>
                  </div>
                  {metrics.breakdown.imageTokens > 0 && (
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span className="font-medium">
                        {metrics.breakdown.imageTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {metrics.breakdown.videoTokens > 0 && (
                    <div className="flex justify-between">
                      <span>Video:</span>
                      <span className="font-medium">
                        {metrics.breakdown.videoTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {metrics.breakdown.audioTokens > 0 && (
                    <div className="flex justify-between">
                      <span>Audio:</span>
                      <span className="font-medium">
                        {metrics.breakdown.audioTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Basic Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.characters.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Characters</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.words.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.sentences.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Sentences</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.paragraphs.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Paragraphs</div>
              </div>
            </div>

            {/* Token Density */}
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-lg font-semibold text-indigo-700">
                {metrics.tokenDensity}
              </div>
              <div className="text-xs text-indigo-600">Tokens per Word</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            Recent analyses with provider-specific token calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No analyses yet</p>
              <p className="text-sm">Save an analysis to see it here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analysisHistory.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        "{analysis.text}"
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge
                          className={getProviderColor(
                            tokenizers.find(
                              (t) => t.name === analysis.tokenizer
                            )?.provider || ""
                          )}
                        >
                          {analysis.tokenizer}
                        </Badge>
                        {analysis.multimodal?.imageCount > 0 && (
                          <Badge variant="outline">
                            {analysis.multimodal.imageCount} images
                          </Badge>
                        )}
                        {analysis.multimodal?.videoDurationSeconds > 0 && (
                          <Badge variant="outline">
                            {analysis.multimodal.videoDurationSeconds}s video
                          </Badge>
                        )}
                        {analysis.multimodal?.audioDurationSeconds > 0 && (
                          <Badge variant="outline">
                            {analysis.multimodal.audioDurationSeconds}s audio
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {analysis.estimatedTokens.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">tokens</div>
                      {analysis.estimatedCost > 0 && (
                        <div className="text-xs text-green-600">
                          ${analysis.estimatedCost.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
                    <div>{analysis.characters.toLocaleString()} chars</div>
                    <div>{analysis.words.toLocaleString()} words</div>
                    <div>{analysis.sentences} sentences</div>
                    <div>{analysis.tokenDensity} t/w ratio</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {analysis.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenCalculator;
