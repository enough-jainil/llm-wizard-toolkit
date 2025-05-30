import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GitCompare, Star, Zap, DollarSign, Brain, Clock } from "lucide-react";

interface ModelData {
  name: string;
  provider: string;
  parameters: string;
  contextWindow: number;
  inputCost: number; // per 1K tokens
  outputCost: number; // per 1K tokens
  speed: number; // tokens/second (relative)
  reasoning: number; // score out of 100
  coding: number; // score out of 100
  creative: number; // score out of 100
  multimodal: boolean;
  languages: number;
  category: string;
  license?: string;
}

// Helper to convert context window string (e.g., "128K", "1M") to number
const parseContextWindowToNumber = (cw?: string): number => {
  if (!cw) return 4096; // Default if undefined
  const value = parseFloat(cw);
  if (cw.toUpperCase().includes("M")) return value * 1000000;
  if (cw.toUpperCase().includes("K")) return value * 1000;
  return value;
};

const modelData: ModelData[] = [
  {
    name: "GPT-4o",
    provider: "OpenAI",
    parameters: "~1.8T",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.005,
    outputCost: 0.02, // Existing, table N/A
    speed: 90,
    reasoning: 98,
    coding: 92,
    creative: 95,
    multimodal: true,
    languages: 50,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "GPT-4o (2024-08-06)",
    provider: "OpenAI",
    parameters: "~1.8T",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.0025,
    outputCost: 0.01,
    speed: 90,
    reasoning: 98,
    coding: 92,
    creative: 95,
    multimodal: true,
    languages: 50,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    parameters: "~8B",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.00015,
    outputCost: 0.0006,
    speed: 120,
    reasoning: 82,
    coding: 85,
    creative: 80,
    multimodal: true,
    languages: 50,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "GPT-4o (2024-05-13)",
    provider: "OpenAI",
    parameters: "~1.8T",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.005,
    outputCost: 0.015,
    speed: 90,
    reasoning: 98,
    coding: 92,
    creative: 95,
    multimodal: true,
    languages: 50,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "GPT-4 Turbo (2024-04-09)",
    provider: "OpenAI",
    parameters: "~1.8T",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.01,
    outputCost: 0.03,
    speed: 85,
    reasoning: 95,
    coding: 90,
    creative: 92,
    multimodal: true,
    languages: 50,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "GPT-4",
    provider: "OpenAI",
    parameters: "~1.7T",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.03,
    outputCost: 0.06,
    speed: 70,
    reasoning: 90,
    coding: 88,
    creative: 90,
    multimodal: true,
    languages: 50,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "GPT-4-32K",
    provider: "OpenAI",
    parameters: "~1.7T",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.06,
    outputCost: 0.12,
    speed: 65,
    reasoning: 90,
    coding: 88,
    creative: 90,
    multimodal: true,
    languages: 50,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "GPT-3.5 Turbo (0125)",
    provider: "OpenAI",
    parameters: "175B",
    contextWindow: parseContextWindowToNumber("16K"),
    inputCost: 0.0005,
    outputCost: 0.0015,
    speed: 130,
    reasoning: 75,
    coding: 70,
    creative: 75,
    multimodal: false,
    languages: 40,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "GPT-3.5 Turbo Instruct",
    provider: "OpenAI",
    parameters: "175B",
    contextWindow: parseContextWindowToNumber("4K"),
    inputCost: 0.0015,
    outputCost: 0.002,
    speed: 130,
    reasoning: 70,
    coding: 65,
    creative: 70,
    multimodal: false,
    languages: 40,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "GPT-4.1", // Updated from table: GPT-4.1 (2025-04-14)
    provider: "OpenAI",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("1M"),
    inputCost: 0.5, // Note: This cost is high, might be an error from PriceCalculator if not $0.5/K
    outputCost: 0.008,
    speed: 80, // Default or preserved
    reasoning: 96, // Default or preserved
    coding: 93, // Default or preserved
    creative: 94, // Default or preserved
    multimodal: true,
    languages: 50, // Default or preserved
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "GPT-4.1 mini", // Updated from table: GPT-4.1 mini (2025-04-14)
    provider: "OpenAI",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("1M"),
    inputCost: 0.1,
    outputCost: 0.0016,
    speed: 110, // Default or preserved
    reasoning: 85, // Default or preserved
    coding: 88, // Default or preserved
    creative: 82, // Default or preserved
    multimodal: true,
    languages: 50, // Default or preserved
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "GPT-4.1 nano",
    provider: "OpenAI",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("1M"),
    inputCost: 0.025, // Existing, table N/A
    outputCost: 0.0004, // Existing, table N/A
    speed: 140,
    reasoning: 80,
    coding: 82,
    creative: 78,
    multimodal: true,
    languages: 50,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "o3", // Updated from table: o3 (2025-04-16)
    provider: "OpenAI",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.01, // Updated from 2.5
    outputCost: 0.04, // Updated from 0.04
    speed: 70,
    reasoning: 97,
    coding: 91,
    creative: 96,
    multimodal: true,
    languages: 50,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "o4-mini",
    provider: "OpenAI",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.0011, // Updated from 0.275
    outputCost: 0.0044,
    speed: 100,
    reasoning: 86,
    coding: 89,
    creative: 84,
    multimodal: true,
    languages: 50,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "GPT-o4-mini",
    provider: "OpenAI",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.3, // Note: This specific model was not in the new table; o4-mini was.
    outputCost: 0.0024,
    speed: 115,
    reasoning: 84,
    coding: 87,
    creative: 81,
    multimodal: true,
    languages: 50,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "GPT-4.5", // New from table
    provider: "OpenAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.075,
    outputCost: 0.15,
    speed: 70, // Default
    reasoning: 80, // Default (GPQA was 69.5%)
    coding: 80, // Default (HumanEval was 88.0%)
    creative: 80, // Default
    multimodal: true, // Assumed
    languages: 50, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "o1-pro", // New from table
    provider: "OpenAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 70, // Default
    reasoning: 79, // Default (GPQA was 79.0%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 50, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "o1", // New from table: o1 (2024-12-17)
    provider: "OpenAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.015,
    outputCost: 0.06,
    speed: 70, // Default
    reasoning: 78, // Default (GPQA was 78.0%)
    coding: 88, // Default (HumanEval was 88.1%)
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 50, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "o3-mini", // New from table
    provider: "OpenAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.0011,
    outputCost: 0.0044,
    speed: 90, // Default
    reasoning: 77, // Default (GPQA was 77.2%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 50, // Default
    category: "efficient", // Assumed
    license: "Proprietary",
  },
  {
    name: "o1-preview", // New from table
    provider: "OpenAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.015,
    outputCost: 0.06,
    speed: 70, // Default
    reasoning: 73, // Default (GPQA was 73.3%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 50, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "o1-mini", // New from table
    provider: "OpenAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.003,
    outputCost: 0.012,
    speed: 100, // Default
    reasoning: 60, // Default (GPQA was 60.0%)
    coding: 92, // Default (HumanEval was 92.4%)
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 50, // Default
    category: "efficient", // Assumed
    license: "Proprietary",
  },

  // Anthropic Models
  {
    name: "Claude 3 Opus",
    provider: "Anthropic",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.015,
    outputCost: 0.075,
    speed: 45,
    reasoning: 98,
    coding: 88,
    creative: 95,
    multimodal: true,
    languages: 40,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 75,
    reasoning: 90,
    coding: 92,
    creative: 85,
    multimodal: true,
    languages: 40,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.00025,
    outputCost: 0.00125,
    speed: 150,
    reasoning: 78,
    coding: 75,
    creative: 70,
    multimodal: true,
    languages: 40,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Claude 2.1",
    provider: "Anthropic",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.008,
    outputCost: 0.024,
    speed: 40,
    reasoning: 85,
    coding: 70,
    creative: 80,
    multimodal: true,
    languages: 30,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Claude 2.0",
    provider: "Anthropic",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("100K"),
    inputCost: 0.008,
    outputCost: 0.024,
    speed: 35,
    reasoning: 84,
    coding: 68,
    creative: 78,
    multimodal: true,
    languages: 30,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Claude Instant 1.2",
    provider: "Anthropic",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("100K"),
    inputCost: 0.0008,
    outputCost: 0.0024,
    speed: 100,
    reasoning: 70,
    coding: 60,
    creative: 65,
    multimodal: true,
    languages: 30,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Claude Opus 4", // Updated from table: Claude Opus 4 (20250514)
    provider: "Anthropic",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.015,
    outputCost: 0.075,
    speed: 50, // Preserved existing for "Claude Opus 4"
    reasoning: 99, // Preserved existing for "Claude Opus 4" (GPQA was 83.3%)
    coding: 90, // Preserved existing
    creative: 97, // Preserved existing
    multimodal: true,
    languages: 40,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Claude Sonnet 4", // Updated from table: Claude Sonnet 4 (20250514)
    provider: "Anthropic",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 80, // Preserved existing for "Claude Sonnet 4"
    reasoning: 94, // Preserved existing for "Claude Sonnet 4" (GPQA was 83.8%)
    coding: 96, // Preserved existing
    creative: 90, // Preserved existing
    multimodal: true,
    languages: 40,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Claude 3.7 Sonnet", // New from table: Claude 3.7 Sonnet (20250219)
    provider: "Anthropic",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0, // Table: N/A
    outputCost: 0, // Table: N/A
    speed: 75, // Default, matches Claude 3.5 Sonnet
    reasoning: 80, // Default
    coding: 80, // Default
    creative: 80, // Default
    multimodal: true, // Assumed
    languages: 40, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "Claude 3.5 Sonnet", // Updated from table: Claude 3.5 Sonnet (20241022)
    provider: "Anthropic",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("200K"),
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 75, // Preserved existing good scores
    reasoning: 93, // Preserved existing (GPQA was 67.2%)
    coding: 95, // Preserved existing (HumanEval was 93.7%)
    creative: 88, // Preserved existing
    multimodal: true,
    languages: 40,
    category: "flagship",
    license: "Proprietary",
  },

  // Google Models
  {
    name: "Gemini 1.5 Pro",
    provider: "Google",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("1M"),
    inputCost: 0.0035,
    outputCost: 0.0105,
    speed: 70,
    reasoning: 88,
    coding: 82,
    creative: 85,
    multimodal: true,
    languages: 100,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Gemini 1.5 Flash",
    provider: "Google",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("2.8M"),
    inputCost: 0.00035,
    outputCost: 0.00105,
    speed: 140,
    reasoning: 80,
    coding: 78,
    creative: 75,
    multimodal: true,
    languages: 100,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Gemini Pro",
    provider: "Google",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.0005,
    outputCost: 0.0015,
    speed: 100,
    reasoning: 70,
    coding: 72,
    creative: 70,
    multimodal: false,
    languages: 80,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Gemini 2.5 Flash Preview", // Table name: Gemini 2.5 Flash
    provider: "Google",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("1048K"), // Updated (1,048,576)
    inputCost: 0.00015, // Updated
    outputCost: 0.0006, // Updated
    speed: 150,
    reasoning: 82, // Preserved existing (GPQA was 82.8% for Gemini 2.5 Flash)
    coding: 80,
    creative: 78,
    multimodal: true,
    languages: 100,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Gemini 2.5 Pro Preview", // Table name: Gemini 2.5 Pro
    provider: "Google",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("1048K"), // Updated (1,048,576)
    inputCost: 0.0025, // Updated
    outputCost: 0.01, // Updated
    speed: 75,
    reasoning: 90, // Preserved existing (GPQA was 83.0% for Gemini 2.5 Pro)
    coding: 85,
    creative: 88,
    multimodal: true,
    languages: 100,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Gemini 2.0 Flash",
    provider: "Google",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("1048K"), // Updated (1,048,576)
    inputCost: 0.0001, // Updated
    outputCost: 0.0007, // Updated
    speed: 160,
    reasoning: 81, // Preserved existing (GPQA was 62.1%)
    coding: 79,
    creative: 77,
    multimodal: true,
    languages: 100,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Gemini 2.0 Flash-Lite",
    provider: "Google",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("1M"),
    inputCost: 0.000075,
    outputCost: 0.0003,
    speed: 170,
    reasoning: 80,
    coding: 78,
    creative: 76,
    multimodal: true,
    languages: 100,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Gemini 2.0 Flash Thinking", // New from table
    provider: "Google",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("1M"), // (1,000,000)
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 150, // Default
    reasoning: 74, // Default (GPQA was 74.2%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 100, // Default
    category: "efficient", // Assumed
    license: "Proprietary",
  },

  // Meta Llama Models
  {
    name: "Llama 3.1 405B Instruct",
    provider: "Fireworks",
    parameters: "405B",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.003,
    outputCost: 0.003,
    speed: 30,
    reasoning: 97,
    coding: 94,
    creative: 90,
    multimodal: false,
    languages: 20,
    category: "flagship",
    license: "Llama 3 Community License",
  },
  {
    name: "Llama 3.1 70B Instruct",
    provider: "Deepinfra",
    parameters: "70B",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.52,
    outputCost: 0.75,
    speed: 60,
    reasoning: 95,
    coding: 90,
    creative: 88,
    multimodal: false,
    languages: 20,
    category: "flagship",
    license: "Llama 3 Community License",
  },
  {
    name: "Llama 3.1 8B Instruct",
    provider: "Deepinfra",
    parameters: "8B",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.09,
    outputCost: 0.09,
    speed: 120,
    reasoning: 80,
    coding: 82,
    creative: 75,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 3 Community License",
  },
  {
    name: "Llama 3 70B Instruct",
    provider: "Deepinfra",
    parameters: "70B",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.59,
    outputCost: 0.79,
    speed: 50,
    reasoning: 94,
    coding: 89,
    creative: 87,
    multimodal: false,
    languages: 20,
    category: "flagship",
    license: "Llama 3 Community License",
  },
  {
    name: "Llama 3 8B Instruct",
    provider: "Deepinfra",
    parameters: "8B",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.08,
    outputCost: 0.08,
    speed: 130,
    reasoning: 78,
    coding: 80,
    creative: 73,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 3 Community License",
  },
  {
    name: "Llama 3.1 Nemotron Ultra 253B v1", // New from table
    provider: "Meta", // Inferred from URL, though table says empty organization
    parameters: "253B", // From table
    contextWindow: parseContextWindowToNumber("128K"), // (131,072)
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 40, // Default
    reasoning: 76, // Default (GPQA was 76.0%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "Llama 4 Maverick", // New from table
    provider: "Meta", // Inferred from URL
    parameters: "400B", // From table
    contextWindow: parseContextWindowToNumber("1M"), // (1,000,000)
    inputCost: 0.00017,
    outputCost: 0.0006,
    speed: 30, // Default
    reasoning: 69, // Default (GPQA was 69.8%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "Llama-3.3 Nemotron Super 49B v1", // New from table
    provider: "Meta", // Inferred from URL
    parameters: "49.9B", // From table
    contextWindow: parseContextWindowToNumber("128K"), // (131,072)
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 60, // Default
    reasoning: 66, // Default (GPQA was 66.7%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },

  // Mistral Models
  {
    name: "Mistral Large",
    provider: "Mistral",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.008,
    outputCost: 0.024,
    speed: 70,
    reasoning: 92,
    coding: 85,
    creative: 88,
    multimodal: false,
    languages: 30,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Mistral Medium",
    provider: "Mistral",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.0027,
    outputCost: 0.0081,
    speed: 80,
    reasoning: 85,
    coding: 80,
    creative: 82,
    multimodal: false,
    languages: 30,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Mistral Small",
    provider: "Mistral",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.002,
    outputCost: 0.006,
    speed: 90,
    reasoning: 80,
    coding: 78,
    creative: 79,
    multimodal: false,
    languages: 30,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Mixtral 8x7B",
    provider: "Mistral",
    parameters: "8x7B (46.7B total, ~12B active)",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.7,
    outputCost: 0.7,
    speed: 100,
    reasoning: 88,
    coding: 86,
    creative: 85,
    multimodal: false,
    languages: 30,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Mistral 7B",
    provider: "Mistral",
    parameters: "7B",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.25,
    outputCost: 0.25,
    speed: 140,
    reasoning: 75,
    coding: 77,
    creative: 72,
    multimodal: false,
    languages: 30,
    category: "efficient",
    license: "Proprietary",
  },
  // Cohere Models
  {
    name: "Command R+",
    provider: "Cohere",
    parameters: "104B",
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 65,
    reasoning: 85,
    coding: 80,
    creative: 82,
    multimodal: false,
    languages: 10,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Command R",
    provider: "Cohere",
    parameters: "35B",
    contextWindow: parseContextWindowToNumber("128K"), // Updated from 4K to 128K
    inputCost: 0.0005,
    outputCost: 0.0015,
    speed: 90,
    reasoning: 80,
    coding: 78,
    creative: 79,
    multimodal: false,
    languages: 10,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Command",
    provider: "Cohere",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("4K"),
    inputCost: 0.0003,
    outputCost: 0.0006,
    speed: 80,
    reasoning: 70,
    coding: 70,
    creative: 70,
    multimodal: false,
    languages: 10,
    category: "efficient",
    license: "Proprietary",
  },
  // Groq Models
  {
    name: "Llama 3 70B (Groq)",
    provider: "Groq",
    parameters: "70B",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.59,
    outputCost: 0.79,
    speed: 300,
    reasoning: 94,
    coding: 89,
    creative: 87,
    multimodal: false,
    languages: 20,
    category: "flagship",
    license: "Llama 3 Community License",
  },
  {
    name: "Llama 3 8B (Groq)",
    provider: "Groq",
    parameters: "8B",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.05,
    outputCost: 0.1,
    speed: 500,
    reasoning: 78,
    coding: 80,
    creative: 73,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 3 Community License",
  },
  {
    name: "Mixtral 8x7B (Groq)",
    provider: "Groq",
    parameters: "8x7B",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.27,
    outputCost: 0.27,
    speed: 400,
    reasoning: 88,
    coding: 86,
    creative: 85,
    multimodal: false,
    languages: 30,
    category: "efficient",
    license: "Apache 2.0",
  },
  {
    name: "Gemma 7B (Groq)",
    provider: "Groq",
    parameters: "7B",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.1,
    outputCost: 0.1,
    speed: 450,
    reasoning: 76,
    coding: 75,
    creative: 74,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Gemma Terms of Use",
  },
  // Perplexity Models
  {
    name: "PPLX 70B Online",
    provider: "Perplexity",
    parameters: "70B",
    contextWindow: parseContextWindowToNumber("4K"),
    inputCost: 1.0,
    outputCost: 1.0,
    speed: 60,
    reasoning: 85,
    coding: 70,
    creative: 75,
    multimodal: false,
    languages: 15,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "PPLX 7B Online",
    provider: "Perplexity",
    parameters: "7B",
    contextWindow: parseContextWindowToNumber("4K"),
    inputCost: 0.2,
    outputCost: 0.2,
    speed: 100,
    reasoning: 80,
    coding: 65,
    creative: 70,
    multimodal: false,
    languages: 15,
    category: "efficient",
    license: "Proprietary",
  },
  // DeepSeek Models
  {
    name: "DeepSeek V2",
    provider: "DeepSeek",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.00014,
    outputCost: 0.00028,
    speed: 90,
    reasoning: 87,
    coding: 90,
    creative: 80,
    multimodal: false,
    languages: 25,
    category: "efficient",
    license: "DeepSeek Model License",
  },
  {
    name: "DeepSeek-R1", // New from table
    provider: "DeepSeek",
    parameters: "671B", // From table
    contextWindow: parseContextWindowToNumber("128K"), // (131,072)
    inputCost: 0.00055,
    outputCost: 0.00219,
    speed: 50, // Default
    reasoning: 71, // Default (GPQA was 71.5%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 25, // Default
    category: "flagship", // Assumed
    license: "DeepSeek Model License",
  },
  {
    name: "DeepSeek-V3 0324", // New from table
    provider: "DeepSeek",
    parameters: "671B", // From table
    contextWindow: parseContextWindowToNumber("128K"), // (131,072)
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 50, // Default
    reasoning: 68, // Default (GPQA was 68.4%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 25, // Default
    category: "flagship", // Assumed
    license: "DeepSeek Model License",
  },

  // Cloudflare Workers AI
  {
    name: "Llama 2 7B Chat (FP16)",
    provider: "Cloudflare",
    parameters: "7B",
    contextWindow: parseContextWindowToNumber("3K"),
    inputCost: 0.00056,
    outputCost: 0.00666,
    speed: 150,
    reasoning: 70,
    coding: 72,
    creative: 68,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 2 Community License",
  },
  {
    name: "Llama 2 7B Chat (INT8)",
    provider: "Cloudflare",
    parameters: "7B",
    contextWindow: parseContextWindowToNumber("2K"),
    inputCost: 0.00016,
    outputCost: 0.00024,
    speed: 180,
    reasoning: 68,
    coding: 70,
    creative: 66,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 2 Community License",
  },
  {
    name: "Mistral 7B Instruct",
    provider: "Cloudflare",
    parameters: "7B",
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0.00011,
    outputCost: 0.00019,
    speed: 160,
    reasoning: 75,
    coding: 77,
    creative: 72,
    multimodal: false,
    languages: 30,
    category: "efficient",
    license: "Apache 2.0",
  },
  // AWS Bedrock Models
  {
    name: "Jurassic-2 Ultra (AWS)",
    provider: "AWS",
    parameters: "178B",
    contextWindow: parseContextWindowToNumber("8K"), // Updated from 32K
    inputCost: 0.0188,
    outputCost: 0.0188,
    speed: 50,
    reasoning: 80,
    coding: 70,
    creative: 75,
    multimodal: false,
    languages: 10,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Jurassic-2 Mid (AWS)",
    provider: "AWS",
    parameters: "178B",
    contextWindow: parseContextWindowToNumber("8K"), // Updated from 32K
    inputCost: 0.0125,
    outputCost: 0.0125,
    speed: 55,
    reasoning: 78,
    coding: 68,
    creative: 73,
    multimodal: false,
    languages: 10,
    category: "flagship",
    license: "Proprietary",
  },
  {
    name: "Titan Text Express (AWS)",
    provider: "AWS",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("8K"), // Updated from 32K
    inputCost: 0.0008,
    outputCost: 0.0016,
    speed: 70,
    reasoning: 72,
    coding: 65,
    creative: 68,
    multimodal: false,
    languages: 10,
    category: "efficient",
    license: "Proprietary",
  },
  {
    name: "Titan Text Lite (AWS)",
    provider: "AWS",
    parameters: "Unknown",
    contextWindow: parseContextWindowToNumber("8K"), // Updated from 32K
    inputCost: 0.0003,
    outputCost: 0.0004,
    speed: 80,
    reasoning: 70,
    coding: 62,
    creative: 65,
    multimodal: false,
    languages: 10,
    category: "efficient",
    license: "Proprietary",
  },
  // Replicate Models
  {
    name: "Meta Llama 3 70B (Replicate)",
    provider: "Replicate",
    parameters: "70B",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.00065,
    outputCost: 0.00275,
    speed: 40,
    reasoning: 94,
    coding: 89,
    creative: 87,
    multimodal: false,
    languages: 20,
    category: "flagship",
    license: "Llama 3 Community License",
  },
  {
    name: "Meta Llama 3 8B (Replicate)",
    provider: "Replicate",
    parameters: "8B",
    contextWindow: parseContextWindowToNumber("8K"),
    inputCost: 0.00005,
    outputCost: 0.00025,
    speed: 100,
    reasoning: 78,
    coding: 80,
    creative: 73,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 3 Community License",
  },
  {
    name: "Llama 2 70B (Replicate)",
    provider: "Replicate",
    parameters: "70B",
    contextWindow: parseContextWindowToNumber("4K"),
    inputCost: 0.00065,
    outputCost: 0.00275,
    speed: 35,
    reasoning: 85,
    coding: 80,
    creative: 82,
    multimodal: false,
    languages: 20,
    category: "flagship",
    license: "Llama 2 Community License",
  },
  {
    name: "Llama 2 13B (Replicate)",
    provider: "Replicate",
    parameters: "13B",
    contextWindow: parseContextWindowToNumber("4K"),
    inputCost: 0.0001,
    outputCost: 0.0005,
    speed: 90,
    reasoning: 82,
    coding: 78,
    creative: 79,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 2 Community License",
  },
  {
    name: "Llama 2 7B (Replicate)",
    provider: "Replicate",
    parameters: "7B",
    contextWindow: parseContextWindowToNumber("4K"),
    inputCost: 0.00005,
    outputCost: 0.00025,
    speed: 120,
    reasoning: 79,
    coding: 75,
    creative: 76,
    multimodal: false,
    languages: 20,
    category: "efficient",
    license: "Llama 2 Community License",
  },

  // xAI Models (New from table)
  {
    name: "Grok-3",
    provider: "xAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("0K"), // Table: -
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 70, // Default
    reasoning: 70, // Default
    coding: 70, // Default
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 30, // Default
    category: "flagship", // Assumed
    license: "Proprietary",
  },
  {
    name: "Grok-3 Mini",
    provider: "xAI",
    parameters: "Unknown", // Table: -
    contextWindow: parseContextWindowToNumber("0K"), // Table: -
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 90, // Default
    reasoning: 70, // Default
    coding: 70, // Default
    creative: 70, // Default
    multimodal: true, // Assumed
    languages: 30, // Default
    category: "efficient", // Assumed
    license: "Proprietary",
  },

  // Microsoft Models (New from table)
  {
    name: "Phi 4 Reasoning Plus",
    provider: "Microsoft",
    parameters: "14B", // From table
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 100, // Default
    reasoning: 68, // Default (GPQA was 68.9%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "efficient", // Assumed
    license: "MIT",
  },
  {
    name: "Phi 4 Reasoning",
    provider: "Microsoft",
    parameters: "14B", // From table
    contextWindow: parseContextWindowToNumber("32K"),
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 100, // Default
    reasoning: 65, // Default (GPQA was 65.8%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "efficient", // Assumed
    license: "MIT",
  },

  // Alibaba Cloud Models (New from table)
  {
    name: "Qwen3 30B A3B",
    provider: "Alibaba Cloud",
    parameters: "30.5B", // From table
    contextWindow: parseContextWindowToNumber("128K"),
    inputCost: 0.0001,
    outputCost: 0.0003,
    speed: 90, // Default
    reasoning: 65, // Default (GPQA was 65.8%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "efficient", // Assumed
    license: "Tongyi Qianwen LICENSE AGREEMENT",
  },

  // Unknown Organization Models (New from table)
  {
    name: "QwQ-32B",
    provider: "Unknown",
    parameters: "32.5B", // From table
    contextWindow: parseContextWindowToNumber("32K"), // (32,768)
    inputCost: 0, // Table: -
    outputCost: 0, // Table: -
    speed: 90, // Default
    reasoning: 65, // Default (GPQA was 65.2%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "efficient", // Assumed
    license: "Unknown",
  },
  {
    name: "QwQ-32B-Preview",
    provider: "Unknown",
    parameters: "32.5B", // From table
    contextWindow: parseContextWindowToNumber("32K"), // (32,768)
    inputCost: 0.00015,
    outputCost: 0.0002,
    speed: 90, // Default
    reasoning: 65, // Default (GPQA was 65.2%)
    coding: 70, // Default
    creative: 70, // Default
    multimodal: false, // Assumed
    languages: 20, // Default
    category: "efficient", // Assumed
    license: "Unknown",
  },
];

// Remove duplicate model entries by name, keeping the one that appeared first (likely from initial list or more specific)
const uniqueModelData = modelData.reduce((acc, current) => {
  const x = acc.find((item) => item.name === current.name);
  if (!x) {
    return acc.concat([current]);
  }
  // If a model with better (non-default) scores already exists, keep it.
  // This prioritizes hand-curated scores for existing models over default scores for newly added ones.
  const existingIsDefault =
    x.parameters === "Unknown" && x.speed === 50 && x.reasoning === 70;
  const currentIsDefault =
    current.parameters === "Unknown" &&
    current.speed === 50 &&
    current.reasoning === 70;
  if (existingIsDefault && !currentIsDefault) {
    // current is better
    acc.splice(
      acc.findIndex((item) => item.name === current.name),
      1
    );
    return acc.concat([current]);
  } else if (!existingIsDefault && currentIsDefault) {
    // existing is better
    return acc;
  } else {
    // both default or both not default, or other scenarios, default to first entry (already in acc)
    return acc;
  }
}, [] as ModelData[]);

const ModelComparison = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>(
    [
      // Default selections - ensure these models exist in the uniqueModelData
      uniqueModelData.find((m) => m.name === "GPT-4o")
        ? "GPT-4o"
        : uniqueModelData[0]
        ? uniqueModelData[0].name
        : "",
      uniqueModelData.find((m) => m.name === "Claude 3.5 Sonnet")
        ? "Claude 3.5 Sonnet"
        : uniqueModelData[1]
        ? uniqueModelData[1].name
        : "",
    ].filter(Boolean) as string[]
  );
  const [sortBy, setSortBy] = useState<keyof ModelData>("reasoning");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterProviders, setFilterProviders] = useState<string[]>(["all"]);

  const allProviders = [
    "all",
    ...Array.from(new Set(uniqueModelData.map((m) => m.provider))),
  ].sort();

  const filteredModels = uniqueModelData.filter(
    (model) =>
      (filterCategory === "all" || model.category === filterCategory) &&
      (filterProviders.includes("all") ||
        filterProviders.includes(model.provider))
  );

  const sortedModels = [...filteredModels].sort((a, b) => {
    if (typeof a[sortBy] === "number" && typeof b[sortBy] === "number") {
      return (b[sortBy] as number) - (a[sortBy] as number);
    }
    return 0;
  });

  const toggleModelSelection = (modelName: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelName)
        ? prev.filter((name) => name !== modelName)
        : prev.length < 4
        ? [...prev, modelName]
        : prev
    );
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return "bg-green-100 text-green-800";
      case "Anthropic":
        return "bg-orange-100 text-orange-800";
      case "Google":
        return "bg-blue-100 text-blue-800";
      case "Cohere":
        return "bg-purple-100 text-purple-800";
      case "Mistral":
        return "bg-red-100 text-red-800";
      case "Fireworks":
        return "bg-yellow-100 text-yellow-800";
      case "Deepinfra":
        return "bg-indigo-100 text-indigo-800";
      case "Groq":
        return "bg-pink-100 text-pink-800";
      case "Perplexity":
        return "bg-cyan-100 text-cyan-800";
      case "DeepSeek":
        return "bg-emerald-100 text-emerald-800";
      case "Cloudflare":
        return "bg-orange-100 text-orange-800"; // Re-using orange for Cloudflare like in PriceCalculator
      case "AWS":
        return "bg-amber-100 text-amber-800";
      case "Replicate":
        return "bg-violet-100 text-violet-800";
      case "xAI":
        return "bg-pink-100 text-pink-800"; // Added for xAI
      case "Microsoft":
        return "bg-teal-100 text-teal-800"; // Added for Microsoft
      case "Alibaba Cloud":
        return "bg-purple-100 text-purple-800"; // Re-using purple, or choose new
      case "Unknown":
        return "bg-gray-200 text-gray-700"; // Slightly different for Unknown provider
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    return category === "flagship"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const selectedModelData = uniqueModelData.filter((model) =>
    selectedModels.includes(model.name)
  );

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Model Selection
          </CardTitle>
          <CardDescription>
            Select up to 4 models to compare side-by-side
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium mr-2 self-center">
                Category:
              </span>
              <Button
                variant={filterCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("all")}
              >
                All Models
              </Button>
              <Button
                variant={filterCategory === "flagship" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("flagship")}
              >
                Flagship
              </Button>
              <Button
                variant={filterCategory === "efficient" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("efficient")}
              >
                Efficient
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm font-medium mr-2 self-center">
                Provider:
              </span>
              {allProviders.map((provider) => (
                <Button
                  key={provider}
                  variant={
                    filterProviders.includes(provider) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    if (provider === "all") {
                      setFilterProviders(["all"]);
                    } else {
                      setFilterProviders((prev) => {
                        const newProviders = prev.includes("all")
                          ? []
                          : [...prev];
                        if (newProviders.includes(provider)) {
                          return newProviders.filter((p) => p !== provider)
                            .length === 0
                            ? ["all"]
                            : newProviders.filter((p) => p !== provider);
                        } else {
                          return [...newProviders, provider];
                        }
                      });
                    }
                  }}
                >
                  {provider}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedModels.map((model) => (
              <div
                key={model.name}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedModels.includes(model.name)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleModelSelection(model.name)}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedModels.includes(model.name)}
                    onChange={() => {}}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{model.name}</h4>
                      <div className="flex gap-1">
                        <Badge className={getProviderColor(model.provider)}>
                          {model.provider}
                        </Badge>
                        <Badge className={getCategoryColor(model.category)}>
                          {model.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {model.parameters} •{" "}
                      {model.contextWindow.toLocaleString()} context
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Selected: {selectedModels.length}/4 models
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      {selectedModelData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
            <CardDescription>
              Side-by-side comparison of selected models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Metric</th>
                    {selectedModelData.map((model) => (
                      <th
                        key={model.name}
                        className="text-center p-3 font-medium min-w-[120px]"
                      >
                        <div>{model.name}</div>
                        <Badge className={getProviderColor(model.provider)}>
                          {model.provider}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Parameters</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        {model.parameters}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Context Window</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        {model.contextWindow.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Input Cost (per 1K)</td>
                    {selectedModelData.map((model) => (
                      <td
                        key={model.name}
                        className="p-3 text-center font-mono"
                      >
                        ${model.inputCost.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Input Cost (per 1M)</td>
                    {selectedModelData.map((model) => (
                      <td
                        key={model.name}
                        className="p-3 text-center font-mono text-gray-500"
                      >
                        ${(model.inputCost * 1000).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Output Cost (per 1K)</td>
                    {selectedModelData.map((model) => (
                      <td
                        key={model.name}
                        className="p-3 text-center font-mono"
                      >
                        ${model.outputCost.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Output Cost (per 1M)</td>
                    {selectedModelData.map((model) => (
                      <td
                        key={model.name}
                        className="p-3 text-center font-mono text-gray-500"
                      >
                        ${(model.outputCost * 1000).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Speed Score</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div
                          className={`font-semibold ${getScoreColor(
                            model.speed
                          )}`}
                        >
                          {model.speed}/150
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Reasoning</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div
                          className={`font-semibold ${getScoreColor(
                            model.reasoning
                          )}`}
                        >
                          {model.reasoning}/100
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Coding</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div
                          className={`font-semibold ${getScoreColor(
                            model.coding
                          )}`}
                        >
                          {model.coding}/100
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Creative Writing</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div
                          className={`font-semibold ${getScoreColor(
                            model.creative
                          )}`}
                        >
                          {model.creative}/100
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Multimodal</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        {model.multimodal ? (
                          <Badge className="bg-green-100 text-green-800">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Languages</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        {model.languages}+
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">License</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center text-xs">
                        {model.license || "Unknown"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Comparison Cards */}
      {selectedModelData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedModelData.map((model) => (
            <Card
              key={model.name}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <Badge className={getProviderColor(model.provider)}>
                  {model.provider}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reasoning</span>
                  <span
                    className={`font-semibold ${getScoreColor(
                      model.reasoning
                    )}`}
                  >
                    {model.reasoning}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Coding</span>
                  <span
                    className={`font-semibold ${getScoreColor(model.coding)}`}
                  >
                    {model.coding}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Speed</span>
                  <span
                    className={`font-semibold ${getScoreColor(model.speed)}`}
                  >
                    {model.speed}/150
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Output Cost (1K)
                  </span>
                  <span className="font-mono text-sm">
                    ${model.outputCost.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Output Cost (1M)
                  </span>
                  <span className="font-mono text-sm text-gray-500">
                    ${(model.outputCost * 1000).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    {model.contextWindow.toLocaleString()} context •{" "}
                    {model.languages}+ languages
                  </div>
                  {model.multimodal && (
                    <Badge variant="outline" className="mt-1">
                      Multimodal
                    </Badge>
                  )}
                  {model.license && (
                    <Badge variant="outline" className="mt-1 ml-1 text-xs">
                      {model.license}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelComparison;
