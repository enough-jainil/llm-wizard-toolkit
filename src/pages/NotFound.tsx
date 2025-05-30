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
    },
    {
      title: "Token Calculator",
      description: "Count tokens in real-time",
      icon: Calculator,
      link: "/?tab=tokens",
      color: "text-blue-600",
    },
    {
      title: "Hardware Calculator",
      description: "Estimate hardware requirements",
      icon: Cpu,
      link: "/?tab=hardware",
      color: "text-purple-600",
    },
    {
      title: "Model Comparison",
      description: "Compare 100+ AI models",
      icon: GitCompare,
      link: "/?tab=compare",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <div>
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-3xl font-bold text-gray-900">
                  LLM Toolkit
                </h1>
              </Link>
              <p className="text-gray-600">
                AI Model Calculator & Comparison Platform
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        role="main"
      >
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The page you're looking for doesn't exist. But don't worry! Our
            powerful LLM tools are just one click away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8"
            >
              <Link to="/?tab=price">
                <DollarSign className="w-5 h-5 mr-2" />
                Start Calculating
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Access to Tools */}
        <section aria-labelledby="tools-heading">
          <h3
            id="tools-heading"
            className="text-2xl font-bold text-gray-900 mb-6 text-center"
          >
            Explore Our LLM Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-200 hover:scale-105"
                >
                  <Link to={tool.link} className="block">
                    <CardHeader className="text-center pb-3">
                      <Icon
                        className={`w-12 h-12 ${tool.color} mx-auto mb-3`}
                        aria-hidden="true"
                      />
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-sm text-gray-600">
                        {tool.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 text-center" aria-labelledby="about-heading">
          <h3
            id="about-heading"
            className="text-xl font-bold text-gray-900 mb-4"
          >
            About LLM Toolkit
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto">
            LLM Toolkit is your comprehensive platform for Large Language Model
            calculations and comparisons. We support over 100 AI models
            including OpenAI GPT-4, Anthropic Claude 3, Google Gemini, Meta
            Llama, Mistral, and many more. Whether you need to calculate costs,
            count tokens, estimate hardware requirements, or compare models,
            we've got you covered.
          </p>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            {/* Community Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm font-medium"
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
                  GitHub
                </a>

                <a
                  href="https://x.com/algogist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200 text-sm font-medium"
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
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 rounded-md transition-colors duration-200 text-xs font-medium"
                >
                  💡 Request New Model
                </a>
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200 text-xs font-medium"
                >
                  🐛 Report Bug
                </a>
                <a
                  href="https://github.com/enough-jainil/llm-wizard-toolkit/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200 text-xs font-medium"
                >
                  💬 General Discussion
                </a>
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
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
