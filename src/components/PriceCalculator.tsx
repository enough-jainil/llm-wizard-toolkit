
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calculator, TrendingUp } from 'lucide-react';

interface ModelPricing {
  name: string;
  provider: string;
  inputCost: number; // per 1K tokens
  outputCost: number; // per 1K tokens
  category: string;
}

const modelPricing: ModelPricing[] = [
  { name: 'GPT-4 Turbo', provider: 'OpenAI', inputCost: 0.01, outputCost: 0.03, category: 'flagship' },
  { name: 'GPT-4', provider: 'OpenAI', inputCost: 0.03, outputCost: 0.06, category: 'flagship' },
  { name: 'GPT-4 Mini', provider: 'OpenAI', inputCost: 0.00015, outputCost: 0.0006, category: 'efficient' },
  { name: 'GPT-3.5 Turbo', provider: 'OpenAI', inputCost: 0.0015, outputCost: 0.002, category: 'efficient' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputCost: 0.003, outputCost: 0.015, category: 'flagship' },
  { name: 'Claude 3 Opus', provider: 'Anthropic', inputCost: 0.015, outputCost: 0.075, category: 'flagship' },
  { name: 'Claude 3 Haiku', provider: 'Anthropic', inputCost: 0.00025, outputCost: 0.00125, category: 'efficient' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', inputCost: 0.0035, outputCost: 0.0105, category: 'flagship' },
  { name: 'Gemini 1.5 Flash', provider: 'Google', inputCost: 0.000075, outputCost: 0.0003, category: 'efficient' },
  { name: 'Command R+', provider: 'Cohere', inputCost: 0.003, outputCost: 0.015, category: 'flagship' },
];

const PriceCalculator = () => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [inputTokens, setInputTokens] = useState<string>('1000');
  const [outputTokens, setOutputTokens] = useState<string>('500');
  const [calculations, setCalculations] = useState<any[]>([]);

  const currentModel = modelPricing.find(m => m.name === selectedModel);

  const calculateCost = () => {
    if (!currentModel || !inputTokens || !outputTokens) return 0;
    
    const inputCost = (parseInt(inputTokens) / 1000) * currentModel.inputCost;
    const outputCost = (parseInt(outputTokens) / 1000) * currentModel.outputCost;
    return inputCost + outputCost;
  };

  const addCalculation = () => {
    if (!currentModel) return;
    
    const cost = calculateCost();
    const newCalc = {
      id: Date.now(),
      model: currentModel.name,
      provider: currentModel.provider,
      inputTokens: parseInt(inputTokens),
      outputTokens: parseInt(outputTokens),
      cost: cost,
      timestamp: new Date().toLocaleString()
    };
    
    setCalculations(prev => [newCalc, ...prev.slice(0, 9)]);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Price Calculator
            </CardTitle>
            <CardDescription>
              Calculate costs for LLM API usage across different providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an LLM model" />
                </SelectTrigger>
                <SelectContent>
                  {modelPricing.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge className={`ml-2 ${getProviderColor(model.provider)}`}>
                          {model.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="input-tokens">Input Tokens</Label>
                <Input
                  id="input-tokens"
                  type="number"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="output-tokens">Output Tokens</Label>
                <Input
                  id="output-tokens"
                  type="number"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(e.target.value)}
                  placeholder="500"
                />
              </div>
            </div>

            {currentModel && (
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Input cost (per 1K tokens):</span>
                  <span className="font-mono">${currentModel.inputCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Output cost (per 1K tokens):</span>
                  <span className="font-mono">${currentModel.outputCost.toFixed(4)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Cost:</span>
                    <span className="text-green-600 font-mono">${calculateCost().toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={addCalculation} className="w-full" disabled={!currentModel}>
              <DollarSign className="w-4 h-4 mr-2" />
              Add to Calculations
            </Button>
          </CardContent>
        </Card>

        {/* Recent Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Calculations
            </CardTitle>
            <CardDescription>
              Your recent cost calculations and comparisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No calculations yet</p>
                <p className="text-sm">Add a calculation to see it here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {calculations.map((calc) => (
                  <div key={calc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{calc.model}</h4>
                        <Badge className={`text-xs ${getProviderColor(calc.provider)}`}>
                          {calc.provider}
                        </Badge>
                      </div>
                      <span className="font-mono text-lg font-bold text-green-600">
                        ${calc.cost.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                      <span>Input: {calc.inputTokens.toLocaleString()} tokens</span>
                      <span>Output: {calc.outputTokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{calc.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model Pricing Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Model Pricing Overview</CardTitle>
          <CardDescription>
            Compare pricing across different LLM providers and models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Model</th>
                  <th className="text-left p-2">Provider</th>
                  <th className="text-right p-2">Input (per 1K)</th>
                  <th className="text-right p-2">Output (per 1K)</th>
                  <th className="text-center p-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {modelPricing.map((model) => (
                  <tr key={model.name} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{model.name}</td>
                    <td className="p-2">
                      <Badge className={getProviderColor(model.provider)}>
                        {model.provider}
                      </Badge>
                    </td>
                    <td className="p-2 text-right font-mono">${model.inputCost.toFixed(4)}</td>
                    <td className="p-2 text-right font-mono">${model.outputCost.toFixed(4)}</td>
                    <td className="p-2 text-center">
                      <Badge variant={model.category === 'flagship' ? 'default' : 'secondary'}>
                        {model.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCalculator;
