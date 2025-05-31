import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Brain,
  Eye,
  Code,
  DollarSign,
  Cpu,
  Shield,
  Loader2,
  RefreshCw,
  Star,
  Info,
} from "lucide-react";
import { useModelDetails } from "@/hooks/useModelDetails";
import ModelDetailView from "./ModelDetailView";
import type { OpenRouterModel } from "@/lib/openrouter";
import {
  getModelCapabilities,
  getDetailedCategory,
  formatPricing,
} from "@/lib/openrouter";

const ModelExplorer: React.FC = () => {
  const {
    models,
    isLoading,
    error,
    getModelsByProvider,
    getModelsByCategory,
    getMultimodalModels,
    getFreeModels,
    refreshModels,
    totalCount,
    searchModels,
  } = useModelDetails();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedModel, setSelectedModel] = useState<OpenRouterModel | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("overview");

  // Get unique providers from models
  const providers = useMemo(() => {
    const providerSet = new Set<string>();
    models.forEach((model) => {
      const provider = model.id.split("/")[0];
      if (provider) {
        providerSet.add(provider);
      }
    });
    return Array.from(providerSet).sort();
  }, [models]);

  // Filter models based on search and filters
  const filteredModels = useMemo(() => {
    let filtered = searchQuery ? searchModels(searchQuery) : models;

    if (selectedProvider !== "all") {
      filtered = filtered.filter((model) =>
        model.id.startsWith(selectedProvider + "/")
      );
    }

    if (selectedCategory !== "all") {
      if (selectedCategory === "multimodal") {
        filtered = filtered.filter(
          (model) =>
            model.architecture.input_modalities.includes("image") ||
            model.architecture.input_modalities.length > 1
        );
      } else if (selectedCategory === "free") {
        filtered = filtered.filter(
          (model) =>
            parseFloat(model.pricing.prompt) === 0 &&
            parseFloat(model.pricing.completion) === 0
        );
      } else {
        filtered = getModelsByCategory(selectedCategory);
        if (selectedProvider !== "all") {
          filtered = filtered.filter((model) =>
            model.id.startsWith(selectedProvider + "/")
          );
        }
        if (searchQuery) {
          filtered = filtered.filter((model) =>
            searchModels(searchQuery).some(
              (searchResult) => searchResult.id === model.id
            )
          );
        }
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [
    models,
    searchQuery,
    selectedProvider,
    selectedCategory,
    searchModels,
    getModelsByCategory,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const multimodal = getMultimodalModels().length;
    const free = getFreeModels().length;
    const flagship = getModelsByCategory("flagship").length;
    const efficient = getModelsByCategory("efficient").length;

    return { multimodal, free, flagship, efficient };
  }, [getMultimodalModels, getFreeModels, getModelsByCategory]);

  const ModelCard: React.FC<{ model: OpenRouterModel }> = ({ model }) => {
    const capabilities = getModelCapabilities(model);
    const { category, tier } = getDetailedCategory(model);
    const pricing = formatPricing(model.pricing);

    const formatContextLength = (length: number) => {
      if (length >= 1000000) {
        return `${(length / 1000000).toFixed(1)}M`;
      } else if (length >= 1000) {
        return `${(length / 1000).toFixed(0)}K`;
      }
      return length.toString();
    };

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedModel(model)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {model.name}
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-1">
                {model.id}
              </CardDescription>
            </div>
            <Badge
              variant="default"
              className={`ml-2 text-xs ${
                tier === "premium"
                  ? "bg-purple-600"
                  : tier === "budget"
                  ? "bg-green-600"
                  : tier === "community"
                  ? "bg-blue-600"
                  : "bg-gray-600"
              }`}
            >
              {category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Capabilities badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {capabilities.isMultimodal && (
              <Badge variant="outline" className="text-xs gap-1">
                <Eye className="w-3 h-3" />
                Vision
              </Badge>
            )}
            {capabilities.hasCodeCapabilities && (
              <Badge variant="outline" className="text-xs gap-1">
                <Code className="w-3 h-3" />
                Code
              </Badge>
            )}
            {capabilities.hasReasoningCapabilities && (
              <Badge variant="outline" className="text-xs gap-1">
                <Brain className="w-3 h-3" />
                Reasoning
              </Badge>
            )}
            {model.top_provider.is_moderated && (
              <Badge variant="outline" className="text-xs gap-1">
                <Shield className="w-3 h-3" />
                Moderated
              </Badge>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Context:</span>
              <span className="ml-1 font-medium">
                {formatContextLength(model.context_length)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Input:</span>
              <span className="ml-1 font-medium font-mono">
                {pricing.prompt}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tokenizer:</span>
              <span className="ml-1 font-medium">{capabilities.tokenizer}</span>
            </div>
            <div>
              <span className="text-gray-600">Output:</span>
              <span className="ml-1 font-medium font-mono">
                {pricing.completion}
              </span>
            </div>
          </div>

          {/* Description preview */}
          <p className="text-xs text-gray-600 mt-3 line-clamp-2">
            {model.description}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (selectedModel) {
    return (
      <ModelDetailView
        model={selectedModel}
        onClose={() => setSelectedModel(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Model Explorer
        </h1>
        <p className="text-gray-600 text-lg">
          Comprehensive database of {totalCount} AI models with detailed
          specifications
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-sm text-gray-600">Total Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.multimodal}
            </div>
            <div className="text-sm text-gray-600">Multimodal</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.free}
            </div>
            <div className="text-sm text-gray-600">Free Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {providers.length}
            </div>
            <div className="text-sm text-gray-600">Providers</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Provider Filter */}
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="flagship">Flagship</SelectItem>
                <SelectItem value="efficient">Efficient</SelectItem>
                <SelectItem value="specialized">Specialized</SelectItem>
                <SelectItem value="multimodal">Multimodal</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              onClick={refreshModels}
              variant="outline"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <Info className="w-5 h-5" />
              <span className="font-medium">Error loading models:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading models...</span>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {filteredModels.length} Models Found
            </h2>
            {(searchQuery ||
              selectedProvider !== "all" ||
              selectedCategory !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProvider("all");
                  setSelectedCategory("all");
                }}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Model Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>

          {/* No Results */}
          {filteredModels.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No models found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelExplorer;
