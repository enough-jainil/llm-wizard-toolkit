import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Hash,
  FileText,
  Download,
  Upload,
  Image,
  Video,
  AudioLines,
  Calculator,
  AlertCircle,
  CheckCircle,
  Search,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { get_encoding, encoding_for_model, Tiktoken } from "tiktoken";
import { useOpenRouterModelComparison } from "@/hooks/useOpenRouterModelComparison";

interface AnalysisEntry {
  id: number;
  text: string; // truncated
  tokenizer: string;
  multimodal: {
    imageCount: number;
    imageSizeCategory: "small" | "large";
    videoDurationSeconds: number;
    audioDurationSeconds: number;
  };
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  estimatedTokens: number;
  tokenDensity: string;
  breakdown: {
    textTokens: number;
    imageTokens: number;
    videoTokens: number;
    audioTokens: number;
  };
  contextUsagePercent: string;
  estimatedCost: number;
  timestamp: string;
}

interface TokenizerInfo {
  name: string;
  provider: string;
  avgTokensPerWord: number;
  avgCharsPerToken: number;
  description: string;
  contextWindow: number;
  outputLimit: number;
  imageTokens?: {
    small: number;
    large: number;
  };
  imageTokenizationMode?: "fixed" | "formula" | "none";
  videoTokensPerSecond?: number;
  audioTokensPerSecond?: number;
  tokenizerType: string;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  license?: string;
}

// Initialize o200k_base encoder for OpenAI models that use it (GPT-4o, GPT-4.1 variants, o3, o4-mini)
// We are doing this outside the component to avoid re-initializing on every render.
// Ensure this specific encoding name is correct for your models.
let o200kEncoder: Tiktoken | null = null;
try {
  o200kEncoder = encoding_for_model("gpt-4o"); // or get_encoding("o200k_base")
} catch (e) {
  console.error("Failed to initialize o200k_base tiktoken encoder:", e);
  // Fallback or error handling if encoder can't be initialized
}

// Convert OpenRouter model to TokenizerInfo
const convertToTokenizerInfo = (model: {
  name: string;
  provider: string;
  contextWindow: number;
  inputCost: number;
  outputCost: number;
  multimodal: boolean;
  parameters: string;
  speed: number;
  reasoning: number;
  coding: number;
  creative: number;
  languages: number;
  category: string;
  license?: string;
}): TokenizerInfo => {
  // Extract provider from model ID
  const provider = model.provider || "Unknown";

  // Estimate tokens per word and chars per token based on provider
  let avgTokensPerWord = 1.3;
  let avgCharsPerToken = 4;
  let tokenizerType = "BPE";

  switch (provider) {
    case "OpenAI":
      avgTokensPerWord = 1.3;
      avgCharsPerToken = 4;
      tokenizerType = "tiktoken (o200k_base)";
      break;
    case "Anthropic":
      avgTokensPerWord = 1.2;
      avgCharsPerToken = 4.2;
      tokenizerType = "Claude tokenizer";
      break;
    case "Google":
      avgTokensPerWord = 1.1;
      avgCharsPerToken = 4.5;
      tokenizerType = "SentencePiece";
      break;
    case "xAI":
      avgTokensPerWord = 1.35;
      avgCharsPerToken = 3.8;
      tokenizerType = "Grok tokenizer";
      break;
    default:
      avgTokensPerWord = 1.3;
      avgCharsPerToken = 4;
      tokenizerType = "BPE";
  }

  // Set multimodal capabilities based on provider and model
  let imageTokens: { small: number; large: number } | undefined;
  let imageTokenizationMode: "fixed" | "formula" | "none" | undefined;
  let videoTokensPerSecond: number | undefined;
  let audioTokensPerSecond: number | undefined;

  if (model.multimodal) {
    switch (provider) {
      case "OpenAI":
        imageTokens = { small: 85, large: 170 };
        imageTokenizationMode = "fixed";
        break;
      case "Anthropic":
        // Claude uses formula: (width * height) / 750
        imageTokenizationMode = "formula";
        break;
      case "Google":
        imageTokens = { small: 258, large: 516 };
        imageTokenizationMode = "fixed";
        break;
      case "xAI":
        imageTokens = { small: 896, large: 1792 };
        imageTokenizationMode = "fixed";
        break;
      default:
        imageTokens = { small: 100, large: 200 };
        imageTokenizationMode = "fixed";
    }
  }

  return {
    name: model.name,
    provider: provider,
    avgTokensPerWord,
    avgCharsPerToken,
    description: `${
      model.name
    } - ${provider} tokenizer with ${model.contextWindow.toLocaleString()} token context`,
    contextWindow: model.contextWindow,
    outputLimit: Math.min(model.contextWindow, 4096), // Conservative output limit
    imageTokens,
    imageTokenizationMode,
    videoTokensPerSecond,
    audioTokensPerSecond,
    tokenizerType,
    costPer1kTokens: {
      input: model.inputCost,
      output: model.outputCost,
    },
    license: model.license,
  };
};

