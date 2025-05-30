import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, MemoryStick, HardDrive, Zap, Monitor, Save } from 'lucide-react';

interface ModelSpec {
  name: string;
  parameters: string;
  baseVRAM: number; // GB for FP16
  minRAM: number; // GB
  category: string;
}

interface QuantizationOption {
  name: string;
  sizeMultiplier: number;
  speedMultiplier: number;
  qualityScore: number;
}

const modelSpecs: ModelSpec[] = [
  { name: 'Llama 2 7B', parameters: '7B', baseVRAM: 14, minRAM: 16, category: 'Small' },
  { name: 'Llama 2 13B', parameters: '13B', baseVRAM: 26, minRAM: 32, category: 'Medium' },
  { name: 'Llama 2 70B', parameters: '70B', baseVRAM: 140, minRAM: 160, category: 'Large' },
  { name: 'Mistral 7B', parameters: '7B', baseVRAM: 14, minRAM: 16, category: 'Small' },
  { name: 'Code Llama 34B', parameters: '34B', baseVRAM: 68, minRAM: 80, category: 'Large' },
  { name: 'Mixtral 8x7B', parameters: '47B', baseVRAM: 94, minRAM: 100, category: 'Large' },
  { name: 'Yi 34B', parameters: '34B', baseVRAM: 68, minRAM: 80, category: 'Large' },
];

const quantizationOptions: QuantizationOption[] = [
  { name: 'FP16', sizeMultiplier: 1.0, speedMultiplier: 1.0, qualityScore: 100 },
  { name: 'INT8', sizeMultiplier: 0.5, speedMultiplier: 1.2, qualityScore: 95 },
  { name: 'Q8_0', sizeMultiplier: 0.5, speedMultiplier: 1.3, qualityScore: 93 },
  { name: 'Q4_0', sizeMultiplier: 0.25, speedMultiplier: 1.8, qualityScore: 85 },
  { name: 'Q2_K', sizeMultiplier: 0.125, speedMultiplier: 2.2, qualityScore: 70 },
];

const gpuOptions = [
  { name: 'RTX 4090', vram: 24, tier: 'high' },
  { name: 'RTX 4080', vram: 16, tier: 'high' },
  { name: 'RTX 4070', vram: 12, tier: 'mid' },
  { name: 'RTX 3090', vram: 24, tier: 'high' },
  { name: 'RTX 3080', vram: 10, tier: 'mid' },
  { name: 'A100 40GB', vram: 40, tier: 'enterprise' },
  { name: 'A100 80GB', vram: 80, tier: 'enterprise' },
  { name: 'H100', vram: 80, tier: 'enterprise' },
];

