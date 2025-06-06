import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Home,
  Calculator,
  DollarSign,
  Cpu,
  GitCompare,
  ArrowLeft,
} from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

const NotFound = () => {
  useEffect(() => {
    // SEO: Update meta tags for 404 page using centralized utilities
    updatePageSEO("notFound");
  }, []);

  const tools = [
    {
      title: "Price Calculator",
      description: "Calculate LLM API costs",
      icon: DollarSign,
      link: "/?tab=price",
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
    },
    {
      title: "Token Calculator",
      description: "Count tokens in real-time",
      icon: Calculator,
      link: "/?tab=tokens",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
    },
    {
      title: "Hardware Calculator",
      description: "Estimate hardware requirements",
      icon: Cpu,
      link: "/?tab=hardware",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
    },
    {
      title: "Model Comparison",
      description: "Compare 100+ AI models",
      icon: GitCompare,
      link: "/?tab=compare",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header with better mobile layout */}
      <header
        className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-40"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain
                className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600"
                aria-hidden="true"
              />
              <div>
                <Link to="/" className="hover:opacity-80 transition-opacity">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    LLM Toolkit
                  </h1>
                </Link>
                <p className="text-gray-600 text-sm sm:text-base hidden sm:block">
                  AI Model Calculator & Comparison Platform
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced 404 Content with better mobile spacing */}
      <main
        className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16"
        role="main"
      >
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-3 sm:mb-4 animate-slide-up">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-700 mb-3 sm:mb-4">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2 leading-relaxed">
              Oops! The page you're looking for doesn't exist. But don't worry!
              Our powerful LLM tools are just one click away. Explore our
              professional AI model calculators and comparison tools below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-2">
            <Button
              asChild
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 min-h-[48px] touch-manipulation"
            >
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 min-h-[48px] touch-manipulation"
            >
              <Link to="/?tab=price">
                <DollarSign className="w-5 h-5 mr-2" />
                Start Calculating
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Quick Access to Tools */}
        <section aria-labelledby="tools-heading" className="animate-fade-in">
          <h3
            id="tools-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center"
          >
            Explore Our Professional LLM Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={index}
                  className={`${tool.bgColor} hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-0 group touch-manipulation`}
                >
                  <Link to={tool.link} className="block h-full">
                    <CardHeader className="text-center pb-3 p-4 sm:p-6">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${tool.color}`}
                          aria-hidden="true"
                        />
                      </div>
                      <CardTitle className="text-base sm:text-lg group-hover:text-gray-900 transition-colors duration-200">
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0 p-4 sm:p-6">
                      <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                        {tool.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Enhanced SEO Content with better mobile formatting */}
        <section
          className="mt-12 sm:mt-16 text-center animate-fade-in"
          aria-labelledby="about-heading"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg">
            <h3
              id="about-heading"
              className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6"
            >
              About LLM Toolkit - Professional AI Model Tools
            </h3>
            <div className="space-y-4 text-gray-600 max-w-4xl mx-auto">
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
                LLM Toolkit is your comprehensive platform for Large Language
                Model calculations and comparisons. We support over 100 AI
                models including OpenAI GPT-4, Anthropic Claude 3, Google
                Gemini, Meta Llama, Mistral, and many more.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                Whether you need to calculate costs, count tokens, estimate
                hardware requirements, or compare models side-by-side, our
                professional-grade tools provide accurate, real-time results for
                developers, researchers, and businesses worldwide.
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  100+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  AI Models
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  Free
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Forever</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  5
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Available
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer with better mobile layout */}
      <footer className="bg-white border-t mt-8 sm:mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-gray-600">
            {/* Community Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <a
                href="https://github.com/enough-jainil/llm-wizard-toolkit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-sm font-medium min-h-[44px] touch-manipulation hover:scale-105 active:scale-95"
                aria-label="View GitHub Repository"
              >
                <svg
                  className="w-4 h-4"
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 text-sm font-medium min-h-[44px] touch-manipulation hover:scale-105 active:scale-95"
                aria-label="Follow us on X (Twitter)"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow @algogist
              </a>
            </div>

            {/* Copyright and Links */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <p className="text-sm text-gray-500">
                © 2024 LLM Toolkit. Professional AI model calculation and
                comparison platform.
              </p>
              <p className="text-xs text-gray-400">
                Built with ❤️ for the AI community •{" "}
                <Link
                  to="/"
                  className="underline hover:text-gray-600 transition-colors duration-200"
                >
                  Return to Home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
