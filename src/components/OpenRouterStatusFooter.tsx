import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useOpenRouterModels } from "@/hooks/useOpenRouterModels";

const OpenRouterStatusFooter = () => {
  const {
    isLoading,
    error,
    hasOpenRouterModels,
    staticModelsCount,
    openRouterModelsCount,
    totalModelsCount,
    refreshModels,
  } = useOpenRouterModels();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshModels();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  OpenRouter Integration
                </span>
                {isLoading && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading
                  </Badge>
                )}
                {error && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    Error
                  </Badge>
                )}
                {hasOpenRouterModels && !isLoading && !error && (
                  <Badge
                    variant="default"
                    className="gap-1 bg-green-600 text-xs"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {totalModelsCount} models available • {openRouterModelsCount}{" "}
                from{" "}
                <a
                  href="https://openrouter.ai/docs/api-reference/list-available-models"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  OpenRouter API
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="gap-1"
            >
              {isLoading || isRefreshing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isExpanded ? "Less" : "Details"}
              </span>
            </Button>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            {/* Model Statistics - Mobile Optimized */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-slate-700">
                  {staticModelsCount}
                </div>
                <div className="text-xs text-slate-600">Static</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-blue-700">
                  {openRouterModelsCount}
                </div>
                <div className="text-xs text-blue-600">OpenRouter</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-green-700">
                  {totalModelsCount}
                </div>
                <div className="text-xs text-green-600">Total</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-purple-700">
                  {totalModelsCount - staticModelsCount}
                </div>
                <div className="text-xs text-purple-600">Added</div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <div className="font-medium text-red-800">API Error</div>
                <div className="text-red-700 mt-1">{error}</div>
              </div>
            )}

            {/* Additional Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
              <div>
                {hasOpenRouterModels
                  ? "✓ Connected to OpenRouter • Real-time model data"
                  : "⚠ Using static model data only"}
              </div>
              <a
                href="https://openrouter.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <span>Learn more about OpenRouter</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenRouterStatusFooter;
