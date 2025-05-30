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
      shortTitle: "Price",
    },
    {
      id: "tokens",
      title: "Token Calculator",
      description:
        "Count tokens in real-time for accurate pricing and context management across all major LLM tokenizers",
      icon: Calculator,
      color: "text-blue-600",
      keywords: "token counter, LLM tokens, tokenizer, context length",
      shortTitle: "Tokens",
    },
    {
      id: "hardware",
      title: "Hardware Calculator",
      description:
        "Estimate VRAM, RAM, and compute requirements for running Large Language Models locally",
      icon: Cpu,
      color: "text-purple-600",
      keywords: "LLM hardware, VRAM requirements, local AI, model deployment",
      shortTitle: "Hardware",
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
      shortTitle: "Compare",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* SEO: Structured Header with proper heading hierarchy */}
      <header className="bg-white shadow-sm border-b" role="banner">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Brain
              className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                LLM Toolkit - AI Model Calculator & Comparison Platform
              </h1>
              <p className="text-gray-600 text-base sm:text-lg mt-1 leading-relaxed">
                Professional toolkit for Large Language Models: Price
                Calculator, Token Counter, Hardware Requirements & Model
                Comparison
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SEO: Main content with proper semantic structure */}
      <main
        className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8"
        role="main"
      >
        {/* SEO: Introduction section with key information */}
        <section className="mb-6 sm:mb-8" aria-labelledby="intro-heading">
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
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl" id="tools-heading">
              Professional LLM Utility Tools
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Choose a tool below to calculate costs, count tokens, estimate
              hardware requirements, or compare AI models. Supports 100+ models
              from OpenAI, Anthropic, Google, Meta, Mistral, and other
              providers.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
              aria-label="LLM Toolkit Tools"
            >
              {/* Mobile-friendly tab navigation */}
              <TabsList
                className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6 sm:mb-8 h-auto p-1 gap-1"
                role="tablist"
              >
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <TabsTrigger
                      key={tool.id}
                      value={tool.id}
                      className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-2 h-auto min-h-[60px] sm:min-h-[40px] text-xs sm:text-sm"
                      role="tab"
                      aria-selected={activeTab === tool.id}
                      aria-controls={`${tool.id}-panel`}
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-4 sm:h-4 ${tool.color} flex-shrink-0`}
                        aria-hidden="true"
                      />
                      <span className="leading-tight text-center sm:text-left">
                        <span className="sm:hidden">{tool.shortTitle}</span>
                        <span className="hidden sm:inline">
                          {tool.shortTitle}
                        </span>
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
        <section className="mt-6 sm:mt-8" aria-labelledby="overview-heading">
          <h2
            id="overview-heading"
            className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900"
          >
            LLM Toolkit Features Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
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
                  <CardHeader className="text-center p-4 sm:p-6">
                    <Icon
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${tool.color} mx-auto mb-2 flex-shrink-0`}
                      aria-hidden="true"
                    />
                    <CardTitle className="text-base sm:text-lg">
                      <h3>{tool.title}</h3>
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tool.description}
                    </CardDescription>
                    <div className="sr-only">Keywords: {tool.keywords}</div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SEO: Enhanced Footer with social links and community engagement */}
        <footer
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200"
          role="contentinfo"
        >
          <div className="text-center text-gray-600">
            <h2 className="text-lg font-semibold mb-4">About LLM Toolkit</h2>
            <p className="max-w-4xl mx-auto text-sm leading-relaxed mb-6">
              LLM Toolkit is a comprehensive platform for Large Language Model
              calculations and comparisons. We support over 100 AI models from
              major providers including OpenAI (GPT-4, GPT-3.5), Anthropic
              (Claude 3 Opus, Sonnet, Haiku), Google (Gemini Pro, Ultra, Flash),
              Meta (Llama 3), Mistral (Large, Medium, Small), Cohere, Groq,
              Perplexity, and many more. Our tools help developers, researchers,
              and businesses make informed decisions about AI model selection,
              pricing, and deployment.
            </p>

            {/* Community Links */}
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm font-medium min-h-[44px] sm:min-h-auto"
                  aria-label="View GitHub Repository"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </a>

                <a
                  href="https://x.com/algogist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 sm:py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200 text-sm font-medium min-h-[44px] sm:min-h-auto"
                  aria-label="Follow us on X (Twitter)"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Follow @algogist
                </a>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">
                🚀 Help Us Improve
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Found a bug? Want to request a new AI model? Have suggestions
                for new features?
              </p>
              <div className="flex flex-col gap-2 justify-center">
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-3 sm:py-2 bg-green-100 hover:bg-green-200 rounded-md transition-colors duration-200 text-xs font-medium min-h-[44px] sm:min-h-auto"
                >
                  💡 Request New Model
                </a>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://github.com/enough-jainil/llm-wizard-toolkit/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 sm:py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200 text-xs font-medium min-h-[44px] sm:min-h-auto"
                  >
                    🐛 Report Bug
                  </a>
                  <a
                    href="https://github.com/enough-jainil/llm-wizard-toolkit/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 sm:py-2 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200 text-xs font-medium min-h-[44px] sm:min-h-auto"
                  >
                    💬 General Discussion
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright and additional info */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-2">
                © 2024 LLM Toolkit. Professional AI model calculation and
                comparison platform.
              </p>
              <p className="text-xs text-gray-400">
                Built with ❤️ for the AI community • Open source on{" "}
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600"
                >
                  GitHub
                </a>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
