import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Zap,
  Monitor,
  Save,
  Info,
} from "lucide-react";

interface QuantizationOption {
  name: string;
  sizeMultiplier: number;
  speedMultiplier: number;
  qualityScore: number;
}

interface SystemType {
  name: string;
  value: string;
}

interface CalculationRecord {
  id: number;
  parameters: number;
  modelQuantization: string;
  contextLength: number;
  enableKvCache: boolean;
  kvCacheQuantization: string | null;
  systemType: string;
  gpuVram: number;
  systemMemory: number;
  requirements: {
    modelVRAM: number;
    kvCacheVRAM: number;
    overhead: number;
    totalVRAM: number;
    onDiskSize: number;
    systemRAM: number;
    performance: number;
    powerConsumption: number;
    gpuConfig: string;
    requiredGPUs: number;
    qualityScore: number;
  };
  timestamp: string;
}

const quantizationOptions: QuantizationOption[] = [
  { name: "F32", sizeMultiplier: 2.0, speedMultiplier: 0.8, qualityScore: 100 },
  { name: "F16", sizeMultiplier: 1.0, speedMultiplier: 1.0, qualityScore: 100 },
  { name: "Q8", sizeMultiplier: 0.5, speedMultiplier: 1.2, qualityScore: 95 },
  { name: "Q6", sizeMultiplier: 0.375, speedMultiplier: 1.4, qualityScore: 90 },
  {
    name: "Q5",
    sizeMultiplier: 0.3125,
    speedMultiplier: 1.6,
    qualityScore: 87,
  },
  { name: "Q4", sizeMultiplier: 0.25, speedMultiplier: 1.8, qualityScore: 85 },
  {
    name: "Q3",
    sizeMultiplier: 0.1875,
    speedMultiplier: 2.0,
    qualityScore: 75,
  },
  { name: "Q2", sizeMultiplier: 0.125, speedMultiplier: 2.2, qualityScore: 70 },
  {
    name: "GPTQ",
    sizeMultiplier: 0.25,
    speedMultiplier: 1.9,
    qualityScore: 88,
  },
  { name: "AWQ", sizeMultiplier: 0.25, speedMultiplier: 2.0, qualityScore: 89 },
];

const kvCacheQuantOptions: QuantizationOption[] = [
  { name: "F32", sizeMultiplier: 2.0, speedMultiplier: 1.0, qualityScore: 100 },
  { name: "F16", sizeMultiplier: 1.0, speedMultiplier: 1.0, qualityScore: 100 },
  { name: "Q8", sizeMultiplier: 0.5, speedMultiplier: 1.1, qualityScore: 95 },
  {
    name: "Q5",
    sizeMultiplier: 0.3125,
    speedMultiplier: 1.2,
    qualityScore: 87,
  },
  { name: "Q4", sizeMultiplier: 0.25, speedMultiplier: 1.3, qualityScore: 85 },
];

const systemTypes: SystemType[] = [
  { name: "Discrete GPU", value: "DISCRETE_GPU" },
  {
    name: "Unified Memory (Apple Silicon, AMD Ryzen™ AI Max+ 395)",
    value: "UNIFIED_MEMORY",
  },
];

const gpuVramOptions = [8, 12, 16, 20, 24, 32, 40, 48, 80];

