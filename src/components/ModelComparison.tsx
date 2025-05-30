import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GitCompare, Star, Zap, DollarSign, Brain, Clock } from 'lucide-react';

interface ModelData {
  name: string;
  provider: string;
  parameters: string;
  contextWindow: number;
  inputCost: number; // per 1K tokens
  outputCost: number; // per 1K tokens
  speed: number; // tokens/second (relative)
  reasoning: number; // score out of 100
  coding: number; // score out of 100
  creative: number; // score out of 100
  multimodal: boolean;
  languages: number;
  category: string;
}

const modelData: ModelData[] = [
  {
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    parameters: '~1.8T',
    contextWindow: 128000,
    inputCost: 0.01,
    outputCost: 0.03,
    speed: 85,
    reasoning: 95,
    coding: 90,
    creative: 92,
    multimodal: true,
    languages: 50,
    category: 'flagship'
  },
  {
    name: 'GPT-4 Mini',
    provider: 'OpenAI',
    parameters: '~8B',
    contextWindow: 128000,
    inputCost: 0.00015,
    outputCost: 0.0006,
    speed: 120,
    reasoning: 82,
    coding: 85,
    creative: 80,
    multimodal: true,
    languages: 50,
    category: 'efficient'
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    parameters: 'Unknown',
    contextWindow: 200000,
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 75,
    reasoning: 93,
    coding: 95,
    creative: 88,
    multimodal: true,
    languages: 40,
    category: 'flagship'
  },
  {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    parameters: 'Unknown',
    contextWindow: 200000,
    inputCost: 0.015,
    outputCost: 0.075,
    speed: 45,
    reasoning: 98,
    coding: 88,
    creative: 95,
    multimodal: true,
    languages: 40,
    category: 'flagship'
  },
  {
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    parameters: 'Unknown',
    contextWindow: 200000,
    inputCost: 0.00025,
    outputCost: 0.00125,
    speed: 150,
    reasoning: 78,
    coding: 75,
    creative: 70,
    multimodal: true,
    languages: 40,
    category: 'efficient'
  },
  {
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    parameters: 'Unknown',
    contextWindow: 2000000,
    inputCost: 0.0035,
    outputCost: 0.0105,
    speed: 70,
    reasoning: 88,
    coding: 82,
    creative: 85,
    multimodal: true,
    languages: 100,
    category: 'flagship'
  },
  {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    parameters: 'Unknown',
    contextWindow: 1000000,
    inputCost: 0.000075,
    outputCost: 0.0003,
    speed: 140,
    reasoning: 80,
    coding: 78,
    creative: 75,
    multimodal: true,
    languages: 100,
    category: 'efficient'
  },
  {
    name: 'Command R+',
    provider: 'Cohere',
    parameters: '104B',
    contextWindow: 128000,
    inputCost: 0.003,
    outputCost: 0.015,
    speed: 65,
    reasoning: 85,
    coding: 80,
    creative: 82,
    multimodal: false,
    languages: 10,
    category: 'flagship'
  }
];

const ModelComparison = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4 Turbo', 'Claude 3.5 Sonnet']);
  const [sortBy, setSortBy] = useState<keyof ModelData>('reasoning');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredModels = modelData.filter(model => 
    filterCategory === 'all' || model.category === filterCategory
  );

  const sortedModels = [...filteredModels].sort((a, b) => {
    if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
      return (b[sortBy] as number) - (a[sortBy] as number);
    }
    return 0;
  });

  const toggleModelSelection = (modelName: string) => {
    setSelectedModels(prev => 
      prev.includes(modelName)
        ? prev.filter(name => name !== modelName)
        : prev.length < 4 
          ? [...prev, modelName]
          : prev
    );
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

  const getCategoryColor = (category: string) => {
    return category === 'flagship' 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-green-100 text-green-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const selectedModelData = modelData.filter(model => 
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
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory('all')}
            >
              All Models
            </Button>
            <Button
              variant={filterCategory === 'flagship' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory('flagship')}
            >
              Flagship
            </Button>
            <Button
              variant={filterCategory === 'efficient' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory('efficient')}
            >
              Efficient
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedModels.map((model) => (
              <div
                key={model.name}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedModels.includes(model.name)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
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
                      {model.parameters} • {model.contextWindow.toLocaleString()} context
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
                      <th key={model.name} className="text-center p-3 font-medium min-w-[120px]">
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
                      <td key={model.name} className="p-3 text-center">{model.parameters}</td>
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
                      <td key={model.name} className="p-3 text-center font-mono">
                        ${model.inputCost.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Output Cost (per 1K)</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center font-mono">
                        ${model.outputCost.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Speed Score</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div className={`font-semibold ${getScoreColor(model.speed)}`}>
                          {model.speed}/150
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Reasoning</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div className={`font-semibold ${getScoreColor(model.reasoning)}`}>
                          {model.reasoning}/100
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Coding</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div className={`font-semibold ${getScoreColor(model.coding)}`}>
                          {model.coding}/100
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Creative Writing</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">
                        <div className={`font-semibold ${getScoreColor(model.creative)}`}>
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
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Languages</td>
                    {selectedModelData.map((model) => (
                      <td key={model.name} className="p-3 text-center">{model.languages}+</td>
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
            <Card key={model.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <Badge className={getProviderColor(model.provider)}>
                  {model.provider}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reasoning</span>
                  <span className={`font-semibold ${getScoreColor(model.reasoning)}`}>
                    {model.reasoning}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Coding</span>
                  <span className={`font-semibold ${getScoreColor(model.coding)}`}>
                    {model.coding}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Speed</span>
                  <span className={`font-semibold ${getScoreColor(model.speed)}`}>
                    {model.speed}/150
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cost (1K out)</span>
                  <span className="font-mono text-sm">${model.outputCost.toFixed(4)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    {model.contextWindow.toLocaleString()} context • {model.languages}+ languages
                  </div>
                  {model.multimodal && (
                    <Badge variant="outline" className="mt-1">
                      Multimodal
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
