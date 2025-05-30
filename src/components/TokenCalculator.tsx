
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, FileText, Download, Upload } from 'lucide-react';

interface TokenizerInfo {
  name: string;
  provider: string;
  avgTokensPerWord: number;
  description: string;
}

const tokenizers: TokenizerInfo[] = [
  { name: 'GPT-4/GPT-3.5', provider: 'OpenAI', avgTokensPerWord: 1.3, description: 'OpenAI tiktoken encoder' },
  { name: 'Claude', provider: 'Anthropic', avgTokensPerWord: 1.25, description: 'Anthropic tokenizer' },
  { name: 'Gemini', provider: 'Google', avgTokensPerWord: 1.2, description: 'Google SentencePiece' },
  { name: 'Command', provider: 'Cohere', avgTokensPerWord: 1.35, description: 'Cohere tokenizer' },
];

const TokenCalculator = () => {
  const [text, setText] = useState('');
  const [selectedTokenizer, setSelectedTokenizer] = useState('GPT-4/GPT-3.5');
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  const currentTokenizer = tokenizers.find(t => t.name === selectedTokenizer);

  // Calculate metrics in real-time
  const metrics = useMemo(() => {
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    
    // Estimate tokens based on the selected tokenizer
    const estimatedTokens = currentTokenizer ? Math.ceil(words * currentTokenizer.avgTokensPerWord) : 0;
    
    return {
      characters,
      words,
      sentences,
      paragraphs,
      estimatedTokens,
      tokenDensity: words > 0 ? (estimatedTokens / words).toFixed(2) : '0'
    };
  }, [text, currentTokenizer]);

  const saveAnalysis = () => {
    if (!text.trim()) return;
    
    const analysis = {
      id: Date.now(),
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      tokenizer: selectedTokenizer,
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
      case 'Cohere': return 'bg-purple-100 text-purple-800';
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
              Text Analysis
            </CardTitle>
            <CardDescription>
              Enter or paste text to analyze token count and other metrics
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
                <p className="text-xs text-gray-600">{currentTokenizer.description}</p>
              )}
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
                  <Button variant="outline" size="sm" onClick={exportAnalysis} disabled={!text.trim()}>
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
                className="min-h-[300px] resize-none"
              />
            </div>

            <Button onClick={saveAnalysis} disabled={!text.trim()} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Live Metrics</CardTitle>
            <CardDescription>
              Real-time analysis as you type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{metrics.estimatedTokens.toLocaleString()}</div>
                <div className="text-sm text-blue-700">Estimated Tokens</div>
              </div>

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
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
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
            Your recent text analyses and token calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Hash className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                      <Badge className={getProviderColor(tokenizers.find(t => t.name === analysis.tokenizer)?.provider || '')}>
                        {analysis.tokenizer}
                      </Badge>
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
