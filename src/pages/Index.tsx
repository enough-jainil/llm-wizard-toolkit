import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Cpu,
  DollarSign,
  GitCompare,
  Brain,
  Zap,
} from "lucide-react";
import PriceCalculator from "@/components/PriceCalculator";
import TokenCalculator from "@/components/TokenCalculator";
import HardwareCalculator from "@/components/HardwareCalculator";
import ModelComparison from "@/components/ModelComparison";

const Index = () => {
  const [activeTab, setActiveTab] = useState("price");

  const tools = [
    {
      id: "price",
      title: "LLM Price Calculator",
      description:
        "Calculate costs for API usage across different LLM providers",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      id: "tokens",
      title: "Token Calculator",
      description:
        "Count tokens in real-time for accurate pricing and context management",
      icon: Calculator,
      color: "text-blue-600",
    },
    {
      id: "hardware",
      title: "Hardware Calculator",
      description: "Estimate hardware requirements for running LLMs locally",
      icon: Cpu,
      color: "text-purple-600",
    },
    {
      id: "compare",
      title: "Model Comparison",
      description:
        "Compare different LLMs side-by-side for performance and cost",
      icon: GitCompare,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LLM Toolkit</h1>
              <p className="text-gray-600">
                Complete utility platform for Large Language Models
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Supported Models</p>
                  <p className="text-2xl font-bold">25+</p>
                </div>
                <Brain className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">API Providers</p>
                  <p className="text-2xl font-bold">8+</p>
                </div>
                <Zap className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Calculations Today</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <Calculator className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Cost Savings</p>
                  <p className="text-2xl font-bold">$12.5K</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Main Calculator Tools */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">LLM Utility Tools</CardTitle>
            <CardDescription>
              Choose a tool below to start calculating costs, tokens, or
              hardware requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <TabsTrigger
                      key={tool.id}
                      value={tool.id}
                      className="flex items-center gap-2"
                    >
                      <Icon className={`w-4 h-4 ${tool.color}`} />
                      <span className="hidden sm:inline">
                        {tool.title.split(" ")[0]}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="price" className="mt-0">
                <PriceCalculator />
              </TabsContent>

              <TabsContent value="tokens" className="mt-0">
                <TokenCalculator />
              </TabsContent>

              <TabsContent value="hardware" className="mt-0">
                <HardwareCalculator />
              </TabsContent>

              <TabsContent value="compare" className="mt-0">
                <ModelComparison />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tool Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105"
                onClick={() => setActiveTab(tool.id)}
              >
                <CardHeader className="text-center">
                  <Icon className={`w-12 h-12 ${tool.color} mx-auto mb-2`} />
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
