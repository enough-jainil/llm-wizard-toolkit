import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calculator, TrendingUp } from "lucide-react";

interface ModelPricing {
  name: string;
  provider: string;
  inputCost: number; // per 1K tokens
  outputCost: number; // per 1K tokens
  category: string;
  contextWindow?: string;
  score?: number;
}

interface CalculationEntry {
  id: number;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: string;
}

const modelPricing: ModelPricing[] = [
  // OpenAI Models
  {
    name: "GPT-4o",
    provider: "OpenAI",
    inputCost: 5.0,
    outputCost: 20.0,
    category: "flagship",
    contextWindow: "128K",
    score: 100,
  },
  {
    name: "GPT-4o (2024-08-06)",
    provider: "OpenAI",
    inputCost: 2.5,
    outputCost: 10.0,
    category: "flagship",
    contextWindow: "128K",
    score: 100,
  },
  {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    inputCost: 0.15,
    outputCost: 0.6,
    category: "efficient",
    contextWindow: "128K",
    score: 85,
  },
  {
    name: "GPT-4o (2024-05-13)",
    provider: "OpenAI",
    inputCost: 5.0,
    outputCost: 15.0,
    category: "flagship",
    contextWindow: "128K",
    score: 100,
  },
  {
    name: "GPT-4 Turbo (2024-04-09)",
    provider: "OpenAI",
    inputCost: 10.0,
    outputCost: 30.0,
    category: "flagship",
    contextWindow: "128K",
    score: 94,
  },
  {
    name: "GPT-4",
    provider: "OpenAI",
    inputCost: 30.0,
    outputCost: 60.0,
    category: "flagship",
    contextWindow: "8K",
    score: 84,
  },
  {
    name: "GPT-4-32K",
    provider: "OpenAI",
    inputCost: 60.0,
    outputCost: 120.0,
    category: "flagship",
    contextWindow: "32K",
  },
  {
    name: "GPT-3.5 Turbo (0125)",
    provider: "OpenAI",
    inputCost: 0.5,
    outputCost: 1.5,
    category: "efficient",
    contextWindow: "16K",
    score: 67,
  },
  {
    name: "GPT-3.5 Turbo Instruct",
    provider: "OpenAI",
    inputCost: 1.5,
    outputCost: 2.0,
    category: "efficient",
    contextWindow: "4K",
    score: 60,
  },
  {
    name: "GPT-4.1",
    provider: "OpenAI",
    inputCost: 2.0,
    outputCost: 8.0,
    category: "flagship",
    contextWindow: "1M",
  },
  {
    name: "GPT-4.1 mini",
    provider: "OpenAI",
    inputCost: 0.4,
    outputCost: 1.6,
    category: "efficient",
    contextWindow: "1M",
  },
  {
    name: "GPT-4.1 nano",
    provider: "OpenAI",
    inputCost: 0.1,
    outputCost: 0.4,
    category: "efficient",
    contextWindow: "1M",
  },
  {
    name: "o3",
    provider: "OpenAI",
    inputCost: 10.0,
    outputCost: 40.0,
    category: "flagship",
    contextWindow: "200K",
  },
  {
    name: "o4-mini",
    provider: "OpenAI",
    inputCost: 1.1,
    outputCost: 4.4,
    category: "efficient",
    contextWindow: "200K",
  },
  {
    name: "GPT-o4-mini",
    provider: "OpenAI",
    inputCost: 0.6,
    outputCost: 2.4,
    category: "efficient",
    contextWindow: "128K",
  },

  // Anthropic Models
  {
    name: "Claude 3 Opus",
    provider: "Anthropic",
    inputCost: 15.0,
    outputCost: 75.0,
    category: "flagship",
    contextWindow: "200K",
    score: 100,
  },
  {
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    inputCost: 3.0,
    outputCost: 15.0,
    category: "flagship",
    contextWindow: "200K",
    score: 85,
  },
  {
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    inputCost: 0.25,
    outputCost: 1.25,
    category: "efficient",
    contextWindow: "200K",
    score: 78,
  },
  {
    name: "Claude 2.1",
    provider: "Anthropic",
    inputCost: 8.0,
    outputCost: 24.0,
    category: "flagship",
    contextWindow: "200K",
    score: 66,
  },
  {
    name: "Claude 2.0",
    provider: "Anthropic",
    inputCost: 8.0,
    outputCost: 24.0,
    category: "flagship",
    contextWindow: "100K",
    score: 72,
  },
  {
    name: "Claude Instant 1.2",
    provider: "Anthropic",
    inputCost: 0.8,
    outputCost: 2.4,
    category: "efficient",
    contextWindow: "100K",
    score: 65,
  },
  {
    name: "Claude Opus 4",
    provider: "Anthropic",
    inputCost: 15.0,
    outputCost: 75.0,
    category: "flagship",
    contextWindow: "200K",
  },
  {
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    inputCost: 3.0,
    outputCost: 15.0,
    category: "flagship",
    contextWindow: "200K",
  },
  {
    name: "Claude Sonnet 3.7",
    provider: "Anthropic",
    inputCost: 3.0,
    outputCost: 15.0,
    category: "flagship",
    contextWindow: "200K",
  },

  // Google Models
  {
    name: "Gemini 1.5 Pro",
    provider: "Google",
    inputCost: 3.5,
    outputCost: 10.5,
    category: "flagship",
    contextWindow: "1M",
    score: 88,
  },
  {
    name: "Gemini 1.5 Flash",
    provider: "Google",
    inputCost: 0.075,
    outputCost: 0.3,
    category: "efficient",
    contextWindow: "2.8M",
  },
  {
    name: "Gemini Pro",
    provider: "Google",
    inputCost: 0.5,
    outputCost: 1.5,
    category: "efficient",
    contextWindow: "32K",
    score: 66,
  },
  {
    name: "Gemini 2.5 Flash Preview",
    provider: "Google",
    inputCost: 0.15,
    outputCost: 0.6,
    category: "efficient",
    contextWindow: "1M",
  },
  {
    name: "Gemini 2.5 Pro Preview",
    provider: "Google",
    inputCost: 1.25,
    outputCost: 10.0,
    category: "flagship",
    contextWindow: "1M",
  },
  {
    name: "Gemini 2.0 Flash",
    provider: "Google",
    inputCost: 0.1,
    outputCost: 0.4,
    category: "efficient",
    contextWindow: "1M",
  },
  {
    name: "Gemini 2.0 Flash-Lite",
    provider: "Google",
    inputCost: 0.075,
    outputCost: 0.3,
    category: "efficient",
    contextWindow: "1M",
  },

  // Meta Llama Models
  {
    name: "Llama 3.1 405B Instruct",
    provider: "Fireworks",
    inputCost: 3.0,
    outputCost: 3.0,
    category: "flagship",
    contextWindow: "128K",
    score: 100,
  },
  {
    name: "Llama 3.1 70B Instruct",
    provider: "Deepinfra",
    inputCost: 0.52,
    outputCost: 0.75,
    category: "flagship",
    contextWindow: "128K",
    score: 95,
  },
  {
    name: "Llama 3.1 8B Instruct",
    provider: "Deepinfra",
    inputCost: 0.09,
    outputCost: 0.09,
    category: "efficient",
    contextWindow: "128K",
    score: 66,
  },
  {
    name: "Llama 3 70B Instruct",
    provider: "Deepinfra",
    inputCost: 0.59,
    outputCost: 0.79,
    category: "flagship",
    contextWindow: "8K",
    score: 88,
  },
  {
    name: "Llama 3 8B Instruct",
    provider: "Deepinfra",
    inputCost: 0.08,
    outputCost: 0.08,
    category: "efficient",
    contextWindow: "8K",
    score: 58,
  },

  // Mistral Models
  {
    name: "Mistral Large",
    provider: "Mistral",
    inputCost: 8.0,
    outputCost: 24.0,
    category: "flagship",
    contextWindow: "32K",
    score: 84,
  },
  {
    name: "Mistral Medium",
    provider: "Mistral",
    inputCost: 2.7,
    outputCost: 8.1,
    category: "flagship",
    contextWindow: "32K",
    score: 76,
  },
  {
    name: "Mistral Small",
    provider: "Mistral",
    inputCost: 2.0,
    outputCost: 6.0,
    category: "flagship",
    contextWindow: "32K",
    score: 73,
  },
  {
    name: "Mixtral 8x7B",
    provider: "Mistral",
    inputCost: 0.7,
    outputCost: 0.7,
    category: "efficient",
    contextWindow: "32K",
    score: 68,
  },
  {
    name: "Mistral 7B",
    provider: "Mistral",
    inputCost: 0.25,
    outputCost: 0.25,
    category: "efficient",
    contextWindow: "32K",
    score: 40,
  },

  // Cohere Models
  {
    name: "Command R+",
    provider: "Cohere",
    inputCost: 3.0,
    outputCost: 15.0,
    category: "flagship",
    contextWindow: "128K",
    score: 80,
  },
  {
    name: "Command R",
    provider: "Cohere",
    inputCost: 0.5,
    outputCost: 1.5,
    category: "efficient",
    contextWindow: "4K",
    score: 67,
  },
  {
    name: "Command",
    provider: "Cohere",
    inputCost: 0.3,
    outputCost: 0.6,
    category: "efficient",
    contextWindow: "4K",
  },

  // Groq Models (High Speed)
  {
    name: "Llama 3 70B (Groq)",
    provider: "Groq",
    inputCost: 0.59,
    outputCost: 0.79,
    category: "flagship",
    contextWindow: "8K",
    score: 88,
  },
  {
    name: "Llama 3 8B (Groq)",
    provider: "Groq",
    inputCost: 0.05,
    outputCost: 0.1,
    category: "efficient",
    contextWindow: "8K",
    score: 58,
  },
  {
    name: "Mixtral 8x7B (Groq)",
    provider: "Groq",
    inputCost: 0.27,
    outputCost: 0.27,
    category: "efficient",
    contextWindow: "32K",
    score: 68,
  },
  {
    name: "Gemma 7B (Groq)",
    provider: "Groq",
    inputCost: 0.1,
    outputCost: 0.1,
    category: "efficient",
    contextWindow: "8K",
    score: 59,
  },

  // Perplexity Models
  {
    name: "PPLX 70B Online",
    provider: "Perplexity",
    inputCost: 1.0,
    outputCost: 1.0,
    category: "flagship",
    contextWindow: "4K",
    score: 45,
  },
  {
    name: "PPLX 7B Online",
    provider: "Perplexity",
    inputCost: 0.2,
    outputCost: 0.2,
    category: "efficient",
    contextWindow: "4K",
    score: 35,
  },

  // DeepSeek Models
  {
    name: "DeepSeek V2",
    provider: "DeepSeek",
    inputCost: 0.14,
    outputCost: 0.28,
    category: "efficient",
    contextWindow: "32K",
  },

  // Cloudflare Workers AI
  {
    name: "Llama 2 7B Chat (FP16)",
    provider: "Cloudflare",
    inputCost: 0.56,
    outputCost: 6.66,
    category: "efficient",
    contextWindow: "3K",
  },
  {
    name: "Llama 2 7B Chat (INT8)",
    provider: "Cloudflare",
    inputCost: 0.16,
    outputCost: 0.24,
    category: "efficient",
    contextWindow: "2K",
  },
  {
    name: "Mistral 7B Instruct",
    provider: "Cloudflare",
    inputCost: 0.11,
    outputCost: 0.19,
    category: "efficient",
    contextWindow: "32K",
  },

  // AWS Bedrock Models
  {
    name: "Jurassic-2 Ultra (AWS)",
    provider: "AWS",
    inputCost: 18.8,
    outputCost: 18.8,
    category: "flagship",
    contextWindow: "32K",
  },
  {
    name: "Jurassic-2 Mid (AWS)",
    provider: "AWS",
    inputCost: 12.5,
    outputCost: 12.5,
    category: "flagship",
    contextWindow: "32K",
  },
  {
    name: "Titan Text Express (AWS)",
    provider: "AWS",
    inputCost: 0.8,
    outputCost: 1.6,
    category: "efficient",
    contextWindow: "32K",
  },
  {
    name: "Titan Text Lite (AWS)",
    provider: "AWS",
    inputCost: 0.3,
    outputCost: 0.4,
    category: "efficient",
    contextWindow: "32K",
  },

  // Replicate Models
  {
    name: "Meta Llama 3 70B (Replicate)",
    provider: "Replicate",
    inputCost: 0.65,
    outputCost: 2.75,
    category: "flagship",
    contextWindow: "8K",
  },
  {
    name: "Meta Llama 3 8B (Replicate)",
    provider: "Replicate",
    inputCost: 0.05,
    outputCost: 0.25,
    category: "efficient",
    contextWindow: "8K",
  },
  {
    name: "Llama 2 70B (Replicate)",
    provider: "Replicate",
    inputCost: 0.65,
    outputCost: 2.75,
    category: "flagship",
    contextWindow: "4K",
  },
  {
    name: "Llama 2 13B (Replicate)",
    provider: "Replicate",
    inputCost: 0.1,
    outputCost: 0.5,
    category: "efficient",
    contextWindow: "4K",
  },
  {
    name: "Llama 2 7B (Replicate)",
    provider: "Replicate",
    inputCost: 0.05,
    outputCost: 0.25,
    category: "efficient",
    contextWindow: "4K",
  },
];

