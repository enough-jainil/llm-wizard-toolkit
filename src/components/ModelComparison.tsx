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
import { GitCompare } from "lucide-react";
import {
  uniqueModelComparisonData,
  ModelData,
} from "../../models/modelDataConverter";

const ModelComparison = () => {
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
  const [sortBy, setSortBy] = useState<keyof ModelData>("reasoning");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterProviders, setFilterProviders] = useState<string[]>(["all"]);

  const allProviders = [
    "all",
    ...Array.from(new Set(uniqueModelComparisonData.map((m) => m.provider))),
  ].sort();

  const filteredModels = uniqueModelComparisonData.filter(
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

  const selectedModelData = uniqueModelComparisonData.filter((model) =>
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
