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
import { Input } from "@/components/ui/input";
import { GitCompare, Search, X } from "lucide-react";
import { useOpenRouterModelComparison } from "@/hooks/useOpenRouterModelComparison";
import type { ModelData } from "@/lib/openrouter";

const ModelComparison = () => {
  // Use the new OpenRouter models hook
  const { models: uniqueModelComparisonData, isLoading } =
    useOpenRouterModelComparison();

  const [selectedModels, setSelectedModels] = useState<string[]>(
    [
      // Default selections - ensure these models exist in the uniqueModelComparisonData
      uniqueModelComparisonData.find((m) => m.name === "GPT-4o")
        ? "GPT-4o"
        : uniqueModelComparisonData[0]
        ? uniqueModelComparisonData[0].name
        : "",
      uniqueModelComparisonData.find((m) => m.name === "Claude 3.5 Sonnet")
        ? "Claude 3.5 Sonnet"
        : uniqueModelComparisonData[1]
        ? uniqueModelComparisonData[1].name
        : "",
    ].filter(Boolean) as string[]
  );
  const [sortBy, setSortBy] = useState<keyof ModelData>("inputCost");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterProviders, setFilterProviders] = useState<string[]>(["all"]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const allProviders = [
    "All",
    ...Array.from(
      new Set(uniqueModelComparisonData.map((m) => m.provider))
    ).sort(),
  ];

  const filteredModels = uniqueModelComparisonData.filter((model) => {
    // Existing filters
    const categoryMatch =
      filterCategory === "all" || model.category === filterCategory;
    const providerMatch =
      filterProviders.includes("all") ||
      filterProviders.includes(model.provider);

    // Search filter
    let searchMatch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      searchMatch =
        model.name.toLowerCase().includes(searchLower) ||
        model.provider.toLowerCase().includes(searchLower) ||
        model.category.toLowerCase().includes(searchLower);
    }

    return categoryMatch && providerMatch && searchMatch;
  });

  const clearSearch = () => {
    setSearchTerm("");
  };

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
        return "bg-orange-100 text-orange-800";
      case "AWS":
        return "bg-amber-100 text-amber-800";
      case "Replicate":
        return "bg-violet-100 text-violet-800";
      case "xAI":
        return "bg-pink-100 text-pink-800";
      case "Microsoft":
        return "bg-teal-100 text-teal-800";
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

  const selectedModelData = uniqueModelComparisonData.filter((model) =>
    selectedModels.includes(model.name)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <GitCompare className="w-5 h-5" />
            Model Selection
          </CardTitle>
          <CardDescription>
            Select up to 4 models to compare side-by-side
            {isLoading && " • Loading latest models..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search models by name, provider, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  disabled={isLoading}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={clearSearch}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {searchTerm && (
                <div className="text-xs text-gray-600">
                  Showing {filteredModels.length} of{" "}
                  {uniqueModelComparisonData.length} models
                </div>
              )}
            </div>

            {/* Category and Provider Filters */}
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Category:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterCategory("all")}
                    className="h-9"
                    disabled={isLoading}
                  >
                    All Models
                  </Button>
                  <Button
                    variant={
                      filterCategory === "flagship" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterCategory("flagship")}
                    className="h-9"
                    disabled={isLoading}
                  >
                    Flagship
                  </Button>
                  <Button
                    variant={
                      filterCategory === "efficient" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterCategory("efficient")}
                    className="h-9"
                    disabled={isLoading}
                  >
                    Efficient
                  </Button>
                </div>
              </div>

              {/* Provider Filter */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Provider:</span>
                <div className="flex flex-wrap gap-2">
                  {allProviders.map((provider) => (
                    <Button
                      key={provider}
                      variant={
                        filterProviders.includes(
                          provider.toLowerCase() === "all" ? "all" : provider
                        )
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (provider === "All") {
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
                      className="h-9"
                      disabled={isLoading}
                    >
                      {provider}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredModels.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{isLoading ? "Loading models..." : "No models found"}</p>
                <p className="text-sm">
                  {isLoading
                    ? "Please wait while we fetch the latest models"
                    : searchTerm
                    ? "Try adjusting your search term or filters"
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.name}
                  className={`border rounded-lg p-3 cursor-pointer transition-all touch-manipulation ${
                    selectedModels.includes(model.name)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleModelSelection(model.name)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedModels.includes(model.name)}
                      onChange={() => {}}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        <h4 className="font-semibold truncate">{model.name}</h4>
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              className={`text-xs ${getProviderColor(
                                model.provider
                              )}`}
                            >
                              {model.provider}
                            </Badge>
                            <Badge
                              className={`text-xs ${getCategoryColor(
                                model.category
                              )}`}
                            >
                              {model.category}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {model.contextWindow.toLocaleString()} context
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
            <CardTitle className="text-lg sm:text-xl">
              Detailed Comparison
            </CardTitle>
            <CardDescription>
              Side-by-side comparison of selected models
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
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
                </tbody>
              </table>
            </div>

            {/* Mobile Comparison Cards */}
            <div className="lg:hidden space-y-4">
              {selectedModelData.map((model) => (
                <div
                  key={model.name}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{model.name}</h3>
                      <Badge
                        className={`text-xs mt-1 ${getProviderColor(
                          model.provider
                        )}`}
                      >
                        {model.provider}
                      </Badge>
                    </div>
                    <Badge
                      className={`text-xs ${getCategoryColor(model.category)}`}
                    >
                      {model.category}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Context</div>
                      <div className="font-medium">
                        {model.contextWindow.toLocaleString()}
                      </div>
                    </div>
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
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Multimodal:</span>
                      {model.multimodal ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          No
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelComparison;
