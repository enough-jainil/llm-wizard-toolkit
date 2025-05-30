import { useState, useEffect } from "react";
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
import { updatePageSEO, addStructuredData, STRUCTURED_DATA } from "@/lib/seo";

const Index = () => {
  const [activeTab, setActiveTab] = useState("price");

  // SEO: Update document title and meta description based on active tab
  useEffect(() => {
    const pageMap = {
      price: "priceCalculator" as const,
      tokens: "tokenCalculator" as const,
      hardware: "hardwareCalculator" as const,
      compare: "modelComparison" as const,
    };

    const pageKey =
      pageMap[activeTab as keyof typeof pageMap] || ("home" as const);
    updatePageSEO(pageKey);

    // Add structured data for the current page
    if (activeTab === "price") {
      addStructuredData(STRUCTURED_DATA.softwareApplication, "software-app");
    }
  }, [activeTab]);

  // Add structured data on initial load
  useEffect(() => {
    addStructuredData(STRUCTURED_DATA.website, "website");
    addStructuredData(STRUCTURED_DATA.organization, "organization");
  }, []);

  const tools = [
    {
      id: "price",
      title: "LLM Price Calculator",
      description:
        "Calculate costs for API usage across different LLM providers including OpenAI, Anthropic, Google, and more",
      icon: DollarSign,
      color: "text-green-600",
      keywords: "LLM pricing, AI model costs, GPT calculator, Claude pricing",
    },
    {
      id: "tokens",
      title: "Token Calculator",
      description:
        "Count tokens in real-time for accurate pricing and context management across all major LLM tokenizers",
      icon: Calculator,
      color: "text-blue-600",
      keywords: "token counter, LLM tokens, tokenizer, context length",
    },
    {
      id: "hardware",
      title: "Hardware Calculator",
      description:
        "Estimate VRAM, RAM, and compute requirements for running Large Language Models locally",
      icon: Cpu,
      color: "text-purple-600",
      keywords: "LLM hardware, VRAM requirements, local AI, model deployment",
    },
    {
      id: "compare",
      title: "Model Comparison",
      description:
        "Compare 100+ AI models side-by-side including performance metrics, pricing, and capabilities",
      icon: GitCompare,
      color: "text-orange-600",
      keywords:
        "AI model comparison, LLM comparison, GPT vs Claude, model benchmarks",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* SEO: Structured Header with proper heading hierarchy */}
      <header className="bg-white shadow-sm border-b" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                LLM Toolkit - AI Model Calculator & Comparison Platform
              </h1>
              <p className="text-gray-600 text-lg">
                Professional toolkit for Large Language Models: Price
                Calculator, Token Counter, Hardware Requirements & Model
                Comparison
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SEO: Main content with proper semantic structure */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* SEO: Introduction section with key information */}
        <section className="mb-8" aria-labelledby="intro-heading">
          <div className="sr-only">
            <h2 id="intro-heading">LLM Toolkit Features</h2>
            <p>
              Compare pricing across 100+ AI models including OpenAI GPT-4,
              Anthropic Claude 3, Google Gemini Pro, Meta Llama, Mistral, and
              more. Calculate token usage, estimate hardware requirements, and
              find the most cost-effective AI model for your needs.
            </p>
          </div>
        </section>

        {/* Main Calculator Tools */}
        <Card
          className="shadow-lg"
          role="application"
          aria-labelledby="tools-heading"
        >
          <CardHeader>
            <CardTitle className="text-2xl" id="tools-heading">
              Professional LLM Utility Tools
            </CardTitle>
            <CardDescription className="text-lg">
              Choose a tool below to calculate costs, count tokens, estimate
              hardware requirements, or compare AI models. Supports 100+ models
              from OpenAI, Anthropic, Google, Meta, Mistral, and other
              providers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
              aria-label="LLM Toolkit Tools"
            >
              <TabsList className="grid w-full grid-cols-4 mb-8" role="tablist">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <TabsTrigger
                      key={tool.id}
                      value={tool.id}
                      className="flex items-center gap-2"
                      role="tab"
                      aria-selected={activeTab === tool.id}
                      aria-controls={`${tool.id}-panel`}
                    >
                      <Icon
                        className={`w-4 h-4 ${tool.color}`}
                        aria-hidden="true"
                      />
                      <span className="hidden sm:inline">
                        {tool.title.split(" ")[0]}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent
                value="price"
                className="mt-0"
                role="tabpanel"
                id="price-panel"
                aria-labelledby="price-tab"
              >
                <PriceCalculator />
              </TabsContent>

              <TabsContent
                value="tokens"
                className="mt-0"
                role="tabpanel"
                id="tokens-panel"
                aria-labelledby="tokens-tab"
              >
                <TokenCalculator />
              </TabsContent>

              <TabsContent
                value="hardware"
                className="mt-0"
                role="tabpanel"
                id="hardware-panel"
                aria-labelledby="hardware-tab"
              >
                <HardwareCalculator />
              </TabsContent>

              <TabsContent
                value="compare"
                className="mt-0"
                role="tabpanel"
                id="compare-panel"
                aria-labelledby="compare-tab"
              >
                <ModelComparison />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* SEO: Tool Overview Cards with structured data */}
        <section className="mt-8" aria-labelledby="overview-heading">
          <h2
            id="overview-heading"
            className="text-2xl font-bold mb-6 text-gray-900"
          >
            LLM Toolkit Features Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105"
                  onClick={() => setActiveTab(tool.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Switch to ${tool.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveTab(tool.id);
                    }
                  }}
                >
                  <CardHeader className="text-center">
                    <Icon
                      className={`w-12 h-12 ${tool.color} mx-auto mb-2`}
                      aria-hidden="true"
                    />
                    <CardTitle className="text-lg">
                      <h3>{tool.title}</h3>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                    <div className="sr-only">Keywords: {tool.keywords}</div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SEO: Footer with additional context */}
        <footer
          className="mt-12 pt-8 border-t border-gray-200"
          role="contentinfo"
        >
          <div className="text-center text-gray-600">
            <h2 className="text-lg font-semibold mb-2">About LLM Toolkit</h2>
            <p className="max-w-4xl mx-auto text-sm leading-relaxed">
              LLM Toolkit is a comprehensive platform for Large Language Model
              calculations and comparisons. We support over 100 AI models from
              major providers including OpenAI (GPT-4, GPT-3.5), Anthropic
              (Claude 3 Opus, Sonnet, Haiku), Google (Gemini Pro, Ultra, Flash),
              Meta (Llama 3), Mistral (Large, Medium, Small), Cohere, Groq,
              Perplexity, and many more. Our tools help developers, researchers,
              and businesses make informed decisions about AI model selection,
              pricing, and deployment.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
