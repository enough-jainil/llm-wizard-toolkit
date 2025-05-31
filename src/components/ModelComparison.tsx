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
import {
  GitCompare,
  Search,
  X,
  Monitor,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("mobile");
  const [displayCount, setDisplayCount] = useState<number>(12);

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

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredModels.length));
  };

  const showLess = () => {
    setDisplayCount(12);
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

  const displayedModels = filteredModels.slice(0, displayCount);
  const hasMore = displayCount < filteredModels.length;
  const canShowLess = displayCount > 12;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Model Selection */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
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
          <div className="space-y-6">
            {/* Enhanced Search and Filters */}
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search models by name, provider, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                  disabled={isLoading}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={clearSearch}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {searchTerm && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <span className="font-medium">
                    {filteredModels.length} of{" "}
                    {uniqueModelComparisonData.length} models found
                  </span>
                  {filteredModels.length === 0 && (
                    <span className="block mt-1 text-gray-500">
                      Try adjusting your search term or filters
                    </span>
                  )}
                </div>
              )}

              {/* Provider Filters - Enhanced Mobile Layout */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Filter by Provider
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {allProviders.map((provider) => (
                    <Button
                      key={provider}
                      variant={
                        (filterProviders.includes("all") &&
                          provider === "All") ||
                        (filterProviders.includes(provider) &&
                          provider !== "All")
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
                      className="h-10 text-xs justify-center"
                      disabled={isLoading}
                    >
                      {provider}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Grid - Enhanced Mobile Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    {isLoading ? "Loading models..." : "No models found"}
                  </h3>
                  <p className="text-sm max-w-md mx-auto">
                    {isLoading
                      ? "Please wait while we fetch the latest models from OpenRouter"
                      : searchTerm
                      ? "Try adjusting your search term or provider filters to find more models"
                      : "Try adjusting your provider filters to see available models"}
                  </p>
                </div>
              ) : (
                displayedModels.map((model) => (
                  <div
                    key={model.name}
                    className={`group border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${
                      selectedModels.includes(model.name)
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    } ${
                      selectedModels.length >= 4 &&
                      !selectedModels.includes(model.name)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => {
                      if (
                        selectedModels.length < 4 ||
                        selectedModels.includes(model.name)
                      ) {
                        toggleModelSelection(model.name);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5 mt-1">
                        <Checkbox
                          checked={selectedModels.includes(model.name)}
                          disabled={
                            selectedModels.length >= 4 &&
                            !selectedModels.includes(model.name)
                          }
                          className="h-4 w-4 rounded-sm border border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white shadow-sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {model.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {model.contextWindow.toLocaleString()} tokens
                            context
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
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
                          {model.multimodal && (
                            <Badge className="text-xs bg-purple-100 text-purple-800">
                              Multimodal
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Input:</span>
                            <span className="font-mono">
                              ${model.inputCost.toFixed(4)}/1K
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Output:</span>
                            <span className="font-mono">
                              ${model.outputCost.toFixed(4)}/1K
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More / Show Less Section */}
            {filteredModels.length > 0 && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  Showing {displayCount} of {filteredModels.length} models
                </div>

                <div className="flex gap-2">
                  {hasMore && (
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      className="flex items-center gap-2 hover:bg-blue-50"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Load More (
                      {Math.min(12, filteredModels.length - displayCount)} more)
                    </Button>
                  )}

                  {canShowLess && (
                    <Button
                      variant="ghost"
                      onClick={showLess}
                      className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedModels.length}/4</span>{" "}
                models selected
              </div>
              {selectedModels.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModels([])}
                  className="text-red-600 hover:bg-red-50"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      {selectedModelData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Detailed Comparison
                </CardTitle>
                <CardDescription>
                  Side-by-side comparison of {selectedModelData.length} selected
                  models
                </CardDescription>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <Button
                  variant={viewMode === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "mobile" ? (
              // Mobile Card View
              <div className="space-y-6">
                {selectedModelData.map((model, index) => (
                  <Card
                    key={model.name}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {model.name}
                          </CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getProviderColor(model.provider)}>
                              {model.provider}
                            </Badge>
                            <Badge className={getCategoryColor(model.category)}>
                              {model.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModelSelection(model.name)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Context Window:
                            </span>
                            <span className="font-medium">
                              {model.contextWindow.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Input Cost:</span>
                            <span className="font-mono">
                              ${model.inputCost.toFixed(4)}/1K
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Output Cost:</span>
                            <span className="font-mono">
                              ${model.outputCost.toFixed(4)}/1K
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Multimodal:</span>
                            <Badge
                              className={
                                model.multimodal
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }
                            >
                              {model.multimodal ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Parameters:</span>
                            <span className="font-medium">
                              {model.parameters}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="table-mobile-scroll overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-4 font-semibold bg-gray-50 sticky left-0">
                        Metric
                      </th>
                      {selectedModelData.map((model) => (
                        <th
                          key={model.name}
                          className="text-center p-4 font-semibold min-w-[160px] bg-gray-50"
                        >
                          <div className="space-y-2">
                            <div className="font-medium">{model.name}</div>
                            <Badge className={getProviderColor(model.provider)}>
                              {model.provider}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium bg-gray-50/50 sticky left-0">
                        Context Window
                      </td>
                      {selectedModelData.map((model) => (
                        <td key={model.name} className="p-4 text-center">
                          <span className="font-medium">
                            {model.contextWindow.toLocaleString()}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium bg-gray-50/50 sticky left-0">
                        Input Cost (per 1K)
                      </td>
                      {selectedModelData.map((model) => (
                        <td key={model.name} className="p-4 text-center">
                          <span className="font-mono font-medium">
                            ${model.inputCost.toFixed(4)}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium bg-gray-50/50 sticky left-0">
                        Output Cost (per 1K)
                      </td>
                      {selectedModelData.map((model) => (
                        <td key={model.name} className="p-4 text-center">
                          <span className="font-mono font-medium">
                            ${model.outputCost.toFixed(4)}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium bg-gray-50/50 sticky left-0">
                        Multimodal Support
                      </td>
                      {selectedModelData.map((model) => (
                        <td key={model.name} className="p-4 text-center">
                          <Badge
                            className={
                              model.multimodal
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {model.multimodal ? "Yes" : "No"}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium bg-gray-50/50 sticky left-0">
                        Parameters
                      </td>
                      {selectedModelData.map((model) => (
                        <td key={model.name} className="p-4 text-center">
                          <span className="font-medium">
                            {model.parameters}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelComparison;
