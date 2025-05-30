
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Hash, FileText, Download, Upload, Image, Video, AudioLines, Calculator } from 'lucide-react';

interface TokenizerInfo {
  name: string;
  provider: string;
  avgTokensPerWord: number;
  avgCharsPerToken: number;
  description: string;
  contextWindow: number;
  outputLimit: number;
  imageTokens?: {
    small: number; // <=384px for Gemini 2.0, base rate for others
    large: number; // per tile/segment for larger images
  };
  videoTokensPerSecond?: number;
  audioTokensPerSecond?: number;
}

const tokenizers: TokenizerInfo[] = [
  { 
    name: 'GPT-4/GPT-3.5', 
    provider: 'OpenAI', 
    avgTokensPerWord: 1.3, 
    avgCharsPerToken: 4,
    description: 'OpenAI tiktoken encoder (cl100k_base)', 
    contextWindow: 128000,
    outputLimit: 4096,
    imageTokens: { small: 85, large: 170 }, // Varies by image size and detail
    videoTokensPerSecond: 0, // Not supported
    audioTokensPerSecond: 0 // Not supported in vision models
  },
  { 
    name: 'Claude 3.5/4', 
    provider: 'Anthropic', 
    avgTokensPerWord: 1.25, 
    avgCharsPerToken: 3.2,
    description: 'Anthropic tokenizer with extended thinking support', 
    contextWindow: 200000,
    outputLimit: 8192,
    imageTokens: { small: 258, large: 258 }, // Fixed rate per image
    videoTokensPerSecond: 0, // Not supported
    audioTokensPerSecond: 0 // Not supported
  },
  { 
    name: 'Gemini 2.0', 
    provider: 'Google', 
    avgTokensPerWord: 1.2, 
    avgCharsPerToken: 4,
    description: 'Google SentencePiece with multimodal support', 
    contextWindow: 1000000,
    outputLimit: 8000,
    imageTokens: { small: 258, large: 258 }, // 258 per tile (768x768)
    videoTokensPerSecond: 263,
    audioTokensPerSecond: 32
  },
  { 
    name: 'Grok-3', 
    provider: 'xAI', 
    avgTokensPerWord: 1.35, 
    avgCharsPerToken: 3.7,
    description: 'xAI Grok tokenizer with reasoning capabilities', 
    contextWindow: 131072,
    outputLimit: 4096,
    imageTokens: { small: 256, large: 1792 }, // Variable based on image size
    videoTokensPerSecond: 0, // Not specified
    audioTokensPerSecond: 0 // Not specified
  },
];

