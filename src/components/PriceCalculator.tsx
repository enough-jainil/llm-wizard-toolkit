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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DollarSign,
  Calculator,
  TrendingUp,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOpenRouterModels } from "@/hooks/useOpenRouterModels";
import type { ModelPricing } from "@/lib/openrouter";

interface CalculationEntry {
  id: number;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: string;
}

const PriceCalculator = () => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [inputTokens, setInputTokens] = useState<string>("1000");
  const [outputTokens, setOutputTokens] = useState<string>("500");
  const [calculations, setCalculations] = useState<CalculationEntry[]>([]);
  const [isModelSelectOpen, setIsModelSelectOpen] = useState<boolean>(false);

  // Use the new OpenRouter models hook
  const { models: modelPricing, isLoading } = useOpenRouterModels();

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
      case "xAI":
        return "bg-pink-100 text-pink-800";
      case "Microsoft":
        return "bg-emerald-100 text-emerald-800";
      case "Alibaba Cloud":
        return "bg-purple-100 text-purple-800";
      case "Meta":
        return "bg-blue-100 text-blue-800";
      case "Together":
        return "bg-green-100 text-green-800";
      case "Unknown":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calculator className="w-5 h-5" />
              Price Calculator
            </CardTitle>
            <CardDescription>
              Calculate costs for LLM API usage across different providers
              {isLoading && " • Loading latest models..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="model"
                className="text-sm font-medium text-gray-700"
              >
                Select Model
              </Label>
              <Popover
                open={isModelSelectOpen}
                onOpenChange={setIsModelSelectOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isModelSelectOpen}
                    className="w-full justify-between h-12 text-left bg-white hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    <span className="truncate text-sm">
                      {selectedModel
                        ? modelPricing.find(
                            (model) => model.name === selectedModel
                          )?.name
                        : isLoading
                        ? "Loading models..."
                        : "Choose an LLM model..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search models by name, provider, or category..."
                      className="h-12 text-base"
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No models found.</CommandEmpty>
                      <CommandGroup>
                        {modelPricing.map((model) => (
                          <CommandItem
                            key={model.name}
                            value={`${model.name} ${model.provider} ${model.category}`}
                            onSelect={() => {
                              setSelectedModel(model.name);
                              setIsModelSelectOpen(false);
                            }}
                            className="py-3"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                selectedModel === model.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {model.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Input: ${model.inputCost.toFixed(4)}/1K •
                                  Output: ${model.outputCost.toFixed(4)}/1K
                                </div>
                              </div>
                              <div className="flex gap-1 flex-wrap">
                                <Badge
                                  className={`text-xs ${getProviderColor(
                                    model.provider
                                  )}`}
                                >
                                  {model.provider}
                                </Badge>
                                {model.category === "flagship" && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                    Flagship
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="inputTokens"
                  className="text-sm font-medium text-gray-700"
                >
                  Input Tokens
                </Label>
                <Input
                  id="inputTokens"
                  type="number"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(e.target.value)}
                  placeholder="1000"
                  className="h-12 text-base"
                  min="0"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="outputTokens"
                  className="text-sm font-medium text-gray-700"
                >
                  Output Tokens
                </Label>
                <Input
                  id="outputTokens"
                  type="number"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(e.target.value)}
                  placeholder="500"
                  className="h-12 text-base"
                  min="0"
                />
              </div>
            </div>

            {currentModel && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-blue-900">Model Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Provider:</span>
                    <Badge className={getProviderColor(currentModel.provider)}>
                      {currentModel.provider}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Category:</span>
                    <Badge
                      className={
                        currentModel.category === "flagship"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {currentModel.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Input cost:</span>
                    <span className="font-mono">
                      ${currentModel.inputCost.toFixed(4)}/1K
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Output cost:</span>
                    <span className="font-mono">
                      ${currentModel.outputCost.toFixed(4)}/1K
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={addCalculation}
                disabled={!currentModel || !inputTokens || !outputTokens}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Cost
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <DollarSign className="w-5 h-5" />
              Cost Estimation
            </CardTitle>
            <CardDescription>
              Current calculation and pricing breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentModel && inputTokens && outputTokens ? (
              <>
                <div className="text-center space-y-3">
                  <div className="text-4xl sm:text-5xl font-bold text-green-600">
                    ${calculateCost().toFixed(6)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Total cost for {parseInt(inputTokens).toLocaleString()}{" "}
                    input + {parseInt(outputTokens).toLocaleString()} output
                    tokens
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        Input tokens ({parseInt(inputTokens).toLocaleString()}):
                      </span>
                      <span className="font-mono">
                        $
                        {(
                          (parseInt(inputTokens) / 1000) *
                          currentModel.inputCost
                        ).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Output tokens ({parseInt(outputTokens).toLocaleString()}
                        ):
                      </span>
                      <span className="font-mono">
                        $
                        {(
                          (parseInt(outputTokens) / 1000) *
                          currentModel.outputCost
                        ).toFixed(6)}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total cost:</span>
                      <span className="font-mono">
                        ${calculateCost().toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-blue-600">
                      ${(calculateCost() * 1000).toFixed(3)}
                    </div>
                    <div className="text-xs text-blue-600">
                      Per 1,000 requests
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-purple-600">
                      ${(calculateCost() * 1000000).toFixed(2)}
                    </div>
                    <div className="text-xs text-purple-600">
                      Per 1M requests
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Ready to Calculate</h3>
                <p className="text-sm max-w-sm mx-auto">
                  Select a model and enter token counts to see pricing estimates
                  and cost breakdowns.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
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
                    <div className="min-w-0 flex-1 mr-3">
                      <h4 className="font-semibold text-sm truncate">
                        {calc.model}
                      </h4>
                      <Badge
                        className={`text-xs ${getProviderColor(calc.provider)}`}
                      >
                        {calc.provider}
                      </Badge>
                    </div>
                    <span className="font-mono text-lg font-bold text-green-600 flex-shrink-0">
                      ${calc.cost.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
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

      {/* Model Pricing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Model Pricing Overview
          </CardTitle>
          <CardDescription>
            Compare pricing across different LLM providers and models
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Model</th>
                  <th className="text-left p-2">Provider</th>
                  <th className="text-right p-2">Input (per 1K)</th>
                  <th className="text-right p-2">Output (per 1K)</th>
                  <th className="text-right p-2">Input (per 1M)</th>
                  <th className="text-right p-2">Output (per 1M)</th>
                  <th className="text-center p-2">Category</th>
                  <th className="text-left p-2">License</th>
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
                    <td className="p-2 text-right font-mono text-gray-500">
                      ${(model.inputCost * 1000).toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-mono text-gray-500">
                      ${(model.outputCost * 1000).toFixed(2)}
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
                    <td className="p-2 text-xs">
                      {model.license || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 max-h-96 overflow-y-auto">
            {modelPricing.map((model) => (
              <div key={model.name} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-semibold text-sm truncate">
                      {model.name}
                    </h3>
                    <Badge
                      className={`text-xs mt-1 ${getProviderColor(
                        model.provider
                      )}`}
                    >
                      {model.provider}
                    </Badge>
                  </div>
                  <Badge
                    variant={
                      model.category === "flagship" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {model.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Input (1K)</div>
                    <div className="font-mono">
                      ${model.inputCost.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Output (1K)</div>
                    <div className="font-mono">
                      ${model.outputCost.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Input (1M)</div>
                    <div className="font-mono text-gray-500">
                      ${(model.inputCost * 1000).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Output (1M)</div>
                    <div className="font-mono text-gray-500">
                      ${(model.outputCost * 1000).toFixed(2)}
                    </div>
                  </div>
                </div>

                {model.license && (
                  <div className="text-xs text-gray-500 border-t pt-2">
                    License: {model.license}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCalculator;