const HardwareCalculator = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [quantization, setQuantization] = useState('FP16');
  const [contextLength, setContextLength] = useState([4096]);
  const [batchSize, setBatchSize] = useState([1]);
  const [calculations, setCalculations] = useState<any[]>([]);

  const currentModel = modelSpecs.find(m => m.name === selectedModel);
  const currentQuant = quantizationOptions.find(q => q.name === quantization);

  const requirements = useMemo(() => {
    if (!currentModel || !currentQuant) return null;

    // Calculate VRAM requirements
    const modelVRAM = currentModel.baseVRAM * currentQuant.sizeMultiplier;
    const kvCacheVRAM = (contextLength[0] * batchSize[0] * 2 * 32) / (1024 * 1024 * 1024); // Rough estimate
    const totalVRAM = modelVRAM + kvCacheVRAM + 2; // 2GB overhead

    // Calculate system RAM
    const systemRAM = Math.max(currentModel.minRAM, totalVRAM * 1.5);

    // Performance estimation (tokens/second)
    const basePerformance = currentModel.parameters === '7B' ? 50 : 
                           currentModel.parameters === '13B' ? 35 :
                           currentModel.parameters === '34B' ? 20 :
                           currentModel.parameters === '47B' ? 15 : 10;
    const performance = Math.round(basePerformance * currentQuant.speedMultiplier);

    // Power consumption estimate (watts)
    const basePower = totalVRAM > 24 ? 600 : totalVRAM > 16 ? 400 : 300;
    const powerConsumption = Math.round(basePower * (batchSize[0] * 0.3 + 0.7));

    // Storage requirements
    const modelSize = currentModel.baseVRAM * currentQuant.sizeMultiplier;
    const totalStorage = Math.round(modelSize * 1.2 + 10); // 20% overhead + 10GB system

    return {
      modelVRAM: Math.round(modelVRAM),
      kvCacheVRAM: Math.round(kvCacheVRAM * 10) / 10,
      totalVRAM: Math.round(totalVRAM),
      systemRAM: Math.round(systemRAM),
      performance,
      powerConsumption,
      totalStorage,
      qualityScore: currentQuant.qualityScore
    };
  }, [currentModel, currentQuant, contextLength, batchSize]);

  const getCompatibleGPUs = () => {
    if (!requirements) return [];
    return gpuOptions.filter(gpu => gpu.vram >= requirements.totalVRAM);
  };

  const saveCalculation = () => {
    if (!currentModel || !requirements) return;
    
    const calc = {
      id: Date.now(),
      model: currentModel.name,
      quantization,
      contextLength: contextLength[0],
      batchSize: batchSize[0],
      requirements,
      compatibleGPUs: getCompatibleGPUs().length,
      timestamp: new Date().toLocaleString()
    };
    
    setCalculations(prev => [calc, ...prev.slice(0, 9)]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Small': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Large': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Hardware Calculator
            </CardTitle>
            <CardDescription>
              Estimate hardware requirements for running LLMs locally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model">Model Selection</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a model to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {modelSpecs.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <div className="flex gap-1 ml-2">
                          <Badge variant="outline">{model.parameters}</Badge>
                          <Badge className={getCategoryColor(model.category)}>
                            {model.category}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantization">Quantization</Label>
              <Select value={quantization} onValueChange={setQuantization}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quantizationOptions.map((quant) => (
                    <SelectItem key={quant.name} value={quant.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{quant.name}</span>
                        <div className="flex gap-1 ml-2">
                          <Badge variant="outline">{quant.qualityScore}% quality</Badge>
                          <Badge variant="secondary">{(quant.sizeMultiplier * 100).toFixed(0)}% size</Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Context Length: {contextLength[0].toLocaleString()} tokens</Label>
                <Slider
                  value={contextLength}
                  onValueChange={setContextLength}
                  max={32768}
                  min={512}
                  step={512}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Batch Size: {batchSize[0]}</Label>
                <Slider
                  value={batchSize}
                  onValueChange={setBatchSize}
                  max={8}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <Button onClick={saveCalculation} disabled={!currentModel} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Requirements Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="w-5 h-5" />
              Hardware Requirements
            </CardTitle>
            <CardDescription>
              Estimated requirements for your configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!requirements ? (
              <div className="text-center text-gray-500 py-8">
                <Cpu className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a model to see requirements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* VRAM Requirements */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">VRAM Requirements</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="font-mono">{requirements.modelVRAM} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KV Cache:</span>
                      <span className="font-mono">{requirements.kvCacheVRAM} GB</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total VRAM:</span>
                      <span className="font-mono text-blue-700">{requirements.totalVRAM} GB</span>
                    </div>
                  </div>
                </div>

                {/* System Requirements */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <MemoryStick className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-green-700">{requirements.systemRAM} GB</div>
                    <div className="text-xs text-green-600">System RAM</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Zap className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-lg font-bold text-purple-700">{requirements.performance}</div>
                    <div className="text-xs text-purple-600">Tokens/sec</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <Zap className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                    <div className="text-lg font-bold text-orange-700">{requirements.powerConsumption}W</div>
                    <div className="text-xs text-orange-600">Power Draw</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <HardDrive className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-lg font-bold text-gray-700">{requirements.totalStorage} GB</div>
                    <div className="text-xs text-gray-600">Storage</div>
                  </div>
                </div>

                {/* Quality Score */}
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Model Quality:</span>
                    <Badge className="bg-yellow-200 text-yellow-800">
                      {requirements.qualityScore}% of FP16
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compatible GPUs */}
      {requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Compatible GPUs
            </CardTitle>
            <CardDescription>
              GPUs that can handle your configuration (≥{requirements.totalVRAM} GB VRAM)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getCompatibleGPUs().map((gpu) => (
                <div key={gpu.name} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <h4 className="font-semibold">{gpu.name}</h4>
                    <div className="text-lg font-bold text-blue-600 mt-1">{gpu.vram} GB</div>
                    <Badge className={getTierColor(gpu.tier)}>
                      {gpu.tier}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {getCompatibleGPUs().length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No compatible consumer GPUs found</p>
                <p className="text-sm">Consider using quantization or cloud solutions</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calculation History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Configurations</CardTitle>
          <CardDescription>
            Your saved hardware requirement calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Cpu className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No configurations saved yet</p>
              <p className="text-sm">Save a configuration to see it here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {calculations.map((calc) => (
                <div key={calc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{calc.model}</h4>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline">{calc.quantization}</Badge>
                        <Badge variant="secondary">{calc.contextLength.toLocaleString()} ctx</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{calc.requirements.totalVRAM} GB</div>
                      <div className="text-xs text-gray-500">VRAM needed</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                    <div>{calc.requirements.systemRAM} GB RAM</div>
                    <div>{calc.requirements.performance} tok/s</div>
                    <div>{calc.compatibleGPUs} GPUs</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{calc.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HardwareCalculator;