const TokenCalculator = () => {
  const [text, setText] = useState('');
  const [selectedTokenizer, setSelectedTokenizer] = useState('GPT-4/GPT-3.5');
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [multimodalContent, setMultimodalContent] = useState({
    imageCount: 0,
    imageSizeCategory: 'small' as 'small' | 'large',
    videoDurationSeconds: 0,
    audioDurationSeconds: 0
  });

  const currentTokenizer = tokenizers.find(t => t.name === selectedTokenizer);

  // Enhanced token calculation with multimodal support
  const metrics = useMemo(() => {
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    
    if (!currentTokenizer) return { characters, words, sentences, paragraphs, estimatedTokens: 0, tokenDensity: '0', breakdown: {} };
    
    // Text tokens - more accurate estimation
    let textTokens = 0;
    if (words > 0) {
      // Use character-based estimation as fallback to word-based
      const charBasedTokens = Math.ceil(characters / currentTokenizer.avgCharsPerToken);
      const wordBasedTokens = Math.ceil(words * currentTokenizer.avgTokensPerWord);
      textTokens = Math.min(charBasedTokens, wordBasedTokens);
    }
    
    // Multimodal tokens
    let imageTokens = 0;
    let videoTokens = 0;
    let audioTokens = 0;
    
    if (currentTokenizer.imageTokens && multimodalContent.imageCount > 0) {
      const tokensPerImage = multimodalContent.imageSizeCategory === 'small' 
        ? currentTokenizer.imageTokens.small 
        : currentTokenizer.imageTokens.large;
      imageTokens = multimodalContent.imageCount * tokensPerImage;
    }
    
    if (currentTokenizer.videoTokensPerSecond && multimodalContent.videoDurationSeconds > 0) {
      videoTokens = multimodalContent.videoDurationSeconds * currentTokenizer.videoTokensPerSecond;
    }
    
    if (currentTokenizer.audioTokensPerSecond && multimodalContent.audioDurationSeconds > 0) {
      audioTokens = multimodalContent.audioDurationSeconds * currentTokenizer.audioTokensPerSecond;
    }
    
    const estimatedTokens = textTokens + imageTokens + videoTokens + audioTokens;
    const contextUsagePercent = ((estimatedTokens / currentTokenizer.contextWindow) * 100).toFixed(1);
    
    return {
      characters,
      words,
      sentences,
      paragraphs,
      estimatedTokens,
      tokenDensity: words > 0 ? (textTokens / words).toFixed(2) : '0',
      breakdown: {
        textTokens,
        imageTokens,
        videoTokens,
        audioTokens
      },
      contextUsagePercent
    };
  }, [text, currentTokenizer, multimodalContent]);

  const saveAnalysis = () => {
    if (!text.trim() && !multimodalContent.imageCount && !multimodalContent.videoDurationSeconds && !multimodalContent.audioDurationSeconds) return;
    
    const analysis = {
      id: Date.now(),
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      tokenizer: selectedTokenizer,
      multimodal: multimodalContent,
      ...metrics,
      timestamp: new Date().toLocaleString()
    };
    
    setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]);
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'OpenAI': return 'bg-green-100 text-green-800';
      case 'Anthropic': return 'bg-orange-100 text-orange-800';
      case 'Google': return 'bg-blue-100 text-blue-800';
      case 'xAI': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
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
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Advanced Token Analysis
            </CardTitle>
            <CardDescription>
              Analyze text and multimodal content with provider-specific tokenization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenizer">Tokenizer</Label>
              <Select value={selectedTokenizer} onValueChange={setSelectedTokenizer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokenizers.map((tokenizer) => (
                    <SelectItem key={tokenizer.name} value={tokenizer.name}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>{tokenizer.name}</span>
                          <Badge className={`ml-2 ${getProviderColor(tokenizer.provider)}`}>
                            {tokenizer.provider}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentTokenizer && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{currentTokenizer.description}</p>
                  <p>Context: {currentTokenizer.contextWindow.toLocaleString()} tokens • Output: {currentTokenizer.outputLimit.toLocaleString()} tokens</p>
                </div>
              )}
            </div>

            {/* Multimodal Content Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Images
                </Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Number of images"
                    value={multimodalContent.imageCount || ''}
                    onChange={(e) => setMultimodalContent(prev => ({ 
                      ...prev, 
                      imageCount: parseInt(e.target.value) || 0 
                    }))}
                  />
                  <Select 
                    value={multimodalContent.imageSizeCategory} 
                    onValueChange={(value: 'small' | 'large') => 
                      setMultimodalContent(prev => ({ ...prev, imageSizeCategory: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (≤384px)</SelectItem>
                      <SelectItem value="large">Large (>384px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Duration
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Seconds"
                  value={multimodalContent.videoDurationSeconds || ''}
                  onChange={(e) => setMultimodalContent(prev => ({ 
                    ...prev, 
                    videoDurationSeconds: parseInt(e.target.value) || 0 
                  }))}
                  disabled={!currentTokenizer?.videoTokensPerSecond}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AudioLines className="w-4 h-4" />
                  Audio Duration
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Seconds"
                  value={multimodalContent.audioDurationSeconds || ''}
                  onChange={(e) => setMultimodalContent(prev => ({ 
                    ...prev, 
                    audioDurationSeconds: parseInt(e.target.value) || 0 
                  }))}
                  disabled={!currentTokenizer?.audioTokensPerSecond}
                />
              </div>
            </div>

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
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportAnalysis} disabled={!text.trim() && !multimodalContent.imageCount}>
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

            <Button onClick={saveAnalysis} disabled={!text.trim() && !multimodalContent.imageCount} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Metrics</CardTitle>
            <CardDescription>
              Accurate token analysis with multimodal support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{metrics.estimatedTokens.toLocaleString()}</div>
                <div className="text-sm text-blue-700">Total Tokens</div>
                {currentTokenizer && (
                  <div className="text-xs text-blue-600 mt-1">
                    {metrics.contextUsagePercent}% of context window
                  </div>
                )}
              </div>

              {/* Token Breakdown */}
              {(metrics.breakdown.imageTokens > 0 || metrics.breakdown.videoTokens > 0 || metrics.breakdown.audioTokens > 0) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Token Breakdown</Label>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Text:</span>
                      <span>{metrics.breakdown.textTokens.toLocaleString()}</span>
                    </div>
                    {metrics.breakdown.imageTokens > 0 && (
                      <div className="flex justify-between">
                        <span>Images:</span>
                        <span>{metrics.breakdown.imageTokens.toLocaleString()}</span>
                      </div>
                    )}
                    {metrics.breakdown.videoTokens > 0 && (
                      <div className="flex justify-between">
                        <span>Video:</span>
                        <span>{metrics.breakdown.videoTokens.toLocaleString()}</span>
                      </div>
                    )}
                    {metrics.breakdown.audioTokens > 0 && (
                      <div className="flex justify-between">
                        <span>Audio:</span>
                        <span>{metrics.breakdown.audioTokens.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">{metrics.characters.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Characters</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">{metrics.words.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Words</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">{metrics.sentences.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Sentences</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">{metrics.paragraphs.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Paragraphs</div>
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-700">{metrics.tokenDensity}</div>
                <div className="text-xs text-green-600">Tokens per Word</div>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Examples</Label>
              <div className="space-y-1">
                {[
                  "Hello, how are you today?",
                  "The quick brown fox jumps over the lazy dog.",
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left justify-start text-xs h-auto p-2"
                    onClick={() => setText(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            Your recent text and multimodal analyses with accurate token calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No analyses yet</p>
              <p className="text-sm">Save an analysis to see it here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analysisHistory.map((analysis) => (
                <div key={analysis.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">"{analysis.text}"</p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge className={getProviderColor(tokenizers.find(t => t.name === analysis.tokenizer)?.provider || '')}>
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
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{analysis.estimatedTokens.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">tokens</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
                    <div>{analysis.characters.toLocaleString()} chars</div>
                    <div>{analysis.words.toLocaleString()} words</div>
                    <div>{analysis.sentences} sentences</div>
                    <div>{analysis.tokenDensity} t/w ratio</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{analysis.timestamp}</div>
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
