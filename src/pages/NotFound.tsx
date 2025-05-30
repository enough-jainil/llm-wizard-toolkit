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

      {/* Footer */}
      <footer className="bg-white border-t mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-600">
            © 2024 LLM Toolkit. Professional AI model calculation and comparison
            platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
