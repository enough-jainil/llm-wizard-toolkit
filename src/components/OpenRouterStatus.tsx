import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  Database,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Globe,
} from "lucide-react";
import { useOpenRouterModels } from "@/hooks/useOpenRouterModels";

const OpenRouterStatus = () => {
  const {
    isLoading,
    error,
    hasOpenRouterModels,
    staticModelsCount,
    openRouterModelsCount,
    totalModelsCount,
    refreshModels,
    clearCache,
    cacheStatus,
  } = useOpenRouterModels();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshModels();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeUntilExpiry = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">OpenRouter Integration</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading
              </Badge>
            )}
            {error && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Error
              </Badge>
            )}
            {hasOpenRouterModels && !isLoading && !error && (
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Real-time model data from{" "}
          <a
            href="https://openrouter.ai/docs/api-reference/list-available-models"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            OpenRouter API
          </a>{" "}
          • Automatically cached for better performance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Model Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-700">
              {staticModelsCount}
            </div>
            <div className="text-sm text-slate-600">Static Models</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {openRouterModelsCount}
            </div>
            <div className="text-sm text-blue-600">OpenRouter Models</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {totalModelsCount}
            </div>
            <div className="text-sm text-green-600">Total Available</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {totalModelsCount - staticModelsCount}
            </div>
            <div className="text-sm text-purple-600">New Models Added</div>
          </div>
        </div>

        {/* Cache Status */}
        {cacheStatus.hasCachedData && (
          <div className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-sm font-medium">
                  Cache Status: {cacheStatus.isValid ? "Valid" : "Expired"}
                </div>
                {cacheStatus.timestamp && (
                  <div className="text-xs text-slate-600">
                    Last updated: {formatTimestamp(cacheStatus.timestamp)}
                  </div>
                )}
                {cacheStatus.isValid && cacheStatus.timeUntilExpiry && (
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Expires in:{" "}
                    {formatTimeUntilExpiry(cacheStatus.timeUntilExpiry)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <div className="text-sm font-medium">OpenRouter API Error</div>
            </div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
            <div className="text-xs text-red-600 mt-2">
              The application will continue using static model data. Try
              refreshing to reconnect to OpenRouter.
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-slate-600">
            {hasOpenRouterModels
              ? "Connected to OpenRouter • Models updated automatically"
              : "Using static model data only"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              disabled={!cacheStatus.hasCachedData}
              className="gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
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
              Refresh Models
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenRouterStatus;