const TokenCalculator = () => {
  // Use OpenRouter models hook
  const { models: openRouterModels, isLoading: isLoadingModels } =
    useOpenRouterModelComparison();

  // Convert OpenRouter models to tokenizer info
  const tokenizers: TokenizerInfo[] = openRouterModels.map(
    convertToTokenizerInfo
  );

  const [text, setText] = useState("");
  const [selectedTokenizer, setSelectedTokenizer] = useState(""); // Will be set when models load
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisEntry[]>([]);
  const [historySearchTerm, setHistorySearchTerm] = useState<string>("");
  const [isTokenizerSelectOpen, setIsTokenizerSelectOpen] =
    useState<boolean>(false);
  const [multimodalContent, setMultimodalContent] = useState({
    imageCount: 0,
    imageSizeCategory: "small" as "small" | "large",
    imageWidth: 1024,
    imageHeight: 1024,
    videoDurationSeconds: 0,
    audioDurationSeconds: 0,
  });
  const [expectedOutputWords, setExpectedOutputWords] = useState(0);

  const currentTokenizer = tokenizers.find((t) => t.name === selectedTokenizer);

  // Set default tokenizer when models load
  useEffect(() => {
    if (tokenizers.length > 0 && !selectedTokenizer) {
      // Try to find GPT-4o or similar, otherwise use first available
      const defaultTokenizer =
        tokenizers.find(
          (t) =>
            t.name.toLowerCase().includes("gpt-4o") ||
            t.name.toLowerCase().includes("gpt-4")
        ) || tokenizers[0];

      setSelectedTokenizer(defaultTokenizer.name);
    }
  }, [tokenizers, selectedTokenizer]);

  const clearHistorySearch = () => {
    setHistorySearchTerm("");
  };

  // Filter analysis history based on search term
  const filteredAnalysisHistory = analysisHistory.filter((analysis) => {
    if (!historySearchTerm) return true;

    const searchLower = historySearchTerm.toLowerCase();
    return (
      analysis.text.toLowerCase().includes(searchLower) ||
      analysis.tokenizer.toLowerCase().includes(searchLower) ||
      tokenizers
        .find((t) => t.name === analysis.tokenizer)
        ?.provider.toLowerCase()
        .includes(searchLower)
    );
  });

  // Enhanced token calculation with provider-specific accuracy
  const metrics = useMemo(() => {
    const characters = text.length;
    const words = text.trim()
      ? text
          .trim()
          .split(/\W+/)
          .filter((w) => w.length > 0).length
      : 0;
    const sentences = text.trim()
      ? text.split(/[.!?]+/).filter((s) => s.trim()).length
      : 0;
    const paragraphs = text.trim()
      ? text.split(/\n\s*\n/).filter((p) => p.trim()).length
      : 0;

    if (!currentTokenizer)
      return {
        characters,
        words,
        sentences,
        paragraphs,
        estimatedTokens: 0,
        tokenDensity: "0",
        breakdown: {
          textTokens: 0,
          imageTokens: 0,
          videoTokens: 0,
          audioTokens: 0,
        },
        contextUsagePercent: "0",
        estimatedCost: 0,
      };

    // Provider-specific text tokenization
    let textTokens = 0;
    if (words > 0) {
      if (currentTokenizer.provider === "OpenAI" && o200kEncoder) {
        // Use tiktoken for OpenAI models
        try {
          textTokens = o200kEncoder.encode(text).length;
        } catch (error) {
          console.error("Error encoding text with tiktoken:", error);
          // Fallback to heuristic if tiktoken fails for some reason during encoding
          textTokens = Math.ceil(
            words * currentTokenizer.avgTokensPerWord * 0.95
          );
        }
      } else {
        // Improved heuristic for other providers
        const baseTokens = words * currentTokenizer.avgTokensPerWord;
        const charAdjustment = characters / currentTokenizer.avgCharsPerToken;
        let multiplier = 1;
        switch (currentTokenizer.provider) {
          case "Anthropic":
            multiplier = 0.9;
            break;
          case "Google":
            multiplier = 0.85;
            break;
          case "xAI":
            multiplier = 1.05;
            break;
        }
        textTokens = Math.ceil(
          (baseTokens * 0.7 + charAdjustment * 0.3) * multiplier
        );
      }

      // Character-based fallback for very short or non-standard text (applies if not OpenAI or if tiktoken failed)
      if (currentTokenizer.provider !== "OpenAI") {
        // Or if tiktoken failed, this path is taken.
        const charBasedTokens = Math.ceil(
          characters / currentTokenizer.avgCharsPerToken
        );
        textTokens = Math.max(textTokens, charBasedTokens);
      }
    }

    // Multimodal token calculations
    let imageTokens = 0;
    let videoTokens = 0;
    let audioTokens = 0;

    if (multimodalContent.imageCount > 0 && currentTokenizer) {
      if (
        currentTokenizer.provider === "Anthropic" &&
        currentTokenizer.imageTokenizationMode === "formula"
      ) {
        if (
          multimodalContent.imageWidth > 0 &&
          multimodalContent.imageHeight > 0
        ) {
          imageTokens =
            Math.ceil(
              (multimodalContent.imageWidth * multimodalContent.imageHeight) /
                750
            ) * multimodalContent.imageCount;
        }
      } else if (currentTokenizer.imageTokens) {
        const tokensPerImage =
          multimodalContent.imageSizeCategory === "small"
            ? currentTokenizer.imageTokens.small
            : currentTokenizer.imageTokens.large *
              (currentTokenizer.provider === "xAI"
                ? 1792 / currentTokenizer.imageTokens.large
                : 1);
        imageTokens = multimodalContent.imageCount * tokensPerImage;
      }
    }

    if (
      currentTokenizer.videoTokensPerSecond &&
      multimodalContent.videoDurationSeconds > 0
    ) {
      videoTokens =
        multimodalContent.videoDurationSeconds *
        currentTokenizer.videoTokensPerSecond;
    }

    if (
      currentTokenizer.audioTokensPerSecond &&
      multimodalContent.audioDurationSeconds > 0
    ) {
      audioTokens =
        multimodalContent.audioDurationSeconds *
        currentTokenizer.audioTokensPerSecond;
    }

    const estimatedTokens =
      textTokens + imageTokens + videoTokens + audioTokens;
    const contextUsagePercent = (
      (estimatedTokens / currentTokenizer.contextWindow) *
      100
    ).toFixed(1);

    // Cost estimation
    let estimatedCost = 0;
    if (currentTokenizer.costPer1kTokens) {
      const inputCost =
        (estimatedTokens / 1000) * currentTokenizer.costPer1kTokens.input;
      const outputTokensEstimate = Math.ceil(
        expectedOutputWords * currentTokenizer.avgTokensPerWord
      );
      const outputCost =
        (outputTokensEstimate / 1000) * currentTokenizer.costPer1kTokens.output;
      estimatedCost = inputCost + outputCost;
    }

    return {
      characters,
      words,
      sentences,
      paragraphs,
      estimatedTokens,
      tokenDensity: words > 0 ? (textTokens / words).toFixed(2) : "0",
      breakdown: {
        textTokens,
        imageTokens,
        videoTokens,
        audioTokens,
      },
      contextUsagePercent,
      estimatedCost,
    };
  }, [text, currentTokenizer, multimodalContent, expectedOutputWords]);

  const saveAnalysis = () => {
    if (
      !text.trim() &&
      !multimodalContent.imageCount &&
      !multimodalContent.videoDurationSeconds &&
      !multimodalContent.audioDurationSeconds
    )
      return;

    const analysis = {
      id: Date.now(),
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      tokenizer: selectedTokenizer,
      multimodal: multimodalContent,
      ...metrics,
      timestamp: new Date().toLocaleString(),
    };

    setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 9)]);
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return "bg-green-100 text-green-800";
      case "Anthropic":
        return "bg-orange-100 text-orange-800";
      case "Google":
        return "bg-blue-100 text-blue-800";
      case "xAI":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContextUsageColor = (usage: string) => {
    const percent = parseFloat(usage);
    if (percent < 50) return "text-green-600";
    if (percent < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const exportAnalysis = () => {
    const data = {
      text: text,
      tokenizer: selectedTokenizer,
      multimodal: multimodalContent,
      analysis: metrics,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `token-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickExamples = [
    "Hello, how are you today?",
    "The quick brown fox jumps over the lazy dog.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Write a Python function to calculate the Fibonacci sequence up to n terms.",
    "Explain quantum computing in simple terms that a high school student would understand.",
  ];

  // Effect to free the encoder when the component unmounts
  useEffect(() => {
    return () => {
      if (o200kEncoder && typeof o200kEncoder.free === "function") {
        o200kEncoder.free();
      }
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Text Input and Controls */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Hash className="w-5 h-5" />
              Enhanced Token Calculator
            </CardTitle>
            <CardDescription>
              Provider-specific tokenization with multimodal support and cost
              estimation
              {isLoadingModels && " • Loading models..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tokenizer Selection */}
            <div className="space-y-2">
              <Label htmlFor="tokenizer">AI Model / Tokenizer</Label>
              <Popover
                open={isTokenizerSelectOpen}
                onOpenChange={setIsTokenizerSelectOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isTokenizerSelectOpen}
                    className="w-full justify-between h-auto min-h-[44px] text-left"
                    disabled={isLoadingModels}
                  >
                    <span className="truncate">
                      {selectedTokenizer
                        ? tokenizers.find(
                            (tokenizer) => tokenizer.name === selectedTokenizer
                          )?.name
                        : isLoadingModels
                        ? "Loading models..."
                        : "Choose a tokenizer..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search tokenizers by name, provider, or description..." />
                    <CommandList>
                      <CommandEmpty>No tokenizers found.</CommandEmpty>
                      <CommandGroup>
                        {tokenizers.map((tokenizer) => (
                          <CommandItem
                            key={tokenizer.name}
                            value={`${tokenizer.name} ${tokenizer.provider} ${tokenizer.description} ${tokenizer.tokenizerType}`}
                            onSelect={() => {
                              setSelectedTokenizer(tokenizer.name);
                              setIsTokenizerSelectOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                selectedTokenizer === tokenizer.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1 sm:gap-2">
                              <span className="truncate">{tokenizer.name}</span>
                              <Badge
                                className={`self-start sm:self-auto text-xs ${getProviderColor(
                                  tokenizer.provider
                                )}`}
                              >
                                {tokenizer.provider}
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Enhanced Tokenizer Info */}
            {currentTokenizer && (
              <div className="text-xs text-gray-600 space-y-1 p-3 bg-gray-50 rounded-lg">
                <p>
                  <strong>Description:</strong> {currentTokenizer.description}
                </p>
                <p>
                  <strong>Type:</strong> {currentTokenizer.tokenizerType}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <p>
                    <strong>Context:</strong>{" "}
                    {currentTokenizer.contextWindow.toLocaleString()} tokens
                  </p>
                  <p>
                    <strong>Output:</strong>{" "}
                    {currentTokenizer.outputLimit.toLocaleString()} tokens
                  </p>
                </div>
                {currentTokenizer.costPer1kTokens && (
                  <p>
                    <strong>Cost:</strong> $
                    {currentTokenizer.costPer1kTokens.input}/1k input, $
                    {currentTokenizer.costPer1kTokens.output}/1k output
                  </p>
                )}
                {currentTokenizer.costPer1kTokens && (
                  <p className="text-xs text-gray-500">
                    <strong>(Per 1M):</strong> $
                    {(currentTokenizer.costPer1kTokens.input * 1000).toFixed(2)}
                    /1M input, $
                    {(currentTokenizer.costPer1kTokens.output * 1000).toFixed(
                      2
                    )}
                    /1M output
                  </p>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                  {currentTokenizer.imageTokens && (
                    <Badge variant="outline" className="text-xs">
                      Images: {currentTokenizer.imageTokens.small}-
                      {currentTokenizer.imageTokens.large} tokens
                    </Badge>
                  )}
                  {currentTokenizer.videoTokensPerSecond ? (
                    <Badge variant="outline" className="text-xs">
                      Video: {currentTokenizer.videoTokensPerSecond}/sec
                    </Badge>
                  ) : null}
                  {currentTokenizer.audioTokensPerSecond ? (
                    <Badge variant="outline" className="text-xs">
                      Audio: {currentTokenizer.audioTokensPerSecond}/sec
                    </Badge>
                  ) : null}
                </div>
              </div>
            )}

            {/* Multimodal Content Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Images
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Count"
                  value={multimodalContent.imageCount || ""}
                  onChange={(e) =>
                    setMultimodalContent((prev) => ({
                      ...prev,
                      imageCount: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="h-11"
                  // Disabled if Anthropic has 0 width/height, or other providers have no imageToken support
                  disabled={
                    currentTokenizer?.provider === "Anthropic"
                      ? multimodalContent.imageWidth === 0 ||
                        multimodalContent.imageHeight === 0
                      : !currentTokenizer?.imageTokens
                  }
                />
                {currentTokenizer?.provider === "Anthropic" &&
                currentTokenizer.imageTokenizationMode === "formula" ? (
                  <div className="space-y-2 mt-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Width (px)"
                      value={multimodalContent.imageWidth || ""}
                      onChange={(e) =>
                        setMultimodalContent((prev) => ({
                          ...prev,
                          imageWidth: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="h-11"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Height (px)"
                      value={multimodalContent.imageHeight || ""}
                      onChange={(e) =>
                        setMultimodalContent((prev) => ({
                          ...prev,
                          imageHeight: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                ) : currentTokenizer?.provider === "OpenAI" ? (
                  <Select
                    value={multimodalContent.imageSizeCategory}
                    onValueChange={(value: "small" | "large") =>
                      setMultimodalContent((prev) => ({
                        ...prev,
                        imageSizeCategory: value,
                      }))
                    }
                    disabled={!currentTokenizer?.imageTokens}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (≤384px)</SelectItem>
                      <SelectItem value="large">Large ({">"}384px)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-gray-500">
                    Image sizing not applicable or supported.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video (seconds)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Duration"
                  value={multimodalContent.videoDurationSeconds || ""}
                  onChange={(e) =>
                    setMultimodalContent((prev) => ({
                      ...prev,
                      videoDurationSeconds: parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={!currentTokenizer?.videoTokensPerSecond}
                />
                {!currentTokenizer?.videoTokensPerSecond && (
                  <p className="text-xs text-gray-500">Not supported</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AudioLines className="w-4 h-4" />
                  Audio (seconds)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Duration"
                  value={multimodalContent.audioDurationSeconds || ""}
                  onChange={(e) =>
                    setMultimodalContent((prev) => ({
                      ...prev,
                      audioDurationSeconds: parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={!currentTokenizer?.audioTokensPerSecond}
                />
                {!currentTokenizer?.audioTokensPerSecond && (
                  <p className="text-xs text-gray-500">Not supported</p>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-input">Text Content</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportAnalysis}
                    disabled={!text.trim() && !multimodalContent.imageCount}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              <Textarea
                id="text-input"
                placeholder="Enter your text here to analyze tokens, characters, words, and more..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Quick Examples */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Examples</Label>
              <div className="flex flex-wrap gap-2">
                {quickExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-left justify-start text-xs h-auto p-2 max-w-48"
                    onClick={() => setText(example)}
                  >
                    {example.length > 40
                      ? example.substring(0, 40) + "..."
                      : example}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={saveAnalysis}
              disabled={!text.trim() && !multimodalContent.imageCount}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Metrics Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Provider-specific tokenization metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Token Count */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.estimatedTokens.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Total Tokens</div>
              {currentTokenizer && (
                <div
                  className={`text-xs mt-1 font-medium ${getContextUsageColor(
                    metrics.contextUsagePercent
                  )}`}
                >
                  {metrics.contextUsagePercent}% of context window
                </div>
              )}
              {currentTokenizer &&
                parseFloat(metrics.contextUsagePercent) > 90 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      Near context limit
                    </span>
                  </div>
                )}
            </div>

            {/* Cost Estimation */}
            {currentTokenizer?.costPer1kTokens &&
              (metrics.estimatedTokens > 0 || expectedOutputWords > 0) && (
                <div className="text-center p-3 bg-green-50 rounded-lg border">
                  <div className="text-lg font-semibold text-green-700">
                    ${metrics.estimatedCost.toFixed(4)}
                  </div>
                  <div className="text-xs text-green-600">
                    Estimated total cost (input + output)
                  </div>
                </div>
              )}

            {/* Expected Output Input */}
            {currentTokenizer?.costPer1kTokens &&
              currentTokenizer.costPer1kTokens.output > 0 && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <Label
                    htmlFor="expected-output-words"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <Calculator className="w-4 h-4 text-gray-600" />
                    Expected Output Words (for cost calc)
                  </Label>
                  <Input
                    id="expected-output-words"
                    type="number"
                    min="0"
                    placeholder="e.g., 500"
                    value={expectedOutputWords || ""}
                    onChange={(e) =>
                      setExpectedOutputWords(parseInt(e.target.value) || 0)
                    }
                  />
                  {expectedOutputWords > 0 &&
                    currentTokenizer.avgTokensPerWord && (
                      <p className="text-xs text-gray-500">
                        Estimating approx.{" "}
                        {Math.ceil(
                          expectedOutputWords *
                            currentTokenizer.avgTokensPerWord
                        )}{" "}
                        output tokens.
                      </p>
                    )}
                </div>
              )}

            {/* Token Breakdown */}
            {(metrics.breakdown.imageTokens > 0 ||
              metrics.breakdown.videoTokens > 0 ||
              metrics.breakdown.audioTokens > 0) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Token Breakdown</Label>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Text:</span>
                    <span className="font-medium">
                      {metrics.breakdown.textTokens.toLocaleString()}
                    </span>
                  </div>
                  {metrics.breakdown.imageTokens > 0 && (
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span className="font-medium">
                        {metrics.breakdown.imageTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {metrics.breakdown.videoTokens > 0 && (
                    <div className="flex justify-between">
                      <span>Video:</span>
                      <span className="font-medium">
                        {metrics.breakdown.videoTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {metrics.breakdown.audioTokens > 0 && (
                    <div className="flex justify-between">
                      <span>Audio:</span>
                      <span className="font-medium">
                        {metrics.breakdown.audioTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Basic Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.characters.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Characters</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.words.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.sentences.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Sentences</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold">
                  {metrics.paragraphs.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Paragraphs</div>
              </div>
            </div>

            {/* Token Density */}
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-lg font-semibold text-indigo-700">
                {metrics.tokenDensity}
              </div>
              <div className="text-xs text-indigo-600">Tokens per Word</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            Recent analyses with provider-specific token calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisHistory.length > 0 && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search analysis history..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {historySearchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={clearHistorySearch}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {historySearchTerm && (
                <div className="text-xs text-gray-600 mt-2">
                  Showing {filteredAnalysisHistory.length} of{" "}
                  {analysisHistory.length} analyses
                </div>
              )}
            </div>
          )}

          {analysisHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No analyses yet</p>
              <p className="text-sm">Save an analysis to see it here</p>
            </div>
          ) : filteredAnalysisHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No analyses found</p>
              <p className="text-sm">Try adjusting your search term</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAnalysisHistory.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        "{analysis.text}"
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge
                          className={getProviderColor(
                            tokenizers.find(
                              (t) => t.name === analysis.tokenizer
                            )?.provider || ""
                          )}
                        >
                          {analysis.tokenizer}
                        </Badge>
                        {analysis.multimodal?.imageCount > 0 && (
                          <Badge variant="outline">
                            {analysis.multimodal.imageCount} images
                          </Badge>
                        )}
                        {analysis.multimodal?.videoDurationSeconds > 0 && (
                          <Badge variant="outline">
                            {analysis.multimodal.videoDurationSeconds}s video
                          </Badge>
                        )}
                        {analysis.multimodal?.audioDurationSeconds > 0 && (
                          <Badge variant="outline">
                            {analysis.multimodal.audioDurationSeconds}s audio
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {analysis.estimatedTokens.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">tokens</div>
                      {analysis.estimatedCost > 0 && (
                        <div className="text-xs text-green-600">
                          ${analysis.estimatedCost.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
                    <div>{analysis.characters.toLocaleString()} chars</div>
                    <div>{analysis.words.toLocaleString()} words</div>
                    <div>{analysis.sentences} sentences</div>
                    <div>{analysis.tokenDensity} t/w ratio</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {analysis.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenCalculator;