const PriceCalculator = () => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [inputTokens, setInputTokens] = useState<string>("1000");
  const [outputTokens, setOutputTokens] = useState<string>("500");
  const [calculations, setCalculations] = useState<CalculationEntry[]>([]);

  const currentModel = modelPricing.find((m) => m.name === selectedModel);

  const calculateCost = () => {
    if (!currentModel || !inputTokens || !outputTokens) return 0;

    const inputCost = (parseInt(inputTokens) / 1000) * currentModel.inputCost;
    const outputCost =
      (parseInt(outputTokens) / 1000) * currentModel.outputCost;
    return inputCost + outputCost;
  };

  const addCalculation = () => {
    if (!currentModel) return;

    const cost = calculateCost();
    const newCalc = {
      id: Date.now(),
      model: currentModel.name,
      provider: currentModel.provider,
      inputTokens: parseInt(inputTokens),
      outputTokens: parseInt(outputTokens),
      cost: cost,
      timestamp: new Date().toLocaleString(),
    };

    setCalculations((prev) => [newCalc, ...prev.slice(0, 9)]);
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
        return "bg-orange-100 text-orange-800";
      case "AWS":
        return "bg-amber-100 text-amber-800";
      case "Replicate":
        return "bg-violet-100 text-violet-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Price Calculator
            </CardTitle>
            <CardDescription>
              Calculate costs for LLM API usage across different providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an LLM model" />
                </SelectTrigger>
                <SelectContent>
                  {modelPricing.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge
                          className={`ml-2 ${getProviderColor(model.provider)}`}
                        >
                          {model.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="input-tokens">Input Tokens</Label>
                <Input
                  id="input-tokens"
                  type="number"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="output-tokens">Output Tokens</Label>
                <Input
                  id="output-tokens"
                  type="number"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(e.target.value)}
                  placeholder="500"
                />
              </div>
            </div>

            {currentModel && (
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Input cost (per 1K tokens):</span>
                  <span className="font-mono">
                    ${currentModel.inputCost.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Output cost (per 1K tokens):</span>
                  <span className="font-mono">
                    ${currentModel.outputCost.toFixed(4)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Cost:</span>
                    <span className="text-green-600 font-mono">
                      ${calculateCost().toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={addCalculation}
              className="w-full"
              disabled={!currentModel}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Add to Calculations
            </Button>
          </CardContent>
        </Card>

        {/* Recent Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Calculations
            </CardTitle>
            <CardDescription>
              Your recent cost calculations and comparisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No calculations yet</p>
                <p className="text-sm">Add a calculation to see it here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {calculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{calc.model}</h4>
                        <Badge
                          className={`text-xs ${getProviderColor(
                            calc.provider
                          )}`}
                        >
                          {calc.provider}
                        </Badge>
                      </div>
                      <span className="font-mono text-lg font-bold text-green-600">
                        ${calc.cost.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                      <span>
                        Input: {calc.inputTokens.toLocaleString()} tokens
                      </span>
                      <span>
                        Output: {calc.outputTokens.toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {calc.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model Pricing Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Model Pricing Overview</CardTitle>
          <CardDescription>
            Compare pricing across different LLM providers and models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Model</th>
                  <th className="text-left p-2">Provider</th>
                  <th className="text-right p-2">Input (per 1K)</th>
                  <th className="text-right p-2">Output (per 1K)</th>
                  <th className="text-center p-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {modelPricing.map((model) => (
                  <tr key={model.name} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{model.name}</td>
                    <td className="p-2">
                      <Badge className={getProviderColor(model.provider)}>
                        {model.provider}
                      </Badge>
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${model.inputCost.toFixed(4)}
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${model.outputCost.toFixed(4)}
                    </td>
                    <td className="p-2 text-center">
                      <Badge
                        variant={
                          model.category === "flagship"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {model.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCalculator;
