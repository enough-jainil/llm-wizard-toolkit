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
  Database,
} from "lucide-react";
import PriceCalculator from "@/components/PriceCalculator";
import TokenCalculator from "@/components/TokenCalculator";
import HardwareCalculator from "@/components/HardwareCalculator";
import ModelComparison from "@/components/ModelComparison";
import ModelExplorer from "@/components/ModelExplorer";
import OpenRouterStatusFooter from "@/components/OpenRouterStatusFooter";
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
      bgColor: "bg-green-50",
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
      bgColor: "bg-blue-50",
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
      bgColor: "bg-purple-50",
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
      bgColor: "bg-orange-50",
      keywords:
        "AI model comparison, LLM comparison, GPT vs Claude, model benchmarks",
      shortTitle: "Compare",
    },
    {
      id: "explorer",
      title: "Model Explorer",
      description:
        "Explore detailed information about 500+ AI models including architecture, pricing, capabilities, and specifications",
      icon: Database,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      keywords:
        "AI model database, model specifications, OpenRouter models, model details",
      shortTitle: "Explorer",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* SEO: Structured Header with proper heading hierarchy */}
      <header
        className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <Brain
                className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                LLM Toolkit
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2 leading-relaxed">
                Professional AI Model Calculator & Comparison Platform
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed">
                Price Calculator • Token Counter • Hardware Requirements • Model
                Comparison
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SEO: Main content with proper semantic structure */}
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12"
        role="main"
      >
        {/* SEO: Introduction section with key information */}
        <section className="mb-8 lg:mb-12" aria-labelledby="intro-heading">
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
          className="shadow-xl border-0 bg-white/95 backdrop-blur-sm"
          role="application"
          aria-labelledby="tools-heading"
        >
          <CardHeader className="px-6 sm:px-8 py-6 sm:py-8">
            <CardTitle
              className="text-xl sm:text-2xl lg:text-3xl text-center sm:text-left"
              id="tools-heading"
            >
              Professional LLM Utility Tools
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-center sm:text-left">
              Choose a tool below to calculate costs, count tokens, estimate
              hardware requirements, or compare AI models. Supports 100+ models
              from OpenAI, Anthropic, Google, Meta, Mistral, and other
              providers.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
              aria-label="LLM Toolkit Tools"
            >
              {/* Enhanced Mobile-Friendly Tab Navigation */}
              <div className="mb-8">
                <TabsList
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full h-auto p-1.5 gap-1.5 bg-gray-100/80 rounded-xl"
                  role="tablist"
                >
                  {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                      <TabsTrigger
                        key={tool.id}
                        value={tool.id}
                        className={`flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 h-auto min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 
                          ${
                            activeTab === tool.id
                              ? `${tool.bgColor} ${tool.color} shadow-md border-2 border-current/20 scale-105`
                              : "hover:bg-white/80 hover:shadow-sm text-gray-600 hover:text-gray-900"
                          }
                          ${
                            index >= 3
                              ? "col-span-1 sm:col-span-1 lg:col-span-1"
                              : ""
                          }
                        `}
                        role="tab"
                        aria-selected={activeTab === tool.id}
                        aria-controls={`${tool.id}-panel`}
                      >
                        <Icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-colors duration-200`}
                          aria-hidden="true"
                        />
                        <span className="leading-tight text-center">
                          <span className="block sm:hidden">
                            {tool.shortTitle}
                          </span>
                          <span className="hidden sm:block lg:hidden">
                            {tool.shortTitle}
                          </span>
                          <span className="hidden lg:block">
                            {tool.shortTitle}
                          </span>
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Tab Content Panels with Better Spacing */}
              <div className="mt-8">
                <TabsContent
                  value="price"
                  className="mt-0 focus:outline-none"
                  role="tabpanel"
                  id="price-panel"
                  aria-labelledby="price-tab"
                >
                  <PriceCalculator />
                </TabsContent>

                <TabsContent
                  value="tokens"
                  className="mt-0 focus:outline-none"
                  role="tabpanel"
                  id="tokens-panel"
                  aria-labelledby="tokens-tab"
                >
                  <TokenCalculator />
                </TabsContent>

                <TabsContent
                  value="hardware"
                  className="mt-0 focus:outline-none"
                  role="tabpanel"
                  id="hardware-panel"
                  aria-labelledby="hardware-tab"
                >
                  <HardwareCalculator />
                </TabsContent>

                <TabsContent
                  value="compare"
                  className="mt-0 focus:outline-none"
                  role="tabpanel"
                  id="compare-panel"
                  aria-labelledby="compare-tab"
                >
                  <ModelComparison />
                </TabsContent>

                <TabsContent
                  value="explorer"
                  className="mt-0 focus:outline-none"
                  role="tabpanel"
                  id="explorer-panel"
                  aria-labelledby="explorer-tab"
                >
                  <ModelExplorer />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* SEO: Tool Overview Cards with structured data */}
        <section className="mt-12 lg:mt-16" aria-labelledby="overview-heading">
          <h2
            id="overview-heading"
            className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 text-center sm:text-left"
          >
            Toolkit Features Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 group border-0 ${tool.bgColor}/30 hover:${tool.bgColor}/60`}
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
                  <CardHeader className="text-center p-6 sm:p-8">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl ${tool.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${tool.color}`}
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle className="text-lg sm:text-xl mb-3">
                      <h3 className="group-hover:text-gray-900 transition-colors duration-200">
                        {tool.title}
                      </h3>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                      {tool.description}
                    </CardDescription>
                    <div className="sr-only">Keywords: {tool.keywords}</div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      {/* OpenRouter Status Footer */}
      <OpenRouterStatusFooter />

      {/* SEO: Enhanced Footer with social links and community engagement */}
      <footer
        className="bg-white border-t border-gray-200 mt-12"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center text-gray-600 space-y-8">
            {/* About Section */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                About LLM Toolkit
              </h2>
              <p className="max-w-4xl mx-auto text-sm sm:text-base leading-relaxed text-gray-600">
                LLM Toolkit is a comprehensive platform for Large Language Model
                calculations and comparisons. We support over 100 AI models from
                major providers including OpenAI (GPT-4, GPT-3.5), Anthropic
                (Claude 3 Opus, Sonnet, Haiku), Google (Gemini Pro, Ultra,
                Flash), Meta (Llama 3), Mistral (Large, Medium, Small), Cohere,
                Groq, Perplexity, and many more. Our tools help developers,
                researchers, and businesses make informed decisions about AI
                model selection, pricing, and deployment.
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Connect With Us
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all duration-200 text-sm font-medium min-w-[200px] justify-center hover:scale-105 active:scale-95"
                  aria-label="View GitHub Repository"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
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
                  View on GitHub
                </a>

                <a
                  href="https://x.com/algogist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 text-sm font-medium min-w-[200px] justify-center hover:scale-105 active:scale-95"
                  aria-label="Follow us on X (Twitter)"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🚀 Help Us Improve
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                    Found a bug? Want to request a new AI model? Have
                    suggestions for new features? Join our community and help
                    make LLM Toolkit better for everyone!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <a
                    href="https://github.com/enough-jainil/llm-wizard-toolkit/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 p-4 bg-white hover:bg-green-50 border border-green-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    <div className="text-2xl">💡</div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 group-hover:text-green-700">
                        Request New Model
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Suggest AI models to add
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://github.com/enough-jainil/llm-wizard-toolkit/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 p-4 bg-white hover:bg-red-50 border border-red-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    <div className="text-2xl">🐛</div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 group-hover:text-red-700">
                        Report Bug
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Help us fix issues
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://github.com/enough-jainil/llm-wizard-toolkit/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 p-4 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    <div className="text-2xl">💬</div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">
                        Join Discussion
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Share ideas & feedback
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright and additional info */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <p className="text-sm text-gray-500">
                © 2024 LLM Toolkit. Professional AI model calculation and
                comparison platform.
              </p>
              <p className="text-xs text-gray-400">
                Built with ❤️ for the AI community • Open source on{" "}
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600 transition-colors duration-200"
                >
                  GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
