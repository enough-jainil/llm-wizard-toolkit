import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Eye,
  Code,
  DollarSign,
  Clock,
  Shield,
  Cpu,
  Database,
  FileText,
  Image,
  Zap,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";
import type { OpenRouterModel } from "@/lib/openrouter";
import {
  formatPricing,
  formatSupportedParameters,
  getModelCapabilities,
  getModelLimits,
  getDetailedCategory,
} from "@/lib/openrouter";

interface ModelDetailViewProps {
  model: OpenRouterModel;
  onClose?: () => void;
}

const ModelDetailView: React.FC<ModelDetailViewProps> = ({
  model,
  onClose,
}) => {
  const capabilities = getModelCapabilities(model);
  const limits = getModelLimits(model);
  const { category, tier } = getDetailedCategory(model);
  const pricing = formatPricing(model.pricing);
  const supportedParams = formatSupportedParameters(model.supported_parameters);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContextLength = (length: number) => {
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M tokens`;
    } else if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}K tokens`;
    }
    return `${length} tokens`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{model.name}</h1>
              <p className="text-gray-600">ID: {model.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="default"
              className={`
              ${
                tier === "premium"
                  ? "bg-purple-600"
                  : tier === "budget"
                  ? "bg-green-600"
                  : tier === "community"
                  ? "bg-blue-600"
                  : "bg-gray-600"
              }
            `}
            >
              {category} - {tier}
            </Badge>
            {capabilities.isMultimodal && (
              <Badge variant="outline" className="gap-1">
                <Eye className="w-3 h-3" />
                Multimodal
              </Badge>
            )}
            {capabilities.hasCodeCapabilities && (
              <Badge variant="outline" className="gap-1">
                <Code className="w-3 h-3" />
                Code
              </Badge>
            )}
            {capabilities.hasReasoningCapabilities && (
              <Badge variant="outline" className="gap-1">
                <Brain className="w-3 h-3" />
                Reasoning
              </Badge>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{model.description}</p>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identifiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Identifiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Model ID
              </label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                {model.id}
              </p>
            </div>
            {model.hugging_face_id && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Hugging Face ID
                </label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {model.hugging_face_id}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Created
              </label>
              <p className="text-sm">{formatDate(model.created)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Modality
              </label>
              <p className="text-sm">{capabilities.modality}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Tokenizer
              </label>
              <p className="text-sm">{capabilities.tokenizer}</p>
            </div>
            {capabilities.instructType && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Instruction Type
                </label>
                <p className="text-sm">{capabilities.instructType}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Input Modalities
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {model.architecture.input_modalities.map((modality) => (
                  <Badge key={modality} variant="secondary" className="text-xs">
                    {modality}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Output Modalities
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {model.architecture.output_modalities.map((modality) => (
                  <Badge key={modality} variant="secondary" className="text-xs">
                    {modality}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {capabilities.textInput ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Text Input</span>
            </div>
            <div className="flex items-center gap-2">
              {capabilities.imageInput ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Image Input</span>
            </div>
            <div className="flex items-center gap-2">
              {capabilities.fileInput ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">File Input</span>
            </div>
            <div className="flex items-center gap-2">
              {capabilities.hasVision ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Vision</span>
            </div>
            <div className="flex items-center gap-2">
              {capabilities.hasCodeCapabilities ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Code</span>
            </div>
            <div className="flex items-center gap-2">
              {capabilities.hasReasoningCapabilities ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Reasoning</span>
            </div>
            <div className="flex items-center gap-2">
              {limits.isModerated ? (
                <CheckCircle className="w-4 h-4 text-blue-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm">Moderated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits and Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Limits & Constraints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Context Length
              </label>
              <p className="text-sm">
                {formatContextLength(limits.contextLength)}
              </p>
            </div>
            {limits.maxCompletionTokens && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Max Completion Tokens
                </label>
                <p className="text-sm">
                  {limits.maxCompletionTokens.toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Content Moderation
              </label>
              <p className="text-sm">{limits.isModerated ? "Yes" : "No"}</p>
            </div>
            {limits.perRequestLimits &&
              Object.keys(limits.perRequestLimits).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Per-Request Limits
                  </label>
                  <div className="mt-1">
                    {Object.entries(limits.perRequestLimits).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-xs bg-gray-50 p-2 rounded mt-1"
                        >
                          <span className="font-medium">{key}:</span>{" "}
                          {String(value)}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing (per 1M tokens)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="font-medium text-gray-600">Input</label>
                <p className="font-mono">{pricing.prompt}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Output</label>
                <p className="font-mono">{pricing.completion}</p>
              </div>
              {pricing.image !== "N/A" && (
                <div>
                  <label className="font-medium text-gray-600">Image</label>
                  <p className="font-mono">{pricing.image}</p>
                </div>
              )}
              {pricing.request !== "N/A" && (
                <div>
                  <label className="font-medium text-gray-600">Request</label>
                  <p className="font-mono">{pricing.request}</p>
                </div>
              )}
              {pricing.webSearch !== "N/A" && (
                <div>
                  <label className="font-medium text-gray-600">
                    Web Search
                  </label>
                  <p className="font-mono">{pricing.webSearch}</p>
                </div>
              )}
              {pricing.internalReasoning !== "N/A" && (
                <div>
                  <label className="font-medium text-gray-600">Reasoning</label>
                  <p className="font-mono">{pricing.internalReasoning}</p>
                </div>
              )}
              {pricing.inputCacheRead !== "N/A" && (
                <div>
                  <label className="font-medium text-gray-600">
                    Cache Read
                  </label>
                  <p className="font-mono">{pricing.inputCacheRead}</p>
                </div>
              )}
              {pricing.inputCacheWrite !== "N/A" && (
                <div>
                  <label className="font-medium text-gray-600">
                    Cache Write
                  </label>
                  <p className="font-mono">{pricing.inputCacheWrite}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supported Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Supported Parameters
          </CardTitle>
          <CardDescription>
            API parameters you can use when calling this model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {supportedParams.map((param) => (
              <Badge key={param} variant="outline" className="text-xs">
                {param}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelDetailView;