const HardwareCalculator = () => {
  const [parameters, setParameters] = useState(65);
  const [modelQuantization, setModelQuantization] = useState("F16");
  const [contextLength, setContextLength] = useState([4096]);
  const [inferenceMode, setInferenceMode] = useState("incremental");
  const [enableKvCache, setEnableKvCache] = useState(false);
  const [kvCacheQuantization, setKvCacheQuantization] = useState("F16");
  const [systemType, setSystemType] = useState("DISCRETE_GPU");
  const [gpuVram, setGpuVram] = useState(24);
  const [systemMemory, setSystemMemory] = useState([128]);
  const [calculations, setCalculations] = useState<CalculationRecord[]>([]);

  const currentModelQuant = quantizationOptions.find(
    (q) => q.name === modelQuantization
  );
  const currentKvQuant = kvCacheQuantOptions.find(
    (q) => q.name === kvCacheQuantization
  );

  const requirements = useMemo(() => {
    if (!currentModelQuant) return null;

    // Calculate model VRAM (2 bytes per parameter for F16 baseline)
    const baseModelSize = parameters * 2; // GB for F16
    const modelVRAM = baseModelSize * currentModelQuant.sizeMultiplier;

    // Calculate KV Cache VRAM
    let kvCacheVRAM = 0;
    if (enableKvCache && currentKvQuant) {
      // Simplified KV cache calculation: (context_length * hidden_size * layers * 2) / (1024^3)
      // Approximation: ~0.5GB per 1B params per 1K context for F16
      const kvBaseSize = (parameters * contextLength[0] * 0.5) / 1000;
      kvCacheVRAM = kvBaseSize * currentKvQuant.sizeMultiplier;
    }

    // Overhead for inference (activation memory, etc.)
    const overhead = Math.max(2, parameters * 0.05); // At least 2GB, or 5% of model size

    const totalVRAM = modelVRAM + kvCacheVRAM + overhead;

    // On-disk storage (model file size)
    const onDiskSize = modelVRAM * 1.1; // 10% overhead for file format

    // System RAM requirements
    let systemRAM;
    if (systemType === "UNIFIED_MEMORY") {
      systemRAM = totalVRAM + 8; // Unified memory needs space for model + system
    } else {
      systemRAM = Math.max(16, totalVRAM * 0.5); // At least 16GB, or 50% of VRAM for discrete GPU
    }

    // Performance estimation (tokens/second)
    const basePerformance = Math.max(5, 100 - (parameters - 7) * 2); // Rough approximation
    const performance = Math.round(
      basePerformance * currentModelQuant.speedMultiplier
    );

    // GPU configuration suggestion
    let gpuConfig = "1x GPU";
    let requiredGPUs = 1;
    if (totalVRAM > gpuVram) {
      requiredGPUs = Math.ceil(totalVRAM / gpuVram);
      gpuConfig = `${requiredGPUs}x ${gpuVram}GB GPUs`;
    } else {
      gpuConfig = `1x ${gpuVram}GB GPU`;
    }

    // Power consumption estimate (watts)
    const basePower = systemType === "UNIFIED_MEMORY" ? 50 : 300;
    const powerPerGPU = totalVRAM > 24 ? 400 : totalVRAM > 16 ? 300 : 200;
    const powerConsumption = basePower + powerPerGPU * requiredGPUs;

    return {
      modelVRAM: Math.round(modelVRAM * 10) / 10,
      kvCacheVRAM: Math.round(kvCacheVRAM * 10) / 10,
      overhead: Math.round(overhead * 10) / 10,
      totalVRAM: Math.round(totalVRAM * 10) / 10,
      onDiskSize: Math.round(onDiskSize * 10) / 10,
      systemRAM: Math.round(systemRAM),
      performance,
      powerConsumption,
      gpuConfig,
      requiredGPUs,
      qualityScore: currentModelQuant.qualityScore,
    };
  }, [
    parameters,
    currentModelQuant,
    contextLength,
    enableKvCache,
    currentKvQuant,
    systemType,
    gpuVram,
    systemMemory,
  ]);

  const saveCalculation = () => {
    if (!requirements) return;

    const calc = {
      id: Date.now(),
      parameters,
      modelQuantization,
      contextLength: contextLength[0],
      enableKvCache,
      kvCacheQuantization: enableKvCache ? kvCacheQuantization : null,
      systemType,
      gpuVram,
      systemMemory: systemMemory[0],
      requirements,
      timestamp: new Date().toLocaleString(),
    };

    setCalculations((prev) => [calc, ...prev.slice(0, 9)]);
  };

  const getQuantColor = (quant: string) => {
    if (quant.includes("F")) return "bg-blue-100 text-blue-800";
    if (quant.includes("Q8")) return "bg-green-100 text-green-800";
    if (quant.includes("Q4") || quant.includes("GPTQ") || quant.includes("AWQ"))
      return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Model Configuration
            </CardTitle>
            <CardDescription>
              Configure your language model parameters and quantization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number of Parameters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="parameters">
                  Number of Parameters (Billions)
                </Label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-4">
                <Input
                  id="parameters"
                  type="number"
                  min="1"
                  max="1000"
                  value={parameters}
                  onChange={(e) => setParameters(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">B params</span>
              </div>
              <Slider
                value={[parameters]}
                onValueChange={(value) => setParameters(value[0])}
                max={1000}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Model Quantization */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="model-quantization">Model Quantization</Label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <Select
                value={modelQuantization}
                onValueChange={setModelQuantization}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quantizationOptions.map((quant) => (
                    <SelectItem key={quant.name} value={quant.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{quant.name}</span>
                        <div className="flex gap-1 ml-2">
                          <Badge variant="outline">
                            {quant.qualityScore}% quality
                          </Badge>
                          <Badge className={getQuantColor(quant.name)}>
                            {(quant.sizeMultiplier * 100).toFixed(0)}% size
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Context Length */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Context Length (Tokens)</Label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="128"
                  max="32768"
                  step="128"
                  value={contextLength[0]}
                  onChange={(e) => setContextLength([Number(e.target.value)])}
                  className="w-32"
                />
                <span className="text-sm text-gray-600">tokens</span>
              </div>
              <Slider
                value={contextLength}
                onValueChange={setContextLength}
                max={32768}
                min={128}
                step={128}
                className="w-full"
              />
            </div>

            {/* Inference Mode */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="inference-mode">Inference Mode</Label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <Select value={inferenceMode} onValueChange={setInferenceMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incremental">
                    Incremental (streaming)
                  </SelectItem>
                  <SelectItem value="bulk">Bulk (all at once)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* KV Cache */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="kv-cache"
                  checked={enableKvCache}
                  onCheckedChange={(checked) =>
                    setEnableKvCache(checked === true)
                  }
                  className="h-4 w-4 rounded-sm border border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white shadow-sm"
                />
                <Label htmlFor="kv-cache" className="flex items-center gap-2">
                  Enable KV Cache
                  <Info className="w-4 h-4 text-gray-400" />
                </Label>
              </div>

              {enableKvCache && (
                <div className="space-y-2 pl-6 border-l-2 border-blue-200">
                  <Label htmlFor="kv-quantization">KV Cache Quantization</Label>
                  <Select
                    value={kvCacheQuantization}
                    onValueChange={setKvCacheQuantization}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kvCacheQuantOptions.map((quant) => (
                        <SelectItem key={quant.name} value={quant.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{quant.name}</span>
                            <Badge className={getQuantColor(quant.name)}>
                              {(quant.sizeMultiplier * 100).toFixed(0)}% size
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              System Configuration
            </CardTitle>
            <CardDescription>Configure your hardware setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* System Type */}
            <div className="space-y-2">
              <Label htmlFor="system-type">System Type</Label>
              <Select value={systemType} onValueChange={setSystemType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {systemTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GPU VRAM */}
            <div className="space-y-2">
              <Label htmlFor="gpu-vram">GPU VRAM (GB)</Label>
              <Select
                value={gpuVram.toString()}
                onValueChange={(value) => setGpuVram(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gpuVramOptions.map((vram) => (
                    <SelectItem key={vram} value={vram.toString()}>
                      {vram} GB
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* System Memory */}
            <div className="space-y-3">
              <Label>System Memory: {systemMemory[0]} GB</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="8"
                  max="512"
                  step="8"
                  value={systemMemory[0]}
                  onChange={(e) => setSystemMemory([Number(e.target.value)])}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">GB</span>
              </div>
              <Slider
                value={systemMemory}
                onValueChange={setSystemMemory}
                max={512}
                min={8}
                step={8}
                className="w-full"
              />
            </div>

            <Button onClick={saveCalculation} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Requirements */}
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
              <p>Configure parameters to see requirements</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* VRAM Requirements */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  VRAM Needed
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span className="font-mono">
                      {requirements.modelVRAM} GB
                    </span>
                  </div>
                  {enableKvCache && (
                    <div className="flex justify-between">
                      <span>KV Cache:</span>
                      <span className="font-mono">
                        {requirements.kvCacheVRAM} GB
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Overhead:</span>
                    <span className="font-mono">
                      {requirements.overhead} GB
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 text-lg">
                    <span>Total:</span>
                    <span className="font-mono text-blue-700">
                      {requirements.totalVRAM} GB
                    </span>
                  </div>
                </div>
              </div>

              {/* Storage & Memory */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Storage & Memory
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {requirements.onDiskSize} GB
                    </div>
                    <div className="text-xs text-green-600">On-Disk Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {requirements.systemRAM} GB
                    </div>
                    <div className="text-xs text-green-600">System RAM</div>
                  </div>
                </div>
              </div>

              {/* Performance & Power */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {requirements.performance}
                    </div>
                    <div className="text-xs text-purple-600">Tokens/sec</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {requirements.powerConsumption}W
                    </div>
                    <div className="text-xs text-purple-600">Power Draw</div>
                  </div>
                </div>
              </div>

              {/* GPU Configuration */}
              <div className="bg-orange-50 p-6 rounded-lg md:col-span-2 lg:col-span-3">
                <h4 className="font-semibold text-orange-900 mb-4">
                  GPU Configuration
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-orange-700">
                      {requirements.gpuConfig}
                    </div>
                    <div className="text-sm text-orange-600">
                      {requirements.requiredGPUs > 1
                        ? "Multi-GPU setup required"
                        : "Single GPU sufficient"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-700">
                      {requirements.requiredGPUs}
                    </div>
                    <div className="text-sm text-orange-600">GPUs Required</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                <div
                  key={calc.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">
                        {calc.parameters}B Parameters
                      </h4>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline">
                          {calc.modelQuantization}
                        </Badge>
                        <Badge variant="secondary">
                          {calc.contextLength.toLocaleString()} ctx
                        </Badge>
                        {calc.enableKvCache && (
                          <Badge className="bg-blue-100 text-blue-800">
                            KV Cache
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {calc.requirements.totalVRAM} GB
                      </div>
                      <div className="text-xs text-gray-500">VRAM needed</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                    <div>{calc.requirements.systemRAM} GB RAM</div>
                    <div>{calc.requirements.performance} tok/s</div>
                    <div>{calc.requirements.gpuConfig}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {calc.timestamp}
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

export default HardwareCalculator;
